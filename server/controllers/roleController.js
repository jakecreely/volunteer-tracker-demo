const createHttpError = require('http-errors');
const Role = require('../models/Role');
const volunteerController = require('./volunteerController');

const roleController = {};

roleController.getVolunteersUsage = async function (id) {
    const fetchedVolunteers = await volunteerController.findAll()

    const fetchedRole = await Role.findOne({ _id: id }).exec();

    if (!fetchedRole) {
        throw createHttpError(404, "Role Not Found With Given ID");
    }

    let volunteersUsingRole = false;
    fetchedVolunteers.forEach(volunteer => {
        volunteer.roles.forEach(volunteerRole => {
            if (volunteerRole.roleId.toString() === fetchedRole._id.toString()) {
                volunteersUsingRole = true;
            }
        })
    })

    return {
        ...fetchedRole._doc,
        isVolunteerUsingRole: volunteersUsingRole
    }
}

module.exports = roleController;
