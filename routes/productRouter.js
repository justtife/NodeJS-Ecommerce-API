const productRouter = require("express").Router();
const {
  authenticatePass,
  checkRole,
} = require("../middlewares/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// const { getSingleProductReviews } = require("../controllers/reviewController");

productRouter
  .route("/create-product")
  .post([authenticatePass, checkRole("admin")], createProduct);
productRouter.route("/all-products").get(getAllProducts);

productRouter
  .route("/product/:id")
  .get(getSingleProduct)
  .patch([authenticatePass, checkRole("admin")], updateProduct)
  .delete([authenticatePass, checkRole("admin")], deleteProduct);

// router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = productRouter;
