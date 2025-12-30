import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterTransactionPage from "./pages/RegisterTransactionPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterUserPage from "./pages/RegisterUserPage";
import PrivateRoute from "./components/routes/PrivateRoute";
import ControleDiarioPage from "./pages/ControleDiarioPage";
import ResumoMensalPage from "./pages/ResumoMensalPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Relatorio from "./pages/Relatorio";
import MainMenu from "./components/UI/MainMenu";


function AppRoutes() {
  const location = useLocation();
  const hideMenu = location.pathname === "/" || location.pathname === "/register-user";
  return (
    <>
      {!hideMenu && <MainMenu />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-user" element={<RegisterUserPage />} />
        <Route path="/dashboard/:userId" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/receitas" element={<PrivateRoute><Receitas /></PrivateRoute>} />
        <Route path="/despesas" element={<PrivateRoute><Despesas /></PrivateRoute>} />
        <Route path="/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />
        <Route path="/controle-diario" element={<PrivateRoute><ControleDiarioPage /></PrivateRoute>} />
        <Route path="/resumo-mensal" element={<PrivateRoute><ResumoMensalPage /></PrivateRoute>} />
        <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
        <Route path="/transactions/:userId" element={<PrivateRoute><RegisterTransactionPage /></PrivateRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
