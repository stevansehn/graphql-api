import { objectType } from "nexus";
import { PostType } from "./PostType";

export const UserType = objectType({
  name: "UserType",
  definition(t) {
    t.int("id");
    t.string('name');
    t.string('username');
    t.string('email');
    t.string('password');
    t.float('createdAt');
    t.list.field('posts', {
        type: PostType
    })
  },
});
