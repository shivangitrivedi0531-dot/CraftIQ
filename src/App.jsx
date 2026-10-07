import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import CategorySelectPage from "./pages/CategorySelectPage";
import CategoryDashboard from "./components/dashboard/CategoryDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategorySelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:category"
            element={
              <ProtectedRoute>
                <CategoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}