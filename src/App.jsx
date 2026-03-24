import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Users from './pages/Users.jsx';
import Categories from './pages/Categories.jsx';
import SubCategories from './pages/SubCategories.jsx';
import Rewards from './pages/Rewards.jsx';
import Promotions from './pages/Promotions.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/sub-categories" element={<SubCategories />} />
              <Route path="/products/*" element={<Products />} />
              <Route path="/orders/*" element={<Orders />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
