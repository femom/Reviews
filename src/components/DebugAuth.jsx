// DebugAuth.jsx - Composant pour debugger
import React from 'react';

const DebugAuth = () => {
  const checkAndFixAuth = () => {
    console.log("=== DEBUG AUTHENTIFICATION ===");
    
    // 1. Vérifiez ce qui est stocké
    const storage = {
      authToken: localStorage.getItem('authToken'),
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName')
    };
    
    console.log("Storage actuel:", storage);
    
    // 2. Vérifiez la cohérence
    if (storage.token && !storage.authToken) {
      console.log("⚠️ 'token' existe mais pas 'authToken' - Correction...");
      localStorage.setItem('authToken', storage.token);
    }
    
    if (storage.authToken && !storage.token) {
      console.log("⚠️ 'authToken' existe mais pas 'token' - Correction...");
      localStorage.setItem('token', storage.authToken);
    }
    
    // 3. Vérifiez si userId est manquant
    if ((storage.authToken || storage.token) && !storage.userId) {
      console.log("⚠️ Token présent mais userId manquant");
      // Essayez de récupérer l'utilisateur via l'API
      // Ou demandez à l'utilisateur de se reconnecter
    }
    
    // 4. Affichez l'état final
    console.log("État final:", {
      authToken: localStorage.getItem('authToken') ? "✓" : "✗",
      token: localStorage.getItem('token') ? "✓" : "✗",
      userId: localStorage.getItem('userId') || "✗",
      isAuthenticated: !!(localStorage.getItem('authToken') || localStorage.getItem('token'))
    });
    
    alert(`Auth: ${!!(localStorage.getItem('authToken') || localStorage.getItem('token')) ? "OK" : "NOK"}\nUserID: ${localStorage.getItem('userId') || "Manquant"}`);
  };

  const simulateAuth = () => {
    // Pour tester si tout fonctionne avec des données fictives
    localStorage.setItem('authToken', 'test-token-' + Date.now());
    localStorage.setItem('token', 'test-token-' + Date.now());
    localStorage.setItem('userId', '1');
    localStorage.setItem('userName', 'Test User');
    
    console.log("Auth simulée créée");
    window.location.reload();
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    console.log("Auth effacée");
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#333',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      <h4>Debug Auth</h4>
      <button onClick={checkAndFixAuth} style={{margin: '5px'}}>
        Vérifier Auth
      </button>
      <button onClick={simulateAuth} style={{margin: '5px', background: '#28a745'}}>
        Simuler Auth
      </button>
      <button onClick={clearAuth} style={{margin: '5px', background: '#dc3545'}}>
        Déconnexion
      </button>
    </div>
  );
};

export default DebugAuth;