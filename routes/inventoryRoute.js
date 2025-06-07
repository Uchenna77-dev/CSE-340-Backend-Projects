// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
const classificationValidate = require('../utilities/inventory-validation')
const inventoryValidate = require('../utilities/inventory-validation')
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to get vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invController.getInventoryItem));

// Create Error Route
router.get("/errors/serverError", utilities.handleErrors(invController.triggerError));

// Route to show add classification form
router.get("/add-classification", utilities.handleErrors(invController.showAddClassification));

// Route to show add inventory form
router.get("/add-inventory", utilities.handleErrors(invController.showAddInventory));

// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagementView))

// Route to get Inventroy by Classificatioon
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to Update Inventory
router.get("/edit/:inv_id",
  invController.editInventoryView,
  utilities.handleErrors(invController.editInventoryView))

// Deliver delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventoryView))

router.post("/delete", utilities.handleErrors(invController.deleteInventoryItem))
  
// Route to handle inventory update
router.post("/update/",
  inventoryValidate.inventoryRules(),
  invController.updateInventory,
  utilities.handleErrors(invController.updateInventory))  

// Route to handle classification submission
router.post(
  "/add-classification",
  classificationValidate.classificationRules(),
  classificationValidate.checkClassificationData,
  invController.addClassification,
  invController.showAddClassification
);

// Route to handle new vehicle submission
router.post(
  "/add-inventory",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  invController.addInventory,
  invController.showAddInventory
);



module.exports = router;