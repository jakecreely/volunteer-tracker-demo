const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Award = require('../schema/Award')

router.get('/', async (req, res) => {
    try {
        let awards = await Award.find({}).sort({ requiredServiceLength: 1 })
        if (awards === null) {
            res.status(404).send('No Awards Found')
        } else {
            res.status(200).send(awards)
        }
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
        let savedAward = await tempAward.save()
        res.status(201).send(savedAward)
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).send(err.message)
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.get('/:id', async (req, res) => {
    try {
        let award = await Award.findOne({ _id: req.params['id'] })
        if (award === null) {
            res.status(404).send('No award found with that ID')
        } else {
            res.status(200).send(award)
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
        await Award.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedAward = await Award.findOne({ _id: req.params['id'] })
        if (updatedAward === null) {
            res.status(404).send('No award found with that ID')
        } else {
            res.status(200).send(updatedAward)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
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
        let deletedAward = await Award.findOneAndDelete({ _id: req.params['id'] })
        if (deletedAward === null) {
            res.status(404).send('No award found with that ID')
        } else {
            res.status(200).send(deletedAward)
        }
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