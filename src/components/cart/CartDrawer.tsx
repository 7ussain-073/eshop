import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems } =
    useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  سلة التسوق ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">السلة فارغة</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ابدأ بإضافة منتجات إلى سلتك
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="gold-gradient mt-4 rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground"
                  >
                    تصفح المنتجات
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.variant.id}
                      className="flex gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {item.variant.duration}
                        </span>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-sm font-bold text-primary">
                            {(item.variant.salePrice || item.variant.price) * item.quantity} ر.س
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.variant.id, item.quantity - 1)
                              }
                              className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-foreground hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.variant.id, item.quantity + 1)
                              }
                              className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-foreground hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.variant.id)}
                              className="mr-1 flex h-6 w-6 items-center justify-center rounded text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">المجموع</span>
                  <span className="text-xl font-bold text-primary">
                    {totalPrice.toFixed(2)} ر.س
                  </span>
                </div>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="gold-gradient block w-full rounded-lg py-3 text-center text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  إتمام الشراء
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
