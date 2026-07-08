const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const dashboardRepo = require('../db/repositories/dashboard');

const router = express.Router();

router.get('/', asyncHandler((req, res) => {
  const { search, customer_id, status } = req.query;
  res.json({
    stats: dashboardRepo.getStats(),
    entries: dashboardRepo.listEntries({ search, customer_id, status }),
  });
}));

module.exports = router;
