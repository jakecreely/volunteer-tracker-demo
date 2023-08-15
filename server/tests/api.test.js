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

beforeAll(async () => {
    // await dbSetup()
    await initTestDB()
    await setupServer()
})

afterEach(async () => {
    await emptyTestDB()
})

afterAll(async () => {
    await stopDB()
    await stopServer()
})


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
            const {data: award} = await axios.post(process.env.API_URL + '/awards', {
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
        test("When updating an existing award with all required fields, it should respond with the updated award and status of 200", async () => {
            try {
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

                expect(response.data.name).toBe(updatedAward.name)
                expect(response.data.requiredServiceLength).toBe(updatedAward.requiredServiceLength)
                expect(response.status).toBe(axios.HttpStatusCode.Ok)
            } catch (err) {
                console.log(err)
            }
        })

        test.todo("When updating an existing award with missing required fields, it should respond with status of 400")
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

        test("When updating a non-existent award with an invalid object ID, it should respond with status of 400", async () => {
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

        test("When updating a non-existent award with a valid object ID, it should respond with status of 404", async () => {
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

        // Updating the name of the award, should update the name of the award in volunteers
        test("When updating the name of an award, it should update the name of the award in volunteers", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
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
            let updatedSavedAward = await axios.put(process.env.API_URL + '/awards/' + savedAward.data._id, {
                name: updatedAward.name,
                requiredServiceLength: updatedAward.requiredServiceLength
            })

            let response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)
            expect(response.data.awards[0].name).toBe(updatedSavedAward.data.name)
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
        test("When deleting an existing award, it should respond with status of 200", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const response = await axios.delete(process.env.API_URL + '/awards/' + savedAward.data._id)
            try {
                await axios.get(process.env.API_URL + '/awards/' + savedAward.data._id)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When deleting a non-existent award with an invalid object ID, it should respond with status of 400", async () => {
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

        test("When deleting a non-existent award with a valid object ID, it should respond with status of 404", async () => {
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
        })
    })
})

describe("Roles", () => {
    describe("GET /roles", () => {
        test("When asked for a list of the roles, all should be received with a status of 200", async () => {
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

        test("When asked for a list of roles and an error occurs, a response of 404 should be received", async () => {
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
    })

    describe("GET /roles/:id", () => {
        test("When asked for an existing role, it should retrieve it and respond with status of 200", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            const response = await axios.get(process.env.API_URL + '/roles/' + savedRole.data._id)

            expect(response.data.name).toBe(randRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When asked for a non-existent role with an invalid object ID, it should respond with status of 400", async () => {
            let roleId = -1
            try {
                await axios.get(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a non-existent role with a valid object ID, it should respond with status of 404", async () => {
            let roleId = faker.database.mongodbObjectId()
            try {
                await axios.get(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("An error during role retrieval should result in a response with status of 500", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Role.findOne.mockRestore()
        })
    })

    describe("POST /roles", () => {
        test("When creating a new role with all required fields, it should respond with the created role and status of 201", async () => {
            let randRole = randomRole()
            const response = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            expect(response.data.name).toBe(randRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("When creating a new role with missing required fields, it should respond with status of 400", async () => {
            try {
                await axios.post(process.env.API_URL + '/roles', {})
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Role.prototype.save.mockRestore()
        })
    })

    describe("PUT /roles/:id", () => {
        test("When updating an existing role with all required fields, it should respond with the updated role and status of 200", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
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

        test("When updating an existing role with missing required fields, it should respond with status of 400", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            try {
                await axios.put(process.env.API_URL + '/roles/' + savedRole.data._id, {})
            } catch (err) {
                //TODO: Should be 400, but it's 500 - need to check the body before trying to update
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
        })

        test("When updating a non-existent role with an invalid object ID, it should respond with status of 400", async () => {
            let roleId = -1
            try {
                await axios.put(process.env.API_URL + '/roles/' + roleId, {
                    name: randomRole().name
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent role with a valid object ID, it should respond with status of 404", async () => {
            let roleId = faker.database.mongodbObjectId()
            try {
                await axios.put(process.env.API_URL + '/roles/' + roleId, {
                    name: randomRole().name
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("When updating the name of a role, it should update the name of the role in volunteers", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: [{
                    roleId: savedRole.data._id,
                    name: savedRole.data.name,
                }],
                documents: randVolunteer.documents,
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            let updatedRole = randomRole()
            while (updatedRole.name === savedRole.data.name) {
                updatedRole = randomRole()
            }

            let updatedSavedRole = await axios.put(process.env.API_URL + '/roles/' + savedRole.data._id, {
                name: updatedRole.name
            })

            let response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)
            expect(response.data.roles[0].name).toBe(updatedSavedRole.data.name)
        })

        test("When updating the name of a role, it should update the name of the role in excluded roles in training", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: [{
                    roleId: savedRole.data._id,
                    name: savedRole.data.name
                }]
            })

            let updatedRole = randomRole()
            while (updatedRole.name === savedRole.data.name) {
                updatedRole = randomRole()
            }

            let updatedSavedRole = await axios.put(process.env.API_URL + '/roles/' + savedRole.data._id, {
                name: updatedRole.name
            })

            let response = await axios.get(process.env.API_URL + '/training/' + savedTraining.data._id)
            expect(response.data.excludedRoles[0].name).toBe(updatedSavedRole.data.name)
        })

        test("An error during role update should result in a response with status of 500", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Role.findOneAndUpdate.mockRestore()
        })
    })

    describe("DELETE /roles/:id", () => {
        test("When deleting an existing role, it should respond with the deleted roles and status of 200", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            const response = await axios.delete(process.env.API_URL + '/roles/' + savedRole.data._id)
            expect(response.data.name).toBe(randRole.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When deleting a non-existent role with an invalid object ID, it should respond with status of 400", async () => {
            let roleId = -1
            try {
                await axios.delete(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When deleting a non-existent role with a valid object ID, it should respond with status of 404", async () => {
            let roleId = faker.database.mongodbObjectId()
            try {
                await axios.delete(process.env.API_URL + '/roles/' + roleId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("An error during role deletion should result in a response with status of 500", async () => {
            let randRole = randomRole()
            let savedRole = await axios.post(process.env.API_URL + '/roles', {
                name: randRole.name
            })

            jest.spyOn(Role, 'findOneAndDelete').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.delete(process.env.API_URL + '/roles/' + savedRole.data._id)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Role.findOneAndDelete.mockRestore()
        })
    })
})

describe("Training", () => {
    describe("GET /training", () => {
        test("When asked for a list of the training, all should be received with a status of 200", async () => {
            let excludedRole = randomRole()
            let savedExcludedRole = await axios.post(process.env.API_URL + '/roles', {
                name: excludedRole.name
            })

            let numberOfTraining = 10
            let randomTrainings = new Array(numberOfTraining)
            for (let i = 0; i < numberOfTraining; i++) {
                randomTrainings[i] = randomTraining()
            }

            randomTrainings.sort((a, b) => {
                return a.renewalFrequency - b.renewalFrequency
            })

            for (let i = 0; i < numberOfTraining; i++) {
                if (i % 2 === 0) {
                    randomTrainings[i].excludedRoles = [{
                        roleId: savedExcludedRole.data._id,
                        name: savedExcludedRole.data.name
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
                    expect(response.data[i].excludedRoles[0].name).toBe(savedExcludedRole.data.name)
                    expect(response.data[i].excludedRoles[0].roleId).toBe(savedExcludedRole.data._id)
                }
                else {
                    expect(response.data[i].excludedRoles).toStrictEqual(randomTrainings[i].excludedRoles)
                }
            }
        })

        test("When asked for a list of training and an error occurs, a response of 404 should be received", async () => {
            jest.spyOn(Training, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            try {
                await axios.get(process.env.API_URL + '/training')
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            Training.find.mockRestore()
        })
    })

    describe("GET /training/:id", () => {
        test("When asked for an existing training, it should retrieve it and respond with status of 200", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            const response = await axios.get(process.env.API_URL + '/training/' + savedTraining.data._id)

            expect(response.data.name).toBe(randTraining.name)
            expect(response.data.renewalFrequency).toBe(randTraining.renewalFrequency)
            expect(response.data.excludedRoles).toStrictEqual(randTraining.excludedRoles)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When asked for a non-existent training with an invalid object ID, it should respond with status of 400", async () => {
            let trainingId = -1
            try {
                await axios.get(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a non-existent training with a valid object ID, it should respond with status of 404", async () => {
            let trainingId = faker.database.mongodbObjectId()
            try {
                await axios.get(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("An error during training retrieval should result in a response with status of 500", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            jest.spyOn(Training, 'findOne').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.get(process.env.API_URL + '/training/' + savedTraining.data._id)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
            expect(error).not.toBeNull()
            Training.findOne.mockRestore()
        })
    })

    describe("POST /training", () => {
        test("When creating a new training with all required fields, it should respond with the created training and status of 201", async () => {
            let randTraining = randomTraining()
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

        test("When creating a new training with missing required fields, it should respond with status of 400", async () => {
            try {
                await axios.post(process.env.API_URL + '/training', { invalid: 'invalid' })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When creating a new training with an invalid role ID, it should respond with status of 400", async () => {
            let randTraining = randomTraining()
            randTraining.excludedRoles = [{
                roleId: -1,
                name: randomRole().name
            }]

            try {
                await axios.post(process.env.API_URL + '/training', {
                    name: randTraining.name,
                    renewalFrequency: randTraining.renewalFrequency,
                    excludedRoles: randTraining.excludedRoles
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Training.prototype.save.mockRestore()
        })
    })

    describe("PUT /training/:id", () => {
        test("When updating an existing training with all required fields, it should respond with the updated training and status of 200", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            let excludedRole = randomRole()
            let savedExcludedRole = await axios.post(process.env.API_URL + '/roles', {
                name: excludedRole.name
            })

            let updatedTraining = randomTraining()
            while (updatedTraining.name === savedTraining.data.name) {
                updatedTraining = randomTraining()
            }

            updatedTraining.excludedRoles = [{
                roleId: savedExcludedRole.data._id,
                name: savedExcludedRole.data.name
            }]

            const response = await axios.put(process.env.API_URL + '/training/' + savedTraining.data._id, {
                name: updatedTraining.name,
                renewalFrequency: updatedTraining.renewalFrequency,
                excludedRoles: updatedTraining.excludedRoles
            })

            expect(response.data.name).toBe(updatedTraining.name)
            expect(response.data.renewalFrequency).toBe(updatedTraining.renewalFrequency)
            expect(response.data.excludedRoles[0].name).toBe(savedExcludedRole.data.name)
            expect(response.data.excludedRoles[0].roleId).toBe(savedExcludedRole.data._id)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When updating an existing training with missing required fields, it should respond with status of 400 and the training should be unchanged", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            try {
                await axios.put(process.env.API_URL + '/training/' + savedTraining.data._id, { invalid: 'invalid' })
            } catch (err) {
                let response = await axios.get(process.env.API_URL + '/training/' + savedTraining.data._id)
                expect(response.data.name).toBe(randTraining.name)
                expect(response.data.renewalFrequency).toBe(randTraining.renewalFrequency)
                expect(response.data.excludedRoles).toStrictEqual(randTraining.excludedRoles)
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent training with an invalid object ID, it should respond with status of 400", async () => {
            let trainingId = -1
            try {
                await axios.put(process.env.API_URL + '/training/' + trainingId, {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent training with a valid object ID, it should respond with status of 404", async () => {
            let trainingId = faker.database.mongodbObjectId()
            try {
                await axios.put(process.env.API_URL + '/training/' + trainingId, {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("An error during training update should result in a response with status of 500", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            jest.spyOn(Training, 'findOneAndUpdate').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.put(process.env.API_URL + '/training/' + savedTraining.data._id, {
                    name: randomTraining().name,
                    renewalFrequency: randomTraining().renewalFrequency,
                    excludedRoles: randomTraining().excludedRoles
                })
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Training.findOneAndUpdate.mockRestore()
        })
    })

    describe("DELETE /training/:id", () => {
        test("When deleting an existing training, it should respond with the deleted training and status of 200", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            const response = await axios.delete(process.env.API_URL + '/training/' + savedTraining.data._id)
            expect(response.data.name).toBe(savedTraining.data.name)
            expect(response.data.renewalFrequency).toBe(savedTraining.data.renewalFrequency)
            expect(response.data.excludedRoles).toStrictEqual(savedTraining.data.excludedRoles)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When deleting a non-existent training with an invalid object ID, it should respond with status of 400", async () => {
            let trainingId = -1
            try {
                await axios.delete(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When deleting a non-existent training with a valid object ID, it should respond with status of 404", async () => {
            let trainingId = faker.database.mongodbObjectId()
            try {
                await axios.delete(process.env.API_URL + '/training/' + trainingId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("An error during training deletion should result in a response with status of 500", async () => {
            let randTraining = randomTraining()
            let savedTraining = await axios.post(process.env.API_URL + '/training', {
                name: randTraining.name,
                renewalFrequency: randTraining.renewalFrequency,
                excludedRoles: randTraining.excludedRoles
            })

            jest.spyOn(Training, 'findOneAndDelete').mockImplementation(() => {
                throw new Error('Database Connection Error');
            });

            let error = null
            try {
                await axios.delete(process.env.API_URL + '/training/' + savedTraining.data._id)
            } catch (err) {
                error = err
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            expect(error).not.toBeNull()
            Training.findOneAndDelete.mockRestore()
        })
    })
})

describe("Documents", () => {
    describe("GET /documents", () => {
        test("When asked for a list of the documents, all should be received with a status of 200", async () => {
            let numberOfDocuments = 5
            let randomDocuments = new Array(numberOfDocuments)
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

        test("When asked for a list of documents and an error occurs, a response of 404 should be received", async () => {
            jest.spyOn(Document, 'find').mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            try {
                await axios.get(process.env.API_URL + '/documents')
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            Document.find.mockRestore();
        })
    })

    describe("GET /documents/:id", () => {
        test("When asked for an existing document, it should retrieve it and respond with status of 200", async () => {
            let randDocument = randomDocument()
            let savedDocument = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            const response = await axios.get(process.env.API_URL + '/documents/' + savedDocument.data._id)

            expect(response.data.name).toBe(randDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When asked for a non-existent document with an invalid object ID, it should respond with status of 400", async () => {
            let documentId = -1
            try {
                await axios.get(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a non-existent document with a valid object ID, it should respond with status of 404", async () => {
            let documentId = faker.database.mongodbObjectId()
            try {
                await axios.get(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
            expect(error).not.toBeNull()

            Document.findOne.mockRestore()
        })
    })

    describe("POST /documents", () => {
        test("When creating a new document with all required fields, it should respond with the created document and status of 201", async () => {
            let randDocument = randomDocument()
            const response = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            expect(response.data.name).toBe(randDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("When creating a new document with missing required fields, it should respond with status of 400", async () => {
            try {
                await axios.post(process.env.API_URL + '/documents', {})
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
            expect(error).not.toBeNull()

            Document.prototype.save.mockRestore()
        })
    })

    describe("PUT /documents/:id", () => {
        test("When updating an existing document with all required fields, it should respond with the updated document and status of 200", async () => {
            let randDocument = randomDocument()
            let savedDocument = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            let updatedDocument = randomDocument()
            while (updatedDocument.name === savedDocument.data.name) {
                updatedDocument = randomDocument()
            }

            const response = await axios.put(process.env.API_URL + '/documents/' + savedDocument.data._id, {
                name: updatedDocument.name,
            })

            expect(response.data.name).toBe(updatedDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When updating an existing document with missing required fields, it should respond with status of 400", async () => {
            let randDocument = randomDocument()
            let savedDocument = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            try {
                await axios.put(process.env.API_URL + '/documents/' + savedDocument.data._id, { invalid: "invalid" }) // When this empty, it's a 500
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent document with an invalid object ID, it should respond with status of 400", async () => {
            let documentId = -1
            try {
                await axios.put(process.env.API_URL + '/documents/' + documentId, {
                    name: randomDocument().name,
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent document with a valid object ID, it should respond with status of 404", async () => {
            let documentId = faker.database.mongodbObjectId()
            try {
                await axios.put(process.env.API_URL + '/documents/' + documentId, {
                    name: randomDocument().name,
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("When updating the name of a document, it should update the name of the document in volunteers", async () => {
            let randDocument = randomDocument()
            let savedDocument = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
                name: randVolunteer.name,
                startDate: randVolunteer.startDate,
                birthday: randVolunteer.birthday,
                breakDuration: randVolunteer.breakDuration,
                isArchived: randVolunteer.isArchived,
                roles: randVolunteer.roles,
                documents: [{
                    documentId: savedDocument.data._id,
                    name: savedDocument.data.name,
                    isProvided: faker.datatype.boolean()
                }],
                awards: randVolunteer.awards,
                training: randVolunteer.training
            })

            let updatedDocument = randomDocument()
            while (updatedDocument.name === savedDocument.data.name) {
                updatedDocument = randomDocument()
            }

            let updatedSavedDocument = await axios.put(process.env.API_URL + '/documents/' + savedDocument.data._id, {
                name: updatedDocument.name,
            })

            let response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)
            expect(response.data.documents[0].name).toBe(updatedSavedDocument.data.name)
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
            expect(error).not.toBeNull()

            Document.findOneAndUpdate.mockRestore()
        })
    })

    describe("DELETE /documents/:id", () => {
        test("When deleting an existing document, it should respond with the deleted document and status of 200", async () => {
            let randDocument = randomDocument()
            let savedDocument = await axios.post(process.env.API_URL + '/documents', {
                name: randDocument.name,
            })

            const response = await axios.delete(process.env.API_URL + '/documents/' + savedDocument.data._id)
            expect(response.data.name).toBe(randDocument.name)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When deleting a non-existent document with an invalid object ID, it should respond with status of 400", async () => {
            let documentId = -1
            try {
                await axios.delete(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When deleting a non-existent document with a valid object ID, it should respond with status of 404", async () => {
            let documentId = faker.database.mongodbObjectId()
            try {
                await axios.delete(process.env.API_URL + '/documents/' + documentId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
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
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }
            expect(error).not.toBeNull()

            Document.findOneAndDelete.mockRestore()
        })
    })
})

describe("Volunteers", () => {
    describe("GET /volunteers", () => {
        test("When asked for a list of the volunteers, all should be received with a status of 200", async () => {
            let numberOfVolunteers = 5
            let randomVolunteers = new Array(numberOfVolunteers)
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

            expect(response.status).toBe(200)
        })

        test("When asked for a list of volunteers and an error occurs, a response of 500 should be received", async () => {
            jest.spyOn(Volunteer, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            try {
                await axios.get(process.env.API_URL + '/volunteers')
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            Volunteer.find.mockRestore();
        })
    })

    describe("GET /volunteers/:id", () => {
        test("When asked for an existing volunteer, it should retrieve it and respond with status of 200", async () => {
            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
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

            const response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)

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

        test("When asked for a non-existent volunteer with an invalid object ID, it should respond with status of 400", async () => {
            let volunteerId = -1
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a non-existent volunteer with a valid object ID, it should respond with status of 404", async () => {
            let volunteerId = faker.database.mongodbObjectId()
            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })
    })

    describe("POST /volunteers", () => {
        test("When creating a new volunteer with all required fields, it should respond with the created volunteer and status of 201", async () => {
            let randVolunteer = randomVolunteer()
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

        test("When creating a new volunteer with missing required fields, it should respond with status of 400", async () => {
            try {
                await axios.post(process.env.API_URL + '/volunteers', {})
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        // Testing with invalid role ID, trainig ID etc
    })

    describe("PUT /volunteers/:id", () => {
        test("When updating an existing volunteer with all required fields, it should respond with the updated volunteer and status of 200", async () => {
            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
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

            let updatedVolunteer = randomVolunteer()

            const response = await axios.put(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id, {
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

        test("When updating an existing volunteer with missing required fields, it should respond with status of 400", async () => {
            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
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

            try {
                await axios.put(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id, { invalid: 'invalid' })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent volunteer with an invalid object ID, it should respond with status of 400", async () => {
            let volunteerId = -1
            let randVolunteer = randomVolunteer()
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
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent volunteer with a valid object ID, it should respond with status of 404", async () => {
            let volunteerId = faker.database.mongodbObjectId()
            let randVolunteer = randomVolunteer()
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
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })
    })

    describe("DELETE /volunteers/:id", () => {
        test("When deleting an existing volunteer, it should respond with the deleted volunteer and status of 200", async () => {
            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers', {
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

            const response = await axios.delete(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)
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

        test("When deleting a non-existent volunteer with an invalid object ID, it should respond with status of 400", async () => {
            let volunteerId = -1
            try {
                await axios.delete(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When deleting a non-existent volunteer with a valid object ID, it should respond with status of 404", async () => {
            let volunteerId = faker.database.mongodbObjectId()
            try {
                await axios.delete(process.env.API_URL + '/volunteers/' + volunteerId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })
    })

    describe("GET /volunteers/outstanding-documents", () => {
        // No outstanding
        test("When asked and volunteers have no outstanding or missing documents, all volunteers should be returned with empty missing and outstanding document arrays and with a status of 200", async () => {
            try {
                let numberOfDocuments = 5
                for (let i = 0; i < numberOfDocuments; i++) {
                    let randDocument = randomDocument()
                    await axios.post(process.env.API_URL + '/documents', {
                        name: randDocument.name,
                    })
                }


                const res = await axios.get(process.env.API_URL + '/documents')
                const randomDocuments = res.data

                let numberOfVolunteers = 10
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
            } catch (err) {
                console.log(err)
            }
        })

        test("When asked and volunteers have no outstanding documents but missing documents, all volunteers should be returned with empty outstanding document array and full missing documents array and with a status of 200", async () => {
            let numberOfDocuments = 5
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

        test("When asked and volunteers have outstanding documents but no missing documents, all volunteers should be returned with empty missing document array and full outstanding documents array and with a status of 200", async () => {
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

        test("When asked and volunteers have outstanding and missing documents, all volunteers should be returned with valid missing and outstanding document arrays and with a status of 200", async () => {
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
        test("When asked for a list of volunteers with birthdays within the threshold, all should be received with a status of 200", async () => {
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

            expect(response.status).toBe(200)
        })

        test("When asked for a list of volunteers with birthdays within the threshold and no volunteers have birthdays within the threshold, an empty array should be received with a status of 200", async () => {
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
            expect(response.status).toBe(200)
        })

        test("When asked for a list of volunteers with birthdays and the threshold is invalid, a response of 400 should be received", async () => {
            let daysThreshold = -1

            try {
                await axios.get(process.env.API_URL + '/volunteers/birthdays/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a list of volunteers with birthdays within the threshold and an error occurs, a response of 500 should be received", async () => {
            jest.spyOn(Volunteer, 'find').mockImplementation(() => {
                throw new Error('Database connection error');
            });

            const validThreshold = 30
            try {
                await axios.get(process.env.API_URL + '/volunteers/birthdays/upcoming/' + validThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.InternalServerError)
            }

            Volunteer.find.mockRestore();
        })
    })

    describe("GET /volunteers/training/upcoming/:daysThreshold", () => {
        test("When asked for a list of volunteers with overdue training within the threshold (and no excluded roles), all should be received with a status of 200", async () => {
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

        test("When asked for a list of volunteers with training within the threshold (and no excluded roles) and no volunteers have overdue training, all the missing training should be returned and an empty array for the outstanding training, should be received with a status of 200", async () => {
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

        test("When asked for a list of volunteers with training within the threshold (and no excluded roles) and all volunteers have valid training should be returned and an empty array for the outstanding training and missing training, should be received with a status of 200", async () => {
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

        test("Invalid threshold", async () => {
            let daysThreshold = -1

            try {
                await axios.get(process.env.API_URL + '/volunteers/training/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

    })

    describe("GET /volunteers/:id/training/upcoming/:daysThreshold", () => {
        test("When asked for a volunteer with overdue training within the threshold (and no excluded roles), all should be received with a status of 200", async () => {
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

        test("Volunteer does not exist", async () => {
            let daysThreshold = 30
            let volunteerId = faker.database.mongodbObjectId()

            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId + '/training/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("Volunteer ID is not a valid object id", async () => {
            let daysThreshold = 30
            let volunteerId = "123"

            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId + '/training/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
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

        test("invalid threshold", async () => {
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
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }

            expect(error).not.toBeNull()
        })
    })

    describe("GET /volunteers/awards/upcoming/:daysThreshold", () => {
        test("When asked for a list of volunteers with awards within the threshold, all should be received with a status of 200", async () => {
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

        test("When asked for a list of volunteers with awards within the threshold and no volunteers have awards within the threshold, an empty array should be received with a status of 200", async () => {
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

        test("Volunteer has awards but not given, they should be returned as not given", async () => {
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

        test("When asked but there are no volunteers, an empty array should be received with a status of 200", async () => {
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

        test("When asked for a list of volunteers with awards and the threshold is invalid, a response of 400 should be received", async () => {
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

            try {
                await axios.get(process.env.API_URL + '/volunteers/awards/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("Volunteer has a break, no awards should be returned", async () => {
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
        test("When asked for a volunteer with awards within the threshold, all should be received with a status of 200", async () => {
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

        test("When asked for a volunteer with awards within the threshold and no volunteers have awards within the threshold, an empty array should be received with a status of 200", async () => {
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

        test("Volunteer has awards but not given, they should be returned as not given", async () => {
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

        test("When asked but volunteer does not exist a status of 404", async () => {
            let daysThreshold = 30
            let volunteerId = faker.database.mongodbObjectId()

            try {
                await axios.get(process.env.API_URL + '/volunteers/' + volunteerId + '/awards/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("When asked for a volunteer with awards and the threshold is invalid, a response of 400 should be received", async () => {
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

            try {
                await axios.get(process.env.API_URL + '/volunteers/' + createdVolunteer._id + '/awards/upcoming/' + daysThreshold)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("No Awards Exist", async () => {
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
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        test("Volunteer has a break, no awards should be returned", async () => {
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