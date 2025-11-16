// AdminDashboard.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ProductService } from "@/services/productService";
import Chart from "chart.js/auto";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  // current date to set sensible defaults and limit options
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const [activeTab, setActiveTab] = useState("revenue");
  const [productsTime, setProductsTime] = useState("all");
  const [usersYear, setUsersYear] = useState(String(currentYear));
  const [bestsellerMode, setBestsellerMode] = useState("thongke"); 

  const [bestsellerFilter, setBestsellerFilter] = useState({
    month: String(currentMonth),
    year: String(currentYear),
  });

  const [bestsellerCompare1, setBestsellerCompare1] = useState({
    month: String(Math.max(1, currentMonth - 1)),
    year: String(currentYear),
  });

  const [bestsellerCompare2, setBestsellerCompare2] = useState({
    month: String(currentMonth),
    year: String(currentYear),
  });

  const revenueRef = useRef(null);
  const productsRef = useRef(null);
  const usersRef = useRef(null);
  const bestsellersRef = useRef(null);
  const bestsellersCompareRef1 = useRef(null);
  const bestsellersCompareRef2 = useRef(null);
  // refs to hold Chart instances so we can destroy/recreate reliably
  const revenueChartRef = useRef(null);
  const productsChartRef = useRef(null);
  const usersChartRef = useRef(null);
  const bestsellersChartRef = useRef(null);
  const bestsellersCompareChartRef1 = useRef(null);
  const bestsellersCompareChartRef2 = useRef(null);

  // ===== DỮ LIỆU GIỐNG BẢN HTML GỐC =====
  const revenueData = useMemo(() => ({
    labels: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    datasets: [
      {
        label: "Doanh Thu (VNĐ)",
        data: [
          12000000, 15000000, 18000000, 20000000, 25000000, 22000000, 28000000,
          30000000, 32000000, 35000000, 38000000, 40000000,
        ],
        borderColor: "rgba(102, 126, 234, 1)",
        backgroundColor: "rgba(102, 126, 234, 0.2)",
        fill: true,
        tension: 0.1,
      },
    ],
  }), []);

  const productsDataByTime = useMemo(() => ({
    all: {
      labels: ["2022", "2023", "2024"],
      data: [5000, 7000, 9000],
    },
    year: {
      labels: ["2022", "2023", "2024"],
      data: [5000, 7000, 9000],
    },
    month: {
      labels: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ],
      data: [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400],
    },
    quarter: {
      labels: ["Quý 1", "Quý 2", "Quý 3", "Quý 4"],
      data: [1200, 2100, 3000, 3900],
    },
  }), []);

  const usersDataByYear = useMemo(() => ({
    [String(currentYear)]: [1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 3800],
    "2023": [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000],
    "2022": [600, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700],
  }), [currentYear]);


  const monthLabels = useMemo(() => [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ], []);

  const chartCommonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(102, 126, 234, 1)",
        borderWidth: 1,
      },
    },
  }), []);

  // ===== Kiểm tra quyền admin từ localStorage =====
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_gowa"));
    } catch {
      return null;
    }
  }, []);

  const isAdmin = useMemo(() => {
    const roleLike = currentUser?.role ?? currentUser?.roles ?? currentUser?.isAdmin;
    if (typeof roleLike === "string") return roleLike.toLowerCase() === "admin";
    if (typeof roleLike === "boolean") return roleLike === true;
    return false;
  }, [currentUser]);

  // ===== Helpers for Bestseller dynamic data =====
  const computeBestsellerData = useCallback(async (month, year) => {
    const yr = Number(year);
    const mn = Number(month);
    // 1) Lấy tên sản phẩm từ DB
    let products = [];
    try {
      const resp = await ProductService.getAllProducts();
      products = Array.isArray(resp) ? resp : [];
    } catch (err) {
      console.warn(err);
      products = [];
    }

    // Lấy tối đa 8 sản phẩm đầu để hiển thị
    const labels = products.slice(0, 8).map(p => p?.name || "(Không tên)");

    // 2) Sinh số liệu ảo nhưng ổn định theo (year, month, index)
    const seeded = (seed) => {
      let h = 0;
      const s = String(seed);
      for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
      return h;
    };
    const quantities = labels.map((_, idx) => {
      const base = (seeded(`${yr}-${mn}-${idx}`) % 40) + 5; // 5..44
      return base;
    });

    // build a color palette sized to results
    const baseBg = [
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 205, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
      "rgba(199, 199, 199, 0.8)",
      "rgba(83, 102, 255, 0.8)",
    ];
    const baseBorder = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 205, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(199, 199, 199, 1)",
      "rgba(83, 102, 255, 1)",
    ];
    const bg = Array.from({ length: quantities.length }, (_, i) => baseBg[i % baseBg.length]);
    const border = Array.from({ length: quantities.length }, (_, i) => baseBorder[i % baseBorder.length]);

    return {
      labels,
      datasets: [
        {
          label: "Số Lượng Bán Ra",
          data: quantities,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
        },
      ],
    };
  }, []);

  // ===== BIỂU ĐỒ DOANH THU =====
  useEffect(() => {
    if (activeTab !== "revenue") return;
    if (!revenueRef.current) return;
    // destroy existing if any
    if (revenueChartRef.current) {
      try {
        revenueChartRef.current.destroy();
      } catch (err) { console.warn(err); }
      revenueChartRef.current = null;
    }

    const ctx = revenueRef.current.getContext("2d");
    revenueChartRef.current = new Chart(ctx, {
      type: "line",
      data: revenueData,
      options: chartCommonOptions,
    });

    return () => {
      if (revenueChartRef.current) {
        try { revenueChartRef.current.destroy(); } catch (err) { console.warn(err); }
        revenueChartRef.current = null;
      }
    };
  }, [activeTab, revenueData, chartCommonOptions]);

  // ===== BIỂU ĐỒ SỐ SẢN PHẨM =====
  useEffect(() => {
    if (activeTab !== "products") return;
    if (!productsRef.current) return;
    // destroy existing chart
    if (productsChartRef.current) {
      try { productsChartRef.current.destroy(); } catch (err) { console.warn(err); }
      productsChartRef.current = null;
    }

    const ctx = productsRef.current.getContext("2d");
    const data = productsDataByTime[productsTime];

    productsChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Số Sản Phẩm Bán Ra",
            data: data.data,
            backgroundColor: "rgba(54, 162, 235, 0.8)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      },
      options: chartCommonOptions,
    });

    return () => {
      if (productsChartRef.current) {
        try { productsChartRef.current.destroy(); } catch (err) { console.warn(err); }
        productsChartRef.current = null;
      }
    };
  }, [activeTab, productsTime, productsDataByTime, chartCommonOptions]);

  // ===== BIỂU ĐỒ SỐ NGƯỜI DÙNG =====
  useEffect(() => {
    if (activeTab !== "users") return;
    if (!usersRef.current) return;
    if (usersChartRef.current) {
      try { usersChartRef.current.destroy(); } catch (err) { console.warn(err); }
      usersChartRef.current = null;
    }

    const ctx = usersRef.current.getContext("2d");

    usersChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ],
        datasets: [
          {
            label: "Số Người Dùng",
            data: usersDataByYear[usersYear],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: true,
            tension: 0.1,
          },
        ],
      },
      options: chartCommonOptions,
    });

    return () => {
      if (usersChartRef.current) {
        try { usersChartRef.current.destroy(); } catch (err) { console.warn(err); }
        usersChartRef.current = null;
      }
    };
  }, [activeTab, usersYear, usersDataByYear, chartCommonOptions]);

  // ===== BIỂU ĐỒ BÁN CHẠY - CHẾ ĐỘ THỐNG KÊ =====
  useEffect(() => {
    if (activeTab !== "bestsellers") return;
    if (bestsellerMode !== "thongke") return;
    if (!bestsellersRef.current) return;

    let cancelled = false;

    // destroy existing
    if (bestsellersChartRef.current) {
      try { bestsellersChartRef.current.destroy(); } catch (err) { console.warn(err); }
      bestsellersChartRef.current = null;
    }

    (async () => {
      const ctx = bestsellersRef.current?.getContext("2d");
      if (!ctx) return;
      const dataForFilter = await computeBestsellerData(bestsellerFilter.month, bestsellerFilter.year);
      if (cancelled) return;
      bestsellersChartRef.current = new Chart(ctx, {
        type: "pie",
        data: dataForFilter,
        options: {
          ...chartCommonOptions,
          plugins: {
            ...chartCommonOptions.plugins,
            tooltip: {
              ...chartCommonOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed;
                  return `${label}: ${value}`;
                },
              },
            },
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
              },
            },
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      if (bestsellersChartRef.current) {
        try { bestsellersChartRef.current.destroy(); } catch (err) { console.warn(err); }
        bestsellersChartRef.current = null;
      }
    };
  }, [activeTab, bestsellerMode, bestsellerFilter, chartCommonOptions, computeBestsellerData]);

  // ===== BIỂU ĐỒ BÁN CHẠY - CHẾ ĐỘ SO SÁNH (2 BIỂU ĐỒ) =====
  useEffect(() => {
    if (activeTab !== "bestsellers") return;
    if (bestsellerMode !== "sosanh") return;
    if (!bestsellersCompareRef1.current || !bestsellersCompareRef2.current) return;

    let cancelled = false;

    // destroy if exists
    if (bestsellersCompareChartRef1.current) {
      try { bestsellersCompareChartRef1.current.destroy(); } catch (err) { console.warn(err); }
      bestsellersCompareChartRef1.current = null;
    }
    if (bestsellersCompareChartRef2.current) {
      try { bestsellersCompareChartRef2.current.destroy(); } catch (err) { console.warn(err); }
      bestsellersCompareChartRef2.current = null;
    }

    const ctx1 = bestsellersCompareRef1.current.getContext("2d");
    const ctx2 = bestsellersCompareRef2.current.getContext("2d");

    const safeLabel = (mVal, yVal) => {
      const yr = Number(yVal);
      const m = Number(mVal);
      const safeMonth = yr === currentYear && m > currentMonth ? currentMonth : m;
      const safeMonthLabel = monthLabels.find((mm) => mm.value === String(safeMonth))?.label || "";
      return ` (${safeMonthLabel} / ${yr})`;
    };

    const label1 = safeLabel(bestsellerCompare1.month, bestsellerCompare1.year);
    const label2 = safeLabel(bestsellerCompare2.month, bestsellerCompare2.year);

    const withLabel = (data, suffix) => ({
      ...data,
      datasets: data.datasets.map(ds => ({ ...ds, label: (ds.label || "") + suffix }))
    });

    (async () => {
      const [data1, data2] = await Promise.all([
        computeBestsellerData(bestsellerCompare1.month, bestsellerCompare1.year),
        computeBestsellerData(bestsellerCompare2.month, bestsellerCompare2.year),
      ]);
      if (cancelled) return;

      bestsellersCompareChartRef1.current = new Chart(ctx1, {
        type: "pie",
        data: withLabel(data1, label1),
        options: {
          ...chartCommonOptions,
          plugins: {
            ...chartCommonOptions.plugins,
            tooltip: {
              ...chartCommonOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed;
                  return `${label}: ${value}`;
                },
              },
            },
            legend: {
              position: "bottom",
              labels: { padding: 20, usePointStyle: true },
            },
          },
        },
      });

      bestsellersCompareChartRef2.current = new Chart(ctx2, {
        type: "pie",
        data: withLabel(data2, label2),
        options: {
          ...chartCommonOptions,
          plugins: {
            ...chartCommonOptions.plugins,
            tooltip: {
              ...chartCommonOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed;
                  return `${label}: ${value}`;
                },
              },
            },
            legend: {
              position: "bottom",
              labels: { padding: 20, usePointStyle: true },
            },
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      if (bestsellersCompareChartRef1.current) {
        try { bestsellersCompareChartRef1.current.destroy(); } catch (err) { console.warn(err); }
        bestsellersCompareChartRef1.current = null;
      }
      if (bestsellersCompareChartRef2.current) {
        try { bestsellersCompareChartRef2.current.destroy(); } catch (err) { console.warn(err); }
        bestsellersCompareChartRef2.current = null;
      }
    };
  }, [activeTab, bestsellerMode, bestsellerCompare1, bestsellerCompare2, chartCommonOptions, monthLabels, currentYear, currentMonth, computeBestsellerData]);

  // ===== JSX =====
  return (
    <div>
      {!isAdmin ? (
        <div className="container py-5 text-center">
          <div className="alert alert-danger" role="alert">
            Bạn không có quyền truy cập vào trang này.
          </div>
          <a href="/" className="btn btn-primary mt-2">
            Về trang chủ
          </a>
        </div>
      ) : (
        <>
      <div className="header">
        <h1>
          <i className="fas fa-chart-line"></i> Admin Dashboard - Phân Tích
        </h1>
      </div>

      <div className="container">
        {/* Stats Cards Row */}
        <div className="stats-cards-row">
          <div className="stat-card" onClick={() => setActiveTab("revenue")}>
            <div className="stat-icon revenue-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-info">
              <h4>Doanh Thu</h4>
              <p className="stat-value">40,000,000 VNĐ</p>
              <span className="stat-label">Tháng hiện tại</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("products")}>
            <div className="stat-icon products-icon">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-info">
              <h4>Sản Phẩm Bán Ra</h4>
              <p className="stat-value">1,400</p>
              <span className="stat-label">Tháng hiện tại</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("users")}>
            <div className="stat-icon users-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h4>Số Người Dùng</h4>
              <p className="stat-value">3,800</p>
              <span className="stat-label">Tổng người dùng</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("bestsellers")}>
            <div className="stat-icon bestsellers-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            <div className="stat-info">
              <h4>Sản Phẩm Bán Chạy</h4>
              <p className="stat-value">Top 7</p>
              <span className="stat-label">Sản phẩm nổi bật</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "revenue" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("revenue")}
            >
              <i className="fas fa-dollar-sign"></i> Doanh Thu
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "products" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("products")}
            >
              <i className="fas fa-box"></i> Số Sản Phẩm Bán Ra
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("users")}
            >
              <i className="fas fa-users"></i> Số Người Dùng
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "bestsellers" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("bestsellers")}
            >
              <i className="fas fa-chart-pie"></i> Sản Phẩm Bán Chạy
            </button>
          </li>
        </ul>

        {/* Nội dung tab */}
        <div className="tab-content">
          {/* Doanh Thu */}
          {activeTab === "revenue" && (
            <div className="tab-pane fade show active fade-in">
              <h3 className="mt-3">
                <i className="fas fa-chart-line"></i> Doanh Thu Theo Tháng
              </h3>
              <div className="chart-container">
                <canvas ref={revenueRef} />
              </div>
            </div>
          )}

          {/* Số Sản Phẩm */}
          {activeTab === "products" && (
            <div className="tab-pane fade show active fade-in">
              <h3 className="mt-3">
                <i className="fas fa-chart-bar"></i> Số Sản Phẩm Bán Ra
              </h3>
              <div className="mb-3">
                <label htmlFor="timeSelect" className="form-label">
                  <i className="fas fa-calendar-alt"></i> Chọn Khoảng Thời Gian:
                </label>
                <div className="select-with-icon">
                  <i className="fas fa-clock select-icon" aria-hidden="true"></i>
                  <select
                    id="timeSelect"
                    className="form-select"
                    value={productsTime}
                    onChange={(e) => setProductsTime(e.target.value)}
                  >
                    <option value="all">Toàn Bộ</option>
                    <option value="year">Theo Năm</option>
                    <option value="month">Theo Tháng</option>
                    <option value="quarter">Theo Quý</option>
                  </select>
                </div>
              </div>
              <div className="chart-container">
                <canvas ref={productsRef} />
              </div>
            </div>
          )}

          {/* Số Người Dùng */}
          {activeTab === "users" && (
            <div className="tab-pane fade show active fade-in">
              <h3 className="mt-3">
                <i className="fas fa-chart-area"></i> Số Người Dùng Theo Tháng
              </h3>
              <div className="mb-3">
                <label htmlFor="yearSelect" className="form-label">
                  <i className="fas fa-calendar-alt"></i> Chọn Năm:
                </label>
                <div className="select-with-icon">
                  <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
                  <select
                    id="yearSelect"
                    className="form-select"
                    value={usersYear}
                    onChange={(e) => setUsersYear(e.target.value)}
                  >
                    {/** generate years from 2022 to currentYear */}
                    {Array.from({ length: currentYear - 2021 }, (_, i) => String(2022 + i)).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="chart-container">
                <canvas ref={usersRef} />
              </div>
            </div>
          )}

          {/* Sản Phẩm Bán Chạy */}
          {activeTab === "bestsellers" && (
            <div className="tab-pane fade show active fade-in">
              <h3 className="mt-3">
                <i className="fas fa-chart-pie"></i> Sản Phẩm Bán Chạy
              </h3>

              {/* Chọn chế độ Thống kê / So sánh */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      bestsellerMode === "thongke" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setBestsellerMode("thongke")}
                  >
                    Thống kê
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      bestsellerMode === "sosanh" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setBestsellerMode("sosanh")}
                  >
                    So sánh
                  </button>
                </div>

                {bestsellerMode === "thongke" && (
                  <div className="d-flex gap-2">
                    <div>
                      <label className="form-label mb-1">Tháng</label>
                      <div className="select-with-icon">
                        <i className="fas fa-calendar-alt select-icon" aria-hidden="true"></i>
                        <select
                          className="form-select"
                          value={bestsellerFilter.month}
                          onChange={(e) =>
                            setBestsellerFilter((prev) => ({
                              ...prev,
                              month: e.target.value,
                            }))
                          }
                        >
                          {monthLabels
                            .filter((m) => Number(m.value) <= (Number(bestsellerFilter.year) === currentYear ? currentMonth : 12))
                            .map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label mb-1">Năm</label>
                      <div className="select-with-icon">
                        <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
                        <select
                          className="form-select"
                          value={bestsellerFilter.year}
                          onChange={(e) =>
                            setBestsellerFilter((prev) => ({
                              ...prev,
                              year: e.target.value,
                            }))
                          }
                        >
                          {Array.from({ length: currentYear - 2021 }, (_, i) => String(2022 + i)).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nội dung Thống kê */}
              {bestsellerMode === "thongke" && (
                <div className="chart-container">
                  {/* Bạn có thể hiển thị info filter ở đây nếu muốn */}
                  <p className="mb-2">
                    Thống kê cho{" "}
                    <strong>
                      {
                        monthLabels.find((m) => m.value === bestsellerFilter.month)
                          ?.label
                      }
                      {" / "}
                      {bestsellerFilter.year}
                    </strong>
                  </p>
                  <canvas ref={bestsellersRef} />
                </div>
              )}

              {/* Nội dung So sánh */}
              {bestsellerMode === "sosanh" && (
                <div className="row compare-row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6>Khoảng thời gian 1</h6>
                      <div className="d-flex gap-2">
                        <div>
                          <label className="form-label mb-1">Tháng</label>
                          <div className="select-with-icon">
                            <i className="fas fa-calendar-alt select-icon" aria-hidden="true"></i>
                            <select
                              className="form-select"
                              value={bestsellerCompare1.month}
                              onChange={(e) =>
                                setBestsellerCompare1((prev) => ({
                                  ...prev,
                                  month: e.target.value,
                                }))
                              }
                            >
                              {monthLabels
                                .filter((m) => Number(m.value) <= (Number(bestsellerCompare1.year) === currentYear ? currentMonth : 12))
                                .map((m) => (
                                  <option key={m.value} value={m.value}>
                                    {m.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="form-label mb-1">Năm</label>
                          <div className="select-with-icon">
                            <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
                            <select
                              className="form-select"
                              value={bestsellerCompare1.year}
                              onChange={(e) =>
                                setBestsellerCompare1((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                            >
                              {Array.from({ length: currentYear - 2021 }, (_, i) => String(2022 + i)).map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="chart-container">
                      <canvas ref={bestsellersCompareRef1} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6>Khoảng thời gian 2</h6>
                      <div className="d-flex gap-2">
                        <div>
                          <label className="form-label mb-1">Tháng</label>
                          <div className="select-with-icon">
                            <i className="fas fa-calendar-alt select-icon" aria-hidden="true"></i>
                            <select
                              className="form-select"
                              value={bestsellerCompare2.month}
                              onChange={(e) =>
                                setBestsellerCompare2((prev) => ({
                                  ...prev,
                                  month: e.target.value,
                                }))
                              }
                            >
                              {monthLabels
                                .filter((m) => Number(m.value) <= (Number(bestsellerCompare2.year) === currentYear ? currentMonth : 12))
                                .map((m) => (
                                  <option key={m.value} value={m.value}>
                                    {m.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="form-label mb-1">Năm</label>
                          <div className="select-with-icon">
                            <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
                            <select
                              className="form-select"
                              value={bestsellerCompare2.year}
                              onChange={(e) =>
                                setBestsellerCompare2((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                            >
                              {Array.from({ length: currentYear - 2021 }, (_, i) => String(2022 + i)).map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="chart-container">
                      <canvas ref={bestsellersCompareRef2} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
