const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");
const Training = require("./Training");

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }
});

roleSchema.pre('findOneAndUpdate', async function (next) {
  const updatedFields = this.getUpdate();
  
  // If the name field has been modified, update all the awards in the Volunteer schema
  if (updatedFields.name) {
    try {
      const roleId = this.getQuery()["_id"];
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'roles.roleId': roleId },
        { $set: { 'roles.$.name': updatedFields.name } }
      );

      await Training.updateMany(
        { 'excludedRoles.roleId': roleId },
        { $set: {'excludedRoles.$.name': updatedFields.name} 
      })

    } catch (error) {
      next(error);
    }
  }

  next();
});

module.exports = mongoose.model("Role", roleSchema);