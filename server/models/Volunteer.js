const mongoose = require("mongoose");
const moment = require("moment");

const trainingSchema = new mongoose.Schema({
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: [true, 'Training ID is required']
  },
  name: {
    type: String,
    required: [true, 'Training name is required']
  },
  completedOn: {
    type: Date,
    required: [true, 'Training completion date is required']
  },
  needsRetraining: {
    type: Boolean,
    required: [true, 'Needs retraining is required']
  }
});

const documentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  name: {
    type: String,
    required: true
  },
  isProvided: {
    type: Boolean,
    default: false,
    required: true
  }
})

const awardSchema = new mongoose.Schema({
  awardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Award'
  },
  name: {
    type: String,
    required: true
  },
  achievedDate: {
    type: Date,
    required: true
  },
  givenDate: {
    type: Date
  },
  isGiven: {
    type: Boolean,
    default: false,
    required: true
  }
});

const roleSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  name: {
    type: String,
    required: true
  }
});

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  breakDuration: {
    type: Number,
    default: 0,
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    required: true
  },
  roles: {
    type: [roleSchema],
    required: true
  },
  documents: {
    type: [documentSchema],
    required: true
  },
  awards: {
    type: [awardSchema],
    required: true,
  },
  training: {
    type: [trainingSchema],
    required: true
  }
});

//TODO: look for a better way to do save isGiven
// Update the isGiven of each volunteer award based on the givenDate
volunteerSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());

    if (docToUpdate === null) {
      return next(new mongoose.Error.DocumentNotFoundError('No document found with that ID'));
    }

    // Apply the update to a temporary document to avoid modifying the original document
    const updatedFields = { ...docToUpdate.toObject(), ...this.getUpdate() };

    // Create a new document instance with the updated fields
    const updatedDoc = new this.model(updatedFields);

    // Validate the updated document against the schema
    await updatedDoc.validate();

    if (this.getUpdate().awards) {
      // Loop through the awards in the volunteer update
      this.getUpdate().awards.forEach(award => {
        // If the givenDate is set to a date, isGiven is set to true
        if (award.givenDate !== null) {
          award.isGiven = true
        } else { // Set isGiven to false in case it was already true but the givenDate is set to null
          award.isGiven = false
        }
      })
    }
  } catch (error) {
    next(error);
  }
  next();
});

//TODO: Volunteers should be populated with all documents so they are not missing only not provided
volunteerSchema.methods.findMissingDocuments = async function (fetchedDocuments) {
  // Get the volunteers document ids as strings
  let volunteerDocumentIds = this.documents.map(document => {
    return document.documentId.toString()
  })
  // Filter out the documents that are in the volunteer's documents array already
  let missingDocuments = fetchedDocuments.filter(document => !volunteerDocumentIds.includes(document._id.toString()))
  return missingDocuments
}

volunteerSchema.methods.findNotProvidedDocuments = async function () {
  // Filter out the documents that are provided
  let outstandingDocuments = this.documents.filter(document => document.isProvided === false)
  // If there are any outstanding documents, add the volunteer to the array
  return outstandingDocuments
}

volunteerSchema.statics.updateOverdueTraining = async function (training) {
  let volunteers = await this.find({}).select('_id name training').exec()
  return await Promise.all(volunteers.map(async (volunteer) => {
    let updatedTraining = await volunteer.updateOverdueTraining(training)
    volunteer.training = updatedTraining
    // let updatedVolunteer = await volunteer.save()
    return volunteer
  }))
}

// Only updates the training in the volunteer's training array - not missing training
volunteerSchema.methods.updateOverdueTraining = async function (training) {

  const addOverdueTraining = (training) => {
    let overdueTraining = []
    // Loop through the volunteer's training
    this.training.forEach(volunteerTraining => {
      // Loop through the training fetched from the database
      training.forEach(fetchedTraining => {
        // If the loops are on the same training (based on the training id)
        if (trainingMatches(volunteerTraining, fetchedTraining)) {
          // If training is added to the array no matter what
          if (!isTrainingValid(volunteerTraining, fetchedTraining, 0)) {
            // If the training is not valid, it is added with the needsRetraining property set to true
            overdueTraining.push({
              ...volunteerTraining,
              needsRetraining: true
            })
          } else {
            // If the training is valid, it is added with the needsRetraining property set to false
            overdueTraining.push({
              ...volunteerTraining,
              needsRetraining: false
            })
          }
        }
      })
    })
    return overdueTraining
  }

  return addOverdueTraining(training)
}

