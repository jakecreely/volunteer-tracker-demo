const axios = require('axios');
const { setupServer, stopServer } = require('../server');
const { beforeAll, afterAll, afterEach, describe, test, expect } = require('@jest/globals');
const { dbSetup, stopDB, initTestDB, emptyTestDB } = require('../db/setup');
const { randomAward, randomVolunteer } = require('../utils/random');
const { faker } = require('@faker-js/faker');

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
    describe('GET /awards', () => {
        test('When asked for the list of awards, all should be received and a response of 200 ', async () => {
            let numberOfAwards = 5
            let randomAwards = new Array(numberOfAwards)
            for (let i = 0; i < numberOfAwards; i++) {
                randomAwards[i] = randomAward()
                await axios.post(process.env.API_URL + '/awards/create', {
                    name: randomAwards[i].name,
                    requiredServiceLength: randomAwards[i].requiredServiceLength
                })
            }
            randomAwards.sort((a, b) => {
                return a.requiredServiceLength - b.requiredServiceLength
            })

            const response = await axios.get(process.env.API_URL + '/awards')

            for (let i = 0; i < numberOfAwards; i++) {
                expect(response.data[i].name).toBe(randomAwards[i].name)
                expect(response.data[i].requiredServiceLength).toBe(randomAwards[i].requiredServiceLength)
            }

            expect(response.status).toBe(200)
        })

        test("When asked for the list of awards and an error occurs, a response of 404 should be received", async () => {
            // How do we make this test fail?
        })

    })

    describe('GET /awards/:id', () => {
        test("When asked for an existing order, it should retrieve it and respond with status of 200", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards/create', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const response = await axios.get(process.env.API_URL + '/awards/' + savedAward.data._id)

            expect(response.data.name).toBe(randAward.name)
            expect(response.data.requiredServiceLength).toBe(randAward.requiredServiceLength)
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When asked for a non-existent award with an invalid object ID, it should respond with status of 400", async () => {
            let awardId = -1
            try {
                await axios.get(process.env.API_URL + '/awards/' + awardId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When asked for a non-existent award with a valid object ID, it should respond with status of 404", async () => {
            let awardId = faker.database.mongodbObjectId()
            try {
                await axios.get(process.env.API_URL + '/awards/' + awardId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })
    })

    describe('POST /awards/create', () => {
        test("When creating a new award with all required fields, it should respond with the created award and status of 201", async () => {
            let randAward = randomAward()
            const response = await axios.post(process.env.API_URL + '/awards/create', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            expect(response.data.name).toBe(randAward.name)
            expect(response.data.requiredServiceLength).toBe(randAward.requiredServiceLength)
            expect(response.status).toBe(axios.HttpStatusCode.Created)
        })

        test("When creating a new award with missing required fields, it should respond with status of 400", async () => {
            let randAward = randomAward()
            try {
                await axios.post(process.env.API_URL + '/awards/create', {
                    name: randAward.name
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }

            try {
                await axios.post(process.env.API_URL + '/awards/create', {
                    requiredServiceLength: randAward.requiredServiceLength
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })
    })

    describe('PUT /awards/update/:id', () => {
        test("When updating an existing award with all required fields, it should respond with the updated award and status of 200", async () => {
            try {
                const randAward = randomAward()
                let savedAward = await axios.post(process.env.API_URL + '/awards/create', {
                    name: randAward.name,
                    requiredServiceLength: randAward.requiredServiceLength
                })

                const updatedAward = randomAward()
                const response = await axios.put(process.env.API_URL + '/awards/update/' + savedAward.data._id, {
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

        test("When updating an existing award with missing required fields, it should respond with status of 400", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards/create', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            try {
                await axios.put(process.env.API_URL + '/awards/update/' + savedAward.data._id, {
                    name: randAward.name
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }

            try {
                await axios.put(process.env.API_URL + '/awards/update/' + savedAward.data._id, {
                    requiredServiceLength: randAward.requiredServiceLength
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent award with an invalid object ID, it should respond with status of 400", async () => {
            let awardId = -1
            try {
                await axios.put(process.env.API_URL + '/awards/update/' + awardId, {
                    name: randomAward().name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When updating a non-existent award with a valid object ID, it should respond with status of 404", async () => {
            let awardId = faker.database.mongodbObjectId()
            try {
                await axios.put(process.env.API_URL + '/awards/update/' + awardId, {
                    name: randomAward().name,
                    requiredServiceLength: randomAward().requiredServiceLength
                })
            }
            catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })

        // Updating the name of the award, should update the name of the award in volunteers
        test("When updating the name of an award, it should update the name of the award in volunteers", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards/create', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            let randVolunteer = randomVolunteer()
            let savedVolunteer = await axios.post(process.env.API_URL + '/volunteers/create', {
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
            let updatedSavedAward = await axios.put(process.env.API_URL + '/awards/update/' + savedAward.data._id, {
                name: updatedAward.name,
                requiredServiceLength: updatedAward.requiredServiceLength
            })

            let response = await axios.get(process.env.API_URL + '/volunteers/' + savedVolunteer.data._id)
            expect(response.data.awards[0].name).toBe(updatedSavedAward.data.name)
        })

        test("When auto-filling awards with a valid start date and break duration, it should return the awards and status of 200", async () => {
            expect(true).toBe(false)
        })
    })

    describe('DELETE /awards/delete/:id', () => {
        test("When deleting an existing award, it should respond with status of 200", async () => {
            let randAward = randomAward()
            let savedAward = await axios.post(process.env.API_URL + '/awards/create', {
                name: randAward.name,
                requiredServiceLength: randAward.requiredServiceLength
            })

            const response = await axios.delete(process.env.API_URL + '/awards/delete/' + savedAward.data._id)
            try {
                await axios.get(process.env.API_URL + '/awards/' + savedAward.data._id)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
            expect(response.status).toBe(axios.HttpStatusCode.Ok)
        })

        test("When deleting a non-existent award with an invalid object ID, it should respond with status of 400", async () => {
            let awardId = -1
            try {
                await axios.delete(process.env.API_URL + '/awards/delete/' + awardId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.BadRequest)
            }
        })

        test("When deleting a non-existent award with a valid object ID, it should respond with status of 404", async () => {
            let awardId = faker.database.mongodbObjectId()
            try {
                await axios.delete(process.env.API_URL + '/awards/delete/' + awardId)
            } catch (err) {
                expect(err.response.status).toBe(axios.HttpStatusCode.NotFound)
            }
        })
    })
})