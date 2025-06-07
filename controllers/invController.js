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
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
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
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
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
    })
  }
}


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
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildManagementView = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  let message = req.flash("info") || req.flash("error")
  
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    message,
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    message: req.flash("info").concat(req.flash("error")),
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 * Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult.rowCount) {
    req.flash("notice", "Inventory item was successfully deleted.")
    res.redirect("/inv")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}


module.exports = invCont;
