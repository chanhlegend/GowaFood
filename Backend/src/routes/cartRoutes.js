const express = require('express');
const router = express.Router();
const cartController = require('../../src/app/controllers/CartController');

router.get('/',  cartController.getCart);

router.post('/add',  cartController.addItem);

router.patch('/update', cartController.updateItem);

router.delete('/item/:productId', cartController.removeItem);

router.delete('/clear',  cartController.clearCart);

router.get('/count/:userId', cartController.getItemCount);

module.exports = router;