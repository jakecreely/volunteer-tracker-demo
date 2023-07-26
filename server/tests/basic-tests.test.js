const axios = require('axios');
const setupServer = require('../server');
const {beforeAll, afterAll, describe, test, expect} = require('@jest/globals');

beforeAll(async () => {
    // Init database - through docker

    await setupServer()
})

describe('Basic tests', () => {
    test('GET /awards', async () => {
        const response = await axios.get('http://localhost:4001/awards')
        expect(response.status).toBe(200)
    })
})