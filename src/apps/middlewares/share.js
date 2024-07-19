const CategoryModel = require("../models/category");
const bannerModel=require("../models/banner");
const sliderModel = require("../models/slider");
const configModel = require("../models/config");

module.exports = async(req, res, next) =>{
    res.locals.categories = await CategoryModel.find()
        .sort({id: -1});
    res.locals.banners=await bannerModel.find().sort({_id:-1});
    res.locals.sliders=await sliderModel.find().sort({_id:-1});
    
    res.locals.totalCartItems = req.session.cart.reduce((total,item) => total + item.qty, 0);
    res.locals.configs = await configModel.findOne({ allow: true })

    next();
};
