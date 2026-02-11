import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/hooks/use-products";
import { getLowestPrice } from "@/hooks/use-products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { price, salePrice } = getLowestPrice(product);
  const inWishlist = isInWishlist(product.id);
  const hasStock = product.variants.some((v) => v.inStock);
  const cheapestInStock = product.variants.find((v) => v.inStock);
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-background/20 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.badge && (
            <span className="gold-gradient rounded-md px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
              -{discount}%
            </span>
          )}
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            رقمي
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
            inWishlist
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card/80 text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>

        {/* Out of stock overlay */}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground">
              نفذ من المخزون
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {salePrice ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {salePrice} <span className="text-xs">ر.س</span>
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {price} <span className="text-xs">ر.س</span>
              </span>
            )}
          </div>

          {hasStock && cheapestInStock && (
            <button
              onClick={() => addItem(product, cheapestInStock)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-110"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
