import React, { useState, useEffect } from 'react'
import { UserService } from '../services/userService'
import { UserService as AuthService } from '../services/authenService'

const AddressManagement = () => {
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = localStorage.getItem('user_gowa')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
          // Lấy thông tin địa chỉ từ API
          const userInfo = await UserService.getUserInfo(parsedUser._id)
          setAddresses(userInfo.addresses || [])
        } else {
          setError('Vui lòng đăng nhập để quản lý địa chỉ')
        }
      } catch (err) {
        setError('Không thể tải thông tin địa chỉ')
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
      }
    }

    getUserData()
  }, [])

  // Hàm xử lý đặt địa chỉ mặc định
  const handleSetDefault = async (addressId) => {
    try {
      await UserService.setDefaultAddress(user._id, addressId)
      // Cập nhật lại danh sách địa chỉ
      const userInfo = await UserService.getUserInfo(user._id)
      setAddresses(userInfo.addresses || [])
    } catch (err) {
      setError('Không thể đặt địa chỉ mặc định')
      console.error('Error setting default address:', err)
    }
  }

  // Hàm xử lý xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await UserService.deleteAddress(user._id, addressId)
        // Cập nhật lại danh sách địa chỉ
        const userInfo = await UserService.getUserInfo(user._id)
        setAddresses(userInfo.addresses || [])
      } catch (err) {
        setError('Không thể xóa địa chỉ')
        console.error('Error deleting address:', err)
      }
    }
  }

  // Hàm xử lý chỉnh sửa địa chỉ
  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setShowAddForm(true)
    setError(null) // Xóa lỗi khi mở form chỉnh sửa
  }

  // Hàm xử lý thêm địa chỉ mới
  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowAddForm(true)
    setError(null) // Xóa lỗi khi mở form mới
  }

  // Hàm xử lý submit form
  const handleSubmitForm = async (formData) => {
    try {
      // Validate dữ liệu đầu vào
      if (!formData.name || !formData.phone || !formData.address || !formData.ward || !formData.city) {
        setError('Vui lòng nhập đầy đủ thông tin địa chỉ')
        return
      }

      // Validate số điện thoại (chỉ cho phép số và ít nhất 10 ký tự)
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.phone)) {
        setError('Số điện thoại không hợp lệ (10-11 chữ số)')
        return
      }

      // Đảm bảo isDefault là boolean
      const addressData = {
        ...formData,
        isDefault: Boolean(formData.isDefault)
      }

      if (editingAddress) {
        // Cập nhật địa chỉ
        await UserService.updateAddress(user._id, editingAddress._id, addressData)
      } else {
        // Thêm địa chỉ mới
        await UserService.addAddress(user._id, addressData)
      }
      
      // Cập nhật lại danh sách địa chỉ
      const userInfo = await UserService.getUserInfo(user._id)
      setAddresses(userInfo.addresses || [])
      
      // Đóng form và xóa lỗi
      setShowAddForm(false)
      setEditingAddress(null)
      setError(null)
    } catch (err) {
      const errorMessage = err.message || (editingAddress ? 'Không thể cập nhật địa chỉ' : 'Không thể thêm địa chỉ')
      setError(errorMessage)
      console.error('Error submitting form:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">THÔNG TIN ĐỊA CHỈ</h1>
            <button 
              onClick={handleAddAddress}
              className="px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              + Thêm địa chỉ
            </button>
          </div>

          {/* Address Cards */}
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên!</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-800">{address.name}</h3>
                      {address.isDefault && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Địa chỉ mặc định</span>
                      )}
                      {!address.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(address._id)}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full hover:bg-green-200 transition-colors"
                        >
                          Đặt làm địa chỉ mặc định
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditAddress(address)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(address._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-gray-800 font-medium">{address.name}</p>
                    <p className="text-gray-600">Số điện thoại: {address.phone}</p>
                    <p className="text-gray-600">{address.address}</p>
                    <p className="text-gray-600">{address.ward}, {address.city}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Address Form Inline */}
          {showAddForm && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingAddress(null)
                    setError(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Hiển thị lỗi nếu có */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const data = {
                  name: formData.get('name')?.trim(),
                  phone: formData.get('phone')?.trim(),
                  address: formData.get('address')?.trim(),
                  ward: formData.get('ward')?.trim(),
                  city: formData.get('city')?.trim(),
                  isDefault: formData.get('isDefault') === 'on'
                }
                handleSubmitForm(data)
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người nhận
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingAddress?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editingAddress?.phone || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={editingAddress?.address || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xã/Phường
                    </label>
                    <input
                      type="text"
                      name="ward"
                      defaultValue={editingAddress?.ward || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phố/Tỉnh
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingAddress?.city || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
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

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingAddress(null)
                      setError(null)
                    }}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressManagement
