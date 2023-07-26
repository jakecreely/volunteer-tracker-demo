const { faker } = require('@faker-js/faker');

const documents = ["Document 1", "Document 2", "Document 3", "Document 4"]
const roles = ["Role 1", "Role 2", "Role 3", "Role 4"]
const awards = ["Award 1", "Award 2", "Award 3"]
const training = ["Training 1", "Training 2", "Training 3"]

const randomVolunteer = () => {
    return {
        id: faker.database.mongodbObjectId(),
        name: faker.person.fullName(),
        startDate: faker.date.past({years: 10}),
        birthday: faker.date.birthdate(),
        breakDuration: faker.number.int({min: 0, max: 1000}), // Max could be present - start date
        isArchived: false,
        roles: [],
        documents: [],
        awards: [],
        training: []
    }
}

const generateVolunteers = (amount) => {
    for (let i = 0; i < amount; i++) {
        console.log(randomVolunteer())
    }
}

generateVolunteers(5);

const randomDocument = () => {
    const randomIndex = Math.floor(Math.random() * documents.length)
    return {
        id: faker.database.mongodbObjectId(),
        name: documents[randomIndex]
    }
}

const generateDocuments = (amount) => {
    for (let i = 0; i < amount; i++) {
        console.log(randomDocument())
    }
}

generateDocuments(5);

const randomRole = () => {
    const randomIndex = Math.floor(Math.random() * roles.length);
    return {
        id: faker.database.mongodbObjectId(),
        name: roles[randomIndex]
    }
}

const generateRoles = (amount) => {
    for (let i = 0; i < amount; i++) {
        console.log(randomRole())
    }
}

generateRoles(5)

const randomAward = () => {
    const randomIndex = Math.floor(Math.random() * awards.length);
    return {
        id: faker.database.mongodbObjectId(),
        name: awards[randomIndex]
    }
}

const generateAwards = (amount) => {
    for (let i = 0; i < amount; i++) {
        console.log(randomAward())
    }
}

generateAwards(5)

const randomTraining = () => {
    const randomIndex = Math.floor(Math.random() * training.length);
    return {
        id: faker.database.mongodbObjectId(),
        name: training[randomIndex]
    }
}

const generateTraining = (amount) => {
    for (let i = 0; i < amount; i++) {
        console.log(randomTraining())
    }
}

generateTraining(5)

module.export = { randomVolunteer, randomAward, randomDocument, randomRole, randomTraining }