const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const projectsRepo = require('../db/repositories/projects');

const router = express.Router();

router.post('/', asyncHandler((req, res) => {
  const project = projectsRepo.create(req.body || {});
  res.status(201).json(project);
}));

module.exports = router;
