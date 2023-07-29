const { setupServer } = require("./server");
const { dbSetup } = require("./db/setup");

const startDevEnvironment = async () => {
    await dbSetup();
    await setupServer();
}

startDevEnvironment();