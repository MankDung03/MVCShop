const userModel = require("../models/user");
const pagination=require("../../common/pagination");
const bcrypt=require("bcrypt");

const index = async (req, res)=>{
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = page*limit - limit;
  const users = await userModel
  .find({is_delete:false})
  .skip(skip)
  .limit(limit);
  const totalRows = await userModel
  .find({is_delete: false})
  .countDocuments();
  const totalPages = Math.ceil(totalRows / limit);
      res.render("admin/users/user",{
          data:{},
      users,
      pages: pagination(page, limit, totalRows),
      page,
      totalPages,
      });
}
const create = (req, res) =>{
    res.render("admin/users/add_user",{data:{}});
}
const store=async(req,res)=>{
  const {body} = req;
  const user = {
     email:body.email,
     role:body.role,
     full_name:body.full_name,
     password:body.password,
  };
  const re_password = body.re_password;
  if (body.password!==re_password){
      const error = "Mật khẩu không trùng khớp!";
      return res.render("admin/users/add_user",{
          data:{error},
          user,
      })
  };
  const userExists = await userModel.findOne({
      email: { $regex: new RegExp(body.email, "i")
       }
    });
  if (userExists) {
      const error = "Email đã tồn tại !";
      return res.render("admin/users/add_user", {
        data: { error },
        user
      })
    }
    const hashedPassword = await bcrypt.hash(body.password, 10)
    user.password = hashedPassword;
  new userModel(user).save();
  res.redirect("/admin/users")

}
const edit=async(req,res)=>{
    const {id} = req.params;
    const user = await userModel.findById(id);
    res.render("admin/users/edit_user",{user,data:{}});
}
const update=async(req,res)=>{
  const {id} = req.params;
    const {body} = req;
    const user = {
        email:body.email,
        role:body.role,
        full_name:body.full_name,
        password:body.password,
     };
    const re_password = body.re_password;
    if (body.password!==re_password){
        const error = "Mật khẩu không trùng khớp!";
        return res.render("admin/users/edit_user",{
            data:{error},
            user,
        })
    };
    const old_password = body.old_password;
    const userData = await userModel.findById(id);
    
    const isValidOldPassword = await bcrypt.compare(old_password, userData.password);
    if (!isValidOldPassword) {
        const error = "Mật khẩu cũ không chính xác!";
        return res.render("admin/users/edit_user", { 
          data: { error },
          user  
        })
      } 
      const hashedPassword = await bcrypt.hash(body.password, 10)
      user.password = hashedPassword;
    const userExists = await userModel.findOne({
        email: { $regex: new RegExp(body.email, "i"),
                  $ne: body.email    
               } 
      });
    if (userExists) {
        const error = "Email đã tồn tại !";
        return res.render("admin/users/edit_user", {
          data: { error },
          user
        }) 
      }
    await userModel.updateOne({_id: id}, {$set: user});
    res.redirect("/admin/users"); 
}
const Delete = async (req, res) =>{
  const {id}= req.params;
  await userModel.deleteOne({_id: id})
  res.redirect("/admin/users");
}
module.exports = {
    index,
    create,
    store,
    edit,
    update,
    Delete,
};
