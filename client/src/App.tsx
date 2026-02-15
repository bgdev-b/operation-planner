import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { ResourcePage } from './pages/ResourcesPage';
import './App.css';
import { ResourceDetailPage } from './pages/ResourceDetailPage';


function App() {

  return (
    <Routes>
      <Route path='/resources' element={<ResourcePage />} />
      <Route path='/resources/:id' element={<ResourceDetailPage />} />
    </Routes>
  );
}

export default App
