const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Invoice = require("./models/invoice");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.CONNECTION_STRING);

app.use(bodyParser.json());

const validateInvoice = (invoice) => {
  let totalAmount = 0;

  // Validating invoice items
  for (const item of invoice.invoiceItems) {
    if (item.quantity <= 0 || item.price <= 0 || item.amount <= 0) {
      return "Invoice items must have quantity, price, and amount greater than zero.";
    }
    if (item.amount !== item.quantity * item.price) {
      return "Invoice item amount must equal quantity times price.";
    }
    totalAmount += item.amount;
  }

  // Validating bill sundries
  for (const sundry of invoice.billSundries) {
    if (sundry.amount === undefined) {
      return "Bill sundry amount must be defined.";
    } else if (sundry.billSundryName === undefined) {
      return "Bill sundry name is not valid.";
    }
    totalAmount += sundry.amount;
  }

  // Validating total amount
  if (totalAmount !== invoice.totalAmount) {
    return "Total amount must equal the sum of invoice items and bill sundries.";
  }

  return null;
};

// creating Invoice
app.post("/invoices", async (req, res) => {
  const invoice = req.body;
  const validationError = validateInvoice(invoice);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const newInvoice = new Invoice(invoice);
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// retrieve Invoice by ID
app.get("/invoices/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// updating Invoice
// As the items and sundrys are batched, the updates can be batched as well
app.put("/invoices/:id", async (req, res) => {
  const { items, sundries } = req.body;

  // validate that either items or sundries are arrays
  if (!Array.isArray(items) && !Array.isArray(sundries)) {
    return res.status(400).json({ error: "Items or sundries must be arrays." });
  }

  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found." });

    await invoice.updateInvoice(items, sundries);

    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});



// delete Invoice
app.delete("/invoices/:id", async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }
    res.json({ message: "Invoice deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// list all Invoices
app.get("/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
