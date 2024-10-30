const mongoose = require("mongoose");
const { Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

//every item will be assigned a _id in mongodb which is guaranteed to be unique in that collection, so there is no need to explicitly mention uuid
const invoiceItemSchema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: mongoose.Decimal128, required: true },
  amount: { type: mongoose.Decimal128, required: true },
});

const billSundrySchema = new Schema({
  billSundryName: { type: String, required: true },
  amount: { type: mongoose.Decimal128, required: true },
});

const invoiceSchema = new Schema({
  date: { type: String, required: true },
  invoiceNumber: { type: Number, unique: true },
  customerName: { type: String, required: true },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  gstin: { type: String, required: true },
  totalAmount: { type: mongoose.Decimal128, required: true },
  invoiceItems: [invoiceItemSchema],
  billSundries: [billSundrySchema],
});




//the plugin will maintain a counter collection which is used to give an incrememnting number.
//Internally it ensures that access is not concurrent and is correct in batched asynchronous requests
invoiceSchema.plugin(AutoIncrement, { inc_field: "invoiceNumber" });



//Here, we write a method to update the total amount. We can batch multiple requests by passing items and sundrys as an array
// And instead of using the validate function in the server, we simply add to the total instead of verifying it again and again
invoiceSchema.methods.updateInvoice = async function (
  items = [],
  sundries = []
) {
  let newItemAmount = 0;
  let newSundryAmount = 0;

  // adding items if its an array
  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        typeof item.itemName === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.price === "number" &&
        item.price > 0 &&
        typeof item.amount === "number" &&
        item.amount > 0
      ) {
        this.invoiceItems.push(item);
        newItemAmount += item.amount;
      } else {
        throw new Error("Invalid item format: " + JSON.stringify(item));
      }
    });
  }

  // adding sundries if its an array
  if (Array.isArray(sundries)) {
    sundries.forEach((sundry) => {
      if (
        typeof sundry === "object" &&
        sundry !== null &&
        typeof sundry.billSundryName === "string" &&
        typeof sundry.amount === "number"
      ) {
        this.billSundries.push(sundry);
        newSundryAmount += sundry.amount;
      } else {
        throw new Error("Invalid sundry format: " + JSON.stringify(sundry));
      }
    });
  }

  // updating total amount
  this.totalAmount += newItemAmount + newSundryAmount;

  await this.save();
};

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
