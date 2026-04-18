import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import RawMaterials from './pages/RawMaterials';
import { isAuthenticated, getUser, logout } from './services/auth';
import Sidebar from './components/Sidebar';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import OrderDetails from './pages/OrderDetails';
import Financeiro from './pages/Financeiro';
import Profile from './pages/Profile';

// Componente de layout que inclui a sidebar
function Layout({ children }) {
  const user = getUser();
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex">
      <Sidebar userName={user?.name} onLogout={handleLogout} />
      <main className="flex-1 ml-64 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}

// Componente para proteger rotas com layout
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/raw-materials" element={<ProtectedRoute><RawMaterials /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/new" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;