const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const route = require('./routes');
const db = require('./config/db');

// Load biến môi trường
dotenv.config();

// Kết nối DB
db.connect();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://192.168.1.44:5173',
  'http://192.168.1.44:5174',
  'http://192.168.1.44:3000',
  'https://gowa-food-app.vercel.app',
  'https://gowafood.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Cho phép gửi cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('combined'));

// Session
const session = require('express-session');
const sessionConfig = require('./config/session/session-config');
app.use(session(sessionConfig));

// mailer
const mailer = require('./config/mailer/mailer');
app.set('transporter', mailer);

// Passport
const passport = require('./config/passport/passport-config');
app.use(passport.initialize());
app.use(passport.session());

// Khởi tạo routes
route(app);

// Port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ứng dụng đang chạy trên cổng ${PORT}`);
});
