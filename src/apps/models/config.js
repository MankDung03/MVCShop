const mongoose = require('../../common/database')()

const configSchema = new mongoose.Schema({
  logo_header: {
    type: String,
    required: true
  },
  logo_footer: {
    type: String,
    required: true
  },
  intro: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  hotline_phone: {
    type: Number,
    required: true
  },
  hotline_email: {
    type: String,
    required: true
  },
  allow: {
    type: Boolean,
    default: false
  },
  footer: {
    type: String,
    required: true
  },


}, { timestamps: true })

const configModel = mongoose.model('Configs', configSchema, 'configs')

module.exports = configModel