const userModel = require("../models/user");
const productModel = require("../models/product");
const commentModel = require("../models/comment");
const index = async (req, res)=>{
    const total_product = await productModel
        .find()
        .countDocuments();
    const total_user = await userModel
        .find()
        .countDocuments();
    const total_comment = await commentModel
        .find()
        .countDocuments();
    res.render("admin/dashboard", {total_user, total_product,total_comment});

};
module.exports = {
    index,
};
