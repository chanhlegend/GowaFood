import axios from "axios";

const API_URL = "/api/users";

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
    }
};
