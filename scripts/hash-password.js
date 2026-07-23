/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.log("Usage: node scripts/hash-password.js yourPasswordHere");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nHashed password (copy this):\n");
  console.log(hash);
  console.log("");
});