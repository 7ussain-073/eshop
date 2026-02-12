import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { formatPrice } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">سلة التسوق فارغة</h1>
        <p className="mt-2 text-muted-foreground">ابدأ بإضافة منتجات إلى سلتك</p>
        <Link
          to="/"
          className="gold-gradient mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          تصفح المنتجات
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="container">
        <h1 className="mb-6 text-2xl font-bold text-foreground">سلة التسوق</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.variant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{item.variant.duration}</span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice((item.variant.salePrice || item.variant.price) * item.quantity)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.variant.id)}
                          className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button
              onClick={clearCart}
              className="mt-4 text-sm text-destructive hover:underline"
            >
              تفريغ السلة
            </button>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-32 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">ملخص الطلب</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الضريبة (15%)</span>
                  <span>{formatPrice(totalPrice * 0.15)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">الإجمالي</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(totalPrice * 1.15)}
                    </span>
                  </div>
                </div>
              </div>
              <button className="gold-gradient mt-6 w-full rounded-xl py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
                إتمام الشراء
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                يتطلب إتمام الشراء تسجيل الدخول
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
