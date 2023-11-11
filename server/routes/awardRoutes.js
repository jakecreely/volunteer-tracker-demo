const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Award = require('../models/Award');
const { HttpStatusCode } = require('axios');
const awardController = require('../controllers/awardController');

router.get('/', async (req, res) => {
    try {
        const awards = await Award.find({}).sort({ requiredServiceLength: 1 })
        res.status(HttpStatusCode.Ok).send(awards)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const tempAward = new Award({
            name: req.body.name,
            requiredServiceLength: req.body.requiredServiceLength
        })
        const savedAward = await tempAward.save()
        res.status(HttpStatusCode.Created).send(savedAward)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err.code === 11000) { // Duplicate Key Error
            res.status(HttpStatusCode.Conflict).send('Award Already Exists')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.get('/:id', async (req, res) => {
    try {
        const award = await Award.findOne({ _id: req.params['id'] })
        if (!award) {
            return res.status(HttpStatusCode.NotFound).send('No award found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(award)
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
        await Award.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        const updatedAward = await Award.findOne({ _id: req.params['id'] })
        res.status(HttpStatusCode.Ok).send(updatedAward)
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(HttpStatusCode.NotFound).send(err.message)
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deletedAward = await Award.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedAward) {
            return res.status(HttpStatusCode.NotFound).send('No award found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(deletedAward)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.get('/auto-fill/:startDate&:breakDuration', async (req, res) => {
    try {
        let startDate = req.params.startDate
        let breakDuration = req.params.breakDuration
        let filledAwards = await Award.autoFill(startDate, breakDuration)
        res.status(HttpStatusCode.Ok).send(filledAwards)
    }
    catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.get('/:id/volunteer-usage', async (req, res) => {
    try {
        const id = req.params['id']
        const awardsWithUsage = await awardController.getVolunteersUsage(id)
        res.status(HttpStatusCode.Ok).send(awardsWithUsage)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

module.exports = router;