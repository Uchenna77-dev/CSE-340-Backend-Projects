const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const accountModel = require("../models/account-model")
  const jwt = require('jsonwebtoken');
  const validate = {}



  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.loginRules = () => {
    return [  
      // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required."),
        
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
          }
        }),
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors: errors.array(),
      message: req.flash("info"),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to Login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email, account_password } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors: errors.array(),
      message: req.flash("info"),
      title: "Login",
      nav,
      account_email,
      account_password,
    })
    return
  }
  next()
}
 
validate.updateRules = () => {
  return [
    body("account_firstname").notEmpty().withMessage("First name is required."),
    body("account_lastname").notEmpty().withMessage("Last name is required."),
    body("account_email").isEmail().withMessage("Valid email required."),
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account: req.body
    })
  }
  next()
}

validate.passwordRules = () => {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password must meet requirements."),
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account: req.body
    })
  }
  next()
}

/* ****************************************
 *  Validates if the user is an Employee or Admin
 * ************************************ */
validate.requireEmployeeOrAdmin = async(req, res, next) =>{
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "You must be logged in.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      res.locals.accountData = decoded
      next()
    } else {
      req.flash("notice", "You are not authorized.")
      res.redirect("/account/login")
    }
  } catch (err) {
    req.flash("notice", "Invalid token.")
    res.redirect("/account/login")
  }
}

validate.requireAdmin = async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("Token:", token);
  if (!token) {
    req.flash("notice", "You must be logged in.");
    return res.redirect("/account/login");
  }

  try {
    console.log("Secret:", process.env.ACCESS_TOKEN_SECRET);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("✅ Token decoded:", decoded);
    if (decoded.account_type === "Admin") {
      console.log("✅ Admin access granted");

      res.locals.accountData = decoded;
      next();
    } else {
      req.flash("notice", "You are not authorized to perform this action.");
      return res.redirect("/account/login");
    }
  } catch (err) {
    console.error("JWT verify error:", err.message);
    req.flash("notice", "Invalid token.");
    return res.redirect("/account/login");
  }
};


module.exports = validate