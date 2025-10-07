import axios from "axios";
import API_BASE_URL from "@/config/api";
const API_URL = `${API_BASE_URL}/api/gift-codes`;

const GiftCodeService = {
    applyGiftCode: async (code, userId) => {
        try {
            const response = await axios.post(`${API_URL}/apply`, { code, userId });
            return {
                success: true,
                data: response.data,
                message: "Áp dụng mã giảm giá thành công",
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Áp dụng mã giảm giá thất bại",
            };
        }       
    },
    getAllGiftCodes: async () => {
        try {
            const response = await axios.get(API_URL);
            return {
                success: true,
                data: response.data,
                message: "Lấy danh sách mã giảm giá thành công",
            };
        }

        catch (error) {        
            return {
                success: false,
                message: error.response?.data?.message || "Lấy danh sách mã giảm giá thất bại", 
                console: error
            };
        }
    },
    getGiftCodeById: async (id) => {
        try {   
            const response = await axios.get(`${API_URL}/${id}`);
            return {
                success: true,
                data: response.data,
                message: "Lấy mã giảm giá thành công",
            };
        }
        catch (error) {        
            return {
                success: false,
                message: error.response?.data?.message || "Lấy mã giảm giá thất bại",
            };
        }
    },
    updateGiftCode: async (id, giftCodeData) => {
        try {   
            const response = await axios.put(`${API_URL}/${id}`, giftCodeData);
            return {
                success: true,
                data: response.data,
                message: "Cập nhật mã giảm giá thành công",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Cập nhật mã giảm giá thất bại",
            };
        }
    },
    deleteGiftCode: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return {
                success: true,
                data: response.data,
                message: "Xóa mã giảm giá thành công",
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Xóa mã giảm giá thất bại",
            };
        }       
    },
};
export default GiftCodeService;