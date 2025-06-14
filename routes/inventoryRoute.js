// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
const validate = require('../utilities/inventory-validation')
const accountValidate = require('../utilities/account-validation')

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

router.get(
  "/delete-classification/:classificationId",
  utilities.handleErrors(invController.showDeleteClassificationView)
);


router.post("/delete", utilities.handleErrors(invController.deleteInventoryItem))
  
// Route to handle inventory update
router.post("/update/",
  validate.inventoryRules(),
  invController.updateInventory,
  utilities.handleErrors(invController.updateInventory))  

// Route to handle classification submission
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassificationData,
  invController.addClassification,
  invController.showAddClassification
);

// Route to handle new vehicle submission
router.post(
  "/add-inventory",
  validate.inventoryRules(),
  validate.checkInventoryData,
  invController.addInventory,
  invController.showAddInventory
);

router.post(
  "/inv/delete-classification/:classificationId",
  accountValidate.requireAdmin,
  utilities.handleErrors(invController.deleteClassification)
);


module.exports = router;