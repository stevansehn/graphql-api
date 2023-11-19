import { queryType } from "nexus";
import { IMyContext } from "../interface";
import { isAuthenticated } from "../utils";
import { INTERNAL_SERVER_ERROR, NOT_AUTHENTICATED } from "../constants";
import { PostType } from "./PostType";
import { UserType } from "./UserType";

export const Query = queryType({
  definition(t) {
    t.field("hello", {
      type: "String",
      resolve: () => "world",
    });
    t.field("getMe", {
      type: "Int",
      resolve: (_, __, { session }: IMyContext) => {
        if (!isAuthenticated(session)) {
          return new Error(NOT_AUTHENTICATED);
        }
        return {
          userId: session.userId,
        };
      },
    });
    t.list.field("posts", {
      type: PostType,
      resolve: async (_, __, { prisma, session }: IMyContext) => {
        try {
          if (!isAuthenticated(session)) {
            return new Error(NOT_AUTHENTICATED);
          }
          const posts = await prisma.post.findMany({
            select: {
              content: true,
              createdAt: true,
              id: true,
              userId: true,
              title: true,
              user: {
                select: {
                  username: true,
                  id: true,
                },
              },
            },
          });
          return posts;
        } catch (err) {
          console.error(err);
          return new Error(INTERNAL_SERVER_ERROR);
        }
      },
    });
    t.list.field("users", {
      type: UserType,
      resolve: async (_, __, { prisma, session }: IMyContext) => {
        try {
          if (!isAuthenticated(session)) {
            return new Error(NOT_AUTHENTICATED);
          }

          return await prisma.user.findMany({
            select: {
              email: true,
              id: true,
              createdAt: true,
              username: true,
              name: true,
            },
          });
        } catch (err) {
          console.error(err);
          return new Error(INTERNAL_SERVER_ERROR);
        }
      },
    });
  },
});
