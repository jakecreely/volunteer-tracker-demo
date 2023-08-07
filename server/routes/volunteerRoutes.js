const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const Training = require('../models/Training')
const Volunteer = require('../models/Volunteer')
const Award = require('../models/Award')
const Document = require('../models/Document')

router.get('/', async (req, res) => {
    try {
        let volunteers = await Volunteer.find({}).sort({ name: 1 })
        res.status(200).send(volunteers)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.get('/outstanding-documents', async (req, res) => {
    try {
        let documents = await Document.find()
        let volunteersWithDocuments = await Volunteer.findOutstandingDocuments(documents)
        res.status(200).send(volunteersWithDocuments)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

//TODO: Add validation for the request body
router.post('/', async (req, res) => {
    try {
        const tempVolunteer = new Volunteer(req.body)
        let savedVolunteer = await tempVolunteer.save()
        res.status(201).send(savedVolunteer)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).send(err.message)
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.get('/birthdays/upcoming/:daysThreshold', async (req, res) => {
    try {
        if (req.params.daysThreshold < 0) {
            console.log('Days threshold must be a postive integer')
            res.status(400).send('Days threshold must be a postive integer')
        } else {
            let upcomingBirthdays = await Volunteer.findUpcomingBirthdays(req.params.daysThreshold)
            res.status(200).send(upcomingBirthdays)
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.get('/:id', async (req, res) => {
    try {
        let volunteer = await Volunteer.findOne({ _id: req.params['id'] })
        if (volunteer === null) {
            res.status(404).send("Volunteer could not be found with given ID")
        } else {
            res.status(200).send(volunteer)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else {
            res.status(500).send(err.message)
        }
    }
})


router.put('/:id', async (req, res) => {
    try {
        await Volunteer.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedVolunteer = await Volunteer.findOne({ _id: req.params['id'] })
        if (updatedVolunteer === null) {
            res.status(404).send('Volunteer could not be found with given id')
        } else {
            res.status(200).send(updatedVolunteer)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).send(err.message)
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).send('Volunteer could not be found with given id')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let volunteer = await Volunteer.findOneAndDelete({ _id: req.params['id'] })
        if (volunteer === null) {
            res.status(404).send('Volunteer could not be found with given id')
        } else {
            res.status(200).send(volunteer)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else {
            res.status(500).send(err.message)
        }
    }
})

// Instead of getting date cutoffs, we can just get the difference between the current date and the date of the training
// if the difference is greater than the length of the training, then the training is expired
router.get('/training/upcoming/:daysThreshold?', async (req, res) => {
    try {
        let daysThreshold = req.params.daysThreshold === undefined ? 0 : req.params.daysThreshold
        let training = await Training.find()
        let volunteers = await Volunteer.findUpcomingTraining(training, daysThreshold)
        res.status(200).send(volunteers)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Add the cutoff dates to the volunteer object
router.get('/awards/upcoming/:daysThreshold?', async (req, res) => {
    try {
        let daysThreshold = req.params.daysThreshold === undefined ? 0 : req.params.daysThreshold
        let awards = await Award.find()
        let volunteers = await Volunteer.findUpcomingAwards(awards, daysThreshold)
        res.status(200).send(volunteers)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// TODO: Add response to client with all updated volunteers
router.put('/training/update', async (req, res) => {
    try {
        let training = await Training.find()
        let updatedVolunteers = await Volunteer.updateOverdueTraining(training)
        res.status(200).send(updatedVolunteers)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.put('/awards/update', async (req, res) => {
    try {
        let awards = await Award.find()
        let updatedVolunteers = await Volunteer.updateUpcomingAwards(awards)
        res.status(200).send(updatedVolunteers)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Verify days and id are valid
router.get('/:id/awards/upcoming/:days?', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Invalid volunteer id')
    } else if (req.params['days'] < 0) {
        res.status(400).send('Days threshold must be a postive integer')
    } else {
        try {
            let days = req.params['days'] === undefined ? 0 : req.params['days']
            let awards = await Award.find({})
            if (awards === null) {
                res.status(404).send('No awards could be found')
            }
            let volunteer = await Volunteer.findOne({ _id: req.params['id'] })
            if (volunteer === null) {
                res.status(404).send('Volunteer could not be found with given id')
            }
            let upcomingAwards = await volunteer.findUpcomingAwards(awards, days)
            res.status(200).send(upcomingAwards)
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})


router.get('/:id/training/upcoming/:days?', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Invalid volunteer id')
    } else if (req.params['days'] < 0) {
        res.status(400).send('Number of days must be a postive integer')
    } else {
        try {
            let days = req.params['days'] === undefined ? 0 : req.params['days']
            let training = await Training.find({})
            if (training === null) {
                res.status(404).send('No training could be found')
            }
            let volunteer = await Volunteer.findOne({ _id: req.params['id'] })
            if (volunteer === null) {
                res.status(404).send('Volunteer could not be found with given id')
            }
            let upcomingTraining = await volunteer.findUpcomingTraining(training, days)
            res.status(200).send(upcomingTraining)
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

module.exports = router;
