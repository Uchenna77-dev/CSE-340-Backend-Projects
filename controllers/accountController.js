const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav(); // Load navigation
    res.render("account/login", {
      title: "Login",
      nav,
      message: req.flash("info") // This will show flash messages (like errors or success notices)
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
      errors: null
    });
  } catch (error) {
    next(error); // Passes errors to Express error handler
  }  
}


async function loginAccount(req, res) {
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
}



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
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount };
 