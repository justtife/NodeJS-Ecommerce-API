const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // createdAt: { type: Date, expires: "2m", default: Date.now },
  },
  { timestamps: true }
);
// Set a token expiry when token not in use
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 3 });

module.exports = mongoose.model("Token", TokenSchema);
