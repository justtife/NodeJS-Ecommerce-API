const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const ProductSchema = new mongoose.Schema(
  {
    product_num: {
      type: String,
      default: randomUUID,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      main: {
        type: Number,
        default: 0,
      },
      display: {
        type: Number,
        required: [true, "Please provide product price"],
      },
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    image: {
      main: {
        type: String,
        required: [true, "Please provide a product image"],
      },
      others: {
        type: Array,
      },
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: {
        values: ["Fabrics", "Footwears", "Accessories", "Clothings", "Others"],
        message: "{VALUE} is not supported",
      },
      default: "Others",
    },
    colors: {
      type: [String],
      default: ["white"],
      required: true,
    },
    featured: {
      type: String,
      enum: {
        values: ["New", "Recent", "Trending", "Classic"],
        message: "{VALUE} not supported",
      },
    },
    inventory: {
      type: Number,
      required: true,
      default: 1,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    admin: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "product_num",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
