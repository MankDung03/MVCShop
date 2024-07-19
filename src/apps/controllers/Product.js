const productModel = require("../models/product");
const categoryModel = require("../models/category");
const pagination = require("../../common/pagination");
const fs = require("fs");
const path = require("path");
const slug = require("slug");
const config = require("config");
const index = async (req, res) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    let products, totalPages, totalRows;

    const categories = await categoryModel
        .find()
req.query={}
    const categoryId = req.query.category;
    const is_stock=req.query.is_stock;
    if(is_stock==="1"){
        products=await productModel.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
        totalRows = await productModel
            .find({is_stock})
            .countDocuments();
    }
   

    if (categoryId) {
        products = await productModel
            .find({ cat_id: categoryId })
            .populate({ path: "cat_id" })
            .sort({ _id: -1 })
            .limit(limit)
            .skip(skip)

        totalRows = await productModel
            .find({ cat_id: categoryId })
            .countDocuments();
    } else {
        products = await productModel
            .find()
            .populate({ path: "cat_id" })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        totalRows = await productModel
            .find()
            .countDocuments()
    }
    res.render("admin/products/product", {
        products,
        pages: pagination(page, limit, totalRows),
        page,
        totalPages,
        categories,
        categoryId,
    });
}
const productsCreate = async (req, res) =>{
    const categories = await categoryModel.find().sort({_id: 1});
    res.render("admin/products/add_product",{categories});
}

const productsStore = (req, res)=>{
    const {body, file}= req;
    const product = {
        name: body.name,
        price: body.price,
        status: body.status,
        cat_id: body.cat_id,
        featured: body.featured =="on",
        is_stock: body.is_stock,
        promotion: body.promotion,
        accessories: body.accessories,
        warranty: body.warranty,
        description: body.description,
        slug: slug(body.name),

    };
    //upload
    if(file){
         //insert
        const thumbnail = `products/${file.originalname}`;
        product["thumbnail"] = thumbnail;
        fs.renameSync(file.path, path.resolve(config.get("app.baseUrlUpload"),thumbnail))
        new productModel(product).save();
        res.redirect("/admin/products")   
    }
}
const productsEdit = async (req, res) =>{
    const {id} =req.params;
    const product = await productModel.findById(id);
    const categories = await categoryModel.find().sort({_id: 1});
    res.render("admin/products/edit_product",{
        product,
        categories
    });

}
const productsUpdate = async (req, res) =>{
    const {id} = req.params;
    const {body, file} = req;
    const product = {
        name: body.name,
        price: body.price,
        status: body.status,
        cat_id: body.cat_id,
        featured: body.featured ==="on",
        is_stock: body.is_stock,
        promotion: body.promotion,
        accessories: body.accessories,
        warranty: body.warranty,
        description: body.description,
        slug: slug(body.name),
    }
    if(file){
        //insert
       const thumbnail = `products/${file.originalname}`;
       fs.renameSync(file.path, path.resolve(config.get("app.baseUrlUpload"),thumbnail));
       product["thumbnail"] = thumbnail;

   }
   await productModel.updateOne({_id: id}, {$set: product}); 
   res.redirect("/admin/products")  
}
const productsDelete = async (req, res) =>{
    const {id}= req.params;
   
    const product = await productModel.findById(id)
    const thumbnail = product.thumbnail;
  

    const imagePath =  path.resolve(config.get("app.baseUrlUpload"),thumbnail);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Xóa file ảnh từ hệ thống tệp
        }
    await productModel.deleteOne({_id: id})
    res.redirect("/admin/products");
}
const productsTrashDelete = async (req, res) => {
    const { id } = req.params
    const arrayIds = id.split(',') 
    if (!arrayIds) res.redirect('/admin/products/trash')
  
    for (let id of arrayIds) {
      const product = await productModel.findById(id)
      // Xoác các comment có prd_id là id
      await commentModel.deleteMany({ prd_id: id })
  
    //   const thumbnail = product?.thumbnail
  
    //   if (thumbnail) {
    //     const imageName = path.basename(thumbnail)
    //     const imagePathDir = path.resolve('src/public/uploads/images/products')
    //     const imagesWithSameName = fs.readdirSync(imagePathDir).filter(file => file === imageName)
  
    //     if (imagesWithSameName.length > 1) {
    //       const filePath = path.resolve('src/public/uploads/images', thumbnail)
    //       if (fs.existsSync(filePath)) {
    //         fs.unlinkSync(filePath)
    //       }
    //     }
    //   }
    const thumbnail = product.thumbnail;
  

    const imagePath =  path.resolve(config.get("app.baseUrlUpload"),thumbnail);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Xóa file ảnh từ hệ thống tệp
        }
    }
  
    await productModel.deleteMany({ _id: { $in: arrayIds } })
    res.redirect('/admin/products/trash')
  }

module.exports = {
    index,
    productsStore,
    productsCreate,
    productsEdit,
    productsUpdate,
    productsDelete,
    productsTrashDelete,
};

