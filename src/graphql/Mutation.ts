import { Post, User } from "@prisma/client";
import { intArg, mutationType, stringArg } from "nexus";
import { IMyContext } from "../interface";
import { hashPassword, isAuthenticated, verifyPassword } from "../utils";
import {
  INVALID_CREDENTIALS,
  ALREADY_TAKEN,
  NOT_AUTHENTICATED,
  NOT_AUTHORIZED,
  NOT_FOUND,
} from "../constants";

export const Mutation = mutationType({
  definition(t) {
    t.boolean("deletePost", {
      args: {
        id: intArg(),
      },
      resolve: async (
        _,
        { id }: Pick<Post, "id">,
        { prisma, session }: IMyContext
      ) => {
        try {
          if (isAuthenticated(session)) {
            return new Error(NOT_AUTHENTICATED);
          }

          const post = await prisma.post.findUnique({
            where: {
              id,
            },
            select: {
              userId: true,
            },
          });

          if (!post){
            return new Error(NOT_FOUND)
          } else if (post.userId !== session.userId) {
            return new Error(NOT_AUTHORIZED);
          }

          await prisma.post.delete({
            where: {
              id,
            },
          });

          return true;
        } catch (err) {
          console.error("error => ", err);
          const errorCaught = err as any;
          if (errorCaught.code === "P2002") {
            const errorMessage = `${errorCaught.meta.target.toString()} ${ALREADY_TAKEN}`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
        }
      },
    });
    t.boolean("createPost", {
      args: {
        title: stringArg(),
        content: stringArg(),
      },
      resolve: async (
        _,
        { ...postDetails }: Pick<Post, "content" | "title">,
        { prisma, session }: IMyContext
      ) => {
        try {
          if (isAuthenticated(session)) {
            return new Error(NOT_AUTHENTICATED);
          }

          await prisma.post.create({
            data: {
              ...postDetails,
              userId: session.userId!,
            },
            select: {
              id: true,
            },
          });

          return true;
        } catch (err) {
          console.error("error => ", err);
          const errorCaught = err as any;
          if (errorCaught.code === "P2002") {
            const errorMessage = `${errorCaught.meta.target.toString()} ${ALREADY_TAKEN}`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
        }
      },
    });
    t.boolean("registerUser", {
      args: {
        name: stringArg(),
        email: stringArg(),
        username: stringArg(),
        password: stringArg(),
      },
      resolve: async (
        _,
        { ...userDetails }: Omit<User, "id">,
        { prisma, session }: IMyContext
      ) => {
        try {
          if (isAuthenticated(session)) {
            return new Error(NOT_AUTHORIZED);
          }

          const hashedPassword = await hashPassword(userDetails.password);
          await prisma.user.create({
            data: {
              ...userDetails,
              password: hashedPassword,
            },
            select: {
              id: true,
            },
          });

          return true;
        } catch (err) {
          console.error("error => ", err);
          const errorCaught = err as any;
          if (errorCaught.code === "P2002") {
            const errorMessage = `${errorCaught.meta.target.toString()} ${ALREADY_TAKEN}`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
        }
      },
    });
    t.boolean("loginUser", {
      args: {
        username: stringArg(),
        password: stringArg(),
      },
      resolve: async (
        _,
        { ...userDetails }: Pick<User, "username" | "password">,
        { prisma, session }: IMyContext
      ) => {
        try {
          if (isAuthenticated(session)) {
            return new Error(NOT_AUTHORIZED);
          }

          const user = await prisma.user.findUnique({
            where: {
              username: userDetails.username,
            },
          });

          if (!user) {
            return new Error(INVALID_CREDENTIALS);
          }

          const isCorrect = await verifyPassword(
            userDetails.password,
            user.password
          );

          if (!isCorrect) {
            return new Error(INVALID_CREDENTIALS);
          }

          session["userId"] = user.id;

          return true;
        } catch (err) {
          console.error("error => ", err);
          const errorCaught = err as any;
          return new Error(errorCaught.message);
        }
      },
    });
    t.boolean("logoutUser", {
      resolve: (_, __, { session }: IMyContext) => {
        if (!isAuthenticated(session)) {
          return new Error(NOT_AUTHENTICATED);
        }
        session.destroy((err) => {
          console.log(`Error destroying session => `);
          console.log(err);
        });
        return true;
      },
    });
  },
});
