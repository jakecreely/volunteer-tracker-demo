//const isPortReachable = require('is-port-reachable')
const dockerCompose = require('docker-compose')
const path = require('path');
const {MongoClient} = require('mongodb');
const portscanner = require('portscanner');

const dbSetup = async () => {
    //const isDBReachable = await isPortReachable(process.env.PORT || 27017)
    let isDBReachable = false;
    portscanner.checkPortStatus(27017, '127.0.0.1', function(error, status) {
        isDBReachable = (status !== 'open') ? true : false;
    })

    if (!isDBReachable) {
        await dockerCompose.upAll({ cwd: path.join(__dirname), log: true }).then(
            () => {
                console.log('done')
            },
            (err) => {
                console.log('something went wrong:', err.message)
            }
        )
    } else {
        console.log("Container already running")
    }

    const client = new MongoClient(process.env.CONNECTION_URL, { useUnifiedTopology: true });

    // One the container is up, we can connect to it
    // Clear the database - add the test collections
    // Need to change start script to set up server and db at the same time but seperate files
    try {
        await client.connect();
        await client.db("test_database").dropDatabase();
        await client.db("test_database").createCollection("users");
        await client.db("test_database").collection("users").insertOne({ name: 'John Doe'});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    // await dockerCompose.exec(
    //     'mongodb-test',
    //     [
    //         'mongosh', 
    //         "use test_database", 
    //         "db.createCollection('users')",
    //         "db.users.insert({ name: 'John Doe', email: 'john@example.com' });"
    //     ],
    //     {
    //         cwd: path.join(__dirname + '/..')
    //     }
    // )
}


module.exports = dbSetup;