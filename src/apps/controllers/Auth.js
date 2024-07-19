const userModel = require("../models/user");
const transporter = require("../../common/transporter");
const sha1 = require("js-sha1") // cài 2 thư viện mã hóa
const bcrypt = require("bcrypt")
const ejs = require("ejs");
const path = require("path");
const alert = require("alert-node");

const { sign, verify } = require("../../common/jwt");

const login = (req, res) => {
    const savedEmail = req.cookies.savedEmail || ''
    const savedPassword = req.cookies.savedPassword || ''
    res.render("admin/login", {
        data: {},
        cookie: {
            savedEmail,
            savedPassword
        }
    })

}
// const postLogin = async (req, res) => {
//     const { email, password,remember } = req.body;
//     const savedEmail = req.cookies.savedEmail || ''
//   const savedPassword = req.cookies.savedPassword || ''
//     const user = await userModel.findOne({ email, password });
//     if (user) {
//         req.session.email = email;
//         req.session.password = password;
//         res.redirect("/admin/dashboard");
//     }
//     else {
//         const error = "Tài khoản không hợp lệ! ";
//         res.render("admin/login", { 
//             data: { error },
//             cookie: {
//                 savedEmail,
//                 savedPassword
//               }

//         });
//     }
//    // Ghi nhớ tài khoản, mật khẩu
//   if (remember) {
//     res.cookie(savedEmail, email, { maxAge: 3600000 })
//     res.cookie(savedPassword, password, { maxAge: 3600000 })
//   } else {
//     res.clearCookie('savedEmail')
//     res.clearCookie('savedPassword')
//   }
// }

const postLogin = async (req, res) => {
    const { email, password, remember } = req.body;
    const savedEmail = req.cookies.savedEmail || '';
    const savedPassword = req.cookies.savedPassword || '';

    const user = await userModel.findOne({ email });
    //Kiểm tra nếu người dùng chọn "Nhớ mật khẩu"
   
    if (user) {

        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            if (remember) {
                res.cookie('savedEmail', email, { maxAge: 3600000 })
                res.cookie('savedPassword', password, { maxAge: 3600000 })
            } else {
                res.clearCookie('savedEmail')
                res.clearCookie('savedPassword')
            }
            req.session.email = email;
            req.session.password = password;
            res.redirect("/admin/dashboard");
           
        }else{
            const error = "Thông tin đăng nhập không hợp lệ! ";
            res.render("admin/login", {
                data: { error },
                cookie: {
                    savedEmail,
                    savedPassword
                }
            });
        }
    } else {
        const error = "Thông tin đăng nhập không hợp lệ! ";
        res.render("admin/login", {
            data: { error },
            cookie: {
                savedEmail,
                savedPassword
            }


        });
    }

    // if (req.cookies.password) {
    //     // So sánh mật khẩu đã mã hóa với mật khẩu trong cơ sở dữ liệu
    //     bcrypt.compare(user.password, req.cookies.password, function(err, result) {
    //       if (result == true) {
    //        res.redirect("/admin/dashboard");
    //       }
    //     });
    //   }

}


const loginGoogle = async (req, res) => {
    const { google_id, tokenLogin } = req?.params
    const user = await userModel.findOne({ google_id, tokenLogin })
    if (!user) {
        const error = "Tài khoản không chính xác!"
        res.render("admin/login", { data: { error } })
    }
    req.session.email = user.email
    req.session.password = user.password
    return res.redirect('/login_success')
}

const loginFacebook = async (req, res) => {
    const { facebook_id, tokenLogin } = req?.params
    const user = await userModel.findOne({ facebook_id, tokenLogin })
    if (!user) {
        const error = "Tài khoản không chính xác!"
        res.render("admin/login", { data: { error } })
    }
    req.session.email = user.email
    req.session.password = user.password
    return res.redirect('/login_success')
}


const signup = (req, res) => {
    res.render("admin/signup", { data: {} });
}
const postSignup = async (req, res) => {
    const { full_name, email, password, confirmPassword } = req.body;
    const users = await userModel.findOne({ email });
    if (!users) {
        if (password === confirmPassword) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = {
                email,
                password: hashedPassword,
                full_name,
            }
            new userModel(user).save();
            res.redirect("/admin/login");
        }
        else {
            let error = "Mat khau khong dung";
            res.render("admin/signup", { data: { error } });

        }
    } else {
        let error = "Email da ton tai";
        res.render("admin/signup", { data: { error } });
    }
}


const showForgot = (req, res) => {

    res.render("admin/forgot", { data: {} });
}

const forgotPasword = async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    req.session.email = email;
    if (user) {

        const token = sign(email);
        req.session.token = token;
        const viewFolder = req.app.get("views");
        const html = await ejs.renderFile(path.join(viewFolder, "site/mail-reset.ejs"), { user, token });

        const info = await transporter.sendMail({
            from: '"Vietpro Store 👻" vietpro.edu.vn@gmail.com', // sender address
            to: email, // list of receivers
            subject: "Reset Password ✔", // Subject line
            html,
        });
        const done = "Hệ thống đã chấp nhận yêu cầu , vui lòng bấm vào đường link trong email của bạn để thay đổi mật khẩu";
        res.render("admin/forgot", { data: { done } });


    } else {
        const error = "Tài khoản không hợp lệ! ";
        res.render("admin/forgot", { data: { error } });
    }
}


const resetPassword = (req, res) => {
    let { token } = req.query;
    if (token === req.session.token) {
        res.render("admin/reset", {

            data: {},
        });


    } else {
       res.render("admin/reset_fail");
    }




}
const resetNewPassword = async (req, res) => {

    const { password, returnPassword } = req.body;
    const users = await userModel.find();

    if (password === returnPassword) {
        if (password.length >= 6 && /[a-zA-Z]/.test(password )){
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = {
                _id: users.id,
                email: req.session.email,
                password:hashedPassword,
                role: users.role,
                full_name: users.full_name,
            }
            await userModel.updateOne({ email: req.session.email }, { $set: user });
            res.render("admin/reset_success");
        }else {
            const error = "Mật khẩu phải lớn hơn 6 kí tự và có ít nhất 1 chữ cái  ";
            res.render("admin/reset", { data: { error } });
        }
       
    } else {
        const error = "Mật khẩu không giống nhau ";
        res.render("admin/reset", { data: { error } });
    }





}



const logout = async (req, res) => {
    req.session.destroy();
    res.redirect("/admin/login");
}


const loginSuccess = (req, res) => {
    res.render("admin/login_success");
}


module.exports = {
    login,
    logout,
    loginGoogle,
    loginFacebook,
    signup,
    postSignup,
    showForgot,
    forgotPasword,
    resetPassword,
    resetNewPassword,
    postLogin,
    loginSuccess,
};
