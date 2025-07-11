const orderModel = require('../models/order');
const OrderModel = require('../models/order');
const pagination = require("../../common/pagination");
const index=async(req,res)=>{
     const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    let orders, totalRows;


    orders = await orderModel.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    totalRows = await orderModel.countDocuments();

    res.render("admin/orders/order", {
        orders,
        pages: pagination(page, limit, totalRows),
        page,
        totalPages: Math.ceil(totalRows / limit),
        
        
    });
}
const orderStatus = async (req, res) => {
  // Lấy id đơn hàng từ params
  const { id } = req.params;

  // Lấy trạng thái mới từ query (chú ý: req.query, không phải req.querry)
  const { statusText } = req.query;


    // Tìm đơn hàng theo id và cập nhật trạng thái mới
    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      { status: statusText },
      { new: true } // Trả về đơn hàng sau khi đã cập nhật
    );


    // Trả về đơn hàng đã cập nhật
    res.redirect("/admin/orders")
  
};


const orderDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).send("Không tìm thấy đơn hàng");
    }

    // Tính tổng tiền
    let totalAmount = 0;
    for (let item of order.items) {
      totalAmount += item.prd_price * item.prd_qty;
    }
    console.log(order);
    
    // Truyền vào view
    res.render("admin/orders/orderDetail", {
      order,
      totalAmount
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi máy chủ");
  }
};




module.exports={
    index,
    orderDetail,
    orderStatus
}