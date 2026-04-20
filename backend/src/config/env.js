const { cleanEnv, port, str, url } = require('envalid');

module.exports = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: url(),
  JWT_SECRET: str(),
});