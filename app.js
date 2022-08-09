const { urlencoded } = require("express");
const express = require("express");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/api_web_tech_assignment")
  .then(() => {
    console.log("successfully connected to database")
  }, (err) => {
    console.log(err)
  })

const inventorySchema = mongoose.Schema({
  Inventory_id: {
    type: String,
    unique: true,
    required: true,
  },
  Inventory_type: {
    type: String,
    required: true,
  },
  Item_name: {
    type: String,
    required: true,
  },
  Available_quantity: {
    type: Number,
    required: true,
  }
})

const customerSchema = mongoose.Schema({
  Customer_id: {
    type: String,
    unique: true,
    required: true,
  },
  Customer_name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    unique: true,
    required: true,
  }
})

const orderSchema = mongoose.Schema({
  Customer_id: {
    type: String,
    required: true,
  },
  Inventory_id: {
    type: String,
    required: true,
  },
  Item_name: {
    type: String,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
  }
})

const inventory = mongoose.model("inventory", inventorySchema);
const customers = mongoose.model("customers", customerSchema);
const orders = mongoose.model("orders", orderSchema);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get('/inventory', async (req, res) => {
  const inventoryInfo = await inventory.find();
  res.render("inventory", { inventoryInfo });
})

app.post("/inventory", async (req, res) => {
  console.log(req.body);
  const rawData = new inventory(req.body);
  try {
    let data = await rawData.save();
    res.send(data);
  } catch (err) {
    console.log(err)
  }
})

app.get("/customers", async (req, res) => {
  const customersInfo = await customers.find();
  res.render("customers", { customersInfo });
})

app.post("/customers", async (req, res) => {
  console.log(req.body);
  const rawData = new customers(req.body);
  try {
    let data = await rawData.save();
    res.send(data);
  } catch (err) {
    console.log(err);
  }
})

app.get("/orders", async (req, res) => {
  const ordersInfo = await orders.find();
  res.render("orders", {ordersInfo})
})

app.post("/orders", async (req, res) => {
  console.log(req.body);
  const info = await inventory.find({Inventory_id: req.body.Inventory_id});
  if (info.length === 0 || info.Available_quantity < req.body.Quantity) {
    res.send("Out of Stock");
  } else {
    const newAvailable_quantity = info[0].Available_quantity - req.body.Quantity;
    await inventory.updateOne(
      {Inventory_id: req.body.Inventory_id},
      { $set: {Available_quantity: newAvailable_quantity} }
    )
    let rawData = new orders(req.body);
    try {
      let data = await rawData.save();
      res.send(data);
    } catch (err) {
      console.log(err);
    }
  }
})

app.listen(3001, () => {
  console.log("server listening on port 3001");
})