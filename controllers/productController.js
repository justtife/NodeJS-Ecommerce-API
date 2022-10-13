const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom");
const cloudinary = require("cloudinary").v2;

module.exports = class ProductAPI {
  static async createProduct(req, res) {
    var product_images = [];
    var main_product_image = "";
    if (req.file) {
      const main_image = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "product-main-images",
      });
      main_product_image = main_image.public_id + " " + main_image.url;
    } else if (req.files) {
      const main_image = await cloudinary.uploader.upload(req.files[0].path, {
        use_filename: true,
        folder: "product-main-images",
      });
      for (let i = 1; i < req.files.length; i++) {
        const other_images = await cloudinary.uploader.upload(
          req.files[i].path,
          {
            use_filename: true,
            folder: "product-images",
          }
        );
        product_images.push(other_images.public_id + " " + other_images.url);
      }
      main_product_image = main_image.public_id + " " + main_image.url;
    }
    let productDetails = {
      name: req.body.name,
      "price.main": req.body.main_price,
      "price.display": req.body.display_price,
      description: req.body.description,
      "image.main": main_product_image,
      "image.others": product_images,
      category: req.body.category,
      colors: req.body.color,
      featured: req.body.featured,
      admin: req.user.userID,
    };
    const product = await Product.create(productDetails);
    res.status(StatusCodes.CREATED).json({ product });
  }
  static async getAllProducts(req, res, next) {
    const products = await Product.find({}).select(" -admin ");
    res.status(StatusCodes.OK).json({ products, count: products.length });
  }
  static async getSingleProduct(req, res, next) {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate(
      "reviews"
    );

    if (!product) {
      return next(
        CustomError.NotFoundError(`No product with id : ${productId}`)
      );
    }

    res.status(StatusCodes.OK).json({ product });
  }
  static async updateProduct(req, res, next) {
    const { id: productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return new (CustomError.NotFoundError(
        `No product with id : ${productId}`
      ))();
    }

    res.status(StatusCodes.OK).json({ product });
  }
  static async deleteProduct(req, res, next) {
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return next(
        CustomError.NotFoundError(`No product with id : ${productId}`)
      );
    }

    await product.remove();
    res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
  }
};
