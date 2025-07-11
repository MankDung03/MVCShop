const commentModel = require("../models/comment");
const pagination = require("../../common/pagination");
const paginate = require("../../common/paginate");

const comment=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
     const {
        results: comments,
        totalRows,
        totalPages,
        pages,
    } = await paginate(commentModel,{}, page, limit);
  
    res.render("admin/comments/comment",{comments, totalRows,
        pages,
        page,
        totalPages});
}
const approve= async(req,res)=>{
     const { id } = req.params;
    await commentModel.updateOne({ _id: id }, { $set: { is_allowed: true } });
    res.redirect("back");
}
const hidden= async(req,res)=>{
     const { id } = req.params;
    await commentModel.updateOne({ _id: id }, { $set: { is_allowed: false } });
    res.redirect("back");
}
const deleteComment= async(req,res)=>{
      const { id } = req.params;     
    await commentModel.deleteOne({_id:id});
    res.redirect("/admin/comments");
}
module.exports={
    comment,
    approve,
    hidden,
    deleteComment
}
// const { id } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = 9;

//     const category = await categoryModel.findById(id);
//     const { title } = category;

//     const {
//         results: products,
//         totalRows,
//         totalPages,
//         pages,
//     } = await paginate(productModel, { cat_id: id }, page, limit);

//     res.render("site/category", {
//         category,
//         products,
//         title,
//         totalRows,
//         pages,
//         page,
//         totalPages
//     });