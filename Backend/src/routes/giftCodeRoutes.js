
const express = require('express');
const router = express.Router();
const giftCodeController = require('../app/controllers/GiftCodeController');

// POST /api/gift-codes/apply
router.post('/apply', giftCodeController.applyGiftCode);
// GET /api/gift-codes
router.get('/', giftCodeController.getAllGiftCodes);
// create new gift code
router.post('/', giftCodeController.createGiftCode);
module.exports = router;





