import React, { useState } from 'react';
import './App.css';
import Map3D from './map3D.js'; // Importa el componente Map3D
import Login from './login.js'; // Importa el componente Login
import Register from './register.js'; // Importa el componente Register
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (username, password) => {
    // Aquí puedes agregar la lógica de autenticación
    setIsLoggedIn(true);
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={isLoggedIn ? <Map3D /> : <Login onLogin={handleLogin} />} />
          <Route path="/" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;