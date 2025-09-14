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
const ProductDetailPage = React.lazy(() => import("../pages/productDetailPage"));
// Product
const CreateProductPage = React.lazy(() =>
  import("../pages/createProductPage")
);

//site
const HomePage = React.lazy(() => import("../pages/homePage"));
const FoodByCategoryPage = React.lazy(() => import("../pages/foodByCategoryPage"));

// Cấu hình route
const AppRoute = [
  // Auth
  { path: ROUTE_PATH.REGISTER, page: RegisterPage, layout: MainLayout },
  { path: ROUTE_PATH.LOGIN, page: LoginPage, layout: MainLayout },
  { path: ROUTE_PATH.VERIFY, page: VerifyPage, layout: MainLayout },
  // Product
  { path: ROUTE_PATH.CREATE_PRODUCT, page: CreateProductPage },
  { path: ROUTE_PATH.PRODUCT_DETAIL, page: ProductDetailPage, layout: MainLayout },
  // User
  { path: ROUTE_PATH.PROFILE, page: ProfilePage, layout: ProfileLayout },
  { path: ROUTE_PATH.ADDRESS_MANAGE, page: AddressManagePage, layout: ProfileLayout },

  // Site
  { path: ROUTE_PATH.HOME, page: HomePage, layout: MainLayout },
  { path: ROUTE_PATH.FOOD_BY_CATEGORY, page: FoodByCategoryPage, layout: MainLayout },
];

export default AppRoute;
