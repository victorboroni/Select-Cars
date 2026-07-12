import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { Collection } from "./pages/Collection";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminVehicleForm } from "./pages/admin/AdminVehicleForm";
import { VehiclesProvider } from "./store/VehiclesContext";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-0 text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <VehiclesProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Site público */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/colecao" element={<Collection />} />
          </Route>

          {/* Área administrativa */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/painel" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="novo" element={<AdminVehicleForm />} />
            <Route path=":id" element={<AdminVehicleForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </VehiclesProvider>
  );
}
