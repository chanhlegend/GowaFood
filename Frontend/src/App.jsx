import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import AppRoute from "./config/routes";
import { Toaster } from "./lib/toaster";
import { installPWA } from "./pwa"; // import từ pwa.js, KHÔNG import từ main.jsx

const NotFound = () => <div className="p-6 text-center">404 - Không tìm thấy trang</div>;

export default function App() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const onAvail = () => setCanInstall(true);
    window.addEventListener("pwa-install-available", onAvail);
    return () => window.removeEventListener("pwa-install-available", onAvail);
  }, []);

  const onInstall = async () => {
    const res = await installPWA();
    if (res?.outcome === "accepted") setCanInstall(false);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {AppRoute.map((route, i) => {
            const Layout = route.layout || React.Fragment;
            const Page = route.page;
            return (
              <Route
                key={i}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {canInstall && (
        <button
          onClick={onInstall}
          className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition"
        >
          Cài đặt GOWA
        </button>
      )}
    </>
  );
}
