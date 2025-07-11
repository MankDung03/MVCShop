const customerModel = require("../models/customer");
const pagination= require("../../common/pagination");
const orderMdel = require("../models/order");
const index = async (req, res)=>{
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = page*limit - limit;
  const customers = await customerModel
  .find({is_delete:false})
  .skip(skip)
  .limit(limit);
  const totalRows = await customerModel
  .find({is_delete: false})
  .countDocuments();
  const totalPages = Math.ceil(totalRows / limit);
    const customerWithOrderCount = await Promise.all(
    customers.map(async (customer) => {
      const orderCount = await orderMdel.countDocuments({ email: customer.email });
      return {
        ...customer.toObject(), // chuyển từ mongoose document về object thường
        orderCount
      };
    })
  );

  
      res.render("admin/customers/customer",{
          data:{},
      customers:customerWithOrderCount,
      pages: pagination(page, limit, totalRows),
      page,
      totalPages,
      });
}
const deleteCustomer=async (req,res)=>{
 const { id } = req.params;
  const arrIds = id.split(',');
  await customerModel.updateMany({ _id: { $in: arrIds } }, { $set: { is_delete: true } });

  res.redirect("/admin/customers");
}
const customerTrash= async(req,res)=>{
 const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = page * limit - limit
    const query = {}
    query.is_delete = true
    const customers = await customerModel
      .find(query)
      .sort({_id: -1})
      .limit(limit)
      .skip(skip) 
  
    const totalRows = await customerModel.find(query).countDocuments()
    const totalPages = Math.ceil(totalRows / limit);

    res.render('admin/customers/trash_customer', {
      customers,
      page,
      totalPages,
      pages: pagination(page,limit, totalRows),
    })
}
const customerTrashRestore= async(req,res)=>{
    try {
            const { id } = req.params;
            const arrayIds = id.split(',');
            
            for (let id of arrayIds) {
                const customer = await customerModel.findById(id);
                
                if (!customer) {
                    // Nếu không tìm thấy sản phẩm với id này, bỏ qua và tiếp tục với sản phẩm tiếp theo
                    continue;
                }
                // Kiểm tra xem sản phẩm có đang bị đưa vào thùng rác không
                if (customer.is_delete) {
                    await customerModel.findByIdAndUpdate(id, { $set: { is_delete: false } });
                    // Nếu sản phẩm đang trong thùng rác, cập nhật trạng thái của sản phẩm để khôi phục
                    
                } else {
                    // Nếu sản phẩm không trong thùng rác, chuyển hướng về trang thùng rác và hiển thị thông báo lỗi
                    return res.redirect('/admin/customers/trash?restoreError=Sản phẩm đang trong thùng rác. Hãy khôi phục trước!');
                }
            }
            res.redirect('/admin/customers');
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error(error);
            res.status(500).send('Đã xảy ra lỗi khi khôi phục sản phẩm.');
        }
}
const customerTrashDelete= async(req,res)=>{
 const { id } = req.params
    const arrayIds = id.split(',') 
    if (!arrayIds) res.redirect('/admin/users/trash')
  
    for (let id of arrayIds) {
      const customer = await customerModel.findById(id)
    }
  
    await customerModel.deleteMany({ _id: { $in: arrayIds } })
    res.redirect('/admin/customers/trash')
}

module.exports={
    index,
    deleteCustomer,
    customerTrash,
    customerTrashRestore,
    customerTrashDelete
}