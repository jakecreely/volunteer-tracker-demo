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

const randomDocument = () => {
    const randomIndex = Math.floor(Math.random() * documents.length)
    return {
        id: faker.database.mongodbObjectId(),
        name: documents[randomIndex]
    }
}

const randomRole = () => {
    const randomIndex = Math.floor(Math.random() * roles.length);
    return {
        id: faker.database.mongodbObjectId(),
        name: roles[randomIndex]
    }
}

const randomAward = () => {
    const randomIndex = Math.floor(Math.random() * awards.length);
    return {
        id: faker.database.mongodbObjectId(),
        name: awards[randomIndex],
        requiredServiceLength: faker.number.int({min: 0, max: 1000})
    }
}

const randomTraining = () => {
    const randomIndex = Math.floor(Math.random() * training.length);
    return {
        id: faker.database.mongodbObjectId(),
        name: training[randomIndex]
    }
}

module.exports = { randomVolunteer, randomAward, randomDocument, randomRole, randomTraining }