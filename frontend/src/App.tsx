import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterTransactionPage from "./pages/RegisterTransactionPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard/:userId" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />

        <Route path="/transactions/:userId" element={
          <PrivateRoute>
            <RegisterTransactionPage />
          </PrivateRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
