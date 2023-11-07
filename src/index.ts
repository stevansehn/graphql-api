import express from "express";
import { getSchema } from "./graphql/schema";
import { ApolloServer } from "apollo-server-express";
import session from "express-session";
import dotenv from "dotenv";
import Redis from "ioredis";
// import RedisStore from "connect-redis"
const RedisStore = require("connect-redis").default;
import { getMyPrismaClient } from "./db";
import { IMyContext } from "./interface";
import { isProd } from "./utils";

const main = async () => {
  dotenv.config();

  const redisClient = new Redis();

  const app = express();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET!,
      name: "gql-api",
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: isProd(),
        sameSite: "none",
      },
    })
  );

  const schema = await getSchema();
  const prisma = await getMyPrismaClient();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }): IMyContext => ({
      req,
      res,
      prisma,
      session: req.session,
      redis: redisClient,
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
