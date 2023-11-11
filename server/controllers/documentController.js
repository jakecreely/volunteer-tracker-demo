const createHttpError = require('http-errors');
const volunteerController = require('./volunteerController');
const Document = require('../models/Document');

const documentController = {};

documentController.getVolunteersUsage = async function (id) {
    const fetchedVolunteers = await volunteerController.findAll()

    const fetchedDocument = await Document.findOne({ _id: id }).exec();

    if (!fetchedDocument) {
        throw createHttpError(404, "Document Not Found With Given ID");
    }

    let volunteersUsingDocument = false;
    fetchedVolunteers.forEach(volunteer => {
        volunteer.documents.forEach(volunteerDocument => {
            if (volunteerDocument.documentId.toString() === fetchedDocument._id.toString()) {
                volunteersUsingDocument = true;
            }
        })
    })

    return {
        ...fetchedDocument._doc,
        isVolunteerUsingDocument: volunteersUsingDocument
    }
}

module.exports = documentController;
