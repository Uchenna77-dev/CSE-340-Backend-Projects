// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const loginValidate = require('../utilities/account-validation')
// Route link to Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Route to Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process the Login data
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
)
// Route to Post Registration
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)


module.exports = router;