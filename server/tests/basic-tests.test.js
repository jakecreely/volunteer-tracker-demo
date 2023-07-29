const axios = require('axios');
const { setupServer, stopServer } = require('../server');
const { beforeAll, afterAll, describe, test, expect } = require('@jest/globals');
const { dbSetup, stopDB } = require('../db/setup');

beforeAll(async () => {
    await dbSetup()
    await setupServer()
})

afterAll(async () => {
    await stopDB()
    await stopServer()
})

describe('Basic tests', () => {
    test('GET /awards', async () => {
        const response = await axios.get(process.env.API_URL + '/awards')
        expect(response.status).toBe(200)
    })
})