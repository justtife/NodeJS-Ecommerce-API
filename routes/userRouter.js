const userRouter = require("express").Router();
const {
  authenticatePass,
  checkRole,
} = require("../middlewares/authentication");
const { upload } = require("../utils");
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  changePassword,
  changeEmailBySecurityQuestion,
  deleteAccount,
} = require("../controllers/userController");

userRouter
  .route("/all-account")
  .get(authenticatePass, checkRole("admin"), getAllUsers);

userRouter
  .route("/update-account")
  .patch(authenticatePass, upload.single("user-image"), updateUser);
userRouter.route("/change-password").patch(authenticatePass, changePassword);
userRouter
  .route("/change-email")
  .patch(authenticatePass, changeEmailBySecurityQuestion);
userRouter.route("delete-account").delete(authenticatePass, deleteAccount);
userRouter.route("/user/:id").get(authenticatePass, getSingleUser);

module.exports = userRouter;
