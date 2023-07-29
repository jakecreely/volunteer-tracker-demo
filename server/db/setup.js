const dockerCompose = require('docker-compose')
const path = require('path');
const portscanner = require('portscanner');
const mongoose = require('mongoose')

const dbSetup = async () => {
    if (process.env.NODE_ENV !== 'production') {
        const isDBReachable = await new Promise((resolve) => {
            portscanner.checkPortStatus(process.env.DBPORT, '127.0.0.1', function (error, status) {
                resolve(status !== 'open');
            })
        })

        if (!isDBReachable) {
            // Both the test and development environments use the same docker-compose.yml file
            await dockerCompose.upAll({ cwd: path.join(__dirname), log: true }).then(
                () => {
                    console.log('Docker Compose Up All - Done')
                },
                (err) => {
                    console.log('something went wrong:', err.message)
                }
            )
        }
    }

    // One the container is up, we can connect to it
    // Clear the database - add the test collections
    // Need to change start script to set up server and db at the same time but seperate files
    try {
        mongoose.set('strictQuery', true);
        mongoose.connect(process.env.CONNECTION_URL, { useUnifiedTopology: true, useNewUrlParser: true });

        connection = mongoose.connection;

        connection.once("open", function () {
            console.log("MongoDB database connection established successfully");
        });
    } catch (e) {
        console.error(e);
    }
}

const stopDB = async () => {
    await dockerCompose.down({ cwd: path.join(__dirname), log: true }).then(
        () => {
            console.log('done')
        },
        (err) => {
            console.log('something went wrong:', err.message)
        }
    )
    await mongoose.disconnect()
}

module.exports = { dbSetup, stopDB };