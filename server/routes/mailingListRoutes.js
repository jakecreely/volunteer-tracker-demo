const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const { HttpStatusCode } = require('axios');
const Email = require('../models/Email');
const mailingListController = require('../controllers/mailingListController');

router.get('/', async (req, res) => {
    try {
        let mailingList = await mailingListController.findAll()
        res.status(HttpStatusCode.Ok).send(mailingList)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const tempEmail = new Email({
            name: req.body.name,
            emailAddress: req.body.emailAddress,
            frequency: req.body.frequency,
            upcomingDays: req.body.upcomingDays,
            subscribed: req.body.subscribed
        })
        let savedEmail = await tempEmail.save()
        res.status(HttpStatusCode.Created).send(savedEmail)
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
        let fetchedEmail = await Email.findOne({ _id: req.params['id'] })
        if (!fetchedEmail) {
            return res.status(HttpStatusCode.NotFound).send('No email found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(fetchedEmail)
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
        await Email.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedEmail = await Email.findOne({ _id: req.params['id'] })
        res.status(HttpStatusCode.Ok).send(updatedEmail)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(HttpStatusCode.NotFound).send('No email found with that ID')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedEmail = await Email.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedEmail) {
            return res.status(HttpStatusCode.NotFound).send('No email found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(deletedEmail)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

module.exports = router;
