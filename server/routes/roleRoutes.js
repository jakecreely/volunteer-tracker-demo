const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Role = require('../models/Role')

router.get('/', async (req, res) => {
    try {
        let roles = await Role.find({}).sort({ name: 1 })
        res.status(200).send(roles)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const tempRole = new Role({
            name: req.body.name,
        })
        let savedRole = await tempRole.save()
        res.status(201).send(savedRole)
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
        let role = await Role.findOne({ _id: req.params['id'] })
        if (!role) {
            return res.status(404).send('No role found with that ID')
        }
        res.status(200).send(role)
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
        await Role.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedRole = await Role.findOne({ _id: req.params['id'] })
        res.status(200).send(updatedRole)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(400).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).send('No role found with that ID')
        } else {
            res.status(500).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedRole = await Role.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedRole) {
            return res.status(404).send({ message: 'No role found with that ID' })
        }
        res.status(200).send(deletedRole)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(400).send('Provided ID is invalid')
        } else {
            res.status(500).send(err.message)
        }
    }
})

module.exports = router;
