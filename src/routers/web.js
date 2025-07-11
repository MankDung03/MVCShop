const express = require("express");
const router = express.Router();
const AuthController = require("../apps/controllers/Auth")
const AdminController = require("../apps/controllers/Admin")
const ProductController = require("../apps/controllers/Product")
const UserController = require("../apps/controllers/User")
const CategoryController = require("../apps/controllers/Category")
const configController=require("../apps/controllers/Config");
const advertiesController=require("../apps/controllers/advertises")
const commentController= require("../apps/controllers/Comment");
const customerController= require("../apps/controllers/Customer");
const orderController= require("../apps/controllers/Order");
const paymentController= require("../apps/controllers/Payment");
const passport=require("passport");




//FE
const Sitecontroller = require("../apps/controllers/Site")

const { checkLogin, checkAdmin } = require("../apps/middlewares/Auth");
const UploadMiddleware = require("../apps/middlewares/upload")
const {checkCustomer}=require("../apps/middlewares/site");


const TestController = require("../apps/controllers/TestController");
router.get("/test1/",(req, res, next)=>{
    if(req.session.email){
        next();
    }else{
        res.redirect("/test2")
    }
} ,TestController.test1)
router.get("/test2/", TestController.test2)

//FE
router.get("/",checkCustomer,Sitecontroller.home);
router.get("/category-:slug.:id",checkCustomer,Sitecontroller.category);
router.get("/product-:slug.:id",checkCustomer,Sitecontroller.product);
router.post("/product-:slug.:id",checkCustomer,Sitecontroller.comment);
router.get("/search",checkCustomer,Sitecontroller.search);
router.post("/add-to-cart",checkCustomer,Sitecontroller.addToCart);
router.get("/cart",checkCustomer,Sitecontroller.cart);
router.get("/historyOrder",checkCustomer,Sitecontroller.historyOrder);
router.get("/historyOrder/:id",checkCustomer,Sitecontroller.dropOder);
router.post("/update-item-cart",checkCustomer,Sitecontroller.updateItemCart);
router.get("/delete-item-cart-:id",checkCustomer,Sitecontroller.deleteItemCart);
router.post("/order",checkCustomer,Sitecontroller.order);
router.get("/success",checkCustomer,Sitecontroller.success);

router.post("/report-comment:id",checkCustomer,Sitecontroller.reportComment)

//dang nhap,dangki site
router.get("/signin",checkCustomer,Sitecontroller.signIn)
router.post("/signin",checkCustomer,Sitecontroller.postSignIn)
router.get("/signup",checkCustomer,Sitecontroller.signUp)
router.post("/signup",checkCustomer,Sitecontroller.postSignUp)
router.get("/signout",checkCustomer,Sitecontroller.signOut)




//dang nhap ,xuat admin
router.get("/admin/login",checkLogin,AuthController.login)
router.post("/admin/login",checkLogin,AuthController.postLogin)
router.get("/admin/logout",checkAdmin,AuthController.logout)

//Google
router.get('/admin/auth/google',
  passport.authenticate('google', { scope: ['profile','email'],session:false }));

  router.get('/admin/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/admin/login' }, (err, profile) => {
      req.user = profile
      next()
    })(req, res, next)
  }, (req, res) => {
    res.redirect(`http://localhost:3000/admin/auth/google/${req.user?.id}/${req.user?.tokenLogin}`)
  })
  
  router.get('/admin/auth/google/:google_id/:tokenLogin', AuthController.loginGoogle)
  
// admin/auth/facebook
router.get('/admin/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }))

// admin/auth/facebook/callback
router.get('/admin/auth/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { failureRedirect: '/admin/login' }, (err, profile) => {
    req.user = profile
    next()
  })(req, res, next)
}, (req, res) => {
  res.redirect(`http://localhost:3000/admin/auth/facebook/${req.user?.id}/${req.user?.tokenLogin}`)
})

  router.get('/admin/auth/facebook/:facebook_id/:tokenLogin', AuthController.loginFacebook)




  
router.get("/login_success",AuthController.loginSuccess);
 



//Dang ki admin
router.get("/admin/signup",checkLogin,AuthController.signup);
router.post("/admin/signup",checkLogin,AuthController.postSignup);

//Quen mat khau 
router.get("/admin/login/forgot",AuthController.showForgot)
router.post("/admin/login/forgot",AuthController.forgotPasword)
router.get("/admin/login/reset-password/",AuthController.resetPassword)
router.post("/admin/login/reset-password/:token",AuthController.resetNewPassword)





//dashboard
router.get("/admin/dashboard",checkAdmin,AdminController.index)

