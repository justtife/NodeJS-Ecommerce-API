const reviewRouter = require("express").Router();
const reviewAPI = require("../controllers/reviewController");
const { authenticatePass } = require("../middlewares/authentication");

reviewRouter.route("/create").post(authenticatePass, reviewAPI.createReview);
reviewRouter.route("/all").get(reviewAPI.getAllReviews);

reviewRouter.route("/:id").get(reviewAPI.getSingleReview);
reviewRouter.route("/:id/update").patch(authenticatePass, reviewAPI.updateReview);
reviewRouter.route("/:id/delete").delete(authenticatePass, reviewAPI.deleteReview);

module.exports = reviewRouter;
