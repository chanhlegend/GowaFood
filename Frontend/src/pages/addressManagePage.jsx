import React from 'react'

const AddressManagement = () => {
  const addresses = [
    {
      id: 1,
      name: "Nguyễn Minh",
      phone: "0356555425",
      address: "30 Trần Văn Trà, Thị Trấn Di Lăng, Huyện Sơn Hà, Tỉnh Quảng Ngãi",
      isDefault: true,
    },
    {
      id: 2,
      name: "Trần Hoàng Anh",
      phone: "0383531478",
      address: "30 Trần Văn Trà, Thị Trấn Di Lăng, Huyện Sơn Hà, Tỉnh Quảng Ngãi",
      isDefault: false,
    },
  ]

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">THÔNG TIN ĐỊA CHỈ</h1>
            <button className="px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
              + Thêm địa chỉ
            </button>
          </div>

          {/* Address Cards */}
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-800">{address.name}</h3>
                    {address.isDefault && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Địa chỉ mặc định</span>
                    )}
                    {!address.isDefault && (
                      <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full hover:bg-green-200 transition-colors">
                        Đặt làm địa chỉ mặc định
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressManagement
