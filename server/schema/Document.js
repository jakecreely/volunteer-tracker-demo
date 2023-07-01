const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

documentSchema.pre('findOneAndUpdate', async function (next) {
  const updatedFields = this.getUpdate();
  
  // If the name field has been modified, update all the awards in the Volunteer schema
  if (updatedFields.name) {
    try {
      const documentId = this.getQuery()["_id"];
      console.log("Updating document with ID: " + documentId)
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'documents.documentId': documentId },
        { $set: { 'documents.$.name': updatedFields.name } }
      );

    } catch (error) {
      next(error);
    }
  }

  next();
});

module.exports = mongoose.model("Document", documentSchema);