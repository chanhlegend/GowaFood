const express = require('express');
const AddressController = require('../app/controllers/AddressController');
const router = express.Router();

// Lấy danh sách tất cả provinces
router.get('/provinces', AddressController.getProvinces);

// Lấy danh sách districts của một tỉnh
router.get('/provinces/:provinceId/districts', AddressController.getDistrictsByProvince);

// Lấy danh sách communes của một tỉnh
router.get('/provinces/:provinceId/communes', AddressController.getCommunesByProvince);

// Lấy danh sách communes của một district
router.get('/districts/:districtId/communes', AddressController.getCommunesByDistrict);

module.exports = router;
