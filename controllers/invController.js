const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Display vehicle details
 * ************************** */
invCont.getInventoryItem = async function (req, res) {
  const inv_id = req.params.inv_id;

  try {
    const vehicleData = await invModel.getVehicleById(inv_id);
    console.log("Retrieved vehicle data:", vehicleData);

    if (!vehicleData) {
      return res.status(404).send("Vehicle not found");
    }

    const vehicleHTML = utilities.generateVehicleHTML(vehicleData);
    res.send(vehicleHTML);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

/* ***************************
 * Generate intentional error
 * ************************** */
invCont.triggerError = (req, res, next) => {
    try {
        throw new Error("Intentional Server Error");
    } catch (error) {
        next(error);
    }
};

invCont.addClassification = async function(req, res) {
  const { classification_name } = req.body;
  console.log("Incoming classification name:", classification_name); // 🔍 debug line

  try {
    const newClassification = await invModel.insertClassification(classification_name);
    req.flash("info", "Classification added successfully.");
    res.redirect("/inv/management");
  } catch (error) {
    console.error("Insert error:", error.message); 
    req.flash("error", "Failed to add classification.");
    res.redirect("/inv/add-classification");
  }
};


/* ***************************
 * Show add classification form
 * ************************** */
invCont.showAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();

    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("info").concat(req.flash("error")),
      classification_name: req.session.classification_name || "" // sticky value
    });

    // Clear the sticky data
    req.session.classification_name = null;
  } catch (error) {
    next(error);
  }
};


/* ***************************
 * Add inventory form
 * ************************** */
invCont.addInventory = async function (req, res, next) {
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
  console.log("Incoming inventory data:", req.body);

  try {
    const result = await invModel.insertInventory(
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
    );

    req.flash("info", "Inventory item added successfully!");
    res.redirect("/inv/management");
  } catch (error) {
    console.error("Error adding inventory:", error.message);
    req.flash("error", "Failed to add inventory item.");
    res.redirect("/inv/add-inventory");
  }
};

/* ***************************
 * Show add inventory form
 * ************************** */
invCont.showAddInventory = async function (req, res, next) {
  try { 
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // Select list for classifications

    const formData = req.session.formData || {};
    req.session.formData = null;

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      message: req.flash("info").concat(req.flash("error")),
      errors: null,
      // These are the sticky input values, initially blank
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildManagementView = async function (req, res) {
  let nav = await utilities.getNav()
  let message = req.flash("info") || req.flash("error")
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message,
  })
}


module.exports = invCont;
