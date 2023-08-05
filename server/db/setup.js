const dockerCompose = require('docker-compose')
const path = require('path');
const portscanner = require('portscanner');
const mongoose = require('mongoose');
const Role = require('../schema/Role');
const Award = require('../schema/Award');
const Volunteer = require('../schema/Volunteer');
const Training = require('../schema/Training');
const Document = require('../schema/Document');

// Schema
require('../schema/Training')
require('../schema/Volunteer')
require('../schema/Award')
require('../schema/Role')
require('../schema/Document')

let connection = null;

const dbSetup = async () => {
    if (process.env.NODE_ENV !== 'production') {
        let isDBReachable = await new Promise((resolve) => {
            // Returns false if the database needs to be started
            portscanner.checkPortStatus(27017, '127.0.0.1', function (error, status) {
                resolve(status === 'open')
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
    
            return connection;
        } catch (e) {
            console.error(e);
            throw e;
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

const initTestDB = async () => {
    connection = await dbSetup()
    await Role.createCollection()
    await Award.createCollection()
    await Volunteer.createCollection()
    await Training.createCollection()
    await Document.createCollection()
}

const emptyTestDB = async () => {
    await Role.deleteMany({})
    await Award.deleteMany({})
    await Volunteer.deleteMany({})
    await Training.deleteMany({})
    await Document.deleteMany({})
}

module.exports = { dbSetup, stopDB, initTestDB, emptyTestDB };