const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ error: messages });
  }
  req.body = value; // substitui pelos valores já convertidos (ex: números)
  next();
};

module.exports = validate;