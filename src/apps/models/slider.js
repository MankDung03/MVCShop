const mongoose = require('../../common/database')()

const sliderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  thumbnails: {
    type: String,
    required: true
  },
}, { timestamps: true })

const sliderModel = mongoose.model('Sliders', sliderSchema, 'sliders')

module.exports = sliderModel;