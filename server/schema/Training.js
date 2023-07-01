const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");

const roleSchema = new mongoose.Schema({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  name: { type: String, required: true }
});

const trainingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  renewalFrequency: { type: Number, required: true },
  excludedRoles: [roleSchema],
});

trainingSchema.pre('findOneAndUpdate', async function (next) {
  const updatedFields = this.getUpdate();
  
  // If the name field has been modified, update all the awards in the Volunteer schema
  if (updatedFields.name) {
    try {
      const trainingId = this.getQuery()["_id"];
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'training.trainingId': trainingId },
        { $set: { 'training.$.name': updatedFields.name } }
      );
      
    } catch (error) {
      next(error);
    }
  }

  next();
});

module.exports = mongoose.model("Training", trainingSchema);