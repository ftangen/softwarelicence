const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const customersRepo = require('../db/repositories/customers');
const projectsRepo = require('../db/repositories/projects');

const router = express.Router();

router.get('/', asyncHandler((req, res) => {
  res.json(customersRepo.listWithStats());
}));

router.post('/', asyncHandler((req, res) => {
  const customer = customersRepo.create(req.body || {});
  res.status(201).json(customer);
}));

router.get('/:id/projects', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  if (!customersRepo.exists(id)) throw new HttpError(404, 'Customer not found');
  res.json(projectsRepo.listByCustomer(id));
}));

module.exports = router;
