import React from "react";
import { ROUTE_PATH } from "../constants/routePath";

// Auth
const RegisterPage = React.lazy(() => import("../pages/registerPage"));
const LoginPage = React.lazy(() => import("../pages/loginPage"));
const VerifyPage = React.lazy(() => import("../pages/verifyOTPPage"));

// Product
const CreateProductPage = React.lazy(() => import("../pages/createProductPage"));

// Cấu hình route
const AppRoute = [
  // Auth
  { path: ROUTE_PATH.REGISTER, page: RegisterPage},
  { path: ROUTE_PATH.LOGIN, page: LoginPage},
  { path: ROUTE_PATH.VERIFY, page: VerifyPage},
  // Product
  { path: ROUTE_PATH.CREATE_PRODUCT, page: CreateProductPage},
]

export default AppRoute;
