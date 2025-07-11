const axios = require('axios');
const crypto = require('crypto');
const orderModel=require("../models/order");
const productModel=require("../models/product");
const moment = require("moment");


const transporter = require("../../common/transporter");
const { log } = require("console");
const userModel = require("../models/user");
const customerModel = require("../models/customer");
const vndPrice=require("../../lib/VnPrice");
 

const path = require("path");
const ejs = require("ejs")





const payment = async (req, res) => {
  // Khai báo newOrder ở scope ngoài cùng của hàm để nó luôn tồn tại
  let newOrder = null; // Khởi tạo với null hoặc undefined

  try {
    const { body } = req;
    const items = req.session.cart;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const amount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // --- 1. Tạo và lưu đơn hàng vào database với trạng thái 'pending' ---
    newOrder = new orderModel({ // Gán giá trị cho newOrder
      email: body.email || 'guest@example.com',
      phone: body.phone || '0123456789',
      name: body.name || 'Khách Hàng',
      address: body.address || 'Địa chỉ không xác định',
      is_payment: false,
      status: 'Đang xử lí',
      items: items.map(item => ({
        prd_id: item._id,
        prd_name: item.name,
        prd_price: item.price,
        prd_thumbnail: item.thumbnail,
        prd_qty: item.qty,
      })),
      amount: amount
    });

    await newOrder.save();
    console.log("Đơn hàng tạm thời đã được lưu vào DB với ID:", newOrder._id);

    // ... (phần code MoMo API request) ...
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const orderInfo = `Thanh toán đơn hàng #${newOrder._id} từ VietPro Store`;
    const partnerCode = 'MOMO';
    const redirectUrl = 'https://e2b1-210-245-59-162.ngrok-free.app/callback';
    const ipnUrl = 'https://e2b1-210-245-59-162.ngrok-free.app/callback';
    const requestType = "payWithMethod";
    const orderId = newOrder._id.toString();
    const requestId = orderId;
    const extraData = '';

    const crypto = require('crypto');
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      orderGroupId: '',
      signature,
    });

    const axios = require('axios');
    const options = {
      method: "POST",
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': "application/json",
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody
    };

    const result = await axios(options);

    req.session.cart = [];
    await req.session.save();

   // --- Thay đổi ở đây: Chuyển hướng đến payUrl của MoMo ---
    if (result.data && result.data.payUrl) {
        return res.redirect(result.data.payUrl); // Chuyển hướng trình duyệt đến trang thanh toán của MoMo
    } else {
        // Xử lý trường hợp không có payUrl
        console.error("Lỗi: MoMo không trả về payUrl.");
        if (newOrder && newOrder._id) {
            await orderModel.findByIdAndUpdate(newOrder._id, { status: 'failed' });
        }
        return res.status(500).json({ message: "Server error: No payUrl from MoMo" });
    }

  } catch (error) {
    console.error("Lỗi trong hàm payment:", error);
    // Bây giờ newOrder đã được khai báo ở scope ngoài, nên nó có thể được truy cập ở đây
    if (newOrder && newOrder._id) { // Kiểm tra nếu newOrder đã được tạo thành công
        console.log("Đã xảy ra lỗi sau khi tạo đơn hàng. Cập nhật trạng thái thành 'failed' cho ID:", newOrder._id);
        await orderModel.findByIdAndUpdate(newOrder._id, { status: 'failed' });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const callback = async (req, res) => {
    console.log("callback query:", req.query);
    console.log("req.session hiện tại:", req.session); // Vẫn log để debug session

    const { resultCode, orderId: momoOrderId } = req.query; // Lấy orderId từ MoMo callback

    if (!momoOrderId) {
        console.error("Không tìm thấy orderId từ MoMo callback.");
        return res.redirect('/fail'); // Không có ID để tìm đơn hàng
    }

    // --- Tìm đơn hàng trong database dựa trên orderId của MoMo ---
    const order = await orderModel.findById(momoOrderId);

    if (!order) {
        console.error(`Không tìm thấy đơn hàng với ID: ${momoOrderId} trong database.`);
        return res.redirect('/fail'); // Đơn hàng không tồn tại trong DB
    }

    if (resultCode === "0") { // Thanh toán thành công
        // Đảm bảo chỉ xử lý một lần để tránh lỗi trùng lặp (idempotency)
        if (order.is_payment === true) {
            console.log(`Đơn hàng ${order._id} đã được xử lý thành công trước đó.`);
            return res.redirect("/success");
        }

        // --- Cập nhật trạng thái đơn hàng thành công ---
        order.is_payment = true; // Đặt là true
      // Cập nhật trạng thái
        await order.save(); // Lưu thay đổi vào database
        console.log("Đơn hàng đã được cập nhật thành công:", order._id);

        // --- Cập nhật tồn kho ---
        // Lưu ý: Chỉ cập nhật tồn kho khi thanh toán thành công
        for (const item of order.items) {
            await productModel.updateOne({ _id: item.prd_id }, { $inc: { stock: -item.prd_qty } });
        }
        console.log("Đã cập nhật tồn kho cho đơn hàng:", order._id);

        // --- Gửi mail xác nhận ---
        const viewFolder = req.app.get("views");
        // Đảm bảo các thuộc tính prd_name, prd_qty, prd_price được sử dụng trong email-order.ejs
        const html = await ejs.renderFile(path.join(viewFolder, "site/email-order.ejs"), {
            email: order.email,
            phone: order.phone,
            name: order.name,
            address: order.address,
            items: order.items,
            vndPrice: order.amount // vndPrice có thể là biến tổng tiền hoặc cần hàm định dạng
        });
        await transporter.sendMail({
            from: '"VietPro Store 👻" <VietPro.edu.vn@email.com>',
            to: order.email,
            subject: "Xác nhận đơn hàng từ VietPro Store ",
            html,
        });
        console.log("Email xác nhận đã được gửi đến:", order.email);

        return res.redirect("/success");

    } else {
        // Thanh toán thất bại hoặc các resultCode khác
        console.log(`Thanh toán thất bại cho đơn hàng ${order._id} với resultCode: ${resultCode}.`);

        try {
            // --- XÓA ĐƠN HÀNG KHI THANH TOÁN THẤT BẠI ---
            await orderModel.deleteOne({ _id: momoOrderId });
            console.log(`Đã xóa đơn hàng ${momoOrderId} do thanh toán thất bại.`);
        } catch (deleteError) {
            console.error(`Lỗi khi xóa đơn hàng ${momoOrderId}:`, deleteError);
        }

        return res.redirect("/fail");
    }
};

module.exports={
    payment,
    callback
}