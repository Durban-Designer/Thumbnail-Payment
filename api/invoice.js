var mongoose = require("mongoose");

var InvoiceSchema = new mongoose.Schema({
  amount: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timeIssued: {
    type: String,
    required: true
  },
  timePaid: {
    type: String,
    required: false
  },
  paid: {
    type: Boolean,
    required: false,
    default: false
  }
})

var Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;
