const pagination = require('./pagination'); // cái bạn đang dùng để tạo mảng số trang


async function paginate(model, filter, page = 1, limit = 9, sort = { _id: -1 }) {
  const skip = (page - 1) * limit;
  const totalRows = await model.find(filter).countDocuments();
  const totalPages = Math.ceil(totalRows / limit);
  const products = await model.find(filter).sort(sort).limit(limit).skip(skip);
  const pages = pagination(page, limit, totalRows);
  
  return {
    results: products,
    page,
    totalPages,
    totalRows,
    pages,
  };
}

module.exports = paginate;
