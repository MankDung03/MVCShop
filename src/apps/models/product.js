const mongoose = require("../../common/database")();
const productSchema = new mongoose.Schema({
    thumbnail: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
    },
    cat_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Categories",
    },
    status: {
        type: String,
        default:"",
    },
    featured: {
        type: Boolean,
        default:false,
    },
    promotion: {
        type: String,
        default:"",
    },
    warranty: {
        type: String,
        default:"",
    },
    accessories: {
        type: String,
        default:"",
    },
    is_stock: {
        type: Boolean,
        required: true,
    },
    name: {
        type: String,
        text: true,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    is_delete:{
        type: Boolean,
        default:false
    },
    stock:{
        type: Number,
        default:0
    }
},{
    timestamps: true,
});


const productModel = mongoose.model("Products",productSchema,"products");
module.exports = productModel;