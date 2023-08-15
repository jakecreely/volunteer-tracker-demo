const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Training = require('../models/Training');
const { HttpStatusCode } = require('axios');


router.get('/', async (req, res) => {
    try {
        let training = await Training.find({}).sort({ renewalFrequency: 1 })
        res.status(HttpStatusCode.Ok).send(training)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const excludedArr = req.body.excludedRoles ? req.body.excludedRoles : []
        const tempTraining = new Training({
            name: req.body.name,
            renewalFrequency: req.body.renewalFrequency,
            excludedRoles: excludedArr
        })
        let savedTraining = await tempTraining.save()
        res.status(HttpStatusCode.Created).send(savedTraining)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }

})

router.get('/:id', async (req, res) => {
    try {
        let training = await Training.findOne({ _id: req.params['id'] })
        if (!training) {
            return res.status(HttpStatusCode.NotFound).send('No training found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(training)
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
        await Training.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedTraining = await Training.findOne({ _id: req.params['id'] })
        res.status(HttpStatusCode.Ok).send(updatedTraining)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(HttpStatusCode.NotFound).send('No training found with that ID')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedTraining = await Training.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedTraining) {
            return res.status(HttpStatusCode.NotFound).send('No training found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(deletedTraining)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

module.exports = router;