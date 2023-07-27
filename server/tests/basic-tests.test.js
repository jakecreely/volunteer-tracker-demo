const axios = require('axios');
const { setupServer, stopServer } = require('../server');
const {beforeAll, afterAll, describe, test, expect, done} = require('@jest/globals');
const dbSetup = require('../db/setup');

beforeAll(async () => {
    await dbSetup()

    connection = await setupServer()
})

afterAll(async () => {
    console.log("Closing Server");
    await stopServer()
})

describe('Basic tests', () => {
    test('GET /awards', async () => {
        const response = await axios.get('http://localhost:4001/awards')
        expect(response.status).toBe(200)
    })
})