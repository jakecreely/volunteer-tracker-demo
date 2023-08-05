const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Document = require('../schema/Document')


router.get('/', async (req, res) => {
    try {
        let documents = await Document.find({}).sort({ name: 1})
        if (documents === null) {
            res.status(404).send('No documents found')
        } else {
            res.status(200).send(documents)
        }
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

router.post('/create', async (req, res) => {
    if (!req.body.name) {
        res.status(400).send("Missing required fields (name)")
    } else {
        try {
            const tempDocument = new Document({
                name: req.body.name,
            })
            let savedDocument = await tempDocument.save()
            res.status(201).send(savedDocument)
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
            let document = await Document.findOne({ _id: req.params['id'] })
            if (document === null) {
                res.status(404).send('No document found with that ID')
            } else {
                res.status(200).send(document)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

router.put('/update/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Provided ID is invalid')
    } else if (req.body.name) {
        try {
            await Document.findOneAndUpdate({ _id: req.params['id'] }, req.body)
            let updatedDocument = await Document.findOne({ _id: req.params['id'] })
            if (updatedDocument === null) {
                res.status(404).send('No document found with that ID')
            } else {
                res.status(200).send(updatedDocument)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    } else {
        res.status(400).send('Missing required fields (name)')
    }
})

router.delete('/delete/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Provided ID is invalid')
    } else {
        try {
            let deletedDocument = await Document.findOneAndDelete({ _id: req.params['id'] })
            if (deletedDocument === null) {
                res.status(404).send('No document found with that ID')
            } else {
                res.status(200).send(deletedDocument)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

module.exports = router;
