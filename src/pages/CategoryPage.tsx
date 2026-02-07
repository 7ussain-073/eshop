import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { getCategoryBySlug, getProductsByCategory, categories } from "@/data/products";
import ProductCard from "@/components/home/ProductCard";
import { motion } from "framer-motion";

type FilterStock = "all" | "in-stock" | "out-of-stock";
type FilterDuration = "all" | "monthly" | "3months" | "yearly";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");
  const allProducts = getProductsByCategory(category?.id || "");
  const [stockFilter, setStockFilter] = useState<FilterStock>("all");
  const [durationFilter, setDurationFilter] = useState<FilterDuration>("all");

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Stock filter
      if (stockFilter === "in-stock" && !product.variants.some((v) => v.inStock)) return false;
      if (stockFilter === "out-of-stock" && product.variants.some((v) => v.inStock)) return false;

      // Duration filter
      if (durationFilter !== "all") {
        const durationMap: Record<string, string[]> = {
          monthly: ["شهر"],
          "3months": ["3 أشهر"],
          yearly: ["سنة", "6 أشهر"],
        };
        const matchDurations = durationMap[durationFilter] || [];
        if (!product.variants.some((v) => matchDurations.includes(v.duration))) return false;
      }

      return true;
    });
  }, [allProducts, stockFilter, durationFilter]);

  if (!category) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-foreground">القسم غير موجود</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {category.icon} {category.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">الفلاتر</h3>

              {/* Stock filter */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">التوفر</label>
                <div className="space-y-1.5">
                  {([
                    ["all", "الكل"],
                    ["in-stock", "متوفر"],
                    ["out-of-stock", "نفذ"],
                  ] as [FilterStock, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setStockFilter(value)}
                      className={`block w-full rounded-lg px-3 py-1.5 text-right text-xs transition-colors ${
                        stockFilter === value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration filter */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">المدة</label>
                <div className="space-y-1.5">
                  {([
                    ["all", "الكل"],
                    ["monthly", "شهري"],
                    ["3months", "3 أشهر"],
                    ["yearly", "سنوي"],
                  ] as [FilterDuration, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setDurationFilter(value)}
                      className={`block w-full rounded-lg px-3 py-1.5 text-right text-xs transition-colors ${
                        durationFilter === value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Other categories */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">أقسام أخرى</h3>
              <div className="space-y-1">
                {categories
                  .filter((c) => c.id !== category.id)
                  .map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      className="block rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      {c.icon} {c.name}
                    </Link>
                  ))}
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-card">
                <p className="text-muted-foreground">لا توجد منتجات مطابقة للفلتر المحدد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
