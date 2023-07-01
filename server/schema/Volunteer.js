const mongoose = require("mongoose");
const moment = require("moment");              

const trainingSchema = new mongoose.Schema({
  trainingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Training', required: true },
  name: { type: String, required: true },
  completedOn: { type: Date, required: true },
  needsRetraining: { type: Boolean, default: true, required: true }
});

const documentSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  name: { type: String, required: true },
  isProvided: { type: Boolean, default: false, required: true }
})

const awardSchema = new mongoose.Schema({
  awardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Award' },
  name: { type: String, required: true },
  achievedDate: { type: Date, required: true },
  givenDate: { type: Date },
  isGiven: { type: Boolean, default: false, required: true }
});

const roleSchema = new mongoose.Schema({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  name: { type: String, required: true }
});

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  birthday: { type: Date, required: true },
  breakDuration: { type: Number, default: 0, required: true },
  isArchived: { type: Boolean, default: false, required: true },
  roles: { type: [roleSchema], required: true },
  documents: [documentSchema],
  awards: [awardSchema],
  training: [trainingSchema]
});

//TODO: look for a better way to do save isGiven
// Update the isGiven of each volunteer award based on the givenDate
volunteerSchema.pre('findOneAndUpdate', function(next) {
  // Loop through the awards in the volunteer update
  this._update.awards.forEach(award => {
    // If the givenDate is set to a date, isGiven is set to true
    if (award.givenDate !== null) {
      award.isGiven = true
    } else { // Set isGiven to false in case it was already true but the givenDate is set to null
      award.isGiven = false
    }
  })
  next();
});

volunteerSchema.methods.findOutstandingDocuments = async function (fetchedDocuments) {

  const getNotProvidedDocuments = () => {
    // Filter out the documents that are provided
    let outstandingDocuments = this.documents.filter(document => document.isProvided === false)
    // If there are any outstanding documents, add the volunteer to the array
    return outstandingDocuments
  }

  const getMissingDocuments = (fetchedDocuments) => {
    // Get the volunteers document ids as strings
    let volunteerDocumentIds = this.documents.map(document => {
      return document.documentId.toString()
    })
    // Filter out the documents that are in the volunteer's documents array already
    let missingDocuments = fetchedDocuments.filter(document => !volunteerDocumentIds.includes(document._id.toString()))
    return missingDocuments
  }

  let outstandingDocuments = getNotProvidedDocuments()
  let missingDocuments = getMissingDocuments(fetchedDocuments)

  // Adds the volunteer data to the object for the frontend
  return {
    volunteer: {
      _id: this._id,
      name: this.name,
      isArchived: this.isArchived
    },
    outstandingDocuments: outstandingDocuments,
    missingDocuments: missingDocuments
  }
}

volunteerSchema.statics.findOutstandingDocuments = async function (documents) {

    let volunteers = await this.find({}).sort({ startDate: 1 }).exec()

    if (volunteers === null) {
      throw Error("No volunteers found")
    }

    let resultsArr = await Promise.all(volunteers.map(async volunteer => {
      return await volunteer.findOutstandingDocuments(documents)
    })
    )

    return resultsArr
}

volunteerSchema.statics.findUpcomingBirthdays = async function (daysThreshold) {

  if (daysThreshold < 0) {
    throw new Error("daysThreshold must be greater than or equal to 0")
  }
  
  const today = moment()
  const upcoming = moment().add(daysThreshold, 'days')
  
  let volunteers = await this.find({}).select('_id name birthday').exec()
  
  let upcomingBirthdays = volunteers.filter(volunteer => {
    const birthday = moment(volunteer.birthday).set('year', today.year())
  
    // True if birthday is in the same years and is between today and upcoming
    var isBetween = birthday.isBetween(today, upcoming, null, '[]')

    // If upcoming is next year and birthday has not been found yet
    if (upcoming.year() > today.year() && !isBetween) {
      birthday.set('year', today.year() + 1);
      isBetween = birthday.isBetween(today, upcoming, null, '[]')
    }

    return isBetween;
  });
  
  let sortedBirthdays = upcomingBirthdays.sort((a, b) => {
    const birthdayA = moment(a.birthday).set('year', today.year())
    const birthdayB = moment(b.birthday).set('year', today.year())
    return birthdayA.isBefore(birthdayB) ? -1 : 1;
  });

  return sortedBirthdays
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

// On the volunteer model statics so that it can be called on all volunteers
volunteerSchema.statics.findUpcomingTraining = async function (training, daysThreshold) {

  let volunteers = await this.find({}).exec()

  return await Promise.all(volunteers.map(async (volunteer) => {
    let upcomingTraining = await volunteer.findUpcomingTraining(training, daysThreshold)
    return {
      volunteer: {
        _id: volunteer._id,
        name: volunteer.name,
        isArchived: volunteer.isArchived
      },
      missingTraining: upcomingTraining.missingTraining,
      outstandingTraining: upcomingTraining.outstandingTraining
    }
  }))
}

// On the volunteer model methods so that it can be called on a specific volunteer
volunteerSchema.methods.findUpcomingTraining = async function (training, daysThreshold) {
  // Checks if the current training is required for the volunteer based on their roles
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
    if (roleDifference.length === 0) {
      return true
    } else {
      // Otherwise, the volunteer may have some excluded roles, but not all and should not be excluded
      return false
    }
  }

  // Adds overdue training to the array based if the training is still valid
  const addOutstandingTraining = (training) => {
    let outstandingTraining = []
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

            outstandingTraining.push({
              ...volunteerTraining._doc,
              dateDue: dateDue
            })
          }
        }
      })
    })
    return outstandingTraining
  }

  const addMissingTraining = (training) => {
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

  let outstandingTraining = addOutstandingTraining(training)
  let missingTraining = addMissingTraining(training)

  return {
    outstandingTraining,
    missingTraining
  }

}

volunteerSchema.statics.findUpcomingAwards = async function (awards, daysThreshold) {
  let volunteers = await this.find({})
  let results = await Promise.all(volunteers.map(async (volunteer) => {
    let upcomingAwards = await volunteer.findUpcomingAwards(awards, daysThreshold)
    if (upcomingAwards.upcomingAwards.length > 0 || upcomingAwards.awardsNotGiven.length > 0) {
      return {
        volunteer: {
          _id: volunteer._id,
          name: volunteer.name,
          isArchived: volunteer.isArchived
        },
        ...upcomingAwards
      }
    }
  })
  )
  return results.filter((element) => element !== undefined)
}

// Specific to a volunteer, finds the awards that are upcoming within the given number of days
// It also gets any awards that the volunteer has already achieved but not yet been given
volunteerSchema.methods.findUpcomingAwards = async function (awards, daysThreshold) {

  const addUpcomingAwards = () => {
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

  const addAwardsNotGiven = () => {
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

  return {
    upcomingAwards: addUpcomingAwards(),
    awardsNotGiven: addAwardsNotGiven()
  }
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
  console.log('Service time')
  console.log(temp)
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

module.exports = mongoose.model("Volunteer", volunteerSchema);