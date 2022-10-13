const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom");
const cloudinary = require("cloudinary");

const createProduct = async (req, res) => {
  req.body.admin = req.user.userID;
  
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res, next) => {
  const products = await Product.find({}).select(" -admin ");
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res, next) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    return next(CustomError.NotFoundError(`No product with id : ${productId}`));
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res, next) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return new (CustomError.NotFoundError(
      `No product with id : ${productId}`
    ))();
  }

  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res, next) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return next(CustomError.NotFoundError(`No product with id : ${productId}`));
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
