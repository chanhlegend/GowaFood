import axios from "axios";
import API_BASE_URL from "@/config/api";

const API_URL = `${API_BASE_URL}/api/users`;

export const UserService = {
    // Lấy thông tin người dùng
    getUserInfo: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Cập nhật thông tin người dùng
    updateUserInfo: async (userId, userData) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Đổi mật khẩu
    changePassword: async (userId, passwords) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}/change-password`, passwords);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Thêm địa chỉ mới
    addAddress: async (userId, addressData) => {
        try {
            const response = await axios.post(`${API_URL}/${userId}/addresses`, addressData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Cập nhật địa chỉ
    updateAddress: async (userId, addressId, addressData) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}/addresses/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Xóa địa chỉ
    deleteAddress: async (userId, addressId) => {
        try {
            const response = await axios.delete(`${API_URL}/${userId}/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Đặt địa chỉ mặc định
    setDefaultAddress: async (userId, addressId) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}/addresses/${addressId}/default`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Cập nhật điểm thưởng
    updateRewardPoints: async (userId, pointsChange) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}/reward-points`, { pointsChange });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    // Lấy tất cả người dùng
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/getAllUsers`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },
};
