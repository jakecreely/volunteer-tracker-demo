// volunteerController.js

const { default: axios } = require('axios');
const Volunteer = require('../models/Volunteer'); // Import the Volunteer model

const volunteerController = {};

volunteerController.findUpcomingTraining = async function (daysThreshold) {
  try {
    // Fetch daysThreshold from somewhere (e.g., from a request body)
    const fetchedTrainingResponse = await axios.get(process.env.API_URL + '/training')
    const fetchedTraining = fetchedTrainingResponse.data;

    // Find all volunteers
    const volunteers = await Volunteer.find({}).exec();

    // Process each volunteer to gather missing and overdue training data
    const volunteerTrainingData = await Promise.all(volunteers.map(async (volunteer) => {
      let missingTraining = await volunteer.findMissingTraining(fetchedTraining);
      let overdueTraining = await volunteer.findOverdueTraining(fetchedTraining, daysThreshold);
      console.log("Overdue training: ")
      console.log(overdueTraining)
      return {
        volunteer: {
          _id: volunteer._id,
          name: volunteer.name,
          isArchived: volunteer.isArchived
        },
        missingTraining: missingTraining,
        overdueTraining: overdueTraining
      };
    }));

    return volunteerTrainingData;
  } catch (err) {
    // Handle errors if necessary
    console.log(err);
    throw err;
  }
};

module.exports = volunteerController;
