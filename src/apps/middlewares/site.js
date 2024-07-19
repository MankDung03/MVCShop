const customerModel = require("../models/customer");

const checkCustomer =  async (req, res, next)=>{
    const customer = await customerModel.findOne({email: req.session.email});
    res.locals.customer = customer;
    next();
}

module.exports = {
    checkCustomer,
};
