import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar/index.jsx";

import Home from "./components/pages/Home/index.jsx";
import Details from "./components/pages/Details/index.jsx";
import Favorites from "./components/pages/Favorie/index.jsx";
import Login from "./components/pages/Login/index.jsx";
import Register from "./components/pages/Register/index.jsx";
import Addetabs from "./components/pages/Addetabs/index.jsx";
import Etablissements from "./components/pages/Etablissement/index.jsx";
import PrivateRoute from "./components/Route/PrivateRoute.jsx";
import Team from "./components/pages/Mon_equipe/index.jsx";

import { AuthProvider } from "./components/context/AuthContext.jsx";

// ErrorBoundary simple
import React, { useEffect } from "react";
import initScrollReveal from "./utils/scrollReveal";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <h2>Oups, quelque chose s'est mal passé !</h2>;
    }
    return this.props.children;
  }
}

const App = () => {
  const location = useLocation();
  const path = location.pathname;

  const showNav =
    path === "/" ||
    path === "/etablissements" ||
    path === "/add-etabs" ||
    path.startsWith("/etablissements/") ||
    path === "/details" ||
    path === "/favorites";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      try {
        initScrollReveal();
      } catch {
        // no-op
      }
    });
  }, [path]);

  return (
    <AuthProvider>
      <ErrorBoundary>
        {showNav && <NavBar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           <Route path="/Addetabs" element={<Addetabs />} />
           <Route path="/Team" element={<Team />} />

          {/* Routes protégées */}
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-etabs"
            element={
              <PrivateRoute>
                <Addetabs />
              </PrivateRoute>
            }
          />
          <Route
            path="/etablissements"
            element={
                <Etablissements />
            }
          />
          <Route
              path="/etablissements/:id"
              element={
                <PrivateRoute>
                  <Details /> 
                </PrivateRoute>
              }
            />

            <Route
              path="/details/:id"
              element={
                <PrivateRoute>
                  <Details />
                </PrivateRoute>
              }
            />
            
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;
