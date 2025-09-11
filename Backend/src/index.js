const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const app = express();
const route = require('./routes');
const db = require('./config/db');
const cors = require('cors');


// Load biến môi trường
dotenv.config();

// Kết nối DB
db.connect();


// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('combined'));

// session
const sessionMiddleware = require('./config/session/session');
app.use(sessionMiddleware);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

//mailer
const mailer = require('./config/mailer/mailer');
app.set('transporter', mailer);

// Passport
// const passport = require('./config/passport/passport-config');
// app.use(passport.initialize());
// app.use(passport.session());

// Khởi tạo routes
route(app);

// Port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ứng dụng đang chạy trên cổng ${PORT}`);
});

// Cấu hình CORS
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));
