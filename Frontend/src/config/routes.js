import React from "react";
import { ROUTE_PATH } from "../constants/routePath";
import MainLayout from "../layouts/MainLayout";
import ProfileLayout from "../layouts/ProfileLayout";
// Auth
const RegisterPage = React.lazy(() => import("../pages/registerPage"));
const LoginPage = React.lazy(() => import("../pages/loginPage"));
const VerifyPage = React.lazy(() => import("../pages/verifyOTPPage"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"));
const AddressManagePage = React.lazy(() => import("../pages/addressManagePage"));

// Product
const CreateProductPage = React.lazy(() =>
  import("../pages/createProductPage")
);

// Cấu hình route
const AppRoute = [
  // Auth
  { path: ROUTE_PATH.REGISTER, page: RegisterPage, layout: MainLayout },
  { path: ROUTE_PATH.LOGIN, page: LoginPage, layout: MainLayout },
  { path: ROUTE_PATH.VERIFY, page: VerifyPage, layout: MainLayout },
  // Product
  { path: ROUTE_PATH.CREATE_PRODUCT, page: CreateProductPage },
  // User
  { path: ROUTE_PATH.PROFILE, page: ProfilePage, layout: ProfileLayout },
  { path: ROUTE_PATH.ADDRESS_MANAGE, page: AddressManagePage, layout: ProfileLayout },
];

export default AppRoute;