volunteerSchema.methods.findMissingTraining = async function (training) {
  let missingTraining = []
  // Loop through the fetched training
  training.forEach(fetchedTraining => {
    // Assume the volunteer does not have the current training
    let volunteerHasTraining = false
    // Loop through the volunteer's training
    this.training.forEach((volunteerTraining) => {
      // If the volunteer has the training, then set the flag to true
      if (trainingMatches(volunteerTraining, fetchedTraining)) {
        volunteerHasTraining = true;
      }
    })
    // If the volunteer does not have the training and their roles do not exclude the need for this training
    if (!volunteerHasTraining && !isRoleExcluded(this.roles, fetchedTraining.excludedRoles)) {
      missingTraining.push(
        {
          trainingId: fetchedTraining._id,
          name: fetchedTraining.name,
        })
    }
  })
  return missingTraining
}

volunteerSchema.methods.findOverdueTraining = async function (training, daysThreshold) {
  let overdueTraining = []
  // Loop through the volunteer's training
  this.training.forEach((volunteerTraining) => {
    // Loops through the fetched training
    training.forEach(fetchedTraining => {
      // If the loops are on the same training element (based on the training id)
      if (trainingMatches(volunteerTraining, fetchedTraining)) {
        // If the training is not valid and volunteer's role require the training (not excluded)
        // then add the training to the array
        if (!isTrainingValid(volunteerTraining, fetchedTraining, daysThreshold) &&
          !isRoleExcluded(this.roles, fetchedTraining.excludedRoles)) {

          const dateDue = moment(volunteerTraining.completedOn).add(fetchedTraining.renewalFrequency, 'years')

          overdueTraining.push({
            ...volunteerTraining._doc,
            dateDue: dateDue
          })
        }
      }
    })
  })
  return overdueTraining
}

volunteerSchema.methods.findUpcomingAwards = async function (awards, daysThreshold) {
  const serviceTimeInMonths = calculateServiceTimeInMonths(this.startDate, this.breakDuration, daysThreshold)
  let upcomingAwards = []
  awards.forEach(award => {
    if ((award.requiredServiceLength <= serviceTimeInMonths) && !hasAchievedAward(this.awards, award._id)) {
      upcomingAwards.push({
        awardId: award._id,
        name: award.name,
        achievedDate: calculateAchievedDate(this.startDate, this.breakDuration, award.requiredServiceLength),
      })
    }
  });
  return upcomingAwards
}

volunteerSchema.methods.findAwardsNotGiven = async function (awards) {
  let notGivenAwards = []
  this.awards.forEach(achievedAward => {
    if (!achievedAward.isGiven) {
      const award = getAwardById(awards, achievedAward.awardId)
      notGivenAwards.push({
        ...achievedAward._doc,
        achievedDate: calculateAchievedDate(this.startDate, this.breakDuration, award.requiredServiceLength),
      })
    }
  })
  return notGivenAwards
}

// Updates the awards that are overdue at the time of the call (called on the model)
// Not currently implemented within schema so need to take the code from the api call and put it here
volunteerSchema.statics.updateUpcomingAwards = async function (awards) {

  let volunteers = await this.find()

  return await Promise.all(volunteers.map(async (volunteer) => {
    let updatedAwards = await volunteer.updateUpcomingAwards(awards)
    if (updatedAwards.length > 0) {
      volunteer.awards = updatedAwards
      // let updatedVolunteer = await volunteer.save()
      return volunteer
    }
  })
  )
}

