import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  image_url?: string;
}

// Icon mapping for categories
const categoryIcons: Record<string, string> = {
  netflix: "🎬",
  vip: "⭐",
  osn: "📺",
  iptv: "📡",
  chatgpt: "🤖",
  crunchyroll: "🎌",
  renewals: "🔄",
};

function mapVariant(v: any): ProductVariant {
  return {
    id: v.id,
    duration: v.duration,
    price: Number(v.price),
    salePrice: v.sale_price ? Number(v.sale_price) : undefined,
    inStock: v.stock_status === "in_stock",
  };
}

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    image: p.image_url || "/placeholder.svg",
    categoryId: p.category_id || "",
    variants: (p.product_variants || []).map(mapVariant),
  };
}

function mapCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: "",
    icon: categoryIcons[c.slug] || "📦",
    image_url: c.image_url,
  };
}

import { getLocalHiddenCategories } from "@/lib/utils";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // try full select (supports DB `hidden` column)
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");

      // handle case where the `hidden` column doesn't exist in the DB (fallback)
      if (error) {
        const msg = String(error.message || "").toLowerCase();
        if (msg.includes("hidden") || msg.includes('column "hidden"') || msg.includes("could not find the 'hidden' column")) {
          const { data: fallback, error: fbErr } = await supabase
            .from("categories")
            .select("id, name, slug, image_url, sort_order")
            .order("sort_order");
          if (fbErr) throw fbErr;
          const localHidden = getLocalHiddenCategories();
          return (fallback || []).map(mapCategory).filter((c) => !localHidden.includes(c.id));
        }
        throw error;
      }

      const localHidden = getLocalHiddenCategories();
      const rows = (data || []).filter((r: any) => !(r.hidden === true || localHidden.includes(r.id)));
      return rows.map(mapCategory);
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products-with-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["products-by-category", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .eq("category_id", categoryId)
        .eq("status", "published");
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
    enabled: !!categoryId,
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return mapProduct(data);
    },
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["category-by-slug", slug],
    queryFn: async () => {
      // try full select (may include `hidden` column)
      const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single();

      // fallback when `hidden` doesn't exist in DB
      if (error) {
        const msg = String(error.message || "").toLowerCase();
        if (msg.includes("hidden") || msg.includes('column "hidden"') || msg.includes("could not find the 'hidden' column")) {
          const { data: fallback, error: fbErr } = await supabase
            .from("categories")
            .select("id, name, slug, image_url, sort_order")
            .eq("slug", slug)
            .single();
          if (fbErr) throw fbErr;
          const localHidden = getLocalHiddenCategories();
          if (!fallback || localHidden.includes((fallback as any).id)) return null;
          return mapCategory(fallback);
        }
        throw error;
      }

      const localHidden = getLocalHiddenCategories();
      if (!data) return null;
      // hide when DB `hidden` flag set or when locally hidden
      if (data.hidden === true || localHidden.includes((data as any).id)) return null;
      return mapCategory(data);
    },
    enabled: !!slug,
  });
}

export function getLowestPrice(product: Product): { price: number; salePrice?: number } {
  if (!product.variants.length) return { price: 0 };
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const allVariants = inStockVariants.length > 0 ? inStockVariants : product.variants;
  const cheapest = allVariants.reduce((min, v) => {
    const effectivePrice = v.salePrice || v.price;
    const minPrice = min.salePrice || min.price;
    return effectivePrice < minPrice ? v : min;
  });
  return { price: cheapest.price, salePrice: cheapest.salePrice };
}
