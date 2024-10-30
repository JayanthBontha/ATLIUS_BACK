const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const invoiceItemSchema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: mongoose.Decimal128, required: true },
  amount: { type: mongoose.Decimal128, required: true }
});


const billSundrySchema = new Schema({
  billSundryName: { type: String, required: true },
  amount: { type: mongoose.Decimal128, required: true }
});


const invoiceSchema = new Schema({
  date: { type: String, required: true }, 
  invoiceNumber: { type: Number },
  customerName: { type: String, required: true },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  gstin: { type: String, required: true },
  totalAmount: { type: mongoose.Decimal128, required: true },
  invoiceItems: [invoiceItemSchema],
  billSundries: [billSundrySchema]
});


  
invoiceSchema.plugin(AutoIncrement, { inc_field: 'invoiceNumber' });
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
