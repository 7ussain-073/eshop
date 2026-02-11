import { useCategories, useProducts } from "@/hooks/use-products";
import HeroBanner from "@/components/home/HeroBanner";
import CategorySection from "@/components/home/CategorySection";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  return (
    <div className="min-h-screen">
      <HeroBanner />

      {/* Categories quick nav */}
      <section className="border-b border-border bg-secondary/30 py-6">
        <div className="container">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] min-w-[100px]"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {cat.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category sections */}
      {categories.map((category) => {
        const catProducts = products.filter((p) => p.categoryId === category.id);
        return (
          <CategorySection
            key={category.id}
            category={category}
            products={catProducts}
          />
        );
      })}

      {/* CTA Banner */}
      <section className="py-12">
        <div className="container">
          <div className="gold-border-glow rounded-2xl border border-primary/20 bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">
              <span className="gold-text">الضمان الذهبي</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              في حال واجهتك أي مشكلة ولم يتم حلها، نرجع لك المبلغ كامل. ضمان حقيقي لراحتك.
            </p>
            <Link
              to="/contact"
              className="gold-gradient mt-6 inline-block rounded-lg px-8 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
