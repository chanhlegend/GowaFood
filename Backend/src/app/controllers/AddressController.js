const axios = require('axios');

class AddressController {
    // Lấy danh sách tất cả provinces
    async getProvinces(req, res) {
        try {
            const response = await axios.get('https://production.cas.so/address-kit/2025-07-01/provinces', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8'
                },
                responseType: 'text',
                responseEncoding: 'utf8'
            });
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json(JSON.parse(response.data));
        } catch (error) {
            console.error('Error fetching provinces:', error);
            res.status(500).json({ 
                error: 'Failed to fetch provinces',
                message: error.message 
            });
        }
    }

    // Lấy danh sách districts của một tỉnh
    async getDistrictsByProvince(req, res) {
        try {
            const { provinceId } = req.params;
            const response = await axios.get(`https://production.cas.so/address-kit/2025-07-01/provinces/${provinceId}/districts`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8'
                },
                responseType: 'text',
                responseEncoding: 'utf8'
            });
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json(JSON.parse(response.data));
        } catch (error) {
            console.error('Error fetching districts:', error);
            res.status(500).json({ 
                error: 'Failed to fetch districts',
                message: error.message 
            });
        }
    }

    // Lấy danh sách communes của một tỉnh
    async getCommunesByProvince(req, res) {
        try {
            const { provinceId } = req.params;
            const response = await axios.get(`https://production.cas.so/address-kit/2025-07-01/provinces/${provinceId}/communes`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8'
                },
                responseType: 'text',
                responseEncoding: 'utf8'
            });
            
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json(JSON.parse(response.data));
        } catch (error) {
            console.error('Error fetching communes:', error);
            res.status(500).json({ 
                error: 'Failed to fetch communes',
                message: error.message 
            });
        }
    }

    // Lấy danh sách communes của một district
    async getCommunesByDistrict(req, res) {
        try {
            const { districtId } = req.params;
            const response = await axios.get(`https://production.cas.so/address-kit/2025-07-01/districts/${districtId}/communes`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8'
                },
                responseType: 'text',
                responseEncoding: 'utf8'
            });
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.json(JSON.parse(response.data));
        } catch (error) {
            console.error('Error fetching communes by district:', error);
            res.status(500).json({ 
                error: 'Failed to fetch communes',
                message: error.message 
            });
        }
    }
}

module.exports = new AddressController();
