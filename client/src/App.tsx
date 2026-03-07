
import { Navigate, Route, Routes } from 'react-router';
import { ResourcePage } from './pages/ResourcesPage';
import './App.css';
import { ResourceDetailPage } from './pages/ResourceDetailPage';


function App() {

  return (
    <Routes>
      <Route path='/' element={<Navigate to='/resources' replace />} />
      <Route path='/resources' element={<ResourcePage />} />
      <Route path='/resources/:id' element={<ResourceDetailPage />} />
    </Routes>
  );
}

export default App;
