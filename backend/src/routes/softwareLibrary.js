const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const softwareLibraryRepo = require('../db/repositories/softwareLibrary');

const router = express.Router();

router.get('/', asyncHandler((req, res) => {
  res.json(softwareLibraryRepo.list({ search: req.query.search }));
}));

router.post('/', asyncHandler((req, res) => {
  const item = softwareLibraryRepo.create(req.body || {});
  res.status(201).json(item);
}));

router.put('/:id', asyncHandler((req, res) => {
  const item = softwareLibraryRepo.update(Number(req.params.id), req.body || {});
  res.json(item);
}));

router.delete('/:id', asyncHandler((req, res) => {
  softwareLibraryRepo.remove(Number(req.params.id));
  res.status(204).end();
}));

module.exports = router;
