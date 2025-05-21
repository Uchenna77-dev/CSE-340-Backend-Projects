const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  console.log(data);
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +
        '" title="View ' + vehicle.inv_make + " " + vehicle.inv_model +
        ' details"><img src="' + vehicle.inv_thumbnail +
        '" alt="Image of ' + vehicle.inv_make + " " + vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' +
        vehicle.inv_make + " " + vehicle.inv_model + ' details">' +
        vehicle.inv_make + " " + vehicle.inv_model + "</a>";
      grid += "</h2>";
      grid += "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
* Utility for HTML formatting
* ************************************ */
Util.generateVehicleHTML = function (vehicle) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>${vehicle.inv_make} ${vehicle.inv_model}</title>
      <link rel="stylesheet" href="/css/styles.css">
      <script src="/js/script.js"></script>
    </head>
    <body>
      <header>
        <h1>CSE Motors</h1>
        <h3>MY ACCOUNT</h3>
      </header>
      <nav>
        <ul>
          <li><a href="Home">Home</a></li>
          <li><a href="Custom">Custom</a></li>
          <li><a href="Sedan">Sedan</a></li>
          <li><a href="SUV">SUV</a></li>
          <li><a href="Truck">Truck</a></li> 
        </ul>
      </nav>
      <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="vehicle-container">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-details">
            <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
            <p><strong>Price: $${vehicle.inv_price.toLocaleString('en-US')}</strong></p>
            <p><strong>Description:</strong> ${vehicle.inv_description}</p>
            <p><strong>Color:</strong> ${vehicle.inv_color}</p>
            <p><strong>Year:</strong> ${vehicle.inv_year}</p>
            <p><strong>Mileage:</strong> ${vehicle.inv_miles.toLocaleString('en-US')} miles</p>  
        </div>
      </div>
      <footer>
        <p>&copy; <span id="year"></span> CSE 340 App </p>
        <p><a href="/error">Server Error</a></p>
      </footer>
    </body>
    </html>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* Export everything properly */
module.exports = Util;
