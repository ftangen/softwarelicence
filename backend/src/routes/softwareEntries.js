const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const softwareEntriesRepo = require('../db/repositories/softwareEntries');

const router = express.Router();

router.post('/', asyncHandler((req, res) => {
  const entry = softwareEntriesRepo.create(req.body || {});
  res.status(201).json(entry);
}));

router.put('/:id', asyncHandler((req, res) => {
  const entry = softwareEntriesRepo.update(Number(req.params.id), req.body || {});
  res.json(entry);
}));

router.delete('/:id', asyncHandler((req, res) => {
  softwareEntriesRepo.remove(Number(req.params.id));
  res.status(204).end();
}));

module.exports = router;
