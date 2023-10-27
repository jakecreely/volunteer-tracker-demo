const mongoose = require("mongoose");
const Volunteer = require("./Volunteer");

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required']
  }
});

documentSchema.pre('save', async function (next) {
  try {
    // ignore case when checking for existing volunteer
    const existingDocument = await this.model('Document').findOne({ name: { $regex: new RegExp(`^${this.name}$`, 'i') } });
    if (existingDocument) {
      throw new Error('A document with the same name already exists.');
    }
    next();
  } catch (error) {
    next(error);
  }
});

documentSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());

    if (docToUpdate === null) {
      return next(new mongoose.Error.DocumentNotFoundError('No document found with that ID'));
    }

    if (this.getUpdate() === undefined) {
      return next(new mongoose.Error.ValidationError('No update provided'));
    }

    if (this._update.name !== docToUpdate.name) {
      const existingDocument = await this.model.findOne({ name: { $regex: new RegExp(`^${this._update.name}$`, 'i') } })
      if (existingDocument) {
        throw new Error('A document with the same name already exists.');
      }
    }

    // Apply the update to a temporary document to avoid modifying the original document
    const updatedFields = { ...docToUpdate.toObject(), ...this.getUpdate() };

    // Create a new document instance with the updated fields
    const updatedDoc = new this.model(updatedFields);

    // Validate the updated document against the schema
    await updatedDoc.validate();

    // If the name field has been modified, update all the awards in the Volunteer schema
    if (this.getUpdate() !== undefined) {
      const documentId = this.getQuery()["_id"];
      // Update the name field of all the awards in the Volunteer schema
      await Volunteer.updateMany(
        { 'documents.documentId': documentId },
        { $set: { 'documents.$.name': updatedFields.name } }
      );
    } else {
      return next(new mongoose.Error.ValidationError('No name field provided'));
    }
  } catch (error) {
    next(error);
  }

  next();
});

module.exports = mongoose.model("Document", documentSchema);