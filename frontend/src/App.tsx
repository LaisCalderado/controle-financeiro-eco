import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterTransactionPage from "./pages/RegisterTransactionPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterUserPage from "./pages/RegisterUserPage";
import PrivateRoute from "./components/routes/PrivateRoute";
import AdminRoute from "./components/routes/AdminRoute";
import ControleDiarioPage from "./pages/ControleDiarioPage";
import ResumoMensalPage from "./pages/ResumoMensalPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import SelfService from "./pages/SelfService";
import ServicoCompleto from "./pages/ServicoCompleto";
import Despesas from "./pages/Despesas";
import Relatorio from "./pages/Relatorio";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { AuthProvider } from "./context/AuthContext";


function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-user" element={<RegisterUserPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/selfservice" element={<PrivateRoute><SelfService /></PrivateRoute>} />
        <Route path="/servico-completo" element={<PrivateRoute><ServicoCompleto /></PrivateRoute>} />
        <Route path="/despesas" element={<PrivateRoute><Despesas /></PrivateRoute>} />
        <Route path="/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />
        <Route path="/controle-diario" element={<PrivateRoute><ControleDiarioPage /></PrivateRoute>} />
        <Route path="/resumo-mensal" element={<PrivateRoute><ResumoMensalPage /></PrivateRoute>} />
        <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
        <Route path="/transactions/:userId" element={<PrivateRoute><RegisterTransactionPage /></PrivateRoute>} />
        
        {/* Rotas Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
