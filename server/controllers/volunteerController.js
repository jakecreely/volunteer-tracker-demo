const axios = require('axios');
const moment = require('moment');
const Volunteer = require('../models/Volunteer');
const createHttpError = require('http-errors');

const volunteerController = {};

volunteerController.findAll = async function () {
    try {
        let volunteers = await Volunteer.find({}).sort({ name: 1 }).exec();
        return volunteers;
    } catch (err) {
        throw err;
    }
};

volunteerController.findUpcomingTraining = async function (daysThreshold) {
    try {
        if (daysThreshold < 0) {
            throw createHttpError(400, "daysThreshold must be greater than or equal to 0")
        }

        const { data: fetchedTraining } = await axios.get(process.env.API_URL + '/training')

        if (fetchedTraining.length === 0) {
            throw createHttpError(404, "No Training Found For Finding Upcoming Training")
        }

        const volunteers = await Volunteer.find({}).exec();

        const volunteerTrainingData = await Promise.all(volunteers.map(async (volunteer) => {
            let missingTraining = await volunteer.findMissingTraining(fetchedTraining);
            let overdueTraining = await volunteer.findOverdueTraining(fetchedTraining, daysThreshold);
            return {
                volunteer: {
                    _id: volunteer._id,
                    name: volunteer.name,
                    isArchived: volunteer.isArchived
                },
                missingTraining: missingTraining,
                overdueTraining: overdueTraining
            };
        }));

        return volunteerTrainingData;
    } catch (err) {
        throw err;
    }
};

volunteerController.findUpcomingTrainingForVolunteer = async function (volunteerId, daysThreshold) {
    try {
        if (daysThreshold < 0) {
            throw createHttpError(400, "daysThreshold must be greater than or equal to 0")
        }

        const { data: fetchedTraining } = await axios.get(process.env.API_URL + '/training');

        if (fetchedTraining.length === 0) {
            throw createHttpError(404, "No Training Found For Finding Upcoming Training");
        }

        const volunteer = await Volunteer.findOne({ _id: volunteerId }).exec();

        if (!volunteer) {
            throw createHttpError(404, "Volunteer Not Found For Finding Upcoming Training");
        }

        let missingTraining = await volunteer.findMissingTraining(fetchedTraining);
        let overdueTraining = await volunteer.findOverdueTraining(fetchedTraining, daysThreshold);

        return {
            volunteer: {
                _id: volunteer._id,
                name: volunteer.name,
                isArchived: volunteer.isArchived
            },
            missingTraining: missingTraining,
            overdueTraining: overdueTraining
        };
    } catch (err) {
        throw err;
    }
};

volunteerController.findUpcomingBirthdays = async function (daysThreshold) {
    try {
        if (daysThreshold < 0) {
            throw createHttpError(400, "daysThreshold must be greater than or equal to 0")
        }

        const today = moment()
        const upcoming = moment().add(daysThreshold, 'days')

        let volunteers = await Volunteer.find({}).select('_id name birthday').sort({birthday: 1}).exec()

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
    } catch (err) {
        throw err;
    }
}

volunteerController.findOutstandingDocuments = async function () {
    try {
        const { data: fetchedDocuments } = await axios.get(process.env.API_URL + '/documents')

        if (fetchedDocuments.length === 0) {
            throw createHttpError(404, "No Documents Found For Finding Outstanding Documents")
        }

        let volunteers = await Volunteer.find({}).sort({ startDate: 1 }).exec()

        if (!volunteers) {
            throw createHttpError(404, "No Volunteers To Find Outstanding Documents")
        }

        let results = await Promise.all(volunteers.map(async volunteer => {
            let outstandingDocuments = await volunteer.findNotProvidedDocuments()
            let missingDocuments = await volunteer.findMissingDocuments(fetchedDocuments)
            return {
                volunteer: {
                    _id: volunteer._id,
                    name: volunteer.name,
                    isArchived: volunteer.isArchived
                },
                outstandingDocuments: outstandingDocuments,
                missingDocuments: missingDocuments
            }
        })
        )

        return results
    } catch (err) {
        console.log(err)
        throw err
    }
}

volunteerController.findUpcomingAwards = async function (daysThreshold) {
    try {
        if (daysThreshold < 0) {
            throw createHttpError(400, "daysThreshold must be greater than or equal to 0")
        }

        const volunteers = await Volunteer.find({})

        const { data: fetchedAwards } = await axios.get(process.env.API_URL + '/awards')

        if (fetchedAwards.length === 0) {
            throw createHttpError(404, "No Awards Found For Finding Upcoming Awards")
        }

        let results = await Promise.all(volunteers.map(async (volunteer) => {
            const upcomingAwards = await volunteer.findUpcomingAwards(fetchedAwards, daysThreshold)
            const awardsNotGiven = await volunteer.findAwardsNotGiven(fetchedAwards)
            if (upcomingAwards.length > 0 || awardsNotGiven.length > 0) {
                return {
                    volunteer: {
                        _id: volunteer._id,
                        name: volunteer.name,
                        isArchived: volunteer.isArchived
                    },
                    upcomingAwards: upcomingAwards,
                    awardsNotGiven: awardsNotGiven
                }
            }
        })
        )
        return results.filter((element) => element !== undefined)
    } catch (err) {
        throw err
    }
}

volunteerController.findUpcomingAwardsForVolunteer = async function (volunteerId, daysThreshold) {
    try {
        if (daysThreshold < 0) {
            throw createHttpError(400, "daysThreshold must be greater than or equal to 0")
        }

        const { data: fetchedAwards } = await axios.get(process.env.API_URL + '/awards');

        if (fetchedAwards.length === 0) {
            throw createHttpError(404, "No Awards Found For Finding Upcoming Awards");
        }

        const volunteer = await Volunteer.findOne({ _id: volunteerId }).exec();

        if (!volunteer) {
            throw createHttpError(404, "Volunteer Not Found");
        }

        const upcomingAwards = await volunteer.findUpcomingAwards(fetchedAwards, daysThreshold)
        const awardsNotGiven = await volunteer.findAwardsNotGiven(fetchedAwards)

        return {
            volunteer: {
                _id: volunteer._id,
                name: volunteer.name,
                isArchived: volunteer.isArchived
            },
            upcomingAwards: upcomingAwards,
            awardsNotGiven: awardsNotGiven
        };
    } catch (err) {
        throw err;
    }
}

module.exports = volunteerController;
