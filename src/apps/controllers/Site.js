const moment = require("moment");
const categoryModel = require("../models/category");
const commentModel = require("../models/comment");
const productModel = require("../models/product");
const bannerModel=require("../models/banner");
const orderModel=require("../models/order");    
const pagination=require("../../common/pagination");
const path = require("path");
const ejs = require("ejs")
const bcrypt = require("bcrypt")
const { response } = require("express");
const grecaptcha = require('grecaptcha');
const axios=require("axios");
const alert=require("alert-node");





// const formetter = require("../../lib/index");
const transporter = require("../../common/transporter");
const { log } = require("console");
const userModel = require("../models/user");
const customerModel = require("../models/customer");
const vndPrice=require("../../lib/VnPrice");
const home = async (req, res) => {
    const limit = 6
    const featured = await productModel
        .find({
            featured: 1
        })
        .sort({ _id: -1 })
        .limit(limit)
        ;
    const lastest = await productModel
        .find()
        .limit(limit)
        .sort({ _id: -1 });
     const banners=await bannerModel.find();
    res.render("site/index", {
        featured,
        lastest,
        banners,
        
        
    });
}
const signIn=(req,res)=>{
    res.render("site/customers/signIn",{data:{}});

}
const postSignIn=async(req,res)=>{
    const {email,password}=req.body;
    const customer= await customerModel.findOne({email});
    if(customer){
       
        const validPassword = await bcrypt.compare(password, customer.password);
        if (validPassword) {
            req.session.email = email;
            req.session.password = password;
            res.redirect("/");
           

    }else{
        const error="Tai khoan hoac mat khau khong dung"
        res.render("site/customers/signIn",{data:{error}});
    }

}
}
const signUp=(req,res)=>{
    res.render("site/customers/signUp",{data:{}});
    

}
const postSignUp=async(req,res)=>{

    const {full_name,email,phone,address,password,confirmPassword}=req.body;
    const customers = await customerModel.findOne({ email });
    if(!customers){
        if(password===confirmPassword){
            const hashedPassword = await bcrypt.hash(password, 10)
            const customer={
                email,
                password:hashedPassword,
                full_name,
                phone,
                address,
            }
            new customerModel(customer).save();
            res.redirect("/signin");
        }
        else{
            let error="Mat khau khong dung";
            res.render("site/customers/signUp",{data:{error}});
            
        }
    }else{
        let error="Email da ton tai";
        res.render("site/customers/signUp",{data:{error}});
    }


    

}
const signOut=(req,res)=>{
    req.session.destroy();
    res.redirect("/");
}

const category = async (req, res) => {
    const { id } = req.params;
    const { title } = await categoryModel.findById(id);
    const products = await productModel.find({
        cat_id: id,
    });
    const total = products.length;
    res.render("site/category", {
        products,
        title,
        total
    });
 
}
const product = async (req, res) => {
    const { id } = req.params;
    const product = await productModel.findById(id);
    const comments = await commentModel.find({ prd_id: id })
        .sort({ _id: -1 });
    res.render("site/product", {
        product,
        comments,
        moment,
    });

}

const comment = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, body } = req.body;

  

    const captchaToken = req.body['g-recaptcha-response'];
    if (!captchaToken) {
        alert("Vui lòng xác nhận không phải người máy");
    }

    else {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: '6LesTsopAAAAAOzNv4C-YGx0LIOxDDcAgao-ZJ13',
                response: captchaToken,
            }
        });
        console.log(response);

        const { success } = response.data;
        if (success) {
            // Xác nhận CAPTCHA thành công
            const comment = {
                prd_id: id,
                full_name,
                email,
                body,
            }
            await new commentModel(comment).save();
            res.redirect(req.path);
        } 
    } 
    // catch (error) {
    //     console.error('Lỗi khi xác nhận CAPTCHA:', error);
    //     return res.status(500).send('Lỗi khi xác nhận CAPTCHA.');
    // }
    

    


  
};

const search = async (req, res) => {
    const { keyword } = req.query;
    const products = await productModel.find({
        $text: {
            $search: keyword,
        }
    })
    res.render("site/search", {
        products,
        keyword
    });

}

