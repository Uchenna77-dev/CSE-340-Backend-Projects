const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* *****************************************
 *  Get all vehicle details by inventory_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const vehicle = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    return vehicle.rows[0] || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/* ***************************
 *  Insert a new classification
 * ************************** */
async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("insertClassification error:", error);
    throw error;
  }
}

/* ***************************
 *  Insert a new inventory
 * ************************** */
async function insertInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
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
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Insert inventory failed: " + error.message);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    throw new Error("Delete Inventory Error: " + error)
  }
}


async function countVehiclesByClassification(classification_id) {
  const result = await pool.query(
    "SELECT COUNT(*) FROM inventory WHERE classification_id = $1",
    [classification_id]
  );
  return parseInt(result.rows[0].count);
}

async function getAllClassifications() {
  const sql = "SELECT classification_id, classification_name FROM classification ORDER BY classification_name";
  const result = await pool.query(sql);
  return result.rows;
}


/* ***************************
 *  Delete Classification by ID
 * ************************** */
async function deleteClassificationById(classification_id) {
  try {
    const sql = 'DELETE FROM classification WHERE classification_id = $1';
    const result = await pool.query(sql, [classification_id]);
    return result;
  } catch (error) {
    throw new Error("Delete Classification Error: " + error.message);
  }
}


/* Export all functions properly */
module.exports = { 
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory,
  updateInventory,
  deleteInventoryItem,
  countVehiclesByClassification,
  getAllClassifications,
  deleteClassificationById
};
