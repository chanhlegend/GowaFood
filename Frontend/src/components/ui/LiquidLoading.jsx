import React from "react";
import "./liquidLoading.css";

const LiquidLoading = () => (
  <div className="liquid-btn-loader">
    <svg viewBox="0 0 60 60" width="32" height="32">
      <defs>
        <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fd1c5" />
          <stop offset="100%" stopColor="#3182ce" />
        </linearGradient>
      </defs>
      <g>
        <ellipse className="liquid" cx="30" cy="30" rx="22" ry="22" fill="url(#liquid-gradient)" />
        <ellipse className="liquid-wave" cx="30" cy="36" rx="22" ry="18" fill="#fff" fillOpacity="0.3" />
      </g>
    </svg>
  </div>
);

export default LiquidLoading;
