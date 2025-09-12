import React from "react";
import { ROUTE_PATH } from "../constants/routePath";
import MainLayout from "../layouts/MainLayout";
// Auth
const RegisterPage = React.lazy(() => import("../pages/registerPage"));
const LoginPage = React.lazy(() => import("../pages/loginPage"));
const VerifyPage = React.lazy(() => import("../pages/verifyOTPPage"));

// Cấu hình route
const AppRoute = [
  // Auth
  { path: ROUTE_PATH.REGISTER, page: RegisterPage},
  { path: ROUTE_PATH.LOGIN, page: LoginPage , layout: MainLayout},
  { path: ROUTE_PATH.VERIFY, page: VerifyPage, layout: MainLayout},
]

export default AppRoute;
