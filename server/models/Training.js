const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");

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

const trainingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Training name is required']
  },
  renewalFrequency: {
    type: Number,
    min: [0, 'Training renewal frequency (years) must be a positive integer'],
    required: [true, 'Training renewal frequency is required']
  },
  excludedRoles: {
    type: [roleSchema],
    default: []
  },
});

trainingSchema.pre('findOneAndUpdate', async function (next) {
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
      const trainingId = this.getQuery()["_id"];
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'training.trainingId': trainingId },
        { $set: { 'training.$.name': updatedFields.name } }
      );
    }

    if (this.getUpdate().excludedRoles) {
      // check that the roleIds are valid
      const roleIds = this.getUpdate().excludedRoles.map(role => role.roleId);
      const roles = await mongoose.model('Role').find({ _id: { $in: roleIds } });
      if (roles.length !== roleIds.length) {
        return next(new mongoose.Error.ValidationError('Invalid role ID(s) provided'));
      }
    }
  } catch (error) {
    next(error);
  }

  next();
});

module.exports = mongoose.model("Training", trainingSchema);