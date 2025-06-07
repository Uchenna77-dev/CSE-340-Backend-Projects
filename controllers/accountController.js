const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav(); // Load navigation
    res.render("account/login", {
      title: "Login",
      nav,
      message: req.flash("info"), // This will show flash messages (like errors or success notices)
      errors: null,
    });
  } catch (error) {
    next(error); // Passes errors to Express error handler
  }  
}

async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav(); // Load navigation
    res.render("account/register", {
      title: "Register",
      nav,
      message: req.flash("info"),
      errors: null
    });
  } catch (error) {
    next(error); // Passes errors to Express error handler
  }  
}


/*async function loginAccount(req, res) {
  const { account_email, account_password } = req.body;

  const user = await accountModel.validateUser(account_email, account_password);

  const nav = await utilities.getNav();

  if (!user) {
    req.flash("info", "Invalid email or password."); // Set flash message
    res.status(401).render("account/login", {
      title: "Login",
      nav,
      message: req.flash("info"),
      account_email,
    });
    return;
  }

  // Login successful
  req.session.user = user;
  res.redirect("/account/dashboard");
}*/



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      message: req.flash("notice"),
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      message: req.flash("notice"),
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      message: req.flash("notice"),
    })
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav();

  // Check if user is logged in
  if (!res.locals.accountData) {
    req.flash("notice", "You must be logged in.");
    return res.redirect("/account/login");
  }

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    message: req.flash("notice"),
    errors: null
  });
}


/* Display account update form */
async function buildUpdateView(req, res) {
  const account_id = parseInt(req.params.account_id)
  const account = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account,
  })
}

/* Handle basic account info update */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  const nav = await utilities.getNav()
  if (updateResult) {
    req.flash("notice", "Account successfully updated.")
    const accountData = await accountModel.getAccountById(account_id)
    res.redirect("/account")
  } else {
    req.flash("notice", "Update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* Handle password update */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account")
  } else {
    req.flash("notice", "Password update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
 * Process Logout
 * *************************************** */
async function logout(req, res) {
  res.clearCookie("jwt") // Clear the JWT token cookie
  req.flash("notice", "You have successfully logged out.")
  return res.redirect("/") // Or redirect to "/home"
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, updateAccount, updatePassword, buildUpdateView, logout };
 