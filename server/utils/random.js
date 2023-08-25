const { faker } = require('@faker-js/faker');

const documents = ["Document 1", "Document 2", "Document 3", "Document 4"]
const roles = ["Role 1", "Role 2", "Role 3", "Role 4"]
const awards = ["Award 1", "Award 2", "Award 3"]
const training = ["Training 1", "Training 2", "Training 3"]

const randomVolunteer = () => {
    return {
        id: faker.database.mongodbObjectId(),
        name: faker.person.fullName(),
        startDate: faker.date.past({years: 10}).toISOString(),
        birthday: faker.date.birthdate().toISOString(),
        breakDuration: faker.number.int({min: 0, max: 1000}), // Max could be present - start date
        isArchived: false,
        roles: [],
        documents: [],
        awards: [],
        training: []
    }
}

const randomDocument = () => {
    const randomName = "Document" + faker.number.int({min: 1, max: 1000000})
    return {
        id: faker.database.mongodbObjectId(),
        name: randomName
    }
}

const randomRole = () => {
    const randomName = "Role" + faker.number.int({min: 1, max: 1000000})
    return {
        id: faker.database.mongodbObjectId(),
        name: randomName
    }
}

const randomAward = () => {
    const randomName = "Award" + faker.number.int({min: 1, max: 1000000})
    return {
        id: faker.database.mongodbObjectId(),
        name: randomName,
        requiredServiceLength: faker.number.int({min: 0, max: 1000})
    }
}

const randomTraining = () => {
    const randomName = "Training" + faker.number.int({min: 1, max: 1000000})
    return {
        id: faker.database.mongodbObjectId(),
        name: randomName,
        renewalFrequency: faker.number.int({min: 1, max: 5}),
        excludedRoles: []
    }
}

module.exports = { randomVolunteer, randomAward, randomDocument, randomRole, randomTraining }