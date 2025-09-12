

import React, { useState, useEffect } from "react";
import { ProductService } from "../services/productService";
import { CategoryService } from "../services/categoryService";
import { uploadImageToCloudinary } from "../lib/cloudinary";

const formStyle = {
    maxWidth: 500,
    margin: "40px auto",
    padding: 32,
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 2px 12px 0 #0001"
};
const labelStyle = {
    fontWeight: 500,
    marginBottom: 6,
    display: "block"
};
const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 15,
    marginBottom: 2,
    background: "#fafbfc"
};
const textareaStyle = {
    ...inputStyle,
    minHeight: 60,
    resize: "vertical"
};
const buttonStyle = {
    width: "100%",
    padding: 12,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 8,
    transition: "background 0.2s"
};
const errorStyle = { color: "#d32f2f", marginBottom: 8, fontWeight: 500 };
const successStyle = { color: "#388e3c", marginBottom: 8, fontWeight: 500 };
const previewImgStyle = { width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #ccc" };

const initialState = {
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    stock: "",
    qrSource: "",
};


const CreateProductPage = () => {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                setCategories(data);
            } catch (err) {
                setError("Không thể tải danh mục");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "images" && files) {
            setForm((prev) => ({ ...prev, images: Array.from(files) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            let imageUrls = [];
            if (form.images && form.images.length > 0) {
                for (const file of form.images) {
                    const url = await uploadImageToCloudinary(file);
                    imageUrls.push(url);
                }
            }
            const productData = {
                ...form,
                images: imageUrls.map(url => ({ url })),
                price: Number(form.price),
                stock: Number(form.stock),
            };
            await ProductService.createProduct(productData);
            setSuccess("Tạo sản phẩm thành công!");
            setForm(initialState);
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={formStyle}>
            <h2 style={{ textAlign: "center", marginBottom: 24, color: "#1976d2" }}>Tạo sản phẩm mới</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Tên sản phẩm</label>
                    <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="Nhập tên sản phẩm" />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Mô tả</label>
                    <textarea name="description" value={form.description} onChange={handleChange} required style={textareaStyle} placeholder="Mô tả sản phẩm" />
                </div>
                <div style={{ marginBottom: 18, display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Giá</label>
                        <input name="price" type="number" value={form.price} onChange={handleChange} required style={inputStyle} placeholder="Giá" min={0} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Số lượng tồn kho</label>
                        <input name="stock" type="number" value={form.stock} onChange={handleChange} required style={inputStyle} placeholder="Tồn kho" min={0} />
                    </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Danh mục</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="" disabled>Chọn danh mục</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Ảnh sản phẩm (có thể chọn nhiều)</label>
                    <input name="images" type="file" accept="image/*" multiple onChange={handleChange} style={inputStyle} />
                    {form.images && form.images.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {form.images.map((file, idx) => (
                                <img
                                    key={idx}
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    style={previewImgStyle}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>QR Source (ID)</label>
                    <input name="qrSource" value={form.qrSource} onChange={handleChange} style={inputStyle} placeholder="ID QR Source" />
                </div>
                {error && <div style={errorStyle}>{error}</div>}
                {success && <div style={successStyle}>{success}</div>}
                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? "Đang tạo..." : "Tạo sản phẩm"}
                </button>
            </form>
        </div>
    );
};

export default CreateProductPage;
