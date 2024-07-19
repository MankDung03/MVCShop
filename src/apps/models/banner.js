const mongoose = require('../../common/database')()

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  thumbnails: {
    type: String,
    required: true
  },
}, { timestamps: true })

const bannerModel = mongoose.model('Banners', bannerSchema, 'banners')

module.exports = bannerModel