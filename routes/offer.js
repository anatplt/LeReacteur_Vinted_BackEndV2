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
        product_available: true,
      });

      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);
module.exports = router;

/*=====================================OFFER=======================================*/

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    // filter
    const filter = {};
    if (title) {
      filter.product_name = new RegExp(title, "i");
    }
    if (priceMin && priceMax) {
      filter.product_price = { $gte: priceMin, $lte: priceMax };
    } else if (priceMin) {
      filter.product_price = { $gte: priceMin };
    } else if (priceMax) {
      filter.product_price = { $lte: priceMax };
    }
    // console.log(filter);

    // Sort
    const sortFilter = {};

    if (sort === "price-asc") {
      sortFilter.product_price = 1;
    }
    if (sort === "price-desc") {
      sortFilter.product_price = -1;
    }
    // console.log(sortFilter);

    // skip
    const limit = 5;

    let pageFilter = 1;

    if (page) {
      pageFilter = page;
    }
    const skip = (pageFilter - 1) * limit;
    // console.log(pageFilter);

    const filterOffer = await Offer.find(filter)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filter);

    res.status(200).json({ count: count, offer: filterOffer });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

/*=====================================OFFER_ID=======================================*/

router.get("/offer/:id", async (req, res) => {
  try {
    const findOfferById = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.status(200).json(findOfferById);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

/*=====================================EXPORT=======================================*/

module.exports = router;
