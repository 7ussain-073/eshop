import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { getProductById } from "@/data/products";
import ProductCard from "@/components/home/ProductCard";
import { Heart, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  const products = wishlist
    .map((id) => getProductById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[];

  if (products.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">المفضلة فارغة</h1>
        <p className="mt-2 text-muted-foreground">أضف منتجات إلى المفضلة لحفظها</p>
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
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          <Heart className="ml-2 inline h-6 w-6 text-primary" />
          المفضلة ({products.length})
        </h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
