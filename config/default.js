const passport = require("passport");
require("dotenv").config();

module.exports = {
    app:{
        port: 3000,
        static_folder: `${__dirname}/../src/public/`,
        views_folder: `${__dirname}/../src/apps/views`,
        view_engine: `ejs`,
        session_key:  "vietpro",
        session_secure: false,
        tmp: `${__dirname}/../src/tmp/`,
        baseUrlUpload: `${__dirname}/../src/public/uploads/images`,
    },
    mail:{
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        user: "quantri.vietproshop@gmail.com",
        pass: "tjpj rclg ithn rkby",
    },
    passport:{
       google_client_id: process.env.GOOGLE_CLIENT_ID||"SDADASDA",
       google_client_secret: process.env.GOOGLE_CLIENT_SECRET||"ADSADASDASDAS",
       facebook_client_secret: process.env.FACEBOOK_CLIENT_SECRET||12321321,
       facebook_client_id:  process.env.FACEBOOK_CLIENT_ID||"JASBDAWBD",
    },
};
