const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const Training = require('../models/Training')
const Volunteer = require('../models/Volunteer')
const Award = require('../models/Award')
const Document = require('../models/Document');
const volunteerController = require('../controllers/volunteerController');
const { HttpStatusCode } = require('axios');

router.get('/', async (req, res) => {
    try {
        let volunteers = await volunteerController.findAll()
        res.status(HttpStatusCode.Ok).send(volunteers)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.get('/outstanding-documents', async (req, res) => {
    try {
        let volunteersWithDocuments = await volunteerController.findOutstandingDocuments()
        res.status(HttpStatusCode.Ok).send(volunteersWithDocuments)
    } catch (err) {
        if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

// 
// TODO: Add response to client with all updated volunteers
router.put('/training', async (req, res) => {
    try {
        let training = await Training.find()
        let updatedVolunteers = await Volunteer.updateOverdueTraining(training)
        res.status(HttpStatusCode.Ok).send(updatedVolunteers)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

//TODO: Add validation for the request body
router.post('/', async (req, res) => {
    try {
        const tempVolunteer = new Volunteer(req.body)
        let savedVolunteer = await tempVolunteer.save()
        res.status(HttpStatusCode.Created).send(savedVolunteer)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.get('/birthdays/upcoming/:daysThreshold', async (req, res) => {
    try {
        const daysThreshold = req.params.daysThreshold
        let upcomingBirthdays = await volunteerController.findUpcomingBirthdays(daysThreshold)
        res.status(HttpStatusCode.Ok).send(upcomingBirthdays)
    } catch (err) {
        if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const volunteer = await Volunteer.findOne({ _id: id })
        if (!volunteer) {
            return res.status(HttpStatusCode.NotFound).send("Volunteer could not be found with given ID")
        }
        res.status(HttpStatusCode.Ok).send(volunteer)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})


router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const foundVolunteer = await Volunteer.findOne({ _id: id })
        if (!foundVolunteer) {
            return res.status(HttpStatusCode.NotFound).send('Volunteer could not be found with given ID')
        }
        const updatedVolunteer = await Volunteer.findOneAndUpdate({ _id: id }, req.body, { new: true })
        res.status(HttpStatusCode.Ok).send(updatedVolunteer)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(HttpStatusCode.BadRequest).send(err.errors)
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        let volunteer = await Volunteer.findOneAndDelete({ _id: id })
        if (!volunteer) {
            return res.status(HttpStatusCode.NotFound).send('Volunteer could not be found with given ID')
        }
        res.status(HttpStatusCode.Ok).send(volunteer)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

// Instead of getting date cutoffs, we can just get the difference between the current date and the date of the training
// if the difference is greater than the length of the training, then the training is expired
router.get('/training/upcoming/:daysThreshold?', async (req, res) => {
    try {
        const daysThreshold = req.params.daysThreshold === undefined ? 0 : req.params.daysThreshold
        const result = await volunteerController.findUpcomingTraining(daysThreshold)
        res.status(HttpStatusCode.Ok).send(result)
    } catch (err) {
        if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

// Add the cutoff dates to the volunteer object
router.get('/awards/upcoming/:daysThreshold?', async (req, res) => {
    try {  
        let daysThreshold = req.params.daysThreshold === undefined ? 0 : req.params.daysThreshold
        const result = await volunteerController.findUpcomingAwards(daysThreshold)
        res.status(HttpStatusCode.Ok).send(result)
    } catch (err) {
        if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.put('/awards/update', async (req, res) => {
    try {
        let awards = await Award.find()
        let updatedVolunteers = await Volunteer.updateUpcomingAwards(awards)
        res.status(HttpStatusCode.Ok).send(updatedVolunteers)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

// Verify days and id are valid
router.get('/:id/awards/upcoming/:days?', async (req, res) => {
    try {
        const id = req.params.id
        const days = req.params['days'] === undefined ? 0 : req.params['days']
        const result = await volunteerController.findUpcomingAwardsForVolunteer(id, days)
        res.status(HttpStatusCode.Ok).send(result)
    } catch (err) {
        if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})


router.get('/:id/training/upcoming/:days?', async (req, res) => {
    try {
        const id = req.params.id
        const days = req.params['days'] === undefined ? 0 : req.params['days']
        const result = await volunteerController.findUpcomingTrainingForVolunteer(id, days)
        res.status(HttpStatusCode.Ok).send(result)
    } catch (err) {
        if (err.status && err.message) {
            res.status(err.status).send(err.message)
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

module.exports = router;
