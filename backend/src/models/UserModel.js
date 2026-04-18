// Importa a liigação à base de dados (o ficheiro db.js que criámos)
const pool = require('../db');

//Função para criar um novo utilizador 
//Receber name, email, password_hash (já encriptada)
const create = async (name, email, password_hash) => {
    //Query SQL com placeholders ($1, $2, $3) para previnir SQL injection
    const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
    `;
    //Executa a query com os valores
    const result = await pool.query(query, [name, email, password_hash]);
    //Retorna o user criado (sem o password)
    return result.rows[0];
};

//Função para encontrar um utilizador pelo email
const findByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0]; // pode ser undefined se não existir
};

//Função para encontrar um  utilizador pe ID
const findById = async (id) => {
    const query = `SELECT id, name, email, created_at FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

//Atualizar dados do utilizador (nome, email)
const updateProfile = async (id, name, email) => {
    const query = `
    UPDATE users
    SET name = $1, email = $2
    WHERE id = $3
    RETURNING id, name, email, created_at
    `;
    const result = await pool.query(query, [name, email, id]);
    return result.rows[0];
};

//Atualizar apenas a password
const updatePassword = async (id, password_hash) => {
    const query = `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
    RETURNING id
    `;
    await pool.query(query, [password_hash, id]);
    return true;
};

//Exporta as funções para serem usadas noutros ficheiros
module.exports  = { create, findByEmail, findById, updateProfile, updatePassword};