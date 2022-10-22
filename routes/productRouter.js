const productRouter = require("express").Router();
const multer = require("multer");
let storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
let upload = multer({
  storage: storage,
});
const {
  authenticatePass,
  checkRole,
} = require("../middlewares/authentication");

const productAPI = require("../controllers/productController");

const reviewAPI = require("../controllers/reviewController");

productRouter
  .route("/create")
  .post(
    [authenticatePass, checkRole("admin", "owner")],
    upload.array("product-image"),
    productAPI.createProduct
  );
productRouter.route("/all").get(productAPI.getAllProducts);

productRouter
  .route("/:id")
  .get(productAPI.getSingleProduct)
  .patch(
    [authenticatePass, checkRole("admin", "owner")],
    productAPI.updateProduct
  )
  .delete(
    [authenticatePass, checkRole("admin", "owner")],
    productAPI.deleteProduct
  );

productRouter.route("/:id/reviews").get(reviewAPI.getSingleProductReviews);

module.exports = productRouter;
