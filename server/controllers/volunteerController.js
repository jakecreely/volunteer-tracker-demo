const axios = require('axios');
const moment = require('moment');
const Volunteer = require('../models/Volunteer');
const createHttpError = require('http-errors');
const Training = require('../models/Training');
const Document = require('../models/Document');
const Award = require('../models/Award');
const Role = require('../models/Role');

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

        const fetchedTraining = await Training.find({}).exec()

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

        const fetchedTraining = await Training.find({}).exec()

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

        let volunteers = await Volunteer.find({}).select('_id name birthday').exec()

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

        // Calculate days remaining until each birthday
        upcomingBirthdays.forEach(volunteer => {
            const birthday = moment(volunteer.birthday).set('year', today.year());

            if (upcoming.year() > today.year() && !birthday.isBetween(today, upcoming, null, '[]')) {
                birthday.set('year', today.year() + 1);
            }

            volunteer.daysUntilBirthday = birthday.diff(today, 'days');
        });

        // Sort upcoming birthdays by days remaining
        upcomingBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

        return upcomingBirthdays
    } catch (err) {
        throw err;
    }
}

volunteerController.findOutstandingDocuments = async function () {
    try {
        const fetchedDocuments = await Document.find({}).exec()

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

        const fetchedAwards = await Award.find({}).exec()

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

        //TODO: Probabably should not be calling the API here as this is a called by the API
        const fetchedAwards = await Award.find({}).exec()

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

volunteerController.updateOverdueTraining = async function () {
    try {
        const fetchedTraining = await Training.find()
        const volunteers = await Volunteer.find({}).select('_id name training').exec()
        const results = await Promise.all(volunteers.map(async (volunteer) => {
            let updatedTraining = await volunteer.updateOverdueTraining(fetchedTraining)
            volunteer.training = updatedTraining
            let updatedVolunteer = await volunteer.save()
            return updatedVolunteer
        }))
        return results
    } catch (err) {
        throw err
    }
}

volunteerController.importVolunteers = async function (csvFile) {
    try {
        const volunteersFromData = await Promise.all(csvFile.map(async (volunteer) => {
            return await this.createVolunteerFromData(volunteer)
        }))

        // If there are no errors in any of the volunteers, save all the volunteers
        const volunteersWithErrors = volunteersFromData.filter(volunteer => volunteer.errors.length > 0)
        if (volunteersWithErrors.length === 0) {
            // Save all volunteers
            return {
                volunteersFromData,
                canImport: true
            }
        } else {
            return {
                volunteersFromData,
                canImport: false
            }
        }

        // If there are errors, do not save any of the volunteers. Pass the errors + volunteers back to the client\
        // Client will then display the errors and ask the user to make the changes and confirm if they want to save the volunteers
        // If they do, the client will send the volunteers back to the server to be saved

    } catch (err) {
        throw err
    }
}

// Throw errors if certain fields are missing
volunteerController.createVolunteerFromData = async function (volunteer) {
    const startOfAwardsIndex = 9
    const endOfAwardsIndex = 33 // The start of the last award for that volunteer
    // Start of each award is 4 indexes after the start of the previous award
    // 'Acheived Date' is on the start of each award
    // 'Given Date' is 3 index after the start of each award
    // Other 2 indexes are ignored (Days created, award created)

    const referenceCheckOneIndex = 4
    const referenceCheckTwoIndex = 5
    const photoConsentIndex = 6
    const inductionIndex = 7

    const foodHygieneLvl2Index = 37
    const foodHygieneLvl3Index = 38
    const naloxoneIndex = 39
    const safegaurdingTrainingIndex = 40
    const firstAidTrainingIndex = 41

    let errors = []

    try {
        let newVolunteer = {}
        if (volunteer[0] === '') {
            throw createHttpError(400, 'Name is missing, cannot create volunteer')
        } else {
            const foundVolunteer = await Volunteer.findOne({ name: volunteer[0] })
            if (foundVolunteer) {
                errors.push({
                    message: `${volunteer[0]} already exists. Cannot create duplicate volunteer`,
                    type: 'duplicateVolunteer',
                    field: volunteer[0]
                })
            }
            newVolunteer.name = volunteer[0]
        }

        newVolunteer.isArchived = false
        if (volunteer[1] === '') {
            errors.push({
                message: 'Start Date is missing',
                type: 'missingValue',
                field: 'startDate'
            })
            newVolunteer.startDate = null
        } else if (!moment(volunteer[1], 'DD-MM-YYYY').isValid()) {
            errors.push({
                message: `${volunteer[1]} is an invalid start date. Check it is in the format DD/MM/YYYY`,
                type: 'formatError',
                field: 'startDate'
            })
            newVolunteer.startDate = null
        } else {
            const startDate = moment.utc(volunteer[1], 'DD-MM-YYYY').startOf('day')
            newVolunteer.startDate = startDate.toISOString()
        }

        const breakDuration = parseInt(volunteer[2])
        if (isNaN(breakDuration)) {
            errors.push({
                message: 'Break duration is missing or is not a number',
                type: 'missingValue',
                field: 'breakDuration'
            })
        } else if (breakDuration < 0) {
            errors.push({
                message: `Break duration must be greater than or equal to 0. Was given ${breakDuration}`,
                type: 'formatError',
                field: 'breakDuration'
            })
        } else {
            newVolunteer.breakDuration = breakDuration
        }

        newVolunteer.roles = []
        const foundRole = await Role.findOne({ name: volunteer[3] })
        if (volunteer[3] === '') {
            errors.push({
                message: 'Role is missing',
                type: 'missingValue',
                field: 'roles'
            })
        } else if (!foundRole) {
            errors.push({
                message: `${volunteer[3]} is not a valid role`,
                type: 'invalidRole',
                field: volunteer[3]
            })
        } else {
            newVolunteer.roles = [{
                roleId: foundRole._id,
                name: foundRole.name
            }]
        }

        newVolunteer.documents = []

        const referenceCheckOneDoc = await Document.findOne({ name: 'Reference Check One' })
        const referenceCheckTwoDoc = await Document.findOne({ name: 'Reference Check Two' })
        const photoConsentDoc = await Document.findOne({ name: 'Photo Consent' })
        const inductionDoc = await Document.findOne({ name: 'Induction' })

        if (!referenceCheckOneDoc) {
            throw createHttpError(404, 'Reference Check One Document Not Found')
        } else {
            const referenceCheckOneProvided = volunteer[referenceCheckOneIndex].toLowerCase() === 'y'
            if (referenceCheckOneProvided) {
                newVolunteer.documents.push({
                    documentId: referenceCheckOneDoc._id,
                    name: referenceCheckOneDoc.name,
                    isProvided: true
                })
            }
        }

        if (!referenceCheckTwoDoc) {
            throw createHttpError(404, 'Reference Check Two Document Not Found')
        } else {
            const referenceCheckTwoProvided = volunteer[referenceCheckTwoIndex].toLowerCase() === 'y'
            if (referenceCheckTwoProvided) {
                newVolunteer.documents.push({
                    documentId: referenceCheckTwoDoc._id,
                    name: referenceCheckTwoDoc.name,
                    isProvided: true
                })
            }
        }

        if (!photoConsentDoc) {
            throw createHttpError(404, 'Photo Consent Document Not Found')
        } else {
            const photoConsentProvided = volunteer[photoConsentIndex].toLowerCase() === 'y'
            if (photoConsentProvided) {
                newVolunteer.documents.push({
                    documentId: photoConsentDoc._id,
                    name: photoConsentDoc.name,
                    isProvided: true
                })
            }
        }

        if (!inductionDoc) {
            throw createHttpError(404, 'Induction Document Not Found')
        } else {
            const inductionProvided = volunteer[inductionIndex].toLowerCase() === 'y'
            if (inductionProvided) {
                newVolunteer.documents.push({
                    documentId: inductionDoc._id,
                    name: inductionDoc.name,
                    isProvided: true
                })
            }
        }

        const formattedBirthday = formatDate(volunteer[8])
        if (volunteer[8] === '') {
            errors.push({
                message: 'Birthday is missing',
                type: 'missingValue',
                field: 'birthday'
            })
            newVolunteer.birthday = null
        } else if (formattedBirthday === null) {
            errors.push({
                message: `${volunteer[8]} is an invalid birthday. Check it is in the format: Day Month`,
                type: 'formatError',
                field: 'birthday'
            })
            newVolunteer.birthday = null
        } else {
            const birthday = moment.utc(formattedBirthday, 'DD MMMM YYYY').startOf('day')
            newVolunteer.birthday = birthday.toISOString()
        }

        //Awards
        newVolunteer.awards = []

        const fetchedAwards = await Award.find({}).sort({ requiredServiceLength: 1 }).exec()
        if (fetchedAwards.length === 0) {
            throw createHttpError(404, 'No Awards Found')
        }

        // Adds awards that are achieved before today and adjusts based on if they have been given
        let currentAwardIndex = 0
        for (let i = startOfAwardsIndex; i <= endOfAwardsIndex; i += 4) {
            const award = fetchedAwards[currentAwardIndex]
            const achievedDate = volunteer[i]
            const isGiven = volunteer[i + 3].toLowerCase() === 'y'
            if (achievedDate === '') {
                errors.push({
                    message: `Achieved Date for ${award.name} is missing`,
                    type: 'missingValue',
                    field: award.name
                })
            } else {
                if (!moment(achievedDate, 'DD-MM-YYYY').isValid()) {
                    errors.push({
                        message: `${achievedDate} is an invalid achieved date for ${award.name}. Check it is in the format DD/MM/YYYY`,
                        type: 'formatError',
                        field: award.name
                    })
                    newVolunteer.awards.push({
                        awardId: award._id,
                        name: award.name,
                        achievedDate: null,
                        givenDate: null,
                        isGiven: false
                    })
                } else if (moment(achievedDate, 'DD-MM-YYYY').isBefore(moment().startOf('day'))) {
                    // dates are provided into the future so need to only include the ones before today
                    const formattedAchievedDate = moment.utc(volunteer[i], 'DD-MM-YYYY').startOf('day')
                    if (isGiven) {
                        newVolunteer.awards.push({
                            awardId: award._id,
                            name: award.name,
                            achievedDate: formattedAchievedDate,
                            givenDate: formattedAchievedDate,
                            isGiven: true
                        })
                    } else {
                        // errors.push({
                        //     message: `${award.name} has been achieved but has not been given`,
                        //     type: 'notGiven',
                        //     field: award.name
                        // })
                        newVolunteer.awards.push({
                            awardId: award._id,
                            name: award.name,
                            achievedDate: formattedAchievedDate,
                            givenDate: null,
                            isGiven: false
                        })
                    }
                }
            }
            currentAwardIndex++
        }

        // Training
        newVolunteer.training = []

        const foodHygieneLvl2Doc = await Training.findOne({ name: 'Food Hygiene Lvl 2' })
        if (!foodHygieneLvl2Doc) {
            throw createHttpError(404, 'Food Hygiene Lvl 2 Training Document Not Found')
        } else {
            if (volunteer[foodHygieneLvl2Index] !== '') {
                if (!moment(volunteer[foodHygieneLvl2Index], 'DD-MM-YYYY').isValid()) {
                    errors.push({
                        message: `(Food Hygiene Lvl2) ${volunteer[foodHygieneLvl2Index]} is an invalid training date. Check it is in the format DD/MM/YYYY`,
                        type: 'formatError',
                        field: 'Food Hygiene'
                    })
                    newVolunteer.training.push({
                        trainingId: foodHygieneLvl2Doc._id,
                        name: foodHygieneLvl2Doc.name,
                        completedOn: null,
                        needsRetraining: false
                    })
                } else {
                    newVolunteer.training.push({
                        trainingId: foodHygieneLvl2Doc._id,
                        name: foodHygieneLvl2Doc.name,
                        completedOn: moment.utc(volunteer[foodHygieneLvl2Index], 'DD-MM-YYYY').startOf('day'),
                        needsRetraining: false
                    })
                }
            }
        }

        const foodHygieneLvl3Doc = await Training.findOne({ name: 'Food Hygiene Lvl 3' })
        if (!foodHygieneLvl3Doc) {
            throw createHttpError(404, 'Food Hygiene Lvl 3 Training Document Not Found')
        } else {
            if (volunteer[foodHygieneLvl3Index] !== '') {
                if (!moment(volunteer[foodHygieneLvl3Index], 'DD-MM-YYYY').isValid()) {
                    errors.push({
                        message: `(Food Hygiene Lvl 3) ${volunteer[foodHygieneLvl3Index]} is an invalid training date. Check it is in the format DD/MM/YYYY`,
                        type: 'formatError',
                        field: 'Food Hygiene'
                    })
                    newVolunteer.training.push({
                        trainingId: foodHygieneLvl3Doc._id,
                        name: foodHygieneLvl3Doc.name,
                        completedOn: null,
                        needsRetraining: false
                    })
                } else {
                    newVolunteer.training.push({
                        trainingId: foodHygieneLvl3Doc._id,
                        name: foodHygieneLvl3Doc.name,
                        completedOn: moment.utc(volunteer[foodHygieneLvl3Index], 'DD-MM-YYYY').startOf('day'),
                        needsRetraining: false
                    })
                }
            }
        }

        const naloxoneDoc = await Training.findOne({ name: 'Naloxone' })
        if (!naloxoneDoc) {
            throw createHttpError(404, 'Naloxone Training Document Not Found')
        } else {
            if (volunteer[naloxoneIndex] !== '') {
                if (!moment(volunteer[naloxoneIndex], 'DD-MM-YYYY').isValid()) {
                    errors.push({
                        message: `(Naloxone) ${volunteer[naloxoneIndex]} is an invalid training date. Check it is in the format DD/MM/YYYY`,
                        type: 'formatError',
                        field: 'Naloxone'
                    })
                    newVolunteer.training.push({
                        trainingId: naloxoneDoc._id,
                        name: naloxoneDoc.name,
                        completedOn: null,
                        needsRetraining: false
                    })
                } else {
                    newVolunteer.training.push({
                        trainingId: naloxoneDoc._id,
                        name: naloxoneDoc.name,
                        completedOn: moment.utc(volunteer[naloxoneIndex], 'DD-MM-YYYY').startOf('day'),
                        needsRetraining: false
                    })
                }
            }
        }

        const safegaurdingTrainingDoc = await Training.findOne({ name: 'Safeguarding and Values' })
        if (!safegaurdingTrainingDoc) {
            throw createHttpError(404, 'Safeguarding Training Document Not Found')
        } else {
            if (volunteer[safegaurdingTrainingIndex] !== '') {
                if (!moment(volunteer[safegaurdingTrainingIndex], 'DD-MM-YYYY').isValid()) {
                    errors.push({
                        message: `(Safeguarding) ${volunteer[safegaurdingTrainingIndex]} is an invalid training date. Check it is in the format DD/MM/YYYY`,
                        type: 'formatError',
                        field: 'Safeguarding and Values'
                    })
                    newVolunteer.training.push({
                        trainingId: safegaurdingTrainingDoc._id,
                        name: safegaurdingTrainingDoc.name,
                        completedOn: null,
                        needsRetraining: false
                    })
                } else {
                    newVolunteer.training.push({
                        trainingId: safegaurdingTrainingDoc._id,
                        name: safegaurdingTrainingDoc.name,
                        completedOn: moment.utc(volunteer[safegaurdingTrainingIndex], 'DD-MM-YYYY').startOf('day'),
                        needsRetraining: false
                    })
                }
            }
        }

        const firstAidTrainingDoc = await Training.findOne({ name: 'First Aid' })
        if (!firstAidTrainingDoc) {
            throw createHttpError(404, 'First Aid Training Document Not Found')
        } else {
            if (volunteer[firstAidTrainingIndex] !== '') {
                if (!moment(volunteer[firstAidTrainingIndex], 'DD-MM-YYYY').isValid()) {
                    errors.push({
                        message: `(First Aid) ${volunteer[firstAidTrainingIndex]} is an invalid training date. Check it is in the format DD/MM/YYYY`,
                        type: 'formatError',
                        field: 'First Aid'
                    })
                    newVolunteer.training.push({
                        trainingId: firstAidTrainingDoc._id,
                        name: firstAidTrainingDoc.name,
                        completedOn: null,
                        needsRetraining: false
                    })
                } else {
                    newVolunteer.training.push({
                        trainingId: firstAidTrainingDoc._id,
                        name: firstAidTrainingDoc.name,
                        completedOn: moment.utc(volunteer[firstAidTrainingIndex], 'DD-MM-YYYY').startOf('day'),
                        needsRetraining: false
                    })
                }
            }
        }

        return {
            volunteer: newVolunteer,
            errors: errors
        }

    } catch (err) {
        throw err
    }
}

function formatDate(dateString) {
    const regex = /(\d{1,2})(?:st|nd|rd|th)?\s(\w+)|(\w+)\s(\d{1,2})(?:st|nd|rd|th)?/; // Updated regex pattern
    const match = dateString.match(regex);

    if (match) {
        const day = match[1] || match[4];
        const month = match[2] || match[3];
        const currentYear = moment().year();
        return `${day} ${month} ${currentYear}`;
    } else {
        return null; // Handle invalid date formats
    }
}

module.exports = volunteerController;
