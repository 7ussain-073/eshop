import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTracking from "./pages/OrderTracking";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSections from "./pages/admin/AdminSections";
import { PrivacyPage, TermsPage, ReturnsPage, ComplaintsPage } from "./pages/StaticPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Admin routes - no header/footer */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="sections" element={<AdminSections />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>

                {/* Public routes with header/footer */}
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <CartDrawer />
                      <main className="min-h-screen">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/category/:slug" element={<CategoryPage />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/order-tracking" element={<OrderTracking />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/privacy" element={<PrivacyPage />} />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/returns" element={<ReturnsPage />} />
                          <Route path="/complaints" element={<ComplaintsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                      <WhatsAppButton />
                    </>
                  }
                />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