const addToCart = async (req, res) => {
    const items = req.session.cart;
    const { id, qty } = req.body;
    let isProductExists = false;
    const newItems = items.map((item) => {
        if (item.id === id) {
            item.qty += Number(qty);
            isProductExists = true;
        }
        return item;
    });
    if (!isProductExists) {
        const product = await productModel.findById(id);
        newItems.push({
            _id: id,
            name: product.name,
            price: product.price,
            thumbnail: product.thumbnail,
            qty: Number(qty),
        });
    }
    req.session.cart = newItems;
    res.redirect("/cart");
}

const cart = async (req, res) => {
    const {email} = req.session;
    const items = req.session.cart;
    console.log(email);
    res.render("site/cart", {
        items,
        email,
        vndPrice,
    });
}
const historyOrder=async(req,res)=>{
    const {email} = req.session; // kiểm tra xem đăng nhập chưa
    if(email){
        const customer = await customerModel.findOne({email}) // tìm thông tin người dùng thông qua thông tin đã đăng ký
        if(customer){ // nếu có người dùng đó bắt đầu lọc sản phẩm đã mua
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = page*limit -limit;
            const totalRows = await orderModel.countDocuments();
            const totalPages = Math.ceil(totalRows/ limit)
            const items = req.session.cart; // lấy giỏ hàng
            const product = productModel.find(); // duyệt sản phẩm
            const orders = await orderModel
                .find({email})
                .populate('items.prd_id') // tham chiếu dữ liệu sang thằng product
                .skip(skip)
                .limit(limit)
            res.render("site/historyOrder", { // chuyển hết thông tin model và các lib tự tạo sang ví dụ như vndprice..
                items,
                vndPrice,
                email,
                orders,
                customer,
                product,
                pages: pagination(page, limit, totalRows),
                page,
                totalPages
            });
        }
    }else{
        res.redirect("/login"); // hoặc chuyển hướng người dùng đến trang đăng nhập
    }


}
const updateItemCart = (req, res) => {
    const { products } = req.body;
    const items = req.session.cart;
    const newItems = items.map((item) => {
        item.qty = Number(products[item._id]["qty"])
        return item;
    });
    req.session.cart = newItems;
    res.redirect("/cart");
}

const deleteItemCart = (req, res) => {
    const items = req.session.cart;
    const { id } = req.params;
    const newItems = items.filter((item) => item._id !== id)
    req.session.cart = newItems;
    // if(newItems.length === 0){
    //     res.alert("Khong con sp nao ");
    //     return;
    // }
    res.redirect("/cart")

}
const order = async (req, res) => {
    // const { body } = req;
    // const items = req.session.cart;
    // const viewFolder = req.app.get("views");
    // const html = await ejs.renderFile(path.join(viewFolder,"site/email-order.ejs"), {
    //     ...body,
    //     items,
    // })
    // console.log(body);

    // // send mail with defined transport object
    // const info = await transporter.sendMail({
    //     from: '"VietPro Store 👻"VietPro.edu.vn@email.com', // sender address
    //     to: body.email, // list of receivers
    //     subject: "Xác nhận đơn hàng từ VietPro Store ", // Subject line
    //     html
    // });
    // req.session.cart = [];
    // res.redirect("/success");
    const {body} = req
    const items = req.session.cart;
    const viewFolder = req.app.get("views");
    const html = await ejs.renderFile(path.join(viewFolder,"site/email-order.ejs"), {
        ...body,
        items,
        vndPrice,
    })
    const newOrder = new orderModel({
        email: body.email,
        phone: body.phone,
        name: body.name,
        address: body.address,
        items: items.map(item => ({
            prd_id: item._id,  
            prd_name: item.name,  
            prd_price: item.price, 
            prd_thumbnail: item.thumbnail, 
            prd_qty: item.qty, 
        }))
    });
    // send mail with defined transport object
    await transporter.sendMail({
        from: '"VietPro Store 👻"VietPro.edu.vn@email.com', // sender address
        to: body.email, // list of receivers
        subject: "Xác nhận đơn hàng từ VietPro Store ", // Subject line
        html
    });
    await newOrder.save();
    req.session.cart = [];
    res.redirect("/success");
}
const success = (req, res) => {
    res.render("site/success");

}

module.exports = {
    home,
    signIn,
    postSignIn,
    signUp,
    postSignUp,
    signOut,
    category,
    product,
    comment,
    search,
    addToCart,
    updateItemCart,
    deleteItemCart,
    cart,
    historyOrder,
    order,
    success,
};
