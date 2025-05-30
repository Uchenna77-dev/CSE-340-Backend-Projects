const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/");
const validate = {};

/***********************************
 *  Classification Validation Rules
 ***********************************/
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters.")
  ];
};

/******************************************
 * Check Classification Data and Return Errors
 ******************************************/
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  const { classification_name } = req.body;

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();

    // Store errors as flash message
    const errorMessages = errors.array().map(err => err.msg);
    req.flash("error", errorMessages);

    // Store sticky input via session (optional enhancement)
    req.session.classification_name = classification_name;

    res.redirect("/inv/add-classification"); // redirect instead of render
    return;
  }
  next();
};


/***********************************
 *  Inventory Validation Rules
 ***********************************/
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Vehicle make is required."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Vehicle model is required."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative integer."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),

    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required.")
  ];
};

/******************************************
 * Check Inventory Data and Return Errors
 ******************************************/
validate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req);
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList(classification_id);

    req.flash("error", errors.array().map(err => err.msg));

    req.session.formData = {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    };

  res.redirect("/inv/add-inventory");

    return;
  }
  next();
};

module.exports = validate;
