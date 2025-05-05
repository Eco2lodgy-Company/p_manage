module.exports = {
    apps: [
      {
        name: "project-manager", // Nom de l'application
        script: "npm",
        args: "start",
        env: {
          PORT: 3110, // Spécifiez le port ici
          NODE_ENV: "production",
        },
      },
    ],
  };
  