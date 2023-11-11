const createHttpError = require('http-errors');
const volunteerController = require('./volunteerController');
const Training = require('../models/Training');

const trainingController = {};

trainingController.getVolunteersUsage = async function (id) {
    const fetchedVolunteers = await volunteerController.findAll()

    const fetchedTraining = await Training.findOne({ _id: id }).exec();

    if (!fetchedTraining) {
        throw createHttpError(404, "Training Not Found With Given ID");
    }

    let volunteersUsingTraining = false;
    fetchedVolunteers.forEach(volunteer => {
        volunteer.training.forEach(volunteerTraining => {
            if (volunteerTraining.trainingId.toString() === fetchedTraining._id.toString()) {
                volunteersUsingTraining = true;
            }
        })
    })

    return {
        ...fetchedTraining._doc,
        isVolunteerUsingTraining: volunteersUsingTraining
    }
}

module.exports = trainingController;
