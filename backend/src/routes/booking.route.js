const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

router.post('/check-in', bookingController.checkIn);
router.post('/check-out', bookingController.checkOut);

module.exports = router;
