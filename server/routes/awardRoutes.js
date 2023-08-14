const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Award = require('../models/Award')

router.get('/', async (req, res) => {
    try {
        const awards = await Award.find({}).sort({ requiredServiceLength: 1 })
        res.status(200).send(awards)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const tempAward = new Award({
            name: req.body.name,
            requiredServiceLength: req.body.requiredServiceLength
        })
        const savedAward = await tempAward.save()
        res.status(201).send(savedAward)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).send(err.message)
        } else if (err.code === 11000) { // Duplicate key error
            res.status(409).send('Award Already Exists')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.get('/:id', async (req, res) => {
    try {
        const award = await Award.findOne({ _id: req.params['id'] })
        if (!award) {
            return res.status(404).send('No award found with that ID')
        }
        res.status(200).send(award)
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
        await Award.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        const updatedAward = await Award.findOne({ _id: req.params['id'] })
        res.status(200).send(updatedAward)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(400).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).send(err.message)
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deletedAward = await Award.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedAward) {
            return res.status(404).send('No award found with that ID')
        }
        res.status(200).send(deletedAward)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.get('/auto-fill/:startDate&:breakDuration', async (req, res) => {
    try {
        let startDate = req.params.startDate
        let breakDuration = req.params.breakDuration
        let filledAwards = await Award.autoFill(startDate, breakDuration)
        res.status(200).send(filledAwards)
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})

module.exports = router;