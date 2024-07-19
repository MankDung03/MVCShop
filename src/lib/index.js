const formetter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
}); // format lai toan bo tien trong trang web

module.exports = {
    formetter
};
