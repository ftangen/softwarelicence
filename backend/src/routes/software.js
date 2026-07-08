const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const softwareRepo = require('../db/repositories/software');

const router = express.Router();

router.get('/', asyncHandler((req, res) => {
  res.json(softwareRepo.listGrouped({ search: req.query.search }));
}));

module.exports = router;
