import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Profile from './pages/Profile.js';
import Admin from './pages/Admin.js';
import PropertyDetails from './pages/PropertyDetails.jsx';
import AddProperty from './pages/AddProperty.js'; // ← NOUVEL IMPORT
import MyProperties from './pages/MyProperties.js'; // ← NOUVEL IMPORT
import './App.css';

console.log('🔧 App.js chargé - Vérification des imports...');

function App() {
  console.log('🎯 App component rendering');
  
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            
            {/* ========== NOUVELLES ROUTES AJOUTÉES ========== */}
            <Route 
              path="/add-property" 
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-properties" 
              element={
                <ProtectedRoute>
                  <MyProperties />
                </ProtectedRoute>
              } 
            />
            {/* ============================================= */}
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;