// Updates the awards that are overdue at the time of the call (called on a specific volunteer)
// Code from the check awards function needs to go here
//TODO: Any awards which have a given date that is valid should have the isGiven field set to true
volunteerSchema.methods.updateUpcomingAwards = async function (awards) {

  let upcomingAwards = []

  const addAwardsNotGiven = () => {
    this.awards.forEach(achievedAward => {
      if (!achievedAward.isGiven) {
        let correspondingAward = getAwardById(awards, achievedAward.awardId)
        upcomingAwards.push({
          ...achievedAward,
          achievedDate: calculateAchievedDate(this.startDate, this.breakDuration, correspondingAward.requiredServiceLength),
        })
      }
    })
  }

  const addUpcomingAwards = () => {
    const serviceTimeInMonths = calculateServiceTimeInMonths(this.startDate, this.breakDuration, 0)
    awards.forEach(award => {
      if ((award.requiredServiceLength <= serviceTimeInMonths) && !hasAchievedAward(this.awards, award._id)) {
        upcomingAwards.push(
          {
            awardId: award._id,
            name: award.name,
            achievedDate: calculateAchievedDate(this.startDate, this.breakDuration, award.requiredServiceLength),
            givenDate: null,
            isGiven: false
          }
        )
      }
    })
  }

  const addPreviousAwards = () => {
    this.awards.forEach(achievedAward => {
      let correspondingAward = getAwardById(awards, achievedAward.awardId)
      if (hasAchievedAward(this.awards, correspondingAward._id) && achievedAward.isGiven === true) {
        upcomingAwards.push({
          ...achievedAward
        })
      }
    })
  }

  addAwardsNotGiven()
  addUpcomingAwards()
  addPreviousAwards()

  return upcomingAwards
}

//Helper functions for awards

const calculateServiceTimeInMonths = (startDate, breakDuration, daysThreshold) => {
  let adjustedDate = moment().subtract(breakDuration, 'days')
  adjustedDate = adjustedDate.add(daysThreshold, 'days')
  let temp = adjustedDate.diff(startDate, 'months')
  return temp
}

const calculateAchievedDate = (startDate, breakDuration, requiredServiceLength) => {
  let start = moment(startDate)
  let addedDays = start.add(breakDuration, 'days')
  let addedLength = addedDays.add(requiredServiceLength, 'months')
  return addedLength
}

const hasAchievedAward = (awards, idToCheck) => {
  return awards.some(achievedAward => String(achievedAward.awardId) === String(idToCheck))
}

const getAwardById = (awards, id) => {
  return awards.find(award => String(award._id) === String(id))
}

// Helper functions for training

const isTrainingValid = (volunteerTraining, fetchedTraining, daysThreshold) => {
  if (volunteerTraining.completedOn === null) {
    return false
  }

  if (volunteerTraining.needsRetraining) {
    return false
  }

  let currentDateWithThreshold = moment().add(daysThreshold, 'days')
  let timeSinceCompleted = currentDateWithThreshold.diff(moment(volunteerTraining.completedOn), 'years', true)
  return timeSinceCompleted < fetchedTraining.renewalFrequency
}

const trainingMatches = (volunteerTraining, fetchedTraining) => {
  return String(volunteerTraining.trainingId) === String(fetchedTraining._id)
}

const isRoleExcluded = (volunteerRoles, excludedRoles) => {
  // If the training does not have any roles then every volunteer should have it
  if (excludedRoles === undefined || excludedRoles.length === 0) {
    return false
  }
  // Extract the role ids from the excluded roles for difference calculation
  const excludedRoleIds = excludedRoles.map(excludedRole => excludedRole.roleId.toString())
  // Get the difference between the volunteer's roles and the excluded roles based on the role ids
  const roleDifference = volunteerRoles.filter(volunteerRole => {
    return !excludedRoleIds.includes(volunteerRole.roleId.toString())
  })
  // If the difference is empty, then the volunteer has all the excluded roles
  // e.g. volunteer has roles [Monday, Tuesday] and training excluded roles [Monday, Tuesday]
  return (roleDifference.length === 0)
}

module.exports = mongoose.model("Volunteer", volunteerSchema);