const axios = require('axios');
const { setupServer, stopServer } = require('../server');
const { beforeAll, afterAll, afterEach, describe, test, expect } = require('@jest/globals');
const { dbSetup, stopDB, initTestDB, emptyTestDB } = require('../db/setup');
const { randomAward, randomVolunteer, randomRole, randomTraining, randomDocument } = require('../utils/random');
const { faker } = require('@faker-js/faker');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const Volunteer = require('../models/Volunteer');
const Award = require('../models/Award');
const Role = require('../models/Role');
const Training = require('../models/Training');
const Document = require('../models/Document');
const e = require('express');

beforeAll(async () => {
    // await dbSetup()
    await initTestDB()
    await setupServer()
}, 100000)

afterEach(async () => {
    await emptyTestDB()
}, 100000)

afterAll(async () => {
    await stopDB()
    await stopServer()
}, 100000)


describe("Awards", () => {
    describe("GET /awards", () => {
        test("Retrieving all awards should return a list of awards and a response with status 200", async () => {
            const numberOfAwards = 5
            const randomAwards = new Array(numberOfAwards)
            for (let i = 0; i < numberOfAwards; i++) {
                randomAwards[i] = randomAward()
                await axios.post(process.env.API_URL + '/awards', {
                    name: randomAwards[i].name,
                    requiredServiceLength: randomAwards[i].requiredServiceLength
                })
            }

            randomAwards.sort((a, b) => a.requiredServiceLength - b.requiredServiceLength)

            const response = await axios.get(process.env.API_URL + '/awards')

            expect(response.status).toBe(axios.HttpStatusCode.Ok)
            expect(response.data.length).toBe(numberOfAwards)
            response.data.forEach((award, index) => {
                expect(award).toHaveProperty('name');
                expect(award).toHaveProperty('requiredServiceLength');
                expect(award.name).toBe(randomAwards[index].name)
                expect(award.requiredServiceLength).toBe(randomAwards[index].requiredServiceLength)
            });
        })

        test("An error during award retrieval should result in a response with status 500", async () => {
            jest.spyOn(Award, 'find').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/awards')
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
            expect(error).not.toBe(null)

            Award.find.mockRestore()
        })

        test("When there are no awards available, an empty list should be returned", () => {
            return axios.get(process.env.API_URL + '/awards').then(response => {
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
                expect(response.data).toStrictEqual([])
            })
        })
    })

    describe("GET /awards/:id", () => {
        test("Retrieving an existing award by ID should return the award data and a response with status 200", async () => {
            const randAward = randomAward()
            const savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const response = await axios.get(process.env.API_URL + '/awards/' + savedAward.data._id)

            expect(response.data).toHaveProperty('name')
            expect(response.data).toHaveProperty('requiredServiceLength')
            expect(response.data.name).toBe(randAward.name)
            expect(response.data.requiredServiceLength).toBe(randAward.requiredServiceLength)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Requesting a non-existent award with an invalid object ID should result in a response with status 400", async () => {
            const awardId = -1
            let error = null
            try {
                await axios.get(process.env.API_URL + '/awards/' + awardId)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
            expect(error).not.toBeNull()
        })

        test("Requesting a non-existent award with a valid object ID should result in a response with status 400", async () => {
            const awardId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.get(process.env.API_URL + '/awards/' + awardId)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
            expect(error).not.toBeNull()
        })

        test("An error during award retrieval should result in a response with status 500", async () => {
            const randAward = randomAward()
            const savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            jest.spyOn(Award, 'findOne').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/awards/' + savedAward.data._id)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Award.findOne.mockRestore()
        })
    })

    describe("POST /awards", () => {
        test("Creating a new award with all required fields should return the created award and a response with status 201", async () => {
            const randAward = randomAward()
            const response = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            expect(response.data).toHaveProperty('name')
            expect(response.data).toHaveProperty('requiredServiceLength')
            expect(response.data.name).toBe(randAward.name)
            expect(response.data.requiredServiceLength).toBe(randAward.requiredServiceLength)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("Creating a new award with missing required fields should result in a response with status 400", async () => {
            const randAward = randomAward()
            let error = null
            try {
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
            expect(error).not.toBeNull()

            error = null
            try {
                await axios.post(process.env.API_URL + '/awards', {
                    requiredServiceLength: randAward.requiredServiceLength
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }

            expect(error).not.toBeNull()
        })

        test("Creating a new award with duplicate name should result in a response with status 409", async () => {
            const { data: existingAward } = await axios.post(process.env.API_URL + '/awards', {
                name: randomAward().name,
                requiredServiceLength: randomAward().requiredServiceLength
            })

            let error = null

            try {
                await axios.post(process.env.API_URL + '/awards', {
                    name: existingAward.name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.Conflict)
            }

            expect(error).not.toBeNull()
        })

        test("Creating a new award with unexpected fields the unexpected fields should not be saved to be database", async () => {
            const { data: award } = await axios.post(process.env.API_URL + '/awards', {
                name: randomAward().name,
                requiredServiceLength: randomAward().requiredServiceLength,
                unexpectedField: 'Unexpected Field'
            })
            expect(award).not.toHaveProperty('unexpectedField')
        })

        test("An error during award creation should result in a response with status 500", async () => {
            jest.spyOn(Award.prototype, 'save').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.post(process.env.API_URL + '/awards', {
                    name: randomAward().name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Award.prototype.save.mockRestore()
        })
    })

    describe('PUT /awards/:id', () => {
        test("Updates an existing award with valid data, should return updated award and status 200", async () => {
            const randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const updatedAward = randomAward()
            const response = await axios.put(process.env.API_URL + '/awards/' + savedAward.data._id, {
                name: updatedAward.name,
                requiredServiceLength: updatedAward.requiredServiceLength
            })

            expect(response.data).toHaveProperty('name')
            expect(response.data).toHaveProperty('requiredServiceLength')
            expect(response.data.name).toBe(updatedAward.name)
            expect(response.data.requiredServiceLength).toBe(updatedAward.requiredServiceLength)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test.todo("Updating an award with missing required fields, should fail and return a status of 400")
        // test("When updating an existing award with missing required fields, it should respond with status of 400", async () => {
        //     let randAward = randomAward()
        //     let savedAward = await axios.post(process.env.API_URL + '/awards', {
        //         name: randAward.name,
        //         requiredServiceLength: randAward.requiredServiceLength
        //     })

        //     let nameErr = null

        //     try {
        //         await axios.put(process.env.API_URL + '/awards/' + savedAward.data._id, {
        //             name: randAward.name
        //         })
        //     } catch (err) {
        //         nameErr = err
        //         expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
        //     }
        //     expect(nameErr).not.toBeNull()

        //     let requiredServiceLengthErr = null
        //     try {
        //         await axios.put(process.env.API_URL + '/awards/' + savedAward.data._id, {
        //             requiredServiceLength: randAward.requiredServiceLength
        //         })
        //     } catch (err) {
        //         requiredServiceLengthErr = err
        //         expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
        //     }
        //     expect(requiredServiceLengthErr).not.toBeNull()
        // })

        test("Updating a non-existent award with invalid object ID, should fail and return a status of 400", async () => {
            const awardId = -1
            let error = null
            try {
                await axios.put(process.env.API_URL + '/awards/' + awardId, {
                    name: randomAward().name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
            expect(error).not.toBeNull()
        })

        test("Updating a non-existent award with valid object ID, should fail and return a status of 404", async () => {
            const awardId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.put(process.env.API_URL + '/awards/' + awardId, {
                    name: randomAward().name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            }
            catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
            expect(error).not.toBeNull()
        })

        test("Updating award name should update volunteers' award names", async () => {
            const randAward = randomAward()
            const savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const randVolunteer = randomVolunteer()
            const savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: randVolunteer.documents,
                awards: [{
                    awardId: savedAward.data._id,
                    name: savedAward.data.name,
                    achievedDate: faker.date.past(),
                    givenDate: faker.date.past(),
                    isGiven: faker.datatype.boolean()
                }],
                training: randVolunteer.training
            })

            // This could be the same as the original award, so we need to make sure it's different
            let updatedAward = randomAward()
            while (updatedAward.name === savedAward.data.name) { //TODO: Clean this up
                updatedAward = randomAward()
            }

            // This should update any volunteers with that award
            const { data: updatedSavedAward } = await axios.put(process.env.API_URL + '/awards/' + savedAward.data._id, {
                name: updatedAward.name,
                requiredServiceLength: updatedAward.requiredServiceLength
            })

            const { data: fetchedVolunteer } = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)
            expect(fetchedVolunteer.awards[0].name).toBe(updatedSavedAward.name)
        })

        test("An error during award update should result in a response with status 500", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            jest.spyOn(Award, 'findOneAndUpdate').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.put(process.env.API_URL + '/awards/' + savedAward.data._id, {
                    name: randomAward().name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
        })

        test.todo("When auto-filling awards with a valid start date and break duration, it should return the awards and status of 200")
    })

    describe('DELETE /awards/:id', () => {
        test("Deleting an existing award should return the deleted award and a status of 200", async () => {
            const randAward = randomAward()
            const savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const response = await axios.delete(process.env.API_URL + '/awards/' + savedAward.data._id)
            let error = null
            try {
                await axios.get(process.env.API_URL + '/awards/' + savedAward.data._id)
            } catch (err) {
                error = err
            }
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
            expect(response.data.name).toBe(randAward.name)
            expect(response.data.requiredServiceLength).toBe(randAward.requiredServiceLength)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Deleting a non-existent award with an invalid object ID should respond with a status of 400", async () => {
            const awardId = -1
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/awards/' + awardId)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
            expect(error).not.toBeNull()
        })

        test("Deleting a non-existent award with a valid object ID should respond with status of 404", async () => {
            const awardId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/awards/' + awardId)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
            expect(error).not.toBeNull()
        })

        test("An error during award deletion should result in a response with status 500", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            jest.spyOn(Award, 'findOneAndDelete').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.delete(process.env.API_URL + '/awards/' + savedAward.data._id)
            } catch (err) {
                error = err
            }
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            expect(error).not.toBeNull()
        })
    })
})

describe("Roles", () => {
    describe("GET /roles", () => {
        test("Retrieving all roles should return a list of roles and a status of 200", async () => {
            let numberOfRoles = 5
            let randomRoles = new Array(numberOfRoles)
            for (let i = 0; i < numberOfRoles; i++) {
                randomRoles[i] = randomRole()
                await axios.post(process.env.API_URL + '/roles', {
                    name: randomRoles[i].name
                })
            }

            randomRoles.sort((a, b) => {
                const nameA = a.name.toUpperCase()
                const nameB = b.name.toUpperCase()
                if (nameA < nameB) {
                    return -1;
                }
                else if (nameA > nameB) {
                    return 1;
                }
                else {
                    return 0;
                }
            })

            const response = await axios.get(process.env.API_URL + '/roles')

            for (let i = 0; i < numberOfRoles; i++) {
                expect(response.data[i].name).toBe(randomRoles[i].name)
            }

            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("An error during roles retrieval should response with a status of 500", async () => {
            jest.spyOn(Role, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            try {
                await axios.get(process.env.API_URL + '/roles')
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            Role.find.mockRestore()
        })

        test("When there are no roles available, an empty list should be returned", () => {
            return axios.get(process.env.API_URL + '/roles').then(response => {
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
                expect(response.data).toStrictEqual([])
            })
        })
    })

    describe("GET /roles/:id", () => {
        test("When asked for an existing role with a valid object ID, it should respond with the role data and status of 200", async () => {
            const randRole = randomRole()
            const savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            const response = await axios.get(process.env.API_URL + '/roles/' + savedRole.data._id)

            expect(response.data.name).toBe(randRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When asked for a non-existent role with an invalid object ID, it should respond with status of 400", async () => {
            const roleId = -1
            try {
                await axios.get(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a non-existent role with a valid object ID, it should respond with status of 404", async () => {
            const roleId = faker.database.mongodbObjectId()
            try {
                await axios.get(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("An error during role retrieval should result in a response with status of 500", async () => {
            const randRole = randomRole()
            const savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            jest.spyOn(Role, 'findOne').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/roles/' + savedRole.data._id)
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Role.findOne.mockRestore()
        })
    })

    describe("POST /roles", () => {
        test("Creating a new role with all required fields should respond with the created role and status of 201", async () => {
            const randRole = randomRole()
            const response = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            expect(response.data.name).toBe(randRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("Creating a new role with missing required fields should respond with status of 400", async () => {
            let error = null
            try {
                await axios.post(process.env.API_URL + '/roles', {})
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("An error during role creation should result in a response with status of 500", async () => {
            jest.spyOn(Role.prototype, 'save').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.post(process.env.API_URL + '/roles', {
                    name: randomRole().name
                })
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Role.prototype.save.mockRestore()
        })
    })

    describe("PUT /roles/:id", () => {
        test("Updating an existing role with all required fields should respond with the updated role and status of 200", async () => {
            const randRole = randomRole()
            const savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            let updatedRole = randomRole()
            while (updatedRole.name === savedRole.data.name) {
                updatedRole = randomRole()
            }

            const response = await axios.put(process.env.API_URL + '/roles/' + savedRole.data._id, {
                name: updatedRole.name
            })

            expect(response.data.name).toBe(updatedRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Updating an existing role with invalid required fields should respond with status of 400", async () => {
            const randRole = randomRole()
            const savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            let error = null
            try {
                await axios.put(process.env.API_URL + '/roles/' + savedRole.data._id, {name: ""})
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Updating a non-existent role with an invalid object ID should respond with status of 400", async () => {
            const roleId = -1
            let error = null
            try {
                await axios.put(process.env.API_URL + '/roles/' + roleId, {
                    name: randomRole().name
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Updating a non-existent role with a valid object ID should respond with status of 404", async () => {
            const roleId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.put(process.env.API_URL + '/roles/' + roleId, {
                    name: randomRole().name
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("Updating the name of a role should update the name of the role in volunteers", async () => {
            const randRole = randomRole()
            const { data: savedRole } = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            const randVolunteer = randomVolunteer()
            const { data: savedVolunteer } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: [{
                    roleId: savedRole._id,
                    name: savedRole.name,
                }],
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            let updatedRole = randomRole()
            while (updatedRole.name === savedRole.name) {
                updatedRole = randomRole()
            }

            const { data: updatedSavedRole } = await axios.put(process.env.API_URL + '/roles/' + savedRole._id, {
                name: updatedRole.name
            })

            const { data: fetchedVolunteer } = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer._id)
            expect(fetchedVolunteer.roles[0].name).toBe(updatedSavedRole.name)
        })

        test("Updating the name of a role should update the name of the role in excluded roles in training", async () => {
            const randRole = randomRole()
            const { data: savedRole } = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: [{
                    roleId: savedRole._id,
                    name: savedRole.name
                }]
            })

            let updatedRole = randomRole()
            while (updatedRole.name === savedRole.name) {
                updatedRole = randomRole()
            }

            const { data: updatedSavedRole } = await axios.put(process.env.API_URL + '/roles/' + savedRole._id, {
                name: updatedRole.name
            })

            let { data: fetchedTraining } = await axios.get(process.env.API_URL + '/training/' + savedTraining._id)
            expect(fetchedTraining.excludedRoles[0].name).toBe(updatedSavedRole.name)
        })

        test("An error during role update should result in a response with status of 500", async () => {
            const randRole = randomRole()
            const savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            jest.spyOn(Role, 'findOneAndUpdate').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.put(process.env.API_URL + '/roles/' + savedRole.data._id, {
                    name: randomRole().name
                })
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Role.findOneAndUpdate.mockRestore()
        })
    })

    describe("DELETE /roles/:id", () => {
        test("Deleting an existing role should respond with the deleted roles and status of 200", async () => {
            const randRole = randomRole()
            const { data: savedRole } = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            const response = await axios.delete(process.env.API_URL + '/roles/' + savedRole._id)
            expect(response.data.name).toBe(randRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Deleting a non-existent role with an invalid object ID should respond with status of 400", async () => {
            const roleId = -1
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Deleting a non-existent role with a valid object ID should respond with status of 404", async () => {
            const roleId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("An error during role deletion should result in a response with status of 500", async () => {
            const randRole = randomRole()
            const { data: savedRole } = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            jest.spyOn(Role, 'findOneAndDelete').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.delete(process.env.API_URL + '/roles/' + savedRole._id)
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Role.findOneAndDelete.mockRestore()
        })
    })
})

describe("Training", () => {
    describe("GET /training", () => {
        test("Retrieving all training should return a list of awards with a status of 200", async () => {
            const excludedRole = randomRole()
            const { data: savedExcludedRole } = await axios.post(process.env.API_URL + '/roles', {
                name: excludedRole.name
            })

            const numberOfTraining = 10
            const randomTrainings = new Array(numberOfTraining)
            for (let i = 0; i < numberOfTraining; i++) {
                randomTrainings[i] = randomTraining()
            }

            randomTrainings.sort((a, b) => {
                return a.renewalFrequency - b.renewalFrequency
            })

            for (let i = 0; i < numberOfTraining; i++) {
                if (i % 2 === 0) {
                    randomTrainings[i].excludedRoles = [{
                        roleId: savedExcludedRole._id,
                        name: savedExcludedRole.name
                    }]
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randomTrainings[i].name,
                    renewalFrequency: randomTrainings[i].renewalFrequency,
                    excludedRoles: randomTrainings[i].excludedRoles
                })
            }

            const response = await axios.get(process.env.API_URL + '/training')

            for (let i = 0; i < numberOfTraining; i++) {
                expect(response.data[i].name).toBe(randomTrainings[i].name)
                expect(response.data[i].renewalFrequency).toBe(randomTrainings[i].renewalFrequency)
                if (i % 2 === 0) {
                    expect(response.data[i].excludedRoles[0].name).toBe(savedExcludedRole.name)
                    expect(response.data[i].excludedRoles[0].roleId).toBe(savedExcludedRole._id)
                }
                else {
                    expect(response.data[i].excludedRoles).toStrictEqual(randomTrainings[i].excludedRoles)
                }
            }
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("An error during training retrieval should response in a status of 404", async () => {
            jest.spyOn(Training, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/training')
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Training.find.mockRestore()
        })
    })

    describe("GET /training/:id", () => {
        test("Retrieving an existing training should respond with the training and a status of 200", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            const response = await axios.get(process.env.API_URL + '/training/' + savedTraining._id)

            expect(response.data.name).toBe(randTraining.name)
            expect(response.data.renewalFrequency).toBe(randTraining.renewalFrequency)
            expect(response.data.excludedRoles).toStrictEqual(randTraining.excludedRoles)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Retrieving a non-existent training with an invalid object ID should respond with status of 400", async () => {
            const trainingId = -1
            let error = null
            try {
                await axios.get(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Retrieving a non-existent training with a valid object ID should respond with status of 404", async () => {
            const trainingId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.get(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("An error during training retrieval should result in a response with status of 500", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            jest.spyOn(Training, 'findOne').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/training/' + savedTraining._id)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Training.findOne.mockRestore()
        })
    })

    describe("POST /training", () => {
        test("Creating a new training with all required fields should respond with the created training and status of 201", async () => {
            const randTraining = randomTraining()
            const response = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            expect(response.data.name).toBe(randTraining.name)
            expect(response.data.renewalFrequency).toBe(randTraining.renewalFrequency)
            expect(response.data.excludedRoles).toStrictEqual(randTraining.excludedRoles)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("Creating a new training with missing required fields should respond with status of 400", async () => {
            let error = null
            try {
                await axios.post(process.env.API_URL + '/training', { invalid: 'invalid' })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Creating a new training with an invalid role ID should respond with status of 400", async () => {
            let randTraining = randomTraining()
            randTraining.excludedRoles = [{
                roleId: -1,
                name: randomRole().name
            }]

            let error = null
            try {
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: randTraining.excludedRoles
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("An error during training creation should result in a response with status of 500", async () => {
            jest.spyOn(Training.prototype, 'save').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.post(process.env.API_URL + '/training', {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Training.prototype.save.mockRestore()
        })
    })

    describe("PUT /training/:id", () => {
        test("Updating an existing training with all required fields should respond with the updated training and status of 200", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            const excludedRole = randomRole()
            let { data: savedExcludedRole } = await axios.post(process.env.API_URL + '/roles', {
                name: excludedRole.name
            })

            let updatedTraining = randomTraining()
            while (updatedTraining.name === savedTraining.name) {
                updatedTraining = randomTraining()
            }

            updatedTraining.excludedRoles = [{
                roleId: savedExcludedRole._id,
                name: savedExcludedRole.name
            }]

            const response = await axios.put(process.env.API_URL + '/training/' + savedTraining._id, {
                name: updatedTraining.name,
                renewalFrequency: updatedTraining.renewalFrequency,
                excludedRoles: updatedTraining.excludedRoles
            })

            expect(response.data.name).toBe(updatedTraining.name)
            expect(response.data.renewalFrequency).toBe(updatedTraining.renewalFrequency)
            expect(response.data.excludedRoles[0].name).toBe(savedExcludedRole.name)
            expect(response.data.excludedRoles[0].roleId).toBe(savedExcludedRole._id)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Updating an existing training with invalid required fields should respond with status of 400 and the training should be unchanged", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            let error = null
            try {
                await axios.put(process.env.API_URL + '/training/' + savedTraining._id, { name: "" })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)

            error = null
            try {
                await axios.put(process.env.API_URL + '/training/' + savedTraining._id, { renewalFrequency: -1 })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)

            const { data: fetchedTraining } = await axios.get(process.env.API_URL + '/training/' + savedTraining._id)
            expect(fetchedTraining.name).toBe(randTraining.name)
            expect(fetchedTraining.renewalFrequency).toBe(randTraining.renewalFrequency)
            expect(fetchedTraining.excludedRoles).toStrictEqual(randTraining.excludedRoles)
        })

        test("Updating a non-existent training with an invalid object ID should respond with status of 400", async () => {
            const trainingId = -1
            let error = null
            try {
                await axios.put(process.env.API_URL + '/training/' + trainingId, {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Updating a non-existent training with a valid object ID should respond with status of 404", async () => {
            const trainingId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.put(process.env.API_URL + '/training/' + trainingId, {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("An error during training update should result in a response with status of 500", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            jest.spyOn(Training, 'findOneAndUpdate').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.put(process.env.API_URL + '/training/' + savedTraining._id, {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Training.findOneAndUpdate.mockRestore()
        })
    })

    describe("DELETE /training/:id", () => {
        test("Deleting an existing training should respond with the deleted training and status of 200", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            const response = await axios.delete(process.env.API_URL + '/training/' + savedTraining._id)
            expect(response.data.name).toBe(savedTraining.name)
            expect(response.data.renewalFrequency).toBe(savedTraining.renewalFrequency)
            expect(response.data.excludedRoles).toStrictEqual(savedTraining.excludedRoles)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Deleting a non-existent training with an invalid object ID should respond with status of 400", async () => {
            const trainingId = -1
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Deleting a non-existent training with a valid object ID should respond with status of 404", async () => {
            const trainingId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("An error during training deletion should result in a response with status of 500", async () => {
            const randTraining = randomTraining()
            const { data: savedTraining } = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            jest.spyOn(Training, 'findOneAndDelete').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.delete(process.env.API_URL + '/training/' + savedTraining._id)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Training.findOneAndDelete.mockRestore()
        })
    })
})

describe("Documents", () => {
    describe("GET /documents", () => {
        test("Retrieving all documents should respond with a list of roles and a status of 200", async () => {
            const numberOfDocuments = 5
            const randomDocuments = new Array(numberOfDocuments)
            for (let i = 0; i < numberOfDocuments; i++) {
                randomDocuments[i] = randomDocument()
                await axios.post(process.env.API_URL + '/documents', {
                    name: randomDocuments[i].name,
                    isRequired: randomDocuments[i].isRequired
                })
            }

            randomDocuments.sort((a, b) => {
                const nameA = a.name.toUpperCase()
                const nameB = b.name.toUpperCase()
                if (nameA < nameB) {
                    return -1;
                }
                else if (nameA > nameB) {
                    return 1;
                }
                else {
                    return 0;
                }
            })

            const response = await axios.get(process.env.API_URL + '/documents')

            for (let i = 0; i < numberOfDocuments; i++) {
                expect(response.data[i].name).toBe(randomDocuments[i].name)
                expect(response.data[i].isRequired).toBe(randomDocuments[i].isRequired)
            }

            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("An error during document retrieval should response with a status of 404", async () => {
            jest.spyOn(Document, 'find').mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/documents')
            } catch (err) {
                error = err
            }

            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Document.find.mockRestore();
        })
    })

    describe("GET /documents/:id", () => {
        test("Retrieving an existing document should retrieve it with status of 200", async () => {
            const randDocument = randomDocument()
            const { data: savedDocument } = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            const response = await axios.get(process.env.API_URL + '/documents/' + savedDocument._id)

            expect(response.data.name).toBe(randDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Retrieving a non-existent document with an invalid object ID should respond with status of 400", async () => {
            const documentId = -1
            let error = null
            try {
                await axios.get(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Retrieving a non-existent document with a valid object ID should respond with status of 404", async () => {
            const documentId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.get(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("An error during document retrieval should respond with a status of 500", async () => {
            jest.spyOn(Document, 'findOne').mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/documents/' + faker.database.mongodbObjectId())
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Document.findOne.mockRestore()
        })
    })

    describe("POST /documents", () => {
        test("Creating a new document with all required fields should respond with the created document and status of 201", async () => {
            const randDocument = randomDocument()
            const response = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            expect(response.data.name).toBe(randDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("Creating a new document with missing required fields should respond with status of 400", async () => {
            let error = null
            try {
                await axios.post(process.env.API_URL + '/documents', {})
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("An error during document creation should respond with a status of 500", async () => {
            jest.spyOn(Document.prototype, 'save').mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.post(process.env.API_URL + '/documents', {
                    name: randomDocument().name,
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Document.prototype.save.mockRestore()
        })
    })

    describe("PUT /documents/:id", () => {
        test("Updating an existing document with all required fields should respond with the updated document and status of 200", async () => {
            const randDocument = randomDocument()
            const { data: savedDocument } = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            let updatedDocument = randomDocument()
            while (updatedDocument.name === savedDocument.name) {
                updatedDocument = randomDocument()
            }

            const response = await axios.put(process.env.API_URL + '/documents/' + savedDocument._id, {
                name: updatedDocument.name,
            })

            expect(response.data.name).toBe(updatedDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Updating an existing document with invalid required fields should respond with status of 400", async () => {
            const randDocument = randomDocument()
            const { data: savedDocument } = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            let error = null
            try {
                await axios.put(process.env.API_URL + '/documents/' + savedDocument._id, { name: "" }) // When this empty, it's a 500
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Updating a non-existent document with an invalid object ID should respond with status of 400", async () => {
            const documentId = -1
            let error = null
            try {
                await axios.put(process.env.API_URL + '/documents/' + documentId, {
                    name: randomDocument().name,
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Updating a non-existent document with a valid object ID should respond with status of 404", async () => {
            const documentId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.put(process.env.API_URL + '/documents/' + documentId, {
                    name: randomDocument().name,
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("Updating the name of a document should update the name of the document in volunteers", async () => {
            const randDocument = randomDocument()
            const { data: savedDocument } = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            const randVolunteer = randomVolunteer()
            const { data: savedVolunteer } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: [{
                    documentId: savedDocument._id,
                    name: savedDocument.name,
                    isProvided: faker.datatype.boolean()
                }],
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            let updatedDocument = randomDocument()
            while (updatedDocument.name === savedDocument.name) {
                updatedDocument = randomDocument()
            }

            let { data: updatedSavedDocument } = await axios.put(process.env.API_URL + '/documents/' + savedDocument._id, {
                name: updatedDocument.name,
            })

            let { data: fetchedVolunteer } = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer._id)
            expect(fetchedVolunteer.documents[0].name).toBe(updatedSavedDocument.name)
        })

        test("An error during document update should respond with a status of 500", async () => {
            jest.spyOn(Document, 'findOneAndUpdate').mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.put(process.env.API_URL + '/documents/' + faker.database.mongodbObjectId(), {
                    name: randomDocument().name,
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Document.findOneAndUpdate.mockRestore()
        })
    })

    describe("DELETE /documents/:id", () => {
        test("Deleting an existing document should respond with the deleted document and status of 200", async () => {
            const randDocument = randomDocument()
            const { data: savedDocument } = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            const response = await axios.delete(process.env.API_URL + '/documents/' + savedDocument._id)
            expect(response.data.name).toBe(randDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Deleting a non-existent document with an invalid object ID should respond with status of 400", async () => {
            const documentId = -1
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Deleting a non-existent document with a valid object ID should respond with status of 404", async () => {
            const documentId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("An error during document deletion should respond with a status of 500", async () => {
            jest.spyOn(Document, 'findOneAndDelete').mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.delete(process.env.API_URL + '/documents/' + faker.database.mongodbObjectId())
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Document.findOneAndDelete.mockRestore()
        })
    })
})

describe("Volunteers", () => {
    describe("GET /volunteers", () => {
        test("Retrieving all volunteers should return a list of volunteers with a status of 200", async () => {
            const numberOfVolunteers = 5
            const randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                randomVolunteers[i] = randomVolunteer()

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            randomVolunteers.sort((a, b) => {
                const nameA = a.name.toUpperCase()
                const nameB = b.name.toUpperCase()
                if (nameA < nameB) {
                    return -1;
                }
                else if (nameA > nameB) {
                    return 1;
                }
                else {
                    return 0;
                }
            })

            const response = await axios.get(process.env.API_URL + '/volunteers')

            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].name).toBe(randomVolunteers[i].name)
                expect(response.data[i].startDate).toBe(randomVolunteers[i].startDate)
                expect(response.data[i].birthday).toBe(randomVolunteers[i].birthday)
                expect(response.data[i].breakDuration).toBe(randomVolunteers[i].breakDuration)
                expect(response.data[i].isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].roles).toStrictEqual(randomVolunteers[i].roles)
                expect(response.data[i].documents).toStrictEqual(randomVolunteers[i].documents)
                expect(response.data[i].awards).toStrictEqual(randomVolunteers[i].awards)
                expect(response.data[i].training).toStrictEqual(randomVolunteers[i].training)
            }

            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("An error during volunteer retrieval should response with a status of 500", async () => {
            jest.spyOn(Volunteer, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers')
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Volunteer.find.mockRestore();
        })
    })

    describe("GET /volunteers/:id", () => {
        test("Retrieving an existing volunteer should respond with the volunteer with status of 200", async () => {
            const randVolunteer = randomVolunteer()
            const { data: savedVolunteer } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            const response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer._id)

            expect(response.data.name).toBe(randVolunteer.name)
            expect(response.data.startDate).toBe(randVolunteer.startDate)
            expect(response.data.birthday).toBe(randVolunteer.birthday)
            expect(response.data.breakDuration).toBe(randVolunteer.breakDuration)
            expect(response.data.isArchived).toBe(randVolunteer.isArchived)
            expect(response.data.roles).toStrictEqual(randVolunteer.roles)
            expect(response.data.documents).toStrictEqual(randVolunteer.documents)
            expect(response.data.awards).toStrictEqual(randVolunteer.awards)
            expect(response.data.training).toStrictEqual(randVolunteer.training)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Retrieving a non-existent volunteer with an invalid object ID should respond with status of 400", async () => {
            const volunteerId = -1
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Retrieving a non-existent volunteer with a valid object ID should respond with status of 404", async () => {
            const volunteerId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })
    })

    describe("POST /volunteers", () => {
        test("Creating a new volunteer with all required fields should respond with the created volunteer and status of 201", async () => {
            const randVolunteer = randomVolunteer()
            const response = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            expect(response.data.name).toBe(randVolunteer.name)
            expect(response.data.startDate).toBe(randVolunteer.startDate)
            expect(response.data.birthday).toBe(randVolunteer.birthday)
            expect(response.data.breakDuration).toBe(randVolunteer.breakDuration)
            expect(response.data.isArchived).toBe(randVolunteer.isArchived)
            expect(response.data.roles).toStrictEqual(randVolunteer.roles)
            expect(response.data.documents).toStrictEqual(randVolunteer.documents)
            expect(response.data.awards).toStrictEqual(randVolunteer.awards)
            expect(response.data.training).toStrictEqual(randVolunteer.training)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("Creating a new volunteer with missing required fields should respond with status of 400", async () => {
            let error = null
            try {
                await axios.post(process.env.API_URL + '/volunteers', {})
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        // Testing with invalid role ID, trainig ID etc
    })

    describe("PUT /volunteers/:id", () => {
        test("Updating an existing volunteer with all required fields should respond with the updated volunteer and status of 200", async () => {
            const randVolunteer = randomVolunteer()
            const { data: savedVolunteer } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            const updatedVolunteer = randomVolunteer()

            const response = await axios.put(process.env.API_URL + '/volunteers/' + savedVolunteer._id, {
                name: updatedVolunteer.name,
                startDate: updatedVolunteer.startDate,
                birthday: updatedVolunteer.birthday,
                breakDuration: updatedVolunteer.breakDuration,
                isArchived: updatedVolunteer.isArchived,
                roles: updatedVolunteer.roles,
                documents: updatedVolunteer.documents,
                awards: updatedVolunteer.awards,
                training: updatedVolunteer.training
            })

            expect(response.data.name).toBe(updatedVolunteer.name)
            expect(response.data.startDate).toBe(updatedVolunteer.startDate)
            expect(response.data.birthday).toBe(updatedVolunteer.birthday)
            expect(response.data.breakDuration).toBe(updatedVolunteer.breakDuration)
            expect(response.data.isArchived).toBe(updatedVolunteer.isArchived)
            expect(response.data.roles).toStrictEqual(updatedVolunteer.roles)
            expect(response.data.documents).toStrictEqual(updatedVolunteer.documents)
            expect(response.data.awards).toStrictEqual(updatedVolunteer.awards)
            expect(response.data.training).toStrictEqual(updatedVolunteer.training)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Updating an existing volunteer with invalid required fields should respond with status of 400", async () => {
            const randVolunteer = randomVolunteer()
            const { data: savedVolunteer } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            let error = null
            try {
                await axios.put(process.env.API_URL + '/volunteers/' + savedVolunteer._id,  {
                    name: "",
                    startDate: "",
                    birthday: "",
                    breakDuration: -1,
                    isArchived: null,
                    roles: null,
                    documents: null,
                    awards: null,
                    training: null
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            //TODO - Check for specific error messages
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Updating a non-existent volunteer with an invalid object ID should respond with status of 400", async () => {
            const volunteerId = -1
            const randVolunteer = randomVolunteer()
            let error = null
            try {
                await axios.put(process.env.API_URL + '/volunteers/' + volunteerId, {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday,
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles,
                    documents: randVolunteer.documents,
                    awards: randVolunteer.awards,
                    training: randVolunteer.training
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Upading a non-existent volunteer with a valid object ID should respond with status of 404", async () => {
            const volunteerId = faker.database.mongodbObjectId()
            const randVolunteer = randomVolunteer()
            let error = null
            try {
                await axios.put(process.env.API_URL + '/volunteers/' + volunteerId, {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday,
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles,
                    documents: randVolunteer.documents,
                    awards: randVolunteer.awards,
                    training: randVolunteer.training
                })
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })
    })

    describe("DELETE /volunteers/:id", () => {
        test("Deleting an existing volunteer should respond with the deleted volunteer and status of 200", async () => {
            const randVolunteer = randomVolunteer()
            const { data: savedVolunteer } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            const response = await axios.delete(process.env.API_URL + '/volunteers/' + savedVolunteer._id)
            expect(response.data.name).toBe(randVolunteer.name)
            expect(response.data.startDate).toBe(randVolunteer.startDate)
            expect(response.data.birthday).toBe(randVolunteer.birthday)
            expect(response.data.breakDuration).toBe(randVolunteer.breakDuration)
            expect(response.data.isArchived).toBe(randVolunteer.isArchived)
            expect(response.data.roles).toStrictEqual(randVolunteer.roles)
            expect(response.data.documents).toStrictEqual(randVolunteer.documents)
            expect(response.data.awards).toStrictEqual(randVolunteer.awards)
            expect(response.data.training).toStrictEqual(randVolunteer.training)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Deleting a non-existent volunteer with an invalid object ID, it should respond with status of 400", async () => {
            const volunteerId = -1
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Deleting a non-existent volunteer with a valid object ID should respond with status of 404", async () => {
            const volunteerId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.delete(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })
    })

    describe("GET /volunteers/outstanding-documents", () => {
        // No outstanding
        test("When volunteers with no outstanding or missing documents should be returned all volunteers with empty missing and outstanding document arrays with a status of 200", async () => {
            const numberOfDocuments = 5
            for (let i = 0; i < numberOfDocuments; i++) {
                let randDocument = randomDocument()
                await axios.post(process.env.API_URL + '/documents', {
                    name: randDocument.name,
                })
            }


            const res = await axios.get(process.env.API_URL + '/documents')
            const randomDocuments = res.data

            const numberOfVolunteers = 10
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                for (let i = 0; i < randomDocuments.length; i++) {
                    randVolunteer.documents.push({
                        documentId: randomDocuments[i]._id,
                        name: randomDocuments[i].name,
                        isProvided: true
                    })
                }

                randomVolunteers[i] = randVolunteer
                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles,
                    documents: randVolunteer.documents,
                    awards: randVolunteer.awards,
                    training: randVolunteer.training
                })
            }

            // sort random volunteers by start date
            randomVolunteers.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const response = await axios.get(process.env.API_URL + '/volunteers/outstanding-documents')
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                //expect(response.data[i].volunteer._id).toBe(randomVolunteers[i].id) ID is auto generated
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].missingDocuments.length).toBe(0)
                expect(response.data[i].outstandingDocuments.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When volunteers have no outstanding documents but missing documents, all volunteers should be returned with empty outstanding document array and full missing documents array and with a status of 200", async () => {
            const numberOfDocuments = 5
            for (let i = 0; i < numberOfDocuments; i++) {
                let randDocument = randomDocument()
                await axios.post(process.env.API_URL + '/documents', {
                    name: randDocument.name,
                })
            }

            let numberOfVolunteers = 10
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer
                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles,
                    documents: randVolunteer.documents,
                    awards: randVolunteer.awards,
                    training: randVolunteer.training
                })
            }

            // sort random volunteers by start date
            randomVolunteers.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const response = await axios.get(process.env.API_URL + '/volunteers/outstanding-documents')
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                //expect(response.data[i].volunteer._id).toBe(randomVolunteers[i].id) ID is auto generated
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].missingDocuments.length).toBe(numberOfDocuments)
                expect(response.data[i].outstandingDocuments.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When volunteers have outstanding documents but no missing documents, all volunteers should be returned with empty missing document array and full outstanding documents array and with a status of 200", async () => {
            let numberOfDocuments = 5
            for (let i = 0; i < numberOfDocuments; i++) {
                let randDocument = randomDocument()
                await axios.post(process.env.API_URL + '/documents', {
                    name: randDocument.name,
                })
            }

            const documentResponse = await axios.get(process.env.API_URL + '/documents')
            const randomDocuments = documentResponse.data

            let numberOfVolunteers = 10
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                for (let i = 0; i < randomDocuments.length; i++) {
                    randVolunteer.documents.push({
                        documentId: randomDocuments[i]._id,
                        name: randomDocuments[i].name,
                        isProvided: false
                    })
                }
                randomVolunteers[i] = randVolunteer
                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles,
                    documents: randVolunteer.documents,
                    awards: randVolunteer.awards,
                    training: randVolunteer.training
                })
            }

            // sort random volunteers by start date
            randomVolunteers.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const response = await axios.get(process.env.API_URL + '/volunteers/outstanding-documents')
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].missingDocuments.length).toBe(0)
                expect(response.data[i].outstandingDocuments.length).toBe(numberOfDocuments)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When volunteers have outstanding and missing documents, all volunteers should be returned with valid missing and outstanding document arrays and with a status of 200", async () => {
            let numberOfDocuments = 5
            for (let i = 0; i < numberOfDocuments; i++) {
                let randDocument = randomDocument()
                await axios.post(process.env.API_URL + '/documents', {
                    name: randDocument.name,
                })
            }

            const documentResponse = await axios.get(process.env.API_URL + '/documents')
            const randomDocuments = documentResponse.data

            let numberOfVolunteers = 10
            let randomVolunteers = new Array(numberOfVolunteers)
            let numberOfOutstandingDocuments = Math.floor(numberOfDocuments / 2)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                for (let i = 0; i < numberOfOutstandingDocuments; i++) {
                    randVolunteer.documents.push({
                        documentId: randomDocuments[i]._id,
                        name: randomDocuments[i].name,
                        isProvided: false
                    })
                }
                randomVolunteers[i] = randVolunteer
                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles,
                    documents: randVolunteer.documents,
                    awards: randVolunteer.awards,
                    training: randVolunteer.training
                })
            }

            // sort random volunteers by start date
            randomVolunteers.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const response = await axios.get(process.env.API_URL + '/volunteers/outstanding-documents')
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].missingDocuments.length).toBe(numberOfDocuments - numberOfOutstandingDocuments)
                expect(response.data[i].outstandingDocuments.length).toBe(numberOfOutstandingDocuments)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        // No documents
        // No volunteers
        // No documents and no volunteers
    })

    describe("GET /volunteers/birthdays/:daysThreshold", () => {
        test("When volunteers have birthdays within the threshold, all should be received with a status of 200", async () => {
            let numberOfVolunteers = 5
            let daysThreshold = Math.floor(Math.random() * 335) + 30

            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let currentDate = new Date()
                let randomDays = Math.floor(Math.random() * daysThreshold)
                let randVolunteer = randomVolunteer()
                let updatedBirthday = moment(randVolunteer.birthday)
                updatedBirthday.set("month", currentDate.getMonth())
                updatedBirthday.set("date", currentDate.getDate() + randomDays)
                randVolunteer.birthday = updatedBirthday.toISOString()
                randomVolunteers[i] = randVolunteer
                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: updatedBirthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            randomVolunteers.sort((a, b) => {
                const birthdayA = moment(a.birthday).set('year', moment().year())
                const birthdayB = moment(b.birthday).set('year', moment().year())
                return birthdayA.isBefore(birthdayB) ? -1 : 1;
            });

            const response = await axios.get(process.env.API_URL + '/volunteers/birthdays/upcoming/' + daysThreshold)


            for (let i = 0; i < numberOfVolunteers; i++) {
                // _id, name, birthdays are returned
                expect(response.data[i].name).toBe(randomVolunteers[i].name)
                expect(response.data[i].birthday).toBe(randomVolunteers[i].birthday)
            }

            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When no volunteers have birthdays within the threshold, an empty array should be received with a status of 200", async () => {
            let numberOfVolunteers = 5
            let daysThreshold = 30

            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let currentDate = new Date()
                let randomDays = Math.floor(Math.random() * 100) + 1
                let randVolunteer = randomVolunteer()
                let updatedBirthday = moment(randVolunteer.birthday)
                updatedBirthday.set("month", currentDate.getMonth())
                updatedBirthday.set("date", currentDate.getDate())
                updatedBirthday.subtract(randomDays, 'days')
                randVolunteer.birthday = updatedBirthday.toISOString()
                randomVolunteers[i] = randVolunteer
                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: updatedBirthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            const response = await axios.get(process.env.API_URL + '/volunteers/birthdays/upcoming/' + daysThreshold)

            expect(response.data.length).toBe(0)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When the threshold is invalid, a response of 400 should be received", async () => {
            const daysThreshold = -1
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/birthdays/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("An error occurs when retrieving volunteers within threshold a response of 500 should be received", async () => {
            jest.spyOn(Volunteer, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            const validThreshold = 30
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/birthdays/upcoming/' + validThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            Volunteer.find.mockRestore();
        })
    })

    describe("GET /volunteers/training/upcoming/:daysThreshold", () => {
        test("When within the threshold (and no excluded roles), all should be received with a status of 200", async () => {
            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 0
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                if (randTraining.renewalFrequency > maxRenewalFrequency) {
                    maxRenewalFrequency = randTraining.renewalFrequency
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: randTraining.excludedRoles,
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer

                // Add the training to the volunteer
                for (let i = 0; i < randomTrainings.length; i++) {
                    let updatedTrainingDate = moment()
                    updatedTrainingDate.subtract(randomTrainings[i].renewalFrequency, 'years')
                    randVolunteer.training.push({
                        trainingId: randomTrainings[i]._id,
                        name: randomTrainings[i].name,
                        completedOn: updatedTrainingDate.toISOString(),
                        needsRetraining: true
                    })
                }

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/training/upcoming/' + maxRenewalFrequency) // exactly on threshold
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].overdueTraining.length).toBe(numberOfTraining)
                expect(response.data[i].missingTraining.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When within the threshold (and no excluded roles) and no volunteers have overdue training, all the missing training should be returned and an empty array for the outstanding training, should be received with a status of 200", async () => {
            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 0
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                if (randTraining.renewalFrequency > maxRenewalFrequency) {
                    maxRenewalFrequency = randTraining.renewalFrequency
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: randTraining.excludedRoles,
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                const {
                    data: savedVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer._id + '/training/upcoming/' + maxRenewalFrequency) // exactly on threshold
                expect(response.data.volunteer.name).toBe(randVolunteer.name)
                expect(response.data.volunteer.isArchived).toBe(randVolunteer.isArchived)
                expect(response.data.overdueTraining.length).toBe(0)
                expect(response.data.missingTraining.length).toBe(numberOfTraining)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When within the threshold (and no excluded roles) and all volunteers have valid training it should respond with an empty array for the outstanding training and missing training, should be received with a status of 200", async () => {
            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 2
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: maxRenewalFrequency,
                    excludedRoles: randTraining.excludedRoles,
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer

                // Add the training to the volunteer
                for (let i = 0; i < randomTrainings.length; i++) {
                    let updatedTrainingDate = moment()
                    // pick a random number between the renewal frequency and 0
                    let randomDays = Math.floor(Math.random() * (randomTrainings[i].renewalFrequency * 365))
                    updatedTrainingDate.add(1, 'days') // avoid being on the threshold
                    randVolunteer.training.push({
                        trainingId: randomTrainings[i]._id,
                        name: randomTrainings[i].name,
                        completedOn: updatedTrainingDate.toISOString(),
                        needsRetraining: false
                    })
                }

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/training/upcoming/' + maxRenewalFrequency * 365) // exactly on threshold
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].overdueTraining.length).toBe(0)
                expect(response.data[i].missingTraining.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When volunteers role excludes the training, all volunteers should be returned with empty missing and outstanding training arrays and with a status of 200", async () => {
            // create role
            await axios.post(process.env.API_URL + '/roles', {
                name: randomRole().name,
            })

            const roleResponse = await axios.get(process.env.API_URL + '/roles')
            const randRole = roleResponse.data[0]

            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 0
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                if (randTraining.renewalFrequency > maxRenewalFrequency) {
                    maxRenewalFrequency = randTraining.renewalFrequency
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: [{
                        roleId: randRole._id,
                        name: randRole.name
                    }],
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer
                // Add the training to the volunteer
                for (let i = 0; i < randomTrainings.length; i++) {
                    let updatedTrainingDate = moment()
                    updatedTrainingDate.subtract(randomTrainings[i].renewalFrequency, 'years')
                    randVolunteer.training.push({
                        trainingId: randomTrainings[i]._id,
                        name: randomTrainings[i].name,
                        completedOn: updatedTrainingDate.toISOString(),
                        needsRetraining: true
                    })
                }

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: [{
                        roleId: randRole._id,
                        name: randRole.name
                    }], // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/training/upcoming/' + maxRenewalFrequency * 365) // exactly on threshold
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].overdueTraining.length).toBe(0)
                expect(response.data[i].missingTraining.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When a invalid threshold is provided", async () => {
            const daysThreshold = -1
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/training/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

    })

    describe("GET /volunteers/:id/training/upcoming/:daysThreshold", () => {
        test("Existing volunteer within the threshold (and no excluded roles), all should be received with a status of 200", async () => {
            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 0
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                if (randTraining.renewalFrequency > maxRenewalFrequency) {
                    maxRenewalFrequency = randTraining.renewalFrequency
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: randTraining.excludedRoles,
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // Add the training to the volunteer
                for (let i = 0; i < randomTrainings.length; i++) {
                    let updatedTrainingDate = moment()
                    updatedTrainingDate.subtract(randomTrainings[i].renewalFrequency, 'years')
                    randVolunteer.training.push({
                        trainingId: randomTrainings[i]._id,
                        name: randomTrainings[i].name,
                        completedOn: updatedTrainingDate.toISOString(),
                        needsRetraining: true
                    })
                }

                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/training/upcoming/' + maxRenewalFrequency) // exactly on threshold
                expect(response.data.volunteer.name).toBe(randVolunteer.name)
                expect(response.data.volunteer.isArchived).toBe(randVolunteer.isArchived)
                expect(response.data.overdueTraining.length).toBe(numberOfTraining)
                expect(response.data.missingTraining.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When asked for a volunteer with training within the threshold (and no excluded roles) and no volunteers have overdue training, all the missing training should be returned and an empty array for the outstanding training, should be received with a status of 200", async () => {
            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 0
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                if (randTraining.renewalFrequency > maxRenewalFrequency) {
                    maxRenewalFrequency = randTraining.renewalFrequency
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: randTraining.excludedRoles,
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/training/upcoming/' + maxRenewalFrequency) // exactly on threshold
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].overdueTraining.length).toBe(0)
                expect(response.data[i].missingTraining.length).toBe(numberOfTraining)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When asked for a volunteer with training within the threshold (and no excluded roles) and volunteer has valid training should be returned and an empty array for the outstanding training and missing training, should be received with a status of 200", async () => {
            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 2
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: maxRenewalFrequency,
                    excludedRoles: randTraining.excludedRoles,
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // Add the training to the volunteer
                for (let i = 0; i < randomTrainings.length; i++) {
                    let updatedTrainingDate = moment()
                    // pick a random number between the renewal frequency and 0
                    let randomDays = Math.floor(Math.random() * (randomTrainings[i].renewalFrequency * 365))
                    updatedTrainingDate.add(1, 'days') // avoid being on the threshold
                    randVolunteer.training.push({
                        trainingId: randomTrainings[i]._id,
                        name: randomTrainings[i].name,
                        completedOn: updatedTrainingDate.toISOString(),
                        needsRetraining: false
                    })
                }

                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/training/upcoming/' + maxRenewalFrequency * 365) // exactly on threshold
                expect(response.data.volunteer.name).toBe(randVolunteer.name)
                expect(response.data.volunteer.isArchived).toBe(randVolunteer.isArchived)
                expect(response.data.overdueTraining.length).toBe(0)
                expect(response.data.missingTraining.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When asked for a list of volunteers with outstanding training and their role excludes the training, all volunteers should be returned with empty missing and outstanding training arrays and with a status of 200", async () => {
            // create role
            await axios.post(process.env.API_URL + '/roles', {
                name: randomRole().name,
            })

            const roleResponse = await axios.get(process.env.API_URL + '/roles')
            const randRole = roleResponse.data[0]

            // create training
            let numberOfTraining = 5
            let maxRenewalFrequency = 0
            for (let i = 0; i < numberOfTraining; i++) {
                let randTraining = randomTraining()
                if (randTraining.renewalFrequency > maxRenewalFrequency) {
                    maxRenewalFrequency = randTraining.renewalFrequency
                }
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: [{
                        roleId: randRole._id,
                        name: randRole.name
                    }],
                })
            }

            const trainingResponse = await axios.get(process.env.API_URL + '/training')
            const randomTrainings = trainingResponse.data

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                // Add the training to the volunteer
                for (let i = 0; i < randomTrainings.length; i++) {
                    let updatedTrainingDate = moment()
                    updatedTrainingDate.subtract(randomTrainings[i].renewalFrequency, 'years')
                    randVolunteer.training.push({
                        trainingId: randomTrainings[i]._id,
                        name: randomTrainings[i].name,
                        completedOn: updatedTrainingDate.toISOString(),
                        needsRetraining: true
                    })
                }

                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: [{
                        roleId: randRole._id,
                        name: randRole.name
                    }], // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/training/upcoming/' + maxRenewalFrequency * 365) // exactly on threshold
                expect(response.data.volunteer.name).toBe(randVolunteer.name)
                expect(response.data.volunteer.isArchived).toBe(randVolunteer.isArchived)
                expect(response.data.overdueTraining.length).toBe(0)
                expect(response.data.missingTraining.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("When volunteer does not exist", async () => {
            const daysThreshold = 30
            const volunteerId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId + '/training/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("When Volunteer ID is not a valid object id", async () => {
            const daysThreshold = 30
            const volunteerId = "123"
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId + '/training/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("When there is no training, an empty array should be the response", async () => {
            try {
                let daysThreshold = 30
                // create volunteer
                let randVolunteer = randomVolunteer()
                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/training/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("When a invalid days threshold is provided a status of 400 should be returned", async () => {
            let daysThreshold = -1
            // create volunteer
            let randVolunteer = randomVolunteer()
            const {
                data: createdVolunteer
            } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday, //Currently toISOString() format
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles, // Empty ATM
                documents: randVolunteer.documents, // Empty ATM
                awards: randVolunteer.awards, // Empty ATM
                training: randVolunteer.training // Empty ATM
            })

            let error = null

            try {
                await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/training/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })
    })

    describe("GET /volunteers/awards/upcoming/:daysThreshold", () => {
        test("Volunteers with awards within the threshold should respond with all volunteers and a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer

                // Add the training to the volunteer
                let today = moment()
                today.subtract(maxServiceLength, 'months')
                // random between 0 and 100
                let randomDays = Math.floor(Math.random() * 100)
                today.subtract(randomDays, 'days')
                randomVolunteers[i].startDate = today.toISOString()
                randomVolunteers[i].breakDuration = 0

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + 0) // exactly on threshold
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].upcomingAwards.length).toBe(numberOfAwards)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("No volunteers have awards within the threshold should respond with an empty array and a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer

                // add all awards to volunteer
                for (let i = 0; i < randomAwards.length; i++) {
                    let updatedAwardDate = moment()
                    // pick a random number between the renewal frequency and 0
                    let randomDays = Math.floor(Math.random() * (randomAwards[i].requiredServiceLength * 28))
                    updatedAwardDate.subtract(randomDays, 'days')
                    updatedAwardDate.add(1, 'days') // avoid being on the threshold
                    randVolunteer.awards.push({
                        awardId: randomAwards[i]._id,
                        name: randomAwards[i].name,
                        achievedDate: updatedAwardDate.toISOString(),
                        givenDate: updatedAwardDate.toISOString(),
                        isGiven: true,
                    })
                }

                randomVolunteers[i].startDate = moment().toISOString()
                randomVolunteers[i].breakDuration = 0

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + 0) // exactly on 
            expect(response.data).toStrictEqual([])
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("Volunteer has awards none are given should return all as not given with a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()
                randomVolunteers[i] = randVolunteer

                // add all awards to volunteer
                for (let i = 0; i < randomAwards.length; i++) {
                    let updatedAwardDate = moment()
                    // pick a random number between the renewal frequency and 0
                    let randomDays = Math.floor(Math.random() * (randomAwards[i].requiredServiceLength * 28))
                    updatedAwardDate.subtract(randomDays, 'days')
                    updatedAwardDate.add(1, 'days') // avoid being on the threshold
                    randVolunteer.awards.push({
                        awardId: randomAwards[i]._id,
                        name: randomAwards[i].name,
                        achievedDate: updatedAwardDate.toISOString(),
                        givenDate: updatedAwardDate.toISOString(),
                        isGiven: false,
                    })
                }

                randomVolunteers[i].startDate = moment().toISOString()
                randomVolunteers[i].breakDuration = 0

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randomVolunteers[i].name,
                    startDate: randomVolunteers[i].startDate,
                    birthday: randomVolunteers[i].birthday, //Currently toISOString() format
                    breakDuration: randomVolunteers[i].breakDuration,
                    isArchived: randomVolunteers[i].isArchived,
                    roles: randomVolunteers[i].roles, // Empty ATM
                    documents: randomVolunteers[i].documents, // Empty ATM
                    awards: randomVolunteers[i].awards, // Empty ATM
                    training: randomVolunteers[i].training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + 0) // exactly on
            for (let i = 0; i < numberOfVolunteers; i++) {
                expect(response.data[i].volunteer.name).toBe(randomVolunteers[i].name)
                expect(response.data[i].volunteer.isArchived).toBe(randomVolunteers[i].isArchived)
                expect(response.data[i].upcomingAwards.length).toBe(0)
                expect(response.data[i].awardsNotGiven.length).toBe(numberOfAwards)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("No volunteers should respond with an empty array and a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + 0) // exactly on 
            expect(response.data).toStrictEqual([])
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("The threshold is invalid a response of 400 should be received", async () => {
            let daysThreshold = -1
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("Volunteer has a break greater than the required service lengths should respond with an empty array and status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // Add the training to the volunteer
                let today = moment()
                today.subtract(maxServiceLength, 'months')
                // random between 0 and 100
                let randomDays = Math.floor(Math.random() * 100)
                today.subtract(randomDays, 'days')
                randVolunteer.startDate = today.toISOString()

                randVolunteer.breakDuration = maxServiceLength * 100

                await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })
            }

            // TODO volunteers not sorted by date

            const response = await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + 0) // exactly on threshold
            expect(response.data).toStrictEqual([])
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })
    })

    describe("GET /volunteers/:id/awards/upcoming/:daysThreshold", () => {
        test("Existing volunteer within the threshold should receive the awards as upcoming with a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // Add the training to the volunteer
                let today = moment()
                today.subtract(maxServiceLength, 'months')
                // random between 0 and 100
                let randomDays = Math.floor(Math.random() * 100)
                today.subtract(randomDays, 'days')
                randVolunteer.startDate = today.toISOString()
                randVolunteer.breakDuration = 0

                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + 0) // exactly on threshold
                expect(response.data.upcomingAwards.length).toBe(numberOfAwards)
                expect(response.data.awardsNotGiven.length).toBe(0)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("Existing volunteer does not have awards within the threshold, an empty array should be received with a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // add all awards to volunteer
                for (let i = 0; i < randomAwards.length; i++) {
                    let updatedAwardDate = moment()
                    // pick a random number between the renewal frequency and 0
                    let randomDays = Math.floor(Math.random() * (randomAwards[i].requiredServiceLength * 28))
                    updatedAwardDate.subtract(randomDays, 'days')
                    updatedAwardDate.add(1, 'days') // avoid being on the threshold
                    randVolunteer.awards.push({
                        awardId: randomAwards[i]._id,
                        name: randomAwards[i].name,
                        achievedDate: updatedAwardDate.toISOString(),
                        givenDate: updatedAwardDate.toISOString(),
                        isGiven: true,
                    })

                    randVolunteer.startDate = moment().toISOString()
                    randVolunteer.breakDuration = 0

                    const {
                        data: createdVolunteer
                    } = await axios.post(process.env.API_URL + '/volunteers', {
                        name: randVolunteer.name,
                        startDate: randVolunteer.startDate,
                        birthday: randVolunteer.birthday, //Currently toISOString() format
                        breakDuration: randVolunteer.breakDuration,
                        isArchived: randVolunteer.isArchived,
                        roles: randVolunteer.roles, // Empty ATM
                        documents: randVolunteer.documents, // Empty ATM
                        awards: randVolunteer.awards, // Empty ATM
                        training: randVolunteer.training // Empty ATM
                    })

                    // TODO volunteers not sorted by date

                    const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + 0) // exactly on 
                    expect(response.data.upcomingAwards).toStrictEqual([])
                    expect(response.data.awardsNotGiven).toStrictEqual([])
                    expect(response.status).toBe(axios.HttpStatusCode.Ok)
                }
            }
        })

        test("Existing volunteer has awards but none are given should be returned all as not given with a status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // add all awards to volunteer
                for (let i = 0; i < randomAwards.length; i++) {
                    let updatedAwardDate = moment()
                    // pick a random number between the renewal frequency and 0
                    let randomDays = Math.floor(Math.random() * (randomAwards[i].requiredServiceLength * 28))
                    updatedAwardDate.subtract(randomDays, 'days')
                    updatedAwardDate.add(1, 'days') // avoid being on the threshold
                    randVolunteer.awards.push({
                        awardId: randomAwards[i]._id,
                        name: randomAwards[i].name,
                        achievedDate: updatedAwardDate.toISOString(),
                        givenDate: updatedAwardDate.toISOString(),
                        isGiven: false,
                    })
                }

                randVolunteer.startDate = moment().toISOString()
                randVolunteer.breakDuration = 0

                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + 0) // exactly on 
                expect(response.data.upcomingAwards.length).toBe(0)
                expect(response.data.awardsNotGiven.length).toBe(numberOfAwards)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })

        test("Volunteer not existing should return a status of 404", async () => {
            const daysThreshold = 30
            const volunteerId = faker.database.mongodbObjectId()
            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId + '/awards/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("Existing volunteers and an invalid threshold should respond with a status of 400", async () => {
            let daysThreshold = -1
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            // create volunteer
            let randVolunteer = randomVolunteer()
            const {
                data: createdVolunteer
            } = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday, //Currently toISOString() format
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles, // Empty ATM
                documents: randVolunteer.documents, // Empty ATM
                awards: randVolunteer.awards, // Empty ATM
                training: randVolunteer.training // Empty ATM
            })

            let error = null
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.BadRequest)
        })

        test("No Awards Exist", async () => {
            let error = null
            try {
                let daysThreshold = 30
                // create volunteer
                let randVolunteer = randomVolunteer()
                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + daysThreshold)
            } catch (err) {
                error = err
            }
            expect(error).not.toBeNull()
            expect(error.response.status).toBe(axios.HttpStatusCode.NotFound)
        })

        test("Volunteer has a break greater than the given awards should respond with empty arrays with status of 200", async () => {
            // create training
            let numberOfAwards = 5
            let maxServiceLength = 0
            for (let i = 0; i < numberOfAwards; i++) {
                let randAward = randomAward()
                if (randAward.requiredServiceLength > maxServiceLength) {
                    maxServiceLength = randAward.requiredServiceLength
                }
                await axios.post(process.env.API_URL + '/awards', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength,
                })
            }

            const {
                data: randomAwards
            } = await axios.get(process.env.API_URL + '/awards')

            // create volunteers with training - all over threshold
            let numberOfVolunteers = 5
            for (let i = 0; i < numberOfVolunteers; i++) {
                let randVolunteer = randomVolunteer()

                // Add the training to the volunteer
                let today = moment()
                today.subtract(maxServiceLength, 'months')
                // random between 0 and 100
                let randomDays = Math.floor(Math.random() * 100)
                today.subtract(randomDays, 'days')
                randVolunteer.startDate = today.toISOString()

                randVolunteer.breakDuration = maxServiceLength * 100

                const {
                    data: createdVolunteer
                } = await axios.post(process.env.API_URL + '/volunteers', {
                    name: randVolunteer.name,
                    startDate: randVolunteer.startDate,
                    birthday: randVolunteer.birthday, //Currently toISOString() format
                    breakDuration: randVolunteer.breakDuration,
                    isArchived: randVolunteer.isArchived,
                    roles: randVolunteer.roles, // Empty ATM
                    documents: randVolunteer.documents, // Empty ATM
                    awards: randVolunteer.awards, // Empty ATM
                    training: randVolunteer.training // Empty ATM
                })

                // TODO volunteers not sorted by date

                const response = await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + 0) // exactly on threshold
                expect(response.data.upcomingAwards).toStrictEqual([])
                expect(response.data.awardsNotGiven).toStrictEqual([])
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            }
        })
    })

    describe("PUT /volunteers/training/update", () => {
        // write test.todos for all the different scenarios
        test.todo("When asked to update all volunteer's training, the volunteers training should be updated and a status of 200 should be received")

        test.todo("When asked to update all volunteer's training and there are no volunteers, a status of 200 should be received")

        test.todo("When asked to update all volunteer's training and an error occurs, a status of 500 should be received")

        test.todo("When asked to update all volunteer's training and there are no training")
    })

    describe("PUT /volunteers/awards/update", () => {
        test.todo("When asked to update all volunteer's awards, the volunteers awards should be updated and a status of 200 should be received")

        test.todo("When asked to update all volunteer's awards and there are no volunteers, a status of 200 should be received")

        test.todo("When asked to update all volunteer's awards and an error occurs, a status of 500 should be received")

        test.todo("When asked to update all volunteer's awards and there are no awards")
    })
})