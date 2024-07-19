module.exports = (req, res, next)=>{
    if(!req.session.email){
        req.session.email = "";
        req.session.cart = [];
    }
    if(!req.session.cart){
        req.session.cart = [];
    }

    next();
};