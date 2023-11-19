import { makeSchema } from "nexus";
import { Query } from "./Query";
import path from "path";
import { Mutation } from "./Mutation";
import { UserType } from "./UserType";
import { PostType } from "./PostType";
import { GetMeType } from "./GetMeType";

export const getSchema = async () => {
  const schema = makeSchema({
    types: [Query, Mutation, UserType, PostType, GetMeType],
    outputs: {
      schema: path.join(process.cwd(), "nexus", "schema.graphql"),
      typegen: path.join(process.cwd(), "nexus", "nexus.ts"),
    },
  });
  return schema;
};
