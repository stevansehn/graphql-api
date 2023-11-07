import { User } from "@prisma/client";
import { mutationType, stringArg } from "nexus";
import { IMyContext } from "../interface";
import { hashPassword, verifyPassword } from "../utils";

export const Mutation = mutationType({
  definition(t) {
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
        { prisma }: IMyContext
      ) => {
        try {
          const hashedPassword = await hashPassword(userDetails.password);
          await prisma.user.create({
            data: {
              ...userDetails,
              password: hashedPassword,
            },
          });
          return true;
        } catch (err) {
          console.error("error => ", err);
          const errorCaught = err as any;
          if (errorCaught.code === "P2002") {
            const errorMessage = `${errorCaught.meta.target.toString()} already taken`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
        }
      },
    });
  },
});
