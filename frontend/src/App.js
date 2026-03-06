import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { FoodService } from "./pages/FoodService";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ApartmentsManager } from "./pages/admin/ApartmentsManager";
import { GalleryManager } from "./pages/admin/GalleryManager";
import { SettingsEditor } from "./pages/admin/SettingsEditor";
import { SightseeingManager } from "./pages/admin/SightseeingManager";
import { OrdersManager } from "./pages/admin/OrdersManager";
import { MenuManager } from "./pages/admin/MenuManager";
import { ReservationsManager } from "./pages/admin/ReservationsManager";
import { DocumentsManager } from "./pages/admin/DocumentsManager";
import { AuthProvider } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/food-service" element={<FoodService />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/apartments" element={<ApartmentsManager />} />
              <Route path="/admin/gallery" element={<GalleryManager />} />
              <Route path="/admin/sightseeing" element={<SightseeingManager />} />
              <Route path="/admin/settings" element={<SettingsEditor />} />
              <Route path="/admin/orders" element={<OrdersManager />} />
              <Route path="/admin/menu" element={<MenuManager />} />
              <Route path="/admin/reservations" element={<ReservationsManager />} />
              <Route path="/admin/documents" element={<DocumentsManager />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </div>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;