router.get("/admin/products",ProductController.index)
router.get("/admin/products/create",checkAdmin,ProductController.productsCreate)
router.post("/admin/products/store",UploadMiddleware.single("thumbnail"),checkAdmin,ProductController.productsStore)

router.get("/admin/products/supply/:id",checkAdmin,ProductController.productsSuplly)
router.post("/admin/products/supply/:id",checkAdmin,ProductController.productsReSuplly)

router.post("/admin/products/update/:id",UploadMiddleware.single("thumbnail"),checkAdmin,ProductController.productsUpdate)
router.get("/admin/products/edit/:id",checkAdmin,ProductController.productsEdit)
router.get("/admin/products/delete/:id",checkAdmin,ProductController.productsDelete)
router.get("/admin/products/trash",checkAdmin,ProductController.productsTrash)
router.get("/admin/products/trash/restore/:id",checkAdmin,ProductController.productsTrashRestore)
router.get("/admin/products/trash/delete/:id",checkAdmin,ProductController.productsTrashDelete) 

router.get("/admin/users",checkAdmin,UserController.index)
router.get("/admin/users/create",checkAdmin,UserController.create)
router.post("/admin/users/create",checkAdmin,UserController.store)
router.get("/admin/users/edit/:id",checkAdmin,UserController.edit)
router.post("/admin/users/edit/:id",checkAdmin,UserController.update)
router.get("/admin/users/delete/:id",checkAdmin,UserController.Delete)
router.get("/admin/users/trash",checkAdmin,UserController.userTrash)
router.get("/admin/users/trash/restore/:id",checkAdmin,UserController.userTrashRestore)
router.get("/admin/users/trash/delete/:id",checkAdmin,UserController.userTrashDelete),

router.get("/admin/category",checkAdmin,CategoryController.category)
router.get("/admin/category/create",checkAdmin,CategoryController.create)
router.post("/admin/category/create",checkAdmin,CategoryController.store)
router.get("/admin/category/edit",checkAdmin,CategoryController.category)
router.get("/admin/category/delete/:id",checkAdmin, CategoryController.Delete)
router.get("/admin/category/trash",checkAdmin,CategoryController.categoryTrash)
router.get("/admin/category/trash/restore/:id",checkAdmin,CategoryController.categoryTrashRestore)
router.get("/admin/category/trash/delete/:id",checkAdmin,CategoryController.categoryTrashDelete) 

//cau hinh
router.get("/admin/configs",configController.index);
router.get("/admin/create-config",configController.createConfig);
router.post("/admin/create-config",UploadMiddleware.fields([
  { name: 'logo_header', maxCount: 1 },
  { name: 'logo_footer', maxCount: 1 }
]),configController.storeConfig);
router.get("/admin/edit-config/:id",configController.editConfig);
router.post("/admin/edit-config/:id",UploadMiddleware.fields([
  { name: 'logo_header', maxCount: 1 },
  { name: 'logo_footer', maxCount: 1 }
]),configController.updateConfig);
router.get("/admin/delete-config/:id",configController.delConfig);

//GET admin/configs/approve/:id
router.get('/admin/configs/approve/:id', configController.approve)
//GET admin/configs/hidden/:id
router.get('/admin/configs/hidden/:id', configController.hidden)

//Comment
router.get("/admin/comments",commentController.comment);
router.get("/admin/comments/approve/:id",commentController.approve);
router.get("/admin/comments/hidden/:id",commentController.hidden);
router.get("/admin/comments/delete/:id",commentController.deleteComment);

//Customer
router.get("/admin/customers",customerController.index);
router.get("/admin/customers/delete/:id",customerController.deleteCustomer);
router.get("/admin/customers/trash",customerController.customerTrash);
router.get("/admin/customers/trash/restore/:id",customerController.customerTrashRestore);
router.get("/admin/customers/trash/delete/:id",customerController.customerTrashDelete);

//Order
router.get("/admin/orders",orderController.index);
router.get("/admin/orders/:id",orderController.orderDetail);
router.get("/admin/orders/:id/status",orderController.orderStatus);





//banner

router.get("/admin/banners",advertiesController.banner);
router.get("/admin/create-banner",advertiesController.createBanner);
router.post("/admin/create-banner",UploadMiddleware.single("thumbnail"),advertiesController.storeBanner);
router.get("/admin/delete-banners/:id",advertiesController.delBanner);

//Slider
router.get("/admin/sliders",advertiesController.slider);
router.get("/admin/create-slider",advertiesController.createSlider);
router.post("/admin/create-slider",UploadMiddleware.single("thumbnail"),advertiesController.storeSlider);
router.get("/admin/delete-sliders/:id",advertiesController.delSlider);

//Thanh toan momo
router.get("/callback",paymentController.callback);
router.post("/payment",paymentController.payment);
module.exports = router;