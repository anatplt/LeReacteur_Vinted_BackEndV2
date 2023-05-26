/*=====================================SETUP=======================================*/

/*==============IMPORT_PACKAGE================*/
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

/*=======================*/
app.use(express.json());
app.use(morgan("dev"));

/*=====================================BDD=======================================*/
mongoose.connect("mongodb://localhost/Vinted_V2");

/*=================================CLOUDINARY===================================*/

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*=====================================ROUTE=======================================*/
/*==============IMPORT_ROUTE================*/

const userRoute = require("./routes/user");
const offerRoute = require("./routes/offer");

app.use(userRoute);
app.use(offerRoute);

/*==============DEFAULT_ROUTE================*/

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur mon Backend Vinted 🤗" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This Route do not exist 🔴" });
});

/*=====================================LANCEMENT SERVEUR=======================================*/
app.listen(3000, () => {
  console.log("Serveur Started 🟢");
});
