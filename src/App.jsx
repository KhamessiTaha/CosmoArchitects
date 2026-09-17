import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// The simulators pull in three.js; loading them lazily keeps it off the landing page.
const Simulation = lazy(() => import('./pages/Simulation'));
const AccurateSimulation = lazy(() => import('./pages/AccurateSimulation'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen isVisible progress={0} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/accuratesimulation" element={<AccurateSimulation />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
