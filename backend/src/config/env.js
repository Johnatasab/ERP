const { cleanEnv, port, str } = require('envalid');

module.exports = cleanEnv(process.env, {
    PORT: port({ default: 300 }),
    DB_HOST: str(),
    DB_PORT: port({ default: 5432 }),
    DB_NAME: str(),
    DB_USER: str(),
    DB_PASS: str(),
    JWT_SECRET: str(),
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
});