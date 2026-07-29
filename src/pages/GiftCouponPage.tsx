import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Award, AlertTriangle, Calendar, Gift, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../utils/db";

export default function GiftCouponPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.init();
    const loadCoupon = () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const matched = db.getGiftCoupons().find((c: any) => c.secureToken === token);
      if (matched) {
        setCoupon(matched);
      }
      setLoading(false);
    };

    loadCoupon();
    window.addEventListener("storage", loadCoupon);
    return () => window.removeEventListener("storage", loadCoupon);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans text-brand-dark/60 text-sm font-semibold">
        Loading coupon details...
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display font-black text-lg text-brand-dark uppercase tracking-wider">
            Coupon Invalid
          </h2>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-semibold">
            This gift coupon link is invalid or unavailable. Please contact Sri Krishna Family Dhaba support.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = coupon.status === "EXPIRED";
  const isRedeemed = coupon.status === "REDEEMED";
  const isCancelled = coupon.status === "CANCELLED";
  const isActive = coupon.status === "ACTIVE";

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 font-sans bg-brand-bg/40">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-brand-gold/30 shadow-xl overflow-hidden max-w-md w-full relative"
      >
        {/* Top Accent Strip */}
        <div className="bg-brand-dark h-3 w-full" />
        
        {/* Background Decorative Circles */}
        <div className="absolute top-12 -left-10 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-16 -right-10 w-32 h-32 bg-brand-gold/5 rounded-full blur-xl pointer-events-none" />

        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Header */}
          <div className="space-y-1 relative">
            <h1 className="font-display font-black text-brand-dark text-xl uppercase tracking-wider">
              Sri Krishna Family Dhaba
            </h1>
            <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles size={10} className="fill-brand-gold" />
              <span>Personalized Rewards</span>
              <Sparkles size={10} className="fill-brand-gold" />
            </p>
          </div>

          {/* Coupon Main Graphic Card */}
          <div className="bg-brand-dark text-brand-bg rounded-2xl p-6 relative overflow-hidden shadow-lg border border-brand-gold/20">
            {/* Corner Borders */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-gold/50" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-gold/50" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-gold/50" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-gold/50" />

            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-brand-gold uppercase bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-0.5 rounded w-fit mx-auto block">
                {coupon.category.replace(/_/g, " ")}
              </span>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-brand-gold leading-none py-2">
                {coupon.discountPercentage}% OFF
              </h2>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-brand-bg/60 uppercase tracking-wider">
                  Exclusively for
                </p>
                <p className="text-sm font-display font-bold text-brand-bg/95">
                  {coupon.customerName}
                </p>
              </div>
            </div>
          </div>

          {/* Validity & Terms */}
          <div className="grid grid-cols-2 gap-4 border-y border-brand-gold/15 py-4 text-left text-xs font-semibold text-brand-dark/75">
            <div className="space-y-1 border-r border-brand-gold/15 pr-2">
              <span className="text-[9px] font-black uppercase text-brand-dark/45 block tracking-wider">Minimum Bill</span>
              <span className="font-extrabold text-sm text-brand-dark">Rs. {coupon.minimumBillAmount}</span>
            </div>
            <div className="space-y-1 pl-2">
              <span className="text-[9px] font-black uppercase text-brand-dark/45 block tracking-wider">Valid Until</span>
              <span className="font-extrabold text-brand-dark flex items-center gap-1">
                <Calendar size={12} className="text-brand-gold shrink-0" />
                {formatDate(coupon.expiresAt)}
              </span>
            </div>
          </div>

          {/* QR Code section */}
          <div className="space-y-4">
            <div className="bg-brand-bg/40 p-4 rounded-2xl border border-brand-gold/15 max-w-[190px] mx-auto">
              <div className="bg-white p-2 rounded-xl border border-brand-gold/20 shadow-md flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(coupon.secureToken)}`}
                  alt="Gift Coupon QR Code"
                  className="w-[130px] h-[130px]"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-brand-dark/45">
                Coupon Code
              </p>
              <p className="text-sm font-extrabold text-brand-dark tracking-widest font-mono">
                {coupon.code}
              </p>
            </div>
          </div>

          {/* Status Alert Badge */}
          <div className="pt-2">
            {isActive && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl py-2 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Active & Ready to Redeem</span>
              </div>
            )}
            {isRedeemed && (
              <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-xl py-2.5 px-4 text-left space-y-1 max-w-xs mx-auto">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Coupon Status</p>
                <p className="text-xs font-extrabold text-gray-700">✓ REDEEMED</p>
                {coupon.redeemedAt && (
                  <p className="text-[10px] text-gray-400 font-bold">
                    Used on {new Date(coupon.redeemedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {isExpired && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl py-2.5 px-4 text-left space-y-1 max-w-xs mx-auto">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Coupon Status</p>
                <p className="text-xs font-extrabold text-rose-700">❌ EXPIRED</p>
                <p className="text-[10px] text-rose-500 font-bold">
                  Expired on {formatDate(coupon.expiresAt)}
                </p>
              </div>
            )}
            {isCancelled && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl py-2.5 px-4 text-left space-y-1 max-w-xs mx-auto">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Coupon Status</p>
                <p className="text-xs font-extrabold text-rose-700">❌ CANCELLED</p>
                <p className="text-[10px] text-rose-500 font-bold">
                  This coupon has been invalidated by administration.
                </p>
              </div>
            )}
          </div>

          {/* Footer Terms */}
          <p className="text-[9px] text-brand-dark/40 leading-relaxed font-semibold max-w-xs mx-auto pt-2 border-t border-brand-gold/10">
            Terms: Coupon can only be redeemed once directly at our check-out counter. Cannot be stacked or combined with other vouchers or digital discount offers.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
