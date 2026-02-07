import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <div className="mb-6 text-center">
            <div className="gold-gradient mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold text-primary-foreground">
              S
            </div>
            <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ادخل لحسابك لمتابعة طلباتك
            </p>
          </div>

          {/* Login Tabs */}
          <div className="mb-6 flex rounded-lg border border-border bg-secondary p-1">
            <button className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
              رقم الجوال
            </button>
            <button className="flex-1 rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              البريد الإلكتروني
            </button>
          </div>

          {/* Phone login */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                رقم الجوال
              </label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground">
                  +966
                </span>
                <input
                  type="tel"
                  placeholder="5XXXXXXXX"
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button className="gold-gradient w-full rounded-lg py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
              إرسال رمز التحقق عبر واتساب
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            ليس لديك حساب؟{" "}
            <button className="text-primary hover:underline">إنشاء حساب جديد</button>
          </p>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            سيتم تفعيل تسجيل الدخول عند ربط قاعدة البيانات
          </p>
        </motion.div>
      </div>
    </div>
  );
}
