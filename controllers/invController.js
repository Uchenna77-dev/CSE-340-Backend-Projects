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

module.exports = invCont;
