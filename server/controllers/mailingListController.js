const axios = require('axios');
const moment = require('moment');
const Volunteer = require('../models/Volunteer');
const createHttpError = require('http-errors');
const Training = require('../models/Training');
const Document = require('../models/Document');
const Award = require('../models/Award');
const Role = require('../models/Role');
const Email = require('../models/Email')

const mailingListController = {};

mailingListController.findAll = async function () {
    try {
        let mailingList = await Email.find({}).sort({ name: 1 }).exec();
        return mailingList;
    } catch (err) {
        throw err;
    }
};

module.exports = mailingListController;
