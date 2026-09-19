// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CategorySelectPage from "./pages/CategorySelectPage";
import CategoryDashboard from "./components/dashboard/CategoryDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/categories" element={<CategorySelectPage />} />
        <Route path="/dashboard/:category" element={<CategoryDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}