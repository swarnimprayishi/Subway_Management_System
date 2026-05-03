// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
// Import a controller function to read CSVs

router.get('/dashboard-data', (req, res) => {
    // Logic to read your .csv files and res.json() the data
});

module.exports = router;
