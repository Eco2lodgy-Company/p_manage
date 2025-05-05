module.exports = {
    apps: [
      {
        name: "Project-manager", // Nom de l'application
        script: "npm",
        args: "start",
        env: {
          PORT: 3110, // Spécifiez le port ici
          NODE_ENV: "production",
        },
      },
    ],
  };
  