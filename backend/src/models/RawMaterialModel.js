const pool = require('../db');

//Criar matéria prima 
const create = async (name, unit_cost, unit, stock) => {
    const query = `
    INSERT INTO raw_materials (name, unit_cost, unit, stock)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `;
    const result = await pool.query(query, [name, unit_cost, unit, stock]);
    return result.rows[0];
};

//Listar todos 
const findAll = async () => {
    const result = await pool.query(`SELECT * FROM raw_materials ORDER BY id`);
    return result.rows;
};

//Buscar por ID
const findById = async  (id) => {
    const result = await pool.query(`SELECT * FROM raw_materials WHERE id = $1`, [id]);
    return result.rows[0];
};

//Atualizar 
const update = async (id, name, unit_cost, unit, stock) => {
    const query = `
    UPDDATE raw_materials
    SET name = $1, unit_cost = $2, unit = $3, stock = $4
    WHERE id = $5
    RETURNING *
    `;
    const result = await pool.query(query, [name, unit_cost, unit, stock, id]);
    return result.rows[0];
};

//Eliminar 
const remove = async (id) => {
    const result = await pool.query(`DELETE FROM raw_materials WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {create, findAll, findById, update, remove}