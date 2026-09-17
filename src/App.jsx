import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// The explorer pulls in three.js; loading it lazily keeps it off the landing page.
const Explorer = lazy(() => import('./pages/Explorer'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen isVisible progress={0} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explorer />} />
          {/* Original entry points, kept so existing links keep working. */}
          <Route path="/simulation" element={<Explorer defaultScale="visual" />} />
          <Route path="/accuratesimulation" element={<Explorer defaultScale="true" />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
