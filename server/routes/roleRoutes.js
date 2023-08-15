const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Role = require('../models/Role');
const { HttpStatusCode } = require('axios');

router.get('/', async (req, res) => {
    try {
        let roles = await Role.find({}).sort({ name: 1 })
        res.status(HttpStatusCode.Ok).send(roles)
    } catch (err) {
        res.status(HttpStatusCode.InternalServerError).send(err.message)
    }
})

router.post('/', async (req, res) => {
    try {
        const tempRole = new Role({
            name: req.body.name,
        })
        let savedRole = await tempRole.save()
        res.status(HttpStatusCode.Created).send(savedRole)
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
        let role = await Role.findOne({ _id: req.params['id'] })
        if (!role) {
            return res.status(HttpStatusCode.NotFound).send('No role found with that ID')
        }
        res.status(HttpStatusCode.Ok).send(role)
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
        await Role.findOneAndUpdate({ _id: req.params['id'] }, req.body)
        let updatedRole = await Role.findOne({ _id: req.params['id'] })
        res.status(HttpStatusCode.Ok).send(updatedRole)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else if (err instanceof mongoose.Error.ValidationError) { // Not being reached - findOneAndUpdate doesn't trigger validation
            res.status(HttpStatusCode.BadRequest).send(err.message)
        } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(HttpStatusCode.NotFound).send('No role found with that ID')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let deletedRole = await Role.findOneAndDelete({ _id: req.params['id'] })
        if (!deletedRole) {
            return res.status(HttpStatusCode.NotFound).send({ message: 'No role found with that ID' })
        }
        res.status(HttpStatusCode.Ok).send(deletedRole)
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            res.status(HttpStatusCode.BadRequest).send('Provided ID is invalid')
        } else {
            res.status(HttpStatusCode.InternalServerError).send(err.message)
        }
    }
})

module.exports = router;
