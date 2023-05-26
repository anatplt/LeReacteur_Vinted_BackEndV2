const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    // console.log(token);
    const findUser = await User.findOne({ token: token }).select("account");

    if (!findUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = findUser;
    // console.log(req.user);
    next();
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = isAuthenticated;
