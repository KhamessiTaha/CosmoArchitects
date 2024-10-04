import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Simulation from './pages/Simulation';
import AccurateSimulation from './pages/AccurateSimulation';
import './App.css';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/accuratesimulation" element={<AccurateSimulation />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
