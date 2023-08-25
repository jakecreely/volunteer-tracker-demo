const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");
const Training = require("./Training");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// Passed fields that are not part of the schema will be ignored
// If nothing is passed, the role is not updated
// Should only fail if the name field is invalid - e.g. empty string
roleSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());

    if (docToUpdate === null) {
      throw new mongoose.Error.DocumentNotFoundError('No document found with that ID');
    }

    // Apply the update to a temporary document to avoid modifying the original document
    const updatedFields = { ...docToUpdate.toObject(), ...this.getUpdate() };

    // Create a new document instance with the updated fields
    const updatedDoc = new this.model(updatedFields);

    // Validate the updated document against the schema
    await updatedDoc.validate(); // This will throw an error if the name field is invalid (e.g. empty string)

    // If the name field has been modified, update all the awards in the Volunteer schema
    if (this.getUpdate().name) {
      const roleId = this.getQuery()["_id"];
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'roles.roleId': roleId },
        { $set: { 'roles.$.name': updatedFields.name } }
      );

      await Training.updateMany(
        { 'excludedRoles.roleId': roleId },
        {
          $set: { 'excludedRoles.$.name': updatedFields.name }
        })
    }
  } catch (error) {
    next(error);
  }

  next();
});

module.exports = mongoose.model("Role", roleSchema);