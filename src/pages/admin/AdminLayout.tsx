import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Shield } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/admin" },
  { icon: Package, label: "المنتجات", path: "/admin/products" },
  { icon: ShoppingCart, label: "الطلبات", path: "/admin/orders" },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <Shield className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">غير مصرح</h1>
        <p className="mt-2 text-muted-foreground">ليس لديك صلاحية الوصول للوحة التحكم</p>
        <Link to="/" className="mt-4 text-primary hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-l border-border bg-card">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="gold-gradient flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-primary-foreground">
              S
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">لوحة التحكم</span>
              <p className="text-[10px] text-muted-foreground">Sponge Store</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  location.pathname === path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-border pt-4">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
