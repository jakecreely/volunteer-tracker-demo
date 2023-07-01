const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Training = require('../schema/Training')


router.get('/', async (req, res) => {
    try {
        let training = await Training.find({}).sort({ renewalFrequency: 1 })
        res.status(200).send(training)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/create', async (req, res) => {
    if (!req.body.name || !req.body.renewalFrequency || !req.body.excludedRoles) {
        res.status(400).send("Missing required fields (name and/or length and/or excluded roles)")
    } else {
        try {
            const tempTraining = new Training({
                name: req.body.name,
                renewalFrequency: req.body.renewalFrequency,
                excludedRoles: req.body.excludedRoles
            })
            let savedTraining = await tempTraining.save()
            res.status(201).send(savedTraining)
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Provided ID is invalid')
    } else {
        try {
            let training = await Training.findOne({ _id: req.params['id'] })
            if (training === null) {
                res.status(404).send('No training found with that ID')
            } else {
                res.status(200).send(training)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

router.put('/update/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Provided ID is invalid')
    } else {
        let updatedTraining = await Training.findOneAndUpdate({_id: req.params['id']}, req.body)
        if (updatedTraining === null) {
            res.status(404).send('No training found with that ID')
        } else {
            res.status(200).send(updatedTraining)
        }
    }
})

router.delete('/delete/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send({ message: 'Provided ID is invalid' })
    } else {
        let deletedTraining = await Training.findOneAndDelete({ _id: req.params['id'] })
        if (deletedTraining === null) {
            res.status(404).send('No training found with that ID')
        } else {
            res.status(200).send(deletedTraining)
        }
    }
})

module.exports = router;