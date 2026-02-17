import { motion } from "framer-motion";
import { ArrowLeft, Shield, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Digital Subscriptions"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      <div className="container relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
            <span className="gold-text">اشتراكاتك الرقمية</span>
            <br />
            <span className="text-foreground">بأفضل الأسعار</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            نتفلكس، شاهد، <TOD></TOD>، ChatGPT والمزيد — تفعيل فوري وضمان كامل المدة مع دعم على مدار الساعة
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/category/netflix"
              className="gold-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              تسوق الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              to="/order-tracking"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              تتبع طلبك
            </Link>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 grid grid-cols-3 gap-4 md:max-w-xl"
        >
          {[
            { icon: Zap, label: "تفعيل فوري" },
            { icon: Shield, label: "ضمان كامل" },
            { icon: Clock, label: "دعم 24/7" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/60 p-3 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
