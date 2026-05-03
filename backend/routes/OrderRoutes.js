const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route to get all orders
router.get('/', (req, res) => {
    // Your existing code to read orders.csv or DB
});

// THIS IS THE FIX: The route to update status
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 1. Read your orders file (orders.csv)
        // 2. Find the order with the matching ID
        // 3. Change the status
        // 4. Save the file back
        
        console.log(`Order ${id} updated to ${status}`);
        res.status(200).json({ message: "Update successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update" });
    }
});

module.exports = router;
