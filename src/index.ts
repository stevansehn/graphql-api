import express from "express";

const main = async () => {
  const app = express();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
