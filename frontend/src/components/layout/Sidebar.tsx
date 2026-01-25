import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingDown, 
  FileText, 
  LogOut, 
  X, 
  Shirt,
  Sparkles,
  Star,
  Repeat
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      path: '/selfservice',
      icon: Sparkles,
      label: 'Self-Service'
    },
    {
      path: '/servico-completo',
      icon: Star,
      label: 'Serviço Completo'
    },
    {
      path: '/dashboard-recorrentes',
      icon: Repeat,
      label: 'Despesas Fixas'
    },
    {
      path: '/despesas',
      icon: TrendingDown,
      label: 'Despesas'
    },
    {
      path: '/relatorio',
      icon: FileText,
      label: 'Relatórios'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname.toLowerCase().includes(path);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">EcoLavanderia</h1>
              <p className="text-xs text-slate-500">Controle Financeiro</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose?.(); // Fecha o sidebar no mobile após clicar
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left
                ${active 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 w-full justify-start text-slate-600 hover:text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
