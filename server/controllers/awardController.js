const createHttpError = require('http-errors');
const volunteerController = require('./volunteerController');
const Award = require('../models/Award');

const awardController = {};

awardController.getVolunteersUsage = async function (id) {
    const fetchedVolunteers = await volunteerController.findAll()

    const fetchedAward = await Award.findOne({ _id: id }).exec();

    if (!fetchedAward) {
        throw createHttpError(404, "Award Not Found With Given ID");
    }

    let volunteersUsingAward = false;
    fetchedVolunteers.forEach(volunteer => {
        volunteer.awards.forEach(volunteerAward => {
            if (volunteerAward.awardId.toString() === fetchedAward._id.toString()) {
                volunteersUsingAward = true;
            }
        })
    })

    return {
        ...fetchedAward._doc,
        isVolunteerUsingAward: volunteersUsingAward
    }
}

module.exports = awardController;
