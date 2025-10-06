import axios from "axios";

const API_URL = "api/auth";

export const UserService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  login: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  verifyOtp: async (otpData) => {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, otpData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },
  getMe: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },
};
