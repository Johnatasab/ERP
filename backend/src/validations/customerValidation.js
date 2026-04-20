const Joi = require('joi');

const createCustomerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{9}$/).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  nif: Joi.string().length(9).pattern(/^[0-9]{9}$/).optional().allow('')
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{9}$/).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  nif: Joi.string().length(9).pattern(/^[0-9]{9}$/).optional().allow('')
}).min(1); // pelo menos um campo para atualizar

// Schema para parâmetro de rota (ex: /:id)
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  createCustomerSchema, updateCustomerSchema, idParamSchema
};