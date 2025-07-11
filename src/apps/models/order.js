const mongoose = require("../../common/database")();

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String, 
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },   
    status:{
            type:String,
            default: "Đang xử lí",
        },
      is_payment: { type: Boolean, default: false },
    items: [{ // Sử dụng mảng để lưu trữ thông tin các mục hàng trong đơn hàng
        prd_id: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Products",
        },
        prd_qty: {
            type: Number,
            required: true,
        },
        prd_name:{
            type: String,
            required: true,
        },
        prd_thumbnail:{
            type: String,
            required: true,
        },
        prd_price:{
            type: Number,
            required: true,

        }
     
        // Bạn có thể thêm các trường khác tùy thuộc vào nhu cầu của bạn
    }],
},{timestamps:true});

const orderModel = mongoose.model("Orders", orderSchema, "orders");
module.exports = orderModel;
