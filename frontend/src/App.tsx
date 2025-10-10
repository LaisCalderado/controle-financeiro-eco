import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterTransactionPage from "./pages/RegisterTransactionPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/routes/PrivateRoute";
import ControleDiarioPage from "./pages/ControleDiarioPage";
import ResumoMensalPage from "./pages/ResumoMensalPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import MainMenu from "./components/UI/MainMenu";

function App() {
  return (
    <BrowserRouter>
      <MainMenu />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/:userId" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/controle-diario" element={<PrivateRoute><ControleDiarioPage /></PrivateRoute>} />
        <Route path="/resumo-mensal" element={<PrivateRoute><ResumoMensalPage /></PrivateRoute>} />
        <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
        <Route path="/transactions/:userId" element={<PrivateRoute><RegisterTransactionPage /></PrivateRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
