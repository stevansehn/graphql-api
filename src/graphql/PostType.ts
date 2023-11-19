import { objectType } from "nexus";
import { UserType } from "./UserType";

export const PostType = objectType({
  name: "PostType",
  definition(t) {
    t.int("id");
    t.int("userId");
    t.string('title');
    t.string('content');
    t.float('createdAt');
    t.field('user', {
      type: UserType,
    })
  },
});
