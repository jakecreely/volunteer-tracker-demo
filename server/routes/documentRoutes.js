const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Document = require('../models/Document');
const { HttpStatusCode } = require('axios');


router.get('/', async (req, res) => {
    try {
        let documents = await Document.find({}).sort({ name: 1 })
        res.status(HttpStatusCode.Ok).send(documents)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const tempDocument = new Document({
            name: req.body.name,
        })
        let savedDocument = await tempDocument.save()
        res.status(HttpStatusCode.Created).send(savedDocument)
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
        let document = await Document.findOne({ _id: req.params['id'] })
        if (!document) {
            return res.status(HttpStatusCode.NotFound).send('No document found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(document)
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
        await Document.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedDocument = await Document.findOne({ _id: req.params['id'] })
        res.status(HttpStatusCode.Ok).send(updatedDocument)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(HttpStatusCode.NotFound).send('No document found with that ID')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedDocument = await Document.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedDocument) {
            return res.status(HttpStatusCode.NotFound).send('No document found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(deletedDocument)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

module.exports = router;
