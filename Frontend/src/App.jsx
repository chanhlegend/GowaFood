import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import AppRoute from "./config/routes";
import React from "react";
import { Toaster } from "./lib/toaster";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {AppRoute.map((route, index) => {
            const Layout = route.layout || React.Fragment;
            const Page = route.page;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;