import { MessageCircle, Instagram, Youtube, Send, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground">تواصل معنا</h1>
          <p className="mt-2 text-muted-foreground">
            نسعد بتواصلك معنا عبر أي من القنوات التالية
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: MessageCircle,
              label: "واتساب",
              value: "+966 50 000 0000",
              href: "https://wa.me/966500000000",
              colorClass: "hover:border-whatsapp hover:bg-whatsapp/10",
            },
            {
              icon: Mail,
              label: "البريد الإلكتروني",
              value: "support@spongestore.com",
              href: "mailto:support@spongestore.com",
              colorClass: "hover:border-primary hover:bg-primary/10",
            },
            {
              icon: Instagram,
              label: "انستجرام",
              value: "@spongestore",
              href: "#",
              colorClass: "hover:border-pink-500 hover:bg-pink-500/10",
            },
            {
              icon: Youtube,
              label: "يوتيوب",
              value: "Sponge Store",
              href: "#",
              colorClass: "hover:border-destructive hover:bg-destructive/10",
            },
            {
              icon: Send,
              label: "تيليجرام",
              value: "@spongestore",
              href: "#",
              colorClass: "hover:border-primary hover:bg-primary/10",
            },
            {
              icon: Phone,
              label: "هاتف",
              value: "+966 50 000 0000",
              href: "tel:+966500000000",
              colorClass: "hover:border-success hover:bg-success/10",
            },
          ].map(({ icon: Icon, label, value, href, colorClass }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all ${colorClass}`}
            >
              <Icon className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
