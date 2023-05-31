const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const User = require("../models/User");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");

/*=====================================SIGNUP=======================================*/

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    // console.log(req.body);
    const { username, email, password, newsletter } = req.body;

    if (!username || !password || !email) {
      return res.status(409).json({ message: "Please complete all input" });
    }

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(409).json({ message: "This User as already exist !" });
    }

    //   console.log(username, email, password, newsletter);
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(64);

    const newUser = new User({
      email,
      account: {
        username,
      },
      newsletter,
      salt,
      hash,
      token,
    });

    if (req.files) {
      const uploadAvatar = req.files.picture;
      const responseCloudinary = await cloudinary.uploader.upload(
        convertToBase64(uploadAvatar),
        { folder: "Vinted_V2/users" }
      );
      newUser.account.avatar = responseCloudinary;
    }

    const returnUser = {
      _id: newUser.email,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    };
    await newUser.save();
    res.status(201).json(returnUser);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/*=====================================LOGIN=======================================*/

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);

    const userExist = await User.findOne({ email: email });

    if (!userExist) {
      return res.status(401).json({ message: "Unathorized 1" });
    }

    // si il existe
    const newHash = SHA256(userExist.salt + password).toString(encBase64);

    if (newHash !== userExist.hash) {
      return res.status(401).json({ message: "Unathorized 2" });
    }
    const returnLogin = {
      _id: userExist._id,
      token: userExist.token,
      account: {
        username: userExist.account.username,
      },
    };
    res.status(200).json(returnLogin);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
