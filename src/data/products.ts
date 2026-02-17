export interface ProductVariant {
  id: string;
  duration: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  variants: ProductVariant[];
  badge?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "netflix",
    name: "اشتراكات نتفلكس 4K",
    slug: "netflix",
    description: "اشتراكات نتفلكس الرسمية بجودة 4K مع تفعيل فوري وضمان كامل المدة",
    icon: "🎬",
  },
  {
    id: "vip",
    name: "VIP للمسلسلات والأفلام",
    slug: "vip",
    description: "اشتراكات VIP لمشاهدة أحدث المسلسلات والأفلام",
    icon: "⭐",
  },
  {
    id: "tod",
    name: "اشتراكات TOD",
    slug: "tod",
    description: "اشتراكات TOD الرسمية مع ضمان التفعيل",
    icon: "📺",
  },
  {
    id: "iptv",
    name: "اشتراكات IPTV",
    slug: "iptv",
    description: "اشتراكات IPTV بأفضل الأسعار وجودة عالية",
    icon: "📡",
  },
  {
    id: "chatgpt",
    name: "اشتراك ChatGPT Plus",
    slug: "chatgpt",
    description: "اشتراكات ChatGPT Plus الرسمية",
    icon: "🤖",
  },
  {
    id: "crunchyroll",
    name: "اشتراكات Crunchyroll",
    slug: "crunchyroll",
    description: "اشتراكات كرانشي رول الرسمية لمشاهدة الأنمي",
    icon: "🎌",
  },
  {
    id: "renewals",
    name: "تجديد الاشتراكات",
    slug: "renewals",
    description: "تجديد اشتراكاتك الحالية بأفضل الأسعار",
    icon: "🔄",
  },
];

