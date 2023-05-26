const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: Object,
  },
  newsletter: Boolean,
  token: String,
  salt: String,
  hash: String,
});

module.exports = User;
