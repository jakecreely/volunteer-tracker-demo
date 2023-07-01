const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Role = require('../schema/Role')


router.get('/', async (req, res) => {
    try {
        let roles = await Role.find({}).sort({ name: 1})
        if (roles === null) {
            res.status(404).send('No roles found')
        } else {
            res.status(200).send(roles)
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/create', async (req, res) => {
    if (!req.body.name) {
        res.status(400).send("Missing required fields (name)")
    } else {
        try {
            const tempRole = new Role({
                name: req.body.name,
            })
            let savedRole = await tempRole.save()
            res.status(201).send(savedRole)
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
            let role = await Role.findOne({ _id: req.params['id'] })
            if (role === null) {
                res.status(404).send('No role found with that ID')
            } else {
                res.status(200).send(role)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

router.put('/update/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send('Provided ID is invalid')
    } else {
        try {
            let updatedRole = await Role.findOneAndUpdate({ _id: req.params['id'] }, req.body)
            if (updatedRole === null) {
                res.status(404).send('No role found with that ID')
            } else {
                res.status(200).send(updatedRole)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

router.delete('/delete/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params['id'])) {
        res.status(400).send({ message: 'Provided ID is invalid' })
    } else {
        try {
            let deletedRole = await Role.findOneAndDelete({ _id: req.params['id'] })
            if (deletedRole === null) {
                res.status(404).send({ message: 'No role found with that ID' })
            } else {
                res.status(200).send(deletedRole)
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
})

module.exports = router;
