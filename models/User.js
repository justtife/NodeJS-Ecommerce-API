const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, "Firstname field is required"],
        minlength: [3, "Firstname field should contain more than 2 characters"],
      },
      last: {
        type: String,
        required: [true, "Lastname field is required"],
        minlength: [3, "Lastname field should contain more than 2 characters"],
      },
    },
    email: {
      type: String,
      required: [true, "Email field is required"],
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
      unique: [true, "Email already exist, please register with another email"],
    },
    phone_number: {
      type: Number,
      required: [true, "Phone Number field is required"],
      min: [8, "Phone Number field should contain more than 7 digits"],
    },
    security_question: {
      type: String,
      required: [true, "Security Question field is required"],
    },
    country: {
      type: String,
      required: [true, "Country field is required"],
    },
    sex: String,
    password: {
      type: String,
      required: [true, "Password field is required"],
      minlength: [6, "Password field should contain more than 5 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: {
        values: ["owner", "admin", "user"],
        message: "{VALUE} not supported",
      },
      default: "user",
    },
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenExpiry: Date,
    verified: Date,
    passwordToken: String,
    passwordtokenExpiry: Date,
    smsToken: Number,
    smsTokenExpiry: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePass = async function (pass) {
  const isValid = await bcrypt.compare(pass, this.password);
  return isValid;
};

module.exports = mongoose.model("User", UserSchema);
