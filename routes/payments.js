const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET_KEY);
const Offer = require("../models/Offer");

router.post("/pay", async (req, res) => {
  try {
    console.log(req.body);
    const { stripeToken, product_name, product_price, idOffer, token } =
      req.body;

    const response = await stripe.charges.create({
      amount: (product_price * 100).toFixed(0),
      currency: "eur",
      description: `Paiement pour ${req.body.title} pour Vinted`,
      source: stripeToken,
    });
    console.log(response.status);

    if (response.status === "succeeded") {
      const findOffer = await Offer.findByIdAndUpdate(
        { _id: idOffer },
        { product_available: false }
      );
    }

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
