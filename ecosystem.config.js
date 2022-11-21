module.exports = {
  apps : [{
    name   : "meat-api",
    script : "./dist/main.js",
    instances: 0,
    exec_mode: "cluster",
    env: {
      SERVER_POST: 5000,
      DB_URL: "mongodb://localhost/meat-api",
      NODE_ENV: "development"
    },
    env_prod: {
      SERVER_POST: 5001,
      NODE_ENV: "production"
    }
  }]
}
