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
      console.log("Main Image successfully added to cloudinary");
      main_product_image = main_image.public_id + " " + main_image.url;
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
    }
    console.log("Other product images successfully added to cloudinary");
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
    console.log("Product successfully created");
    res.status(StatusCodes.CREATED).json({ product });
  }
  static async getAllProducts(req, res, next) {
    const products = await Product.find({}).select(" -admin ");
    res.status(StatusCodes.OK).json({ products, count: products.length });
  }
  static async getSingleProduct(req, res, next) {
    const { id: productId } = req.params;
    const product = await Product.findOne({ product_num: productId }).populate(
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
    const product = await Product.findOne({ product_num: productId });
    if (!product) {
      return next(CustomError.NotFoundError("No product was found"));
    }
    console.log(product);
    console.log(product.image.main);
    console.log(product.image.others);
    await cloudinary.uploader.destroy(product.image.main.split(" ")[0]);
    console.log("Old product image successfully removed from cloudinary");
    product.image.others.forEach(async (image) => {
      await cloudinary.uploader.destroy(image.split(" ")[0]);
    });
    console.log("Other images successfully removed from cloudinary");
    var product_images = [];
    var main_product_image = "";
    if (req.file) {
      const main_image = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "product-main-images",
      });
      console.log("Added new image to cloudinary successfully");
      main_product_image = main_image.public_id + " " + main_image.url;
    } else if (req.files) {
      const main_image = await cloudinary.uploader.upload(req.files[0].path, {
        use_filename: true,
        folder: "product-main-images",
      });
      console.log("Added main image to cloudinary successfully");
      main_product_image = main_image.public_id + " " + main_image.url;
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
      console.log("Other product images added to cloudinary successfully");
    }
    product.name = req.body.name;
    product.price.main = req.body.main_price;
    product.price.display = req.body.display_price;
    product.description = req.body.description;
    product.image.main = main_product_image;
    product.image.others = product_images;
    product.category = req.body.category;
    product.colors = req.body.color;
    product.featured = req.body.featured;
    product.admin = req.user.userID;
    await product.save();
    res.status(StatusCodes.OK).json({ product });
  }
  static async deleteProduct(req, res, next) {
    const { id: productId } = req.params;

    const product = await Product.findOne({ product_num: productId });

    if (!product) {
      return next(
        CustomError.NotFoundError(`No product with id : ${productId}`)
      );
    }

    await product.remove();
    res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
  }
};
