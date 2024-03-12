const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

const {
    userRegister,
    userLogin,
    confirmedCode,
    forgotPassword,
    resetPassword,
    resendCode,
    uploadImage,
    userUpdatePersonalInfo
} = require("../controllers/userController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.post("/register", [
    // Add express-validator checks here
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 })
], userRegister);

router.post("/auth/confirmed",[
    // Add express-validator checks here
    check("email").isEmail(),
    check("code").isLength({ min: 4 })
], confirmedCode);
router.post("/login",[
    // Add express-validator checks here
    check("email").isEmail(),
    check("password").isLength({ min: 6 })
],

userLogin);
router.post("/forgotpassword",[
    // Add express-validator checks here
    check("email").isEmail()
],

forgotPassword);
router.post("/resendcode",[
    // Add express-validator checks here
    check("email").isEmail()
],
resendCode);

router.post("/resetpassword/:token", [
    // Add express-validator checks here
    check("password").isLength({ min: 6 })
], resetPassword);
//update user profile
router.put("/updatepersonalinfo", jwtMiddleware,  userUpdatePersonalInfo);
//image upload
router.post("/upload", jwtMiddleware, upload.single("profileImage"), uploadImage);

module.exports = router;
