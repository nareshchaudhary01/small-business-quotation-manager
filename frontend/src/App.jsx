import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { setAuthToken } from './api';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import Products from './pages/Products';
import QuotationList from './pages/Quotations';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Topbar from './components/Topbar';

function App() {
  const storedToken = localStorage.getItem('accessToken');
  const [token, setToken] = useState(storedToken || '');
  const location = useLocation();

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [token]);

  const authContext = useMemo(
    () => ({
      login: (newToken) => setToken(newToken),
      logout: () => setToken(''),
    }),
    [],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleLogout = () => authContext.logout();

  return (
    <div className="min-h-screen">
      <Topbar onLogout={handleLogout} token={token} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute token={token}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute token={token}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute token={token}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute token={token}>
                <QuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute token={token}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login onAuthenticated={authContext.login} />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register onRegistered={authContext.login} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
