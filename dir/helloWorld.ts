require("dotenv").config()

console.log("Hello World!");

console.log(`Hello ${process.argv[2]}!`);

console.log(process.env.HELLO)