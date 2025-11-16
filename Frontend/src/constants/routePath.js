export const ROUTE_PATH = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',

  // Public
  HOME: '/',
  FOOD_BY_CATEGORY: '/food-by-category/:categoryId',
  ABOUT_US: '/aboutus',

  // Product
  CREATE_PRODUCT: '/create-product',
  PRODUCT_DETAIL: '/product/:id',
  // User
  PROFILE: '/profile',
  ADDRESS_MANAGE: '/address-manage',
 
  // Cart & Checkout
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_SUCCESS: "/order-success",

  // RecipeAI
  CHAT_RECIPE_AI: '/chat-recipe-ai',
  HEALTHY_CHAT_AI: '/healthy-chat-ai',

  // Payment
  PAYMENT: '/payment',
  PROCESS_PAYMENT: '/process-payment',
  THANK_YOU: '/thank-you',

  // ==== ORDER MANAGEMENT ====
  ORDERS: "/orders",             
  ORDER_DETAIL: "/orders/:id",    
  ORDER_NEW: "/orders/new", 

  //Admin Dashboard
  ADMIN_DASHBOARD: '/admin-dashboard',
};