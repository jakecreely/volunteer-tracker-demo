const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Training = require('../models/Training')


router.get('/', async (req, res) => {
    try {
        let training = await Training.find({}).sort({ renewalFrequency: 1 })
        res.status(200).send(training)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        let excludedArr = req.body.excludedRoles
        if (excludedArr === undefined) {
            excludedArr = []
        }
        const tempTraining = new Training({
            name: req.body.name,
            renewalFrequency: req.body.renewalFrequency,
            excludedRoles: excludedArr
        })
        let savedTraining = await tempTraining.save()
        res.status(201).send(savedTraining)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).send(err.message)
        } else {
            res.status(500).send(err.message)
        }
    }

})

router.get('/:id', async (req, res) => {
    try {
        let training = await Training.findOne({ _id: req.params['id'] })
        if (training === null) {
            res.status(404).send('No training found with that ID')
        } else {
            res.status(200).send(training)
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
        await Training.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedTraining = await Training.findOne({ _id: req.params['id'] })
        if (updatedTraining === null) {
            res.status(404).send('No training found with that ID')
        } else {
            res.status(200).send(updatedTraining)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).send('No training found with that ID')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedTraining = await Training.findOneAndDelete({ _id: req.params['id'] })
        if (deletedTraining === null) {
            res.status(404).send('No training found with that ID')
        } else {
            res.status(200).send(deletedTraining)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else {
            res.status(500).send(err.message)
        }
    }
})

module.exports = router;