const express = require("express")
const mongoose = require("mongoose")
var cors = require('cors');
const swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')

// Schema
require('./schema/Training')
require('./schema/Volunteer')
require('./schema/Award')
require('./schema/Role')
require('./schema/Document')

// Routes
const volunteerRoutes = require('./routes/volunteerRoutes')
const trainingRoutes = require('./routes/trainingRoutes')
const rewardRoutes = require('./routes/awardRoutes')
const roleRoutes = require('./routes/roleRoutes')
const documentRoutes = require('./routes/documentRoutes')
const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: `./.env.${env}` });
let connection;

const setupServer = () => {
  return new Promise((resolve, reject) => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV === 'production') {
      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false
      });
      app.use(limiter)
    }

    connection = app.listen(process.env.PORT || 8080, () =>
      console.log(`Server running on port ${process.env.PORT}!`),
    );

    app.use('/volunteers', volunteerRoutes);
    app.use('/training', trainingRoutes);
    app.use('/awards', rewardRoutes);
    app.use('/roles', roleRoutes);
    app.use('/documents', documentRoutes);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    resolve(connection)
  })
}

const stopServer = () => {
  return new Promise((resolve, reject) => {
    connection.close(() => {
      resolve()
    })
  })
}

module.exports = { setupServer, stopServer };