export const products: Product[] = [
  // Netflix
  {
    id: "nf-1",
    name: "اشتراك نتفلكس شهري 4K",
    description: "اشتراك نتفلكس رسمي بجودة 4K Ultra HD لمدة شهر كامل مع ضمان المدة",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8d6f28?w=400&h=400&fit=crop",
    categoryId: "netflix",
    featured: true,
    badge: "الأكثر مبيعاً",
    variants: [
      { id: "nf-1-1m", duration: "شهر", price: 25, salePrice: 16.5, inStock: true },
      { id: "nf-1-3m", duration: "3 أشهر", price: 75, salePrice: 45.99, inStock: true },
      { id: "nf-1-1y", duration: "سنة", price: 250, salePrice: 159.99, inStock: false },
    ],
  },
  {
    id: "nf-2",
    name: "اشتراك نتفلكس عائلي",
    description: "اشتراك نتفلكس عائلي يدعم حتى 5 أجهزة بجودة 4K",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=400&fit=crop",
    categoryId: "netflix",
    featured: true,
    variants: [
      { id: "nf-2-1m", duration: "شهر", price: 71, salePrice: 43.99, inStock: true },
      { id: "nf-2-3m", duration: "3 أشهر", price: 199, salePrice: 119.99, inStock: true },
    ],
  },
  {
    id: "nf-3",
    name: "اشتراك نتفلكس ملف شخصي",
    description: "ملف شخصي على حساب نتفلكس مشترك بجودة عالية",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
    categoryId: "netflix",
    variants: [
      { id: "nf-3-1m", duration: "شهر", price: 15, salePrice: 9.99, inStock: true },
      { id: "nf-3-3m", duration: "3 أشهر", price: 40, salePrice: 24.99, inStock: true },
    ],
  },
  // VIP
  {
    id: "vip-1",
    name: "اشتراك شاهد VIP",
    description: "اشتراك شاهد VIP لمشاهدة أحدث المسلسلات العربية والأفلام",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&h=400&fit=crop",
    categoryId: "vip",
    featured: true,
    badge: "جديد",
    variants: [
      { id: "vip-1-1m", duration: "شهر", price: 30, salePrice: 19.99, inStock: true },
      { id: "vip-1-3m", duration: "3 أشهر", price: 80, salePrice: 49.99, inStock: true },
      { id: "vip-1-1y", duration: "سنة", price: 280, salePrice: 179.99, inStock: true },
    ],
  },
  {
    id: "vip-2",
    name: "اشتراك شاهد سبورت",
    description: "مشاهدة جميع المباريات الرياضية مباشرة بجودة عالية",
    image: "https://images.unsplash.com/photo-1461896836934-bd45ba28da28?w=400&h=400&fit=crop",
    categoryId: "vip",
    variants: [
      { id: "vip-2-1m", duration: "شهر", price: 35, salePrice: 24.99, inStock: true },
      { id: "vip-2-3m", duration: "3 أشهر", price: 90, salePrice: 64.99, inStock: true },
    ],
  },
  // TOD
  {
    id: "tod-1",
    name: "اشتراك TOD",
    description: "اشتراك TOD الرسمي لمشاهدة أحدث الأفلام والمسلسلات",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop",
    categoryId: "tod",
    featured: true,
    variants: [
      { id: "tod-1-1m", duration: "شهر", price: 25, salePrice: 17.99, inStock: true },
      { id: "tod-1-3m", duration: "3 أشهر", price: 70, salePrice: 44.99, inStock: true },
    ],
  },
  {
    id: "tod-2",
    name: "اشتراك TOD العائلي",
    description: "اشتراك TOD عائلي لعدة أجهزة",
    image: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=400&h=400&fit=crop",
    categoryId: "tod",
    variants: [
      { id: "tod-2-1m", duration: "شهر", price: 40, salePrice: 29.99, inStock: true },
    ],
  },
  // IPTV
  {
    id: "iptv-1",
    name: "اشتراك IPTV بريميوم",
    description: "أكثر من 10,000 قناة عربية وعالمية بجودة عالية",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    categoryId: "iptv",
    featured: true,
    badge: "عرض خاص",
    variants: [
      { id: "iptv-1-1m", duration: "شهر", price: 20, salePrice: 12.99, inStock: true },
      { id: "iptv-1-3m", duration: "3 أشهر", price: 50, salePrice: 29.99, inStock: true },
      { id: "iptv-1-1y", duration: "سنة", price: 150, salePrice: 89.99, inStock: true },
    ],
  },
  {
    id: "iptv-2",
    name: "اشتراك IPTV رياضي",
    description: "جميع القنوات الرياضية العالمية بما في ذلك beIN Sports",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=400&fit=crop",
    categoryId: "iptv",
    variants: [
      { id: "iptv-2-1m", duration: "شهر", price: 25, salePrice: 17.99, inStock: true },
      { id: "iptv-2-6m", duration: "6 أشهر", price: 120, salePrice: 79.99, inStock: true },
    ],
  },
  // ChatGPT
  {
    id: "gpt-1",
    name: "اشتراك ChatGPT Plus",
    description: "اشتراك ChatGPT Plus الرسمي مع وصول لجميع الميزات المتقدمة",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop",
    categoryId: "chatgpt",
    featured: true,
    variants: [
      { id: "gpt-1-1m", duration: "شهر", price: 85, salePrice: 59.99, inStock: true },
      { id: "gpt-1-3m", duration: "3 أشهر", price: 230, salePrice: 159.99, inStock: true },
    ],
  },
  // Crunchyroll
  {
    id: "cr-1",
    name: "اشتراك Crunchyroll Premium",
    description: "اشتراك كرانشي رول لمشاهدة أحدث الأنمي بدون إعلانات",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop",
    categoryId: "crunchyroll",
    featured: true,
    variants: [
      { id: "cr-1-1m", duration: "شهر", price: 20, salePrice: 12.99, inStock: true },
      { id: "cr-1-3m", duration: "3 أشهر", price: 55, salePrice: 32.99, inStock: true },
      { id: "cr-1-1y", duration: "سنة", price: 180, salePrice: 109.99, inStock: true },
    ],
  },
  {
    id: "cr-2",
    name: "اشتراك Crunchyroll Mega Fan",
    description: "اشتراك ميجا فان مع مشاهدة على عدة أجهزة",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=400&fit=crop",
    categoryId: "crunchyroll",
    variants: [
      { id: "cr-2-1m", duration: "شهر", price: 30, salePrice: 19.99, inStock: true },
    ],
  },
  // Renewals
  {
    id: "rn-1",
    name: "تجديد اشتراك نتفلكس",
    description: "تجديد اشتراكك الحالي في نتفلكس",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8d6f28?w=400&h=400&fit=crop",
    categoryId: "renewals",
    variants: [
      { id: "rn-1-1m", duration: "شهر", price: 25, salePrice: 18.99, inStock: true },
      { id: "rn-1-3m", duration: "3 أشهر", price: 70, salePrice: 49.99, inStock: true },
    ],
  },
  {
    id: "rn-2",
    name: "تجديد اشتراك شاهد",
    description: "تجديد اشتراكك الحالي في شاهد VIP",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&h=400&fit=crop",
    categoryId: "renewals",
    variants: [
      { id: "rn-2-1m", duration: "شهر", price: 30, salePrice: 22.99, inStock: true },
    ],
  },
];

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getLowestPrice(product: Product): { price: number; salePrice?: number } {
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const allVariants = inStockVariants.length > 0 ? inStockVariants : product.variants;
  const cheapest = allVariants.reduce((min, v) => {
    const effectivePrice = v.salePrice || v.price;
    const minPrice = min.salePrice || min.price;
    return effectivePrice < minPrice ? v : min;
  });
  return { price: cheapest.price, salePrice: cheapest.salePrice };
}
