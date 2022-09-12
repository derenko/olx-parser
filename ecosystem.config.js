module.exports = {
  apps: [
    {
      name: "parser",
      script: "./src/index.mjs",
      args: "run start",
      max_memory_restart: "500M",
      env_develop: {
        NODE_ENV: "develop",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 2000,
      },
    },
  ],
};
