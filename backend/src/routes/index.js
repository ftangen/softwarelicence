const express = require('express');
const customers = require('./customers');
const projects = require('./projects');
const softwareEntries = require('./softwareEntries');
const software = require('./software');
const softwareLibrary = require('./softwareLibrary');
const dashboard = require('./dashboard');

const router = express.Router();

router.use('/customers', customers);
router.use('/projects', projects);
router.use('/software-entries', softwareEntries);
router.use('/software', software);
router.use('/software-library', softwareLibrary);
router.use('/dashboard', dashboard);

module.exports = router;
