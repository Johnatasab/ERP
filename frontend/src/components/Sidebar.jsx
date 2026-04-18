import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Layers, 
  LogOut,
  User,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

function Sidebar({ userName, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', name: 'Clientes', icon: Users },
    { path: '/products', name: 'Produtos', icon: Package },
    { path: '/raw-materials', name: 'Matérias-Primas', icon: Layers },
    { path: '/orders', name: 'Encomendas', icon: ShoppingCart },
    { path: '/finance', name: 'Financeiro', icon: DollarSign },
  ];

  return (
    <div className="h-screen w-64 bg-slate-800 text-slate-200 fixed left-0 top-0 flex flex-col shadow-lg">
      {/* Logo / Título */}
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">ERP Fábrica 3D</h1>
        <p className="text-xs text-slate-400 mt-1">Gestão de produção</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botões de Perfil e Sair (lado a lado) */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2 mb-2">
          <Link
            to="/profile"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            <User size={18} />
          </Link>
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;