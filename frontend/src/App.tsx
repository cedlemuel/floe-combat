import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./Components/Navbar/Navbar";
import LandingPage from "./Components/Pages/LandingPage";
import Products from "./Components/Pages/Products";
import Highlights from "./Components/Pages/Highlights";
import Order from "./Components/Pages/Order";
import Reviews from "./Components/Pages/Reviews";
import Footer from "./Components/Sections/Footer";
import AdminPanel from "./admin/AdminPanel";
import AdminHighlights from "./admin/components/Pages/AdminHighlights";
import AdminProducts from "./admin/components/Pages/AdminProducts";
import AdminReviews from "./admin/components/Pages/AdminReviews";
import AdminDashboard from "./admin/components/Pages/AdminDashboard";
import NotFound from "./Components/Pages/NotFound";
import Login from "./Components/Pages/Login";
import ProtectedRoute from "./admin/components/admin/ProtectedRoute";
import AdminPromotions from "./admin/components/Pages/AdminPromotions";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/admin/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPanel />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="highlights" element={<AdminHighlights />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="promotions" element={<AdminPromotions />} />
          </Route>
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/highlights" element={<Highlights />} />
        <Route path="/order" element={<Order />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
