const mongoose = require("mongoose");
const { MONGODB_URI, PORT } = require("./utils/config");
const app = require("./app");

console.log("Connecting to the database...");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to the database...");

    app.listen(PORT, () => {
      console.log(`Server is running @ http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error connecting to the database, ${error}`);
  });
