import React, { createContext, useState, useContext } from "react";

// 🔹 Création du contexte
const AppContext = createContext();

// 🔹 Provider
export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState([]); // tableau des ids favoris
  const [ratings, setRatings] = useState({}); // objet { idEtablissement: note }

  // ✅ Ajouter / retirer un favori
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // ✅ Définir la note pour un établissement
  const setRatingValue = (id, value) => {
    setRatings({
      ...ratings,
      [id]: value
    });
  };

  return (
    <AppContext.Provider value={{ favorites, toggleFavorite, ratings, setRating: setRatingValue }}>
      {children}
    </AppContext.Provider>
  );
}

// 🔹 Hook pratique pour l’utiliser
export function useAppContext() {
  return useContext(AppContext);
}
