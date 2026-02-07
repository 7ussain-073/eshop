import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { Category, Product } from "@/data/products";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              {category.icon} {category.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
          </div>
          <Link
            to={`/category/${category.slug}`}
            className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
