import { queryType } from "nexus";
import { IMyContext } from "../interface";
import { isAuthenticated } from "../utils";
import { NOT_AUTHENTICATED } from "../constants";

export const Query = queryType({
  definition(t) {
    t.field("hello", {
      type: "String",
      resolve: () => "world",
    });
    t.field("getMe", {
      type: "Int",
      resolve: (_, __, {session}: IMyContext) => {
        if(!isAuthenticated(session)){
          return new Error(NOT_AUTHENTICATED)
        }
        return {
          userId: session.userId,
        }
      },
    });
  },
});
