const express = require("express");
const app = express();
const config = require("config");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const { populate } = require("./models/product");



require("../common/passport");
app.use(cookieParser());

app.use(express.urlencoded({extended: true}));

app.use("/static", express.static(config.get("app.static_folder")));

app.set("views", config.get("app.views_folder"));
app.set("view engine", config.get("app.view_engine"));

app.set('trust proxy', 1) // trust first proxy


app.use(session({
  secret: config.get("app.session_key"),
  resave: false,
  saveUninitialized: true,
  httpOnly: true,
  cookie: { secure: config.get("app.session_secure"), },
}))

// app.use(session({
//   secret: config.get("app.session_key") || 'a_very_long_and_random_secret_key_for_your_app_security', // Thay bằng chuỗi bí mật của bạn
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     // Đặt secure: true vì bạn đang sử dụng HTTPS qua ngrok
//     // Nếu bạn muốn linh hoạt hơn, có thể dùng: secure: process.env.NODE_ENV === 'production' || req.protocol === 'https',
//     secure: true, // **Thay đổi thành TRUE nếu bạn dùng ngrok HTTPS**
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000
//   }
// }));
 
app.use(require(`${__dirname}/middlewares/cart`)); // chưa config đường dẫn vào file config
app.use(require(`${__dirname}/middlewares/share`)); // chưa config đường dẫn vào file config



app.use(require(`${__dirname}/../routers/web`)); // chua congif
module.exports = app;