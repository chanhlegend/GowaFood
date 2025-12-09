import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '../constants/routePath';
import './css/guidelinePage.css';

export default function GuidelinePage() {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState({
    search: true,
    order: false,
    payment: false,
  });

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const AccordionItem = ({ title, icon, content, isOpen, onClick }) => (
    <div className="accordion-item">
      <button className={`accordion-header ${isOpen ? 'active' : ''}`} onClick={onClick}>
        <div className="accordion-title-wrapper">
          <span className="accordion-icon">{icon}</span>
          <h3 className="accordion-title">{title}</h3>
        </div>
        <ChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} size={20} />
      </button>
      {isOpen && <div className="accordion-content">{content}</div>}
    </div>
  );

  return (
    <div className="guideline-page">
      {/* Header */}
      <div className="guideline-header">
        <div className="header-content">
          <h1>Hướng Dẫn Sử Dụng GowaFood</h1>
          <p>Tất cả những thông tin bạn cần để mua sắm và nhận hàng một cách dễ dàng</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="guideline-container">
        <div className="tab-content">
          <div className="tab-panel active">
            <h2 className="section-title">Hướng Dẫn Mua Hàng</h2>
              <div className="accordion-wrapper">
              <AccordionItem
                title="Cách Tìm Kiếm Sản Phẩm"
                icon="🔍"
                isOpen={openAccordion.search}
                onClick={() => toggleAccordion('search')}
                content={
                  <div className="accordion-body">
                    <div className="step-list">
                      <div className="step-item">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          <h4>Duyệt Theo Danh Mục</h4>
                          <p>Truy cập Trang Chủ và chọn danh mục sản phẩm bạn muốn. GowaFood chuyên cung cấp rau sạch, hoa quả tươi, nông sản - được thu hoạch sáng giao trong ngày</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">2</div>
                        <div className="step-content">
                          <h4>Sử Dụng Thanh Tìm Kiếm</h4>
                          <p>Nhập tên rau, hoa quả hoặc từ khóa vào ô tìm kiếm. Ví dụ: "rau cải", "cà chua", "táo", "bắp cải"</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">3</div>
                        <div className="step-content">
                          <h4>Sắp Xếp Sản Phẩm</h4>
                          <p>Sắp xếp kết quả theo: Giá thấp → cao, Giá cao → thấp, để dễ tìm sản phẩm phù hợp ngân sách</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">4</div>
                        <div className="step-content">
                          <h4>Xem Chi Tiết & Đánh Giá</h4>
                          <p>Nhấp vào sản phẩm để xem: Giá, khối lượng (1KG, 500g), nguồn gốc, thông tin, đánh giá từ khách hàng đã mua</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="nav-button"
                      onClick={() => navigate(ROUTE_PATH.HOME)}
                    >
                      Bắt Đầu Tìm Kiếm →
                    </button>
                  </div>
                }
              />

              <AccordionItem
                title="Cách Đặt Hàng Từng Bước"
                icon="📋"
                isOpen={openAccordion.order}
                onClick={() => toggleAccordion('order')}
                content={
                  <div className="accordion-body">
                    <div className="step-list">
                      <div className="step-item">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          <h4>Chọn Sản Phẩm & Khối Lượng</h4>
                          <p>Xem chi tiết sản phẩm, chọn khối lượng (1KG hoặc 500g tùy theo sản phẩm), chọn số lượng, và nhấp <strong>"Thêm vào Giỏ Hàng"</strong></p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">2</div>
                        <div className="step-content">
                          <h4>Xem Lại Giỏ Hàng</h4>
                          <p>Truy cập Giỏ Hàng, xem lại danh sách sản phẩm, khối lượng, số lượng và giá. Bạn có thể cập nhật số lượng hoặc xóa sản phẩm tại đây</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">3</div>
                        <div className="step-content">
                          <h4>Áp Dụng Mã Giảm Giá (Nếu Có)</h4>
                          <p>Nhập mã giảm giá hoặc chọn voucher từ điểm tích luỹ (nếu có). Hệ thống tự động tính toán giảm giá</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">4</div>
                        <div className="step-content">
                          <h4>Nhấp Thanh Toán</h4>
                          <p>Nhấp <strong>"Tiến Hành Thanh Toán"</strong> để chuyển đến trang thanh toán</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">5</div>
                        <div className="step-content">
                          <h4>Chọn Địa Chỉ Giao Hàng</h4>
                          <p>Chọn địa chỉ giao hàng từ danh sách đã lưu hoặc thêm địa chỉ mới. Đảm bảo địa chỉ chính xác để tránh trì hoãn</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">6</div>
                        <div className="step-content">
                          <h4>Chọn Phương Thức Thanh Toán & Giao Hàng</h4>
                          <p>Chọn phương thức thanh toán (COD, Chuyển khoản) và phương thức giao hàng (Giao tại nhà). Xem phí vận chuyển được tính toán tự động</p>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">7</div>
                        <div className="step-content">
                          <h4>Xác Nhận Đặt Hàng</h4>
                          <p>Kiểm tra toàn bộ thông tin: Sản phẩm, số lượng, địa chỉ, phí vận chuyển, tổng tiền. Nhấp <strong>"Xác Nhận Đặt Hàng"</strong> để hoàn tất</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="nav-button"
                      onClick={() => navigate(ROUTE_PATH.HOME)}
                    >
                      Đi Đến Trang Chủ & Bắt Đầu Mua Hàng →
                    </button>
                  </div>
                }
              />

              <AccordionItem
                title="Các Phương Thức Thanh Toán"
                icon="💳"
                isOpen={openAccordion.payment}
                onClick={() => toggleAccordion('payment')}
                content={
                  <div className="accordion-body">
                    <div className="payment-methods">
                      <div className="payment-method">
                        <div className="payment-icon">💰</div>
                        <div className="payment-info">
                          <h4>Thanh Toán Khi Nhận Hàng (COD)</h4>
                          <p>Thanh toán tiền mặt cho nhân viên giao hàng khi nhận sản phẩm</p>
                          <ul>
                            <li>✓ Không cần chuẩn bị sẵn tiền trước</li>
                            <li>✓ Kiểm tra hàng trước khi thanh toán</li>
                            <li>✓ Áp dụng: Tất cả khu vực</li>
                            <li>✓ Phí: Miễn phí</li>
                          </ul>
                        </div>
                      </div>

                      <div className="payment-method">
                        <div className="payment-icon">🏦</div>
                        <div className="payment-info">
                          <h4>Chuyển Khoản Ngân Hàng</h4>
                          <p>Chuyển tiền vào tài khoản ngân hàng của GowaFood trước hoặc sau khi nhận hàng</p>
                          <ul>
                            <li>✓ Ngân Hàng: Vietcombank, Techcombank, ACB</li>
                            <li>✓ Xử lý: 1-2 giờ sau khi nhận tiền</li>
                            <li>✓ Phí: Miễn phí (nếu chuyển nội bộ)</li>
                            <li>✓ An toàn: Được xác nhận qua SMS/Email</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="info-box success">
                      <span className="box-icon">✅</span>
                      <p><strong>Tất cả phương thức thanh toán đều bảo mật</strong> và được mã hóa để bảo vệ thông tin cá nhân của bạn</p>
                    </div>
                    <button 
                      className="nav-button"
                      onClick={() => navigate(ROUTE_PATH.CART)}
                    >
                      Đi Đến Giỏ Hàng →
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
