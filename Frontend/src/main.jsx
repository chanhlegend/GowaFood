import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { setupPWA } from "./pwa";

setupPWA(); // chỉ gọi setup, KHÔNG export gì cho App import ngược lại

createRoot(document.getElementById("root")).render(
  <>
    <App />
  </>
);
