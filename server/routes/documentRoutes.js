const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Document = require('../schema/Document')


router.get('/', async (req, res) => {
    try {
        let documents = await Document.find({}).sort({ name: 1 })
        if (documents === null) {
            res.status(404).send('No documents found')
        } else {
            res.status(200).send(documents)
        }
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const tempDocument = new Document({
            name: req.body.name,
        })
        let savedDocument = await tempDocument.save()
        res.status(201).send(savedDocument)
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
        let document = await Document.findOne({ _id: req.params['id'] })
        if (document === null) {
            res.status(404).send('No document found with that ID')
        } else {
            res.status(200).send(document)
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
        await Document.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedDocument = await Document.findOne({ _id: req.params['id'] })
        if (updatedDocument === null) {
            res.status(404).send('No document found with that ID')
        } else {
            res.status(200).send(updatedDocument)
        }
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).send('No document found with that ID')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedDocument = await Document.findOneAndDelete({ _id: req.params['id'] })
        if (deletedDocument === null) {
            res.status(404).send('No document found with that ID')
        } else {
            res.status(200).send(deletedDocument)
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
