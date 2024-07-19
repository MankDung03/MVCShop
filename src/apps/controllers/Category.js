const categoryModel = require("../models/category");
const productModel = require("../models/product")
const slug= require("slug");

const category  = async (req, res)=>{
    const categories = await categoryModel
        .find()

    res.render("admin/categories/category", {categories})
}
const create = (req, res) =>{
    res.render("admin/categories/add_category",{data:{}});
}
const store=async(req,res)=>{
    const {body} = req;
    const category = {
        title:body.title,
        slug:slug(body.title),
    };
    const categoryExists = await categoryModel.findOne({
        title: { $regex: new RegExp(body.title, "i") }
      });
    if (categoryExists) {
        const error = "Danh mục đã tồn tại !";
        return res.render("admin/categories/add_category", {
          data: { error },
          category
        })
      }
    new categoryModel(category).save();
    res.redirect("/admin/category")
}
const edit = async (req,res) =>{
    const {id} = req.params;
    const categories = await categoryModel.findById(id);
    res.render("admin/categories/edit_category",{categories,data:{}});
}
const update = async (req,res)=>{
    const {id} = req.params;
    const {body} = req;
    const category = {
        title:body.title, 
        slug:slug(body.title),
    };
    const categoryExists = await categoryModel.findOne({
        title: { $regex: new RegExp(body.title, "i") }
      });
    if (categoryExists) {
        const error = "Danh mục đã tồn tại !";
        return res.render("admin/categories/edit_category", {
          data: { error },
          category
        })
      }
    await categoryModel.updateOne({_id: id}, {$set: category});
    res.redirect("/admin/category"); 
}
const Delete = async (req, res) => {
  const { id } = req.params;
  const arrIds = id.split(',');
  
  // 1. Tìm danh mục gốc trong cơ sở dữ liệu
  const rootCategory = await categoryModel.findOne({ is_root: true });

  // 2. Lấy tất cả các sản phẩm của các danh mục bị xoá
  const productsToUpdate = await productModel.find({ cat_id: { $in: arrIds } });

  // 3. Cập nhật danh mục của các sản phẩm đó thành danh mục gốc
  const productUpdatePromises = productsToUpdate.map(product => {
      product.cat_id = rootCategory._id;
      return product.save();
  });
  await Promise.all(productUpdatePromises);

  // 4. Tiến hành xoá danh mục bị xoá
  // await categoryModel.updateMany({ _id: { $in: arrIds } }, { $set: { is_delete: true } });
  // console.log(rootCategory);
await categoryModel.deleteMany({ _id: { $in: arrIds } });

  res.redirect("/admin/category");
}
module.exports = {
    category,
    create,
    store,
    edit,
    update,
    Delete,
};
