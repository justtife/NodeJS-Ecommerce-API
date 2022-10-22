const Review = require("../models/Review");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom");
const { checkPermission } = require("../utils");

module.exports = class ReviewAPI {
  static async createReview(req, res, next) {
    const { product: productNum } = req.body;
    console.log("ProductId ----------------");
    console.log(productNum);
    const isValidProduct = await Product.findOne({ product_num: productNum });

    if (!isValidProduct) {
      return next(
        CustomError.NotFoundError(`No product with product number : ${productNum}`)
      );
    }

    const alreadySubmitted = await Review.findOne({
      product: productNum,
      user: req.user.userID,
    });

    if (alreadySubmitted) {
      return next(
        CustomError.BadRequestError("Already submitted review for this product")
      );
    }

    req.body.user = req.user.userID;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
  }
  static async getAllReviews(req, res) {
    const reviews = await Review.find({}).populate({
      path: "product",
      select: "name price",
    });

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  }
  static async getSingleReview(req, res, next) {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
      return next(CustomError.NotFoundError(`No review with id ${reviewId}`));
    }

    res.status(StatusCodes.OK).json({ review });
  }
  static async updateReview(req, res, next) {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
      return next(CustomError.NotFoundError(`No review with id ${reviewId}`));
    }

    checkPermission(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    res.status(StatusCodes.OK).json({ review });
  }
  static async deleteReview(req, res, next) {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
      return next(CustomError.NotFoundError(`No review with id ${reviewId}`));
    }

    checkPermission(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
  }
  static async getSingleProductReviews(req, res) {
    const { id: productNum } = req.params;
    const reviews = await Review.find({ product_num: productNum });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  }
};
