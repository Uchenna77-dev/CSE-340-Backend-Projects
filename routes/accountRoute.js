// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accountValidate = require('../utilities/account-validation')

// Route link to Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Route to Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Route to management view
router.get("/management", accountValidate.requireEmployeeOrAdmin, accountController.buildAccountManagement)


router.get("/update/:account_id", accountValidate.checkUpdateData, utilities.handleErrors(accountController.buildUpdateView))


router.get("/logout", accountController.logout)



router.post("/update",
accountValidate.updateRules(),
accountValidate.checkUpdateData,
utilities.handleErrors(accountController.updateAccount))

router.post("/update-password",
accountValidate.passwordRules(),
accountValidate.checkPasswordData,
utilities.handleErrors(accountController.updatePassword))

// Process the Login data
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
// Route to Post Registration
// Process the registration data
router.post(
  "/register",
  accountValidate.registationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Deliver account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)


module.exports = router;