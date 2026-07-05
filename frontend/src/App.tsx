import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/Auth';
import { DashboardLayout } from './layouts/DashboardLayout';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { AIAssistant } from './pages/AIAssistant';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { SmartIrrigation } from './pages/SmartIrrigation';
import { Marketplace } from './pages/Marketplace';
import { WeatherIntelligence } from './pages/WeatherIntelligence';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<FarmerDashboard />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="disease" element={<DiseaseDetection />} />
        <Route path="irrigation" element={<SmartIrrigation />} />
        <Route path="market" element={<Marketplace />} />
        <Route path="rentals" element={<Marketplace />} />
        <Route path="weather" element={<WeatherIntelligence />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
