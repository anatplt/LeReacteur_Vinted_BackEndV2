const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../midleware/isAuthenticated");

/*=====================================OFFER_PUBLISH=======================================*/
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.body);
      //   console.log(req.files.picture);
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const uploadPicture = req.files.picture;
      //   console.log(uploadPicture);

      const responseCloudinary = await cloudinary.uploader.upload(
        convertToBase64(uploadPicture),
        { folder: "Vinted_V2/offers" }
      );
      //   console.log(responseCloudinary);

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COLOR: color },
          { EMPLACEMENT: city },
        ],
        product_image: responseCloudinary,
        owner: req.user,
      });

      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);
module.exports = router;
