const productModel = require("../models/product");
const categoryModel = require("../models/category");
const commentModel =  require("../models/comment");
const pagination = require("../../common/pagination");
const fs = require("fs");
const path = require("path");
const slug = require("slug");
const config = require("config");
const vndPrice=require("../../lib/VnPrice");
const mongoose = require("mongoose"); 

const index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    let products, totalRows;

    const query = { is_delete: false }; // Mặc định luôn lọc is_delete = false
    const categories = await categoryModel.find();

    const categoryId = req.query.category;
    if (categoryId) {
    query.cat_id = new mongoose.Types.ObjectId(categoryId);
}
    
    const is_stock = req.query.is_stock;

if (is_stock === "1") {
    query.is_stock = true;
} else if (is_stock === "0") {
    query.is_stock = false;
}

    products = await productModel.find( query)
        .populate({ path: "cat_id" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    

    totalRows = await productModel.countDocuments(query);

    res.render("admin/products/product", {
        products,
        vndPrice,
        pages: pagination(page, limit, totalRows),
        page,
        totalPages: Math.ceil(totalRows / limit),
        categories,
        categoryId,
    });
};

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
        stock: body.is_stock,
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
const productsSuplly=async(req,res)=>{
    res.render("admin/products/supply_product");
}
const productsReSuplly=async(req,res)=>{
    res.render("admin/products/supply_product");
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
        stock:body.stock,
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
// const productsDelete = async (req, res) =>{
//     const {id}= req.params;
   
//     const product = await productModel.findById(id)
//     const thumbnail = product.thumbnail;
  

//     const imagePath =  path.resolve(config.get("app.baseUrlUpload"),thumbnail);
//         if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath); // Xóa file ảnh từ hệ thống tệp
//         }
//     await productModel.deleteOne({_id: id})
//     res.redirect("/admin/products");
// }
// const productsTrashDelete = async (req, res) => {
//     const { id } = req.params
//     const arrayIds = id.split(',') 
//     if (!arrayIds) res.redirect('/admin/products/trash')
  
//     for (let id of arrayIds) {
//       const product = await productModel.findById(id)
//       // Xoác các comment có prd_id là id
//       await commentModel.deleteMany({ prd_id: id })
  
//     //   const thumbnail = product?.thumbnail
  
//     //   if (thumbnail) {
//     //     const imageName = path.basename(thumbnail)
//     //     const imagePathDir = path.resolve('src/public/uploads/images/products')
//     //     const imagesWithSameName = fs.readdirSync(imagePathDir).filter(file => file === imageName)
  
//     //     if (imagesWithSameName.length > 1) {
//     //       const filePath = path.resolve('src/public/uploads/images', thumbnail)
//     //       if (fs.existsSync(filePath)) {
//     //         fs.unlinkSync(filePath)
//     //       }
//     //     }
//     //   }
//     const thumbnail = product.thumbnail;
  

//     const imagePath =  path.resolve(config.get("app.baseUrlUpload"),thumbnail);
//         if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath); // Xóa file ảnh từ hệ thống tệp
//         }
//     }
  
//     await productModel.deleteMany({ _id: { $in: arrayIds } })
//     res.redirect('/admin/products/trash')
//   }
const productsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const arrIds = id.split(',');
    
    if (!arrIds || arrIds.length === 0) {
      return res.redirect('/admin/products');
    }

    const idsProduct = await productModel.find({ _id: { $in: arrIds } });

    if (idsProduct.length === 0) {
      return res.redirect('/admin/products');
    }

    await productModel.updateMany(
      { _id: { $in: arrIds } },
      { $set: { is_delete: true } }
    );

    // Nếu dùng commentModel thì cũng nên await và kiểm tra lỗi:
    // await commentModel.updateMany({ prd_id: { $in: arrIds } }, {
    //   $set: { allow: false, is_delete: false }
    // });

    return res.redirect("/admin/products"); // Nhớ return để không chạy tiếp
  } catch (error) {
    console.log("Lỗi khi xóa sản phẩm:", error);
    return res.status(500).send("Lỗi server khi xóa sản phẩm");
  }
};

const productsTrash = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = page * limit - limit
    const query = {}
    query.is_delete = true
    const products = await productModel
      .find(query)
      .populate({ path: "cat_id" })
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip)
  
    const totalRows = await productModel.find(query).countDocuments()
    const totalPages = Math.ceil(totalRows / limit)
  
    res.render('admin/products/trash_product', {
        products,
        page,
        totalPages,
        pages: pagination(page,limit, totalRows),
    })
  }
  
  const productsTrashRestore = async (req, res) => {
    try {
        const { id } = req.params;
        const arrayIds = id.split(',');
        
        for (let id of arrayIds) {
            const product = await productModel.findById(id);
            
            if (!product) {
                // Nếu không tìm thấy sản phẩm với id này, bỏ qua và tiếp tục với sản phẩm tiếp theo
                continue;
            }
            // Kiểm tra xem sản phẩm có đang bị đưa vào thùng rác không
            if (product.is_delete) {
                await productModel.findByIdAndUpdate(id, { $set: { is_delete: false } });
                
            } else {
                return res.redirect('/admin/products/trash?restoreError=Sản phẩm không trong thùng rác');
            }
        }
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi khôi phục sản phẩm.');
    }
};

  
  const productsTrashDelete = async (req, res) => {
    const { id } = req.params
    const arrayIds = id.split(',') 
    if (!arrayIds) res.redirect('/admin/products/trash')
  
    for (let id of arrayIds) {
      const product = await productModel.findById(id)
      await commentModel.deleteMany({ prd_id: id })
      const thumbnail = product.thumbnail;

      const imagePath = path.resolve(config.get("app.baseUrlUpload"),thumbnail);
      if (fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath);
      }
    }
    await productModel.deleteMany({ _id: { $in: arrayIds } })
    res.redirect('/admin/products/trash')
  }
module.exports = {
    index,
    productsStore,
    productsCreate,
    productsSuplly,
    productsReSuplly,
    productsEdit,
    productsUpdate,
    productsDelete,
    productsTrash,
    productsTrashRestore,
    productsTrashDelete
};

