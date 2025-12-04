// AdminDashboard.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ProductService } from "@/services/productService";
import dashboardService from "@/services/dashboardService";
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
  const [ordersPage, setOrdersPage] = useState(1);
  const [allOrders, setAllOrders] = useState([]);
  const ordersPerPage = 10; 

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

  // ===== STATE UNTUK DATA DARI API =====
  const [revenueMonthlyData, setRevenueMonthlyData] = useState(Array(12).fill(0));
  const [productsMonthlyData, setProductsMonthlyData] = useState(Array(12).fill(0));
  const [productsYearlyData, setProductsYearlyData] = useState([]);
  const [productsYearlyLabels, setProductsYearlyLabels] = useState([]);
  const [productsQuarterlyData, setProductsQuarterlyData] = useState([0, 0, 0, 0]);
  const [usersMonthlyData, setUsersMonthlyData] = useState(Array(12).fill(0));
  const [statsData, setStatsData] = useState({
    monthRevenue: 0,
    monthProducts: 0,
    totalUsers: 0,
  });

  // ===== FETCH DATA TỪ API =====
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Lấy doanh thu theo tháng
      const revenueRes = await dashboardService.getRevenueByMonth(currentYear);
      if (revenueRes.success) {
        setRevenueMonthlyData(revenueRes.data);
      }

      // Lấy số sản phẩm bán ra theo tháng
      const productsRes = await dashboardService.getProductsSoldByMonth(currentYear);
      if (productsRes.success) {
        setProductsMonthlyData(productsRes.data);
      }

      // Lấy số sản phẩm bán ra theo năm
      const productsYearRes = await dashboardService.getProductsSoldByYear();
      if (productsYearRes.success) {
        setProductsYearlyData(productsYearRes.data);
        setProductsYearlyLabels(productsYearRes.years);
      }

      // Lấy số sản phẩm bán ra theo quý
      const productsQuarterRes = await dashboardService.getProductsSoldByQuarter(currentYear);
      if (productsQuarterRes.success) {
        setProductsQuarterlyData(productsQuarterRes.data);
      }

      // Lấy số người dùng cộng dồn theo tháng
      const usersRes = await dashboardService.getUsersCumulativeByMonth(currentYear);
      if (usersRes.success) {
        setUsersMonthlyData(usersRes.data);
      }

      // Lấy stats cho tháng hiện tại
      const [monthRevRes, monthProdsRes, totalUsersRes] = await Promise.all([
        dashboardService.getCurrentMonthRevenue(),
        dashboardService.getCurrentMonthProductsSold(),
        dashboardService.getTotalUsers(),
      ]);

      setStatsData({
        monthRevenue: monthRevRes.success ? monthRevRes.revenue : 0,
        monthProducts: monthProdsRes.success ? monthProdsRes.quantity : 0,
        totalUsers: totalUsersRes.success ? totalUsersRes.count : 0,
      });

      // Lấy tất cả đơn hàng
      const ordersRes = await dashboardService.getAllOrders();
      if (ordersRes.success) {
        setAllOrders(ordersRes.data);
      }
    };

    fetchDashboardData();
  }, [currentYear]);

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
        data: revenueMonthlyData,
        borderColor: "rgba(102, 126, 234, 1)",
        backgroundColor: "rgba(102, 126, 234, 0.2)",
        fill: true,
        tension: 0.1,
      },
    ],
  }), [revenueMonthlyData]);

  const productsDataByTime = useMemo(() => ({
    all: {
      labels: productsYearlyLabels.length > 0 ? productsYearlyLabels : ["2022", "2023", "2024"],
      data: productsYearlyData.length > 0 ? productsYearlyData : [0, 0, 0],
    },
    year: {
      labels: productsYearlyLabels.length > 0 ? productsYearlyLabels : ["2022", "2023", "2024"],
      data: productsYearlyData.length > 0 ? productsYearlyData : [0, 0, 0],
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
      data: productsMonthlyData,
    },
    quarter: {
      labels: ["Quý 1", "Quý 2", "Quý 3", "Quý 4"],
      data: productsQuarterlyData,
    },
  }), [productsMonthlyData, productsYearlyData, productsYearlyLabels, productsQuarterlyData]);

  const usersDataByYear = useMemo(() => ({
    [String(currentYear)]: usersMonthlyData,
    "2023": [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000],
    "2022": [600, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700],
  }), [currentYear, usersMonthlyData]);


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

    // 1) Lấy dữ liệu bán chạy từ API
    const bestsellerRes = await dashboardService.getBestsellersByMonthYear(mn, yr);
    
    if (bestsellerRes.success && bestsellerRes.data.length > 0) {
      const data = bestsellerRes.data;
      const labels = data.map(item => item.name || "(Không tên)");
      const quantities = data.map(item => item.totalQuantity || 0);

      // Tạo màu sắc cho mỗi sản phẩm
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
    }

    // Nếu không có dữ liệu, trả về dữ liệu trống
    return {
      labels: ["Không có dữ liệu"],
      datasets: [
        {
          label: "Số Lượng Bán Ra",
          data: [0],
          backgroundColor: ["rgba(200, 200, 200, 0.8)"],
          borderColor: ["rgba(150, 150, 150, 1)"],
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
              <p className="stat-value">
                {new Intl.NumberFormat("vi-VN", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(statsData.monthRevenue)}{" "}
                VNĐ
              </p>
              <span className="stat-label">Tháng hiện tại</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("products")}>
            <div className="stat-icon products-icon">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-info">
              <h4>Sản Phẩm Bán Ra</h4>
              <p className="stat-value">{statsData.monthProducts}</p>
              <span className="stat-label">Tháng hiện tại</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("users")}>
            <div className="stat-icon users-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h4>Số Người Dùng</h4>
              <p className="stat-value">{statsData.totalUsers}</p>
              <span className="stat-label">Tổng người dùng</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("bestsellers")}>
            <div className="stat-icon bestsellers-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            <div className="stat-info">
              <h4>Sản Phẩm Bán Chạy</h4>
              <p className="stat-value">Top 8</p>
              <span className="stat-label">Sản phẩm nổi bật</span>
            </div>
          </div>

          <div className="stat-card" onClick={() => setActiveTab("orders")}>
            <div className="stat-icon bestsellers-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <div className="stat-info">
              <h4>Đơn Hàng</h4>
              <p className="stat-value">{allOrders.length}</p>
              <span className="stat-label">Tất cả đơn hàng</span>
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
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("orders")}
            >
              <i className="fas fa-receipt"></i> Danh Sách Đơn Hàng
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

          {/* Danh Sách Đơn Hàng */}
          {activeTab === "orders" && (
            <div className="tab-pane fade show active fade-in">
              <h3 className="mt-3">
                <i className="fas fa-receipt"></i> Danh Sách Tất Cả Đơn Hàng
              </h3>
              <div className="table-responsive mt-4">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Mã Đơn</th>
                      <th>Khách Hàng</th>
                      <th>Số Điện Thoại</th>
                      <th>Số Lượng</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                      <th>Ngày Đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <em>Chưa có đơn hàng nào</em>
                        </td>
                      </tr>
                    ) : (
                      allOrders
                        .slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage)
                        .map((order, idx) => {
                          const totalItems = order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
                          const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");
                          const statusColors = {
                            PENDING: "warning",
                            SHIPPING: "info",
                            DELIVERED: "success",
                            CANCELLED: "danger",
                          };
                          const statusLabel = {
                            PENDING: "Chờ xử lý",
                            SHIPPING: "Đang giao",
                            DELIVERED: "Đã giao",
                            CANCELLED: "Đã hủy",
                          };

                          return (
                            <tr key={order._id}>
                              <td>{(ordersPage - 1) * ordersPerPage + idx + 1}</td>
                              <td>
                                <strong>{order._id.substring(0, 8).toUpperCase()}</strong>
                              </td>
                              <td>{order.user?.name || "Khách hàng"}</td>
                              <td>{order.shipping?.address?.phone || "-"}</td>
                              <td>{totalItems}</td>
                              <td>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.amounts?.total || 0)}</td>
                              <td>
                                <span className={`badge bg-${statusColors[order.status] || "secondary"}`}>
                                  {statusLabel[order.status] || order.status}
                                </span>
                              </td>
                              <td>{orderDate}</td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân Trang */}
              {allOrders.length > 0 && (
                <nav aria-label="Page navigation" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${ordersPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setOrdersPage(Math.max(1, ordersPage - 1))}
                        disabled={ordersPage === 1}
                      >
                        Trước
                      </button>
                    </li>

                    {Array.from(
                      { length: Math.ceil(allOrders.length / ordersPerPage) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <li key={page} className={`page-item ${ordersPage === page ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setOrdersPage(page)}
                          style={{
                            backgroundColor: ordersPage === page ? "rgba(102, 126, 234, 1)" : "transparent",
                            color: ordersPage === page ? "white" : "rgba(102, 126, 234, 1)",
                          }}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        ordersPage === Math.ceil(allOrders.length / ordersPerPage)
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setOrdersPage(
                            Math.min(
                              Math.ceil(allOrders.length / ordersPerPage),
                              ordersPage + 1
                            )
                          )
                        }
                        disabled={
                          ordersPage ===
                          Math.ceil(allOrders.length / ordersPerPage)
                        }
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
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
