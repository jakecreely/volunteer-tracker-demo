const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");
const moment = require("moment");

const awardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Award name is required']
  },
  requiredServiceLength: {
    type: Number,
    required: [true, 'Required service length is required'],
    min: [0, 'Required service length must be greater than or equal to 0']
  }
});

awardSchema.pre('findOneAndUpdate', async function (next) {
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

    // If the name field has been modified, update all the awards in the Volunteer schema
    if (this.getUpdate().name) {
      const awardId = this.getQuery()["_id"];
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'awards.awardId': awardId },
        { $set: { 'awards.$.name': updatedFields.name } }
      );
    }
  } catch (error) {
    next(error);
  }
  next();
});

// Specific to a volunteer, finds the awards that are upcoming within the given number of days
// It also gets any awards that the volunteer has already achieved but not yet been given
awardSchema.statics.autoFill = async function (startDate, breakDuration) {

  const addUpcomingAwards = (fetchedAwards) => {
    const serviceTimeInMonths = calculateServiceTimeInMonths(startDate, breakDuration)
    let upcomingAwards = []
    fetchedAwards.forEach(award => {
      if (award.requiredServiceLength <= serviceTimeInMonths) {
        let achievedDate = calculateAchievedDate(startDate, breakDuration, award.requiredServiceLength)
        upcomingAwards.push({
          awardId: award._id,
          name: award.name,
          achievedDate: achievedDate,
          givenDate: achievedDate,
          isGiven: true
        })
      }
    });
    return upcomingAwards
  }

  let fetchedAwards = await this.find({}).sort({ requiredServiceLength: 1 })
  let upcomingAwards = addUpcomingAwards(fetchedAwards)

  return upcomingAwards
}

const calculateServiceTimeInMonths = (startDate, breakDuration) => {
  let adjustedDate = moment().subtract(breakDuration, 'days')
  let temp = adjustedDate.diff(startDate, 'months')
  return temp
}

const calculateAchievedDate = (startDate, breakDuration, requiredServiceLength) => {
  let start = moment(startDate)
  let addedDays = start.add(breakDuration, 'days')
  let addedLength = addedDays.add(requiredServiceLength, 'months')
  return addedLength
}

module.exports = mongoose.model("Award", awardSchema);