import React, { useState, useEffect } from "react";
import { UserService } from "../services/userService";
import { UserService as AuthService } from "../services/authenService";
import { AddressService } from "../services/addressService";
import routingService from "../services/routingService";

const AddressManagement = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [communes, setCommunes] = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState("");
  const [alertMess, setAlertMess] = useState(false);
  const [mess, setMess] = useState("");

  // Lấy danh sách communes từ API thông qua service
  const fetchCommunes = async () => {
    try {
      setLoadingCommunes(true);
      const data = await AddressService.getCommunesByProvince(79);

      // Dữ liệu có cấu trúc {communes: [...]}
      const communesList = data.communes || [];
      setCommunes(communesList);
    } catch (err) {
      console.error("Error fetching communes:", err);
      setError("Không thể tải danh sách xã/phường");
    } finally {
      setLoadingCommunes(false);
    }
  };

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = localStorage.getItem("user_gowa");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Lấy thông tin địa chỉ từ API
          const userInfo = await UserService.getUserInfo(parsedUser._id);
          setAddresses(userInfo.addresses || []);
        } else {
          setError("Vui lòng đăng nhập để quản lý địa chỉ");
        }
      } catch (err) {
        setError("Không thể tải thông tin địa chỉ");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    fetchCommunes();
  }, []);

  // Hàm xử lý đặt địa chỉ mặc định
  const handleSetDefault = async (addressId) => {
    try {
      await UserService.setDefaultAddress(user._id, addressId);
      // Cập nhật lại danh sách địa chỉ
      const userInfo = await UserService.getUserInfo(user._id);
      setAddresses(userInfo.addresses || []);
    } catch (err) {
      setError("Không thể đặt địa chỉ mặc định");
      console.error("Error setting default address:", err);
    }
  };

  // Hàm mở modal xác nhận xóa
  const handleOpenDeleteModal = (address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  // Hàm đóng modal xóa
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  // Hàm xử lý xóa địa chỉ
  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      await UserService.deleteAddress(user._id, addressToDelete._id);
      // Cập nhật lại danh sách địa chỉ
      const userInfo = await UserService.getUserInfo(user._id);
      setAddresses(userInfo.addresses || []);
      // Đóng modal
      handleCloseDeleteModal();
    } catch (err) {
      setError("Không thể xóa địa chỉ");
      console.error("Error deleting address:", err);
    }
  };

  const getCoordinatesFromAddress = async (fullAddress) => {
    try {
      setLoadingCoordinates(true);

      // Mặc định: trung tâm Đà Nẵng
      let baseCoordinates = {
        latitude: null,
        longitude: null,
      };

      // điều chỉnh nhẹ theo commune cho đa dạng
      const selectedCommuneObj = communes.find(
        (c) => c.code === selectedCommune
      );
      if (selectedCommuneObj) {
        const offset = parseInt(selectedCommuneObj.code, 10) % 100;
        baseCoordinates.latitude += offset * 0.001 - 0.05;
        baseCoordinates.longitude += offset * 0.0015 - 0.075;
      }

      // cố gắng gọi Nominatim, nếu fail thì dùng baseCoordinates
      try {
        const encodedAddress = encodeURIComponent(fullAddress);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=vn`,
          {
            headers: {
              "User-Agent": "ECare-Mobile-App/1.0",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const { lat, lon } = data[0];
            baseCoordinates = {
              latitude: parseFloat(lat),
              longitude: parseFloat(lon),
            };
          }
        }
      } catch (geoErr) {
        console.log(
          "Geocoding failed, using base coordinates:",
          geoErr.message
        );
      }

      return baseCoordinates;
    } catch (error) {
      console.error("Get coordinates error:", error);
      console.log("Lỗi", "Có lỗi xảy ra khi lấy tọa độ.");
      return null;
    } finally {
      setLoadingCoordinates(false);
    }
  };

  // Hàm xử lý chỉnh sửa địa chỉ
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddForm(true);
    setError(null); // Xóa lỗi khi mở form chỉnh sửa
  };

  // Hàm xử lý thêm địa chỉ mới
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddForm(true);
    setError(null); // Xóa lỗi khi mở form mới
  };

  // Hàm xử lý submit form
  const handleSubmitForm = async (formData) => {
    try {
      // Validate dữ liệu đầu vào
      if (
        !formData.name ||
        !formData.phone ||
        !formData.address ||
        !formData.ward ||
        !formData.city
      ) {
        setError("Vui lòng nhập đầy đủ thông tin địa chỉ");
        return;
      }

      // Validate số điện thoại (chỉ cho phép số và ít nhất 10 ký tự)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Số điện thoại không hợp lệ (10-11 chữ số)");
        return;
      }

      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.city}`;

      const coordinates = await getCoordinatesFromAddress(fullAddress);

      if (coordinates.latitude === null || coordinates.longitude === null) {
        setMess("Địa chỉ có thể bị lỗi, vui lòng kiểm tra lại!");
        setAlertMess(true);
        return;
      }
      // Đảm bảo isDefault là boolean
      const distance = await routingService.calculateRoute(
        10.800106587718977,
        106.64158269510486,
        coordinates.latitude,
        coordinates.longitude
      );

      if (distance.success && distance.distance > 30) {
        setMess(
          "Địa chỉ quá xa cửa hàng (>30 km), không thể vận chuyển, vui lòng chọn địa chỉ khác."
        );
        setAlertMess(true);
        return;
      }

      const addressData = {
        ...formData,
        latitude: coordinates ? coordinates.latitude : null,
        longitude: coordinates ? coordinates.longitude : null,
        distanceToStore: distance.success ? distance.distance : null,
        isDefault: Boolean(formData.isDefault),
      };

      if (editingAddress) {
        // Cập nhật địa chỉ
        await UserService.updateAddress(
          user._id,
          editingAddress._id,
          addressData
        );
      } else {
        // Thêm địa chỉ mới
        await UserService.addAddress(user._id, addressData);
      }

      // Cập nhật lại danh sách địa chỉ
      const userInfo = await UserService.getUserInfo(user._id);
      setAddresses(userInfo.addresses || []);

      // Đóng form và xóa lỗi
      setShowAddForm(false);
      setEditingAddress(null);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.message ||
        (editingAddress
          ? "Không thể cập nhật địa chỉ"
          : "Không thể thêm địa chỉ");
      setError(errorMessage);
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-3 py-4 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  THÔNG TIN ĐỊA CHỈ
                </h1>
                <button
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                  + Thêm địa chỉ
                </button>
              </div>
              {/* Add/Edit Address Form Inline */}
              {showAddForm && (
                <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      {editingAddress
                        ? "Chỉnh sửa địa chỉ"
                        : "Thêm địa chỉ mới"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAddress(null);
                        setError(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Hiển thị lỗi nếu có */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const selectedWard = formData.get("ward")?.trim();
                      const selectedCommune = communes.find(
                        (commune) => commune.name === selectedWard
                      );

                      const data = {
                        name: formData.get("name")?.trim(),
                        phone: formData.get("phone")?.trim(),
                        address: formData.get("address")?.trim(),
                        ward: selectedWard,
                        wardCode: selectedCommune?.code || "",
                        city: formData.get("city")?.trim(),
                        isDefault: formData.get("isDefault") === "on",
                      };
                      handleSubmitForm(data);
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên người nhận
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingAddress?.name || ""}
                          required
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          defaultValue={editingAddress?.phone || ""}
                          required
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ chi tiết
                        </label>
                        <input
                          type="text"
                          name="address"
                          defaultValue={editingAddress?.address || ""}
                          required
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xã/Phường
                        </label>
                        <select
                          name="ward"
                          defaultValue={editingAddress?.ward || ""}
                          required
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={loadingCommunes}
                        >
                          <option value="">
                            {loadingCommunes ? "Đang tải..." : "Chọn xã/phường"}
                          </option>
                          {communes.map((commune) => (
                            <option key={commune.code} value={commune.name}>
                              {commune.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thành phố/Tỉnh
                        </label>
                        <input
                          type="text"
                          name="city"
                          defaultValue="TP.Hồ Chí Minh"
                          value="TP.Hồ Chí Minh"
                          readOnly
                          required
                          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="isDefault"
                            defaultChecked={editingAddress?.isDefault || false}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-700">
                            Đặt làm địa chỉ mặc định
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingAddress(null);
                          setError(null);
                        }}
                        className="px-6 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[48px] order-2 sm:order-1"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors min-h-[48px] order-1 sm:order-2"
                      >
                        {editingAddress
                          ? loadingCoordinates
                          ? "Đang lưu..."
                          : "Cập nhật địa chỉ"
                          : loadingCoordinates
                          ? "Đang lưu..."
                          : "Thêm địa chỉ"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Address Cards */}
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm sm:text-base">
                      Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên!
                    </p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm"
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {address.name}
                          </h3>
                          {address.isDefault && (
                            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full w-fit">
                              Địa chỉ mặc định
                            </span>
                          )}
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address._id)}
                              className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm rounded-full hover:bg-green-200 transition-colors w-fit"
                            >
                              Đặt làm địa chỉ mặc định
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Chỉnh sửa"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(address)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Xóa"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="space-y-2">
                        <p className="text-gray-800 font-medium text-sm sm:text-base">
                          {address.name}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Số điện thoại: {address.phone}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base break-words">
                          {address.address}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {address.ward}, {address.city}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={handleCloseDeleteModal}
          />

          {/* Modal */}
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Xác nhận xóa địa chỉ
                </h3>
                <button
                  onClick={handleCloseDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Bạn có chắc chắn muốn xóa địa chỉ này không?
                </p>
                {addressToDelete && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-800">
                      {addressToDelete.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addressToDelete.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addressToDelete.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addressToDelete.ward}, {addressToDelete.city}
                    </p>
                  </div>
                )}
                <p className="text-sm text-red-600 mt-3">
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-6 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[48px] order-2 sm:order-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAddress}
                  className="px-6 py-2 text-sm sm:text-base bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors min-h-[48px] order-1 sm:order-2"
                >
                  Xóa địa chỉ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Alert for Distance or Address Issues */}
      {alertMess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông báo
            </h3> 
            <p className="text-gray-600 mb-6">{mess}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertMess(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              > Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
