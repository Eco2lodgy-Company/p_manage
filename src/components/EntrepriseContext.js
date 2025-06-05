// EntrepriseContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const EntrepriseContext = createContext();

export const EntrepriseProvider = ({ children }) => {
  const [selectedEntreprise, setSelectedEntreprise] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("firm") || "" : "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("firm", selectedEntreprise);
    }
  }, [selectedEntreprise]);

  return (
    <EntrepriseContext.Provider value={{ selectedEntreprise, setSelectedEntreprise }}>
      {children}
    </EntrepriseContext.Provider>
  );
};

export const useEntreprise = () => useContext(EntrepriseContext);