const fs = require("fs/promises");
const path = require("path");

const main = async () => {
    const currPath = path.join(__dirname, "dir", "helloWorld.ts");
    const data = await fs.readFile(currPath, "ascii");

    console.log(data)
}

main();