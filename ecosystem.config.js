module.exports = {
  apps: [
    {
      name: "nextjsbackend",
      cwd: "/home/winston/apps/alertify",  // 👈 backend folder
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "qwebapp",
      cwd: "/var/www/qwebapp",  // 👈 webapp folder
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,

       },
    },
  ],
};
