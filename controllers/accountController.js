const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
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

    // Validate user credentials using your model
    const user = await accountModel.validateUser(account_email, account_password);
    
    if (!user) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            title: "Login",
            nav,
            errors,
            account_email,
            account_password,
        });
        return;
    }

    // Set session if login successful
    req.session.user = user;
    res.redirect("/account/dashboard"); // Redirect to user dashboard after login
};


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
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
 