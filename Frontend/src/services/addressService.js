import axios from "axios";
import API_BASE_URL from "@/config/api";

const API_URL = `${API_BASE_URL}/api/address`;

export const AddressService = {
    // Lấy danh sách tất cả provinces
    getProvinces: async () => {
        try {
            const response = await axios.get(`${API_URL}/provinces`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Lấy danh sách districts của một tỉnh
    getDistrictsByProvince: async (provinceId) => {
        try {
            const response = await axios.get(`${API_URL}/provinces/${provinceId}/districts`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Lấy danh sách communes của một tỉnh
    getCommunesByProvince: async (provinceId) => {
        try {
            const response = await axios.get(`${API_URL}/provinces/${provinceId}/communes`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Lấy danh sách communes của một district
    getCommunesByDistrict: async (districtId) => {
        try {
            const response = await axios.get(`${API_URL}/districts/${districtId}/communes`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    }
};
