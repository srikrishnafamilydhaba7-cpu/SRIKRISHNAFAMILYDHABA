import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../utils/db";

export default function ReviewPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    db.init();
    
    // Load matching order
    const loadOrder = () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const matched = db.getOrders().find((o: any) => o.reviewToken === token);
      if (matched) {
        setOrder(matched);
        setCustomerName(matched.customerName);
      }
      setLoading(false);
    };

    loadOrder();
    window.addEventListener("storage", loadOrder);
    return () => window.removeEventListener("storage", loadOrder);
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!order) return;

    if (order.status !== "Delivered") {
      setError("This review link is invalid or unavailable.");
      return;
    }

    // Check duplicate review
    const alreadyReviewed = order.isReviewed || db.getReviews().some((r: any) => r.orderId === order.id);
    if (alreadyReviewed) {
      setError("Thank you! Your review has already been submitted.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a short review text about your meal.");
      return;
    }

    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      db.submitOrderReview(order.id, customerName.trim(), rating, reviewText.trim());
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans text-brand-dark/60 text-sm font-semibold">
        Loading review session...
      </div>
    );
  }

  // Error views
  const isDuplicate = order && (order.isReviewed || db.getReviews().some((r: any) => r.orderId === order.id));
  const isInvalid = !order || order.status !== "Delivered";

  if (isInvalid) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display font-black text-lg text-brand-dark uppercase tracking-wider">
            Review Link Invalid
          </h2>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-semibold">
            This review link is invalid or unavailable. Only successfully delivered orders can be reviewed.
          </p>
        </div>
      </div>
    );
  }

  if (isDuplicate) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display font-black text-lg text-brand-dark uppercase tracking-wider">
            Review Already Submitted
          </h2>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-semibold">
            Thank you! Your review has already been submitted. We appreciate your valuable feedback!
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm max-w-md w-full text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display font-black text-lg text-brand-dark uppercase tracking-wider">
            Thank You!
          </h2>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-semibold">
            Your review has been successfully submitted and sent to our team for approval. We appreciate your feedback!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-10 font-sans">
      <div className="bg-white rounded-3xl border border-brand-gold/15 shadow-sm p-6 sm:p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black tracking-widest text-brand-gold uppercase bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-0.5 rounded">
            Feedback Form
          </span>
          <h2 className="font-display font-black text-xl text-brand-dark uppercase tracking-wider">
            How was your experience?
          </h2>
          <p className="text-[10px] font-extrabold text-brand-dark/50 tracking-wider uppercase">
            Order: {order.id}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selection */}
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-wider block">
              Your Rating *
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer text-brand-gold"
                >
                  <Star
                    size={28}
                    className={
                      star <= (hoverRating ?? rating)
                        ? "fill-brand-gold text-brand-gold"
                        : "text-brand-gold/30"
                    }
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] font-black text-brand-gold uppercase tracking-wider block mt-1">
              {rating}/5 Stars
            </span>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-wider block">
              Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-brand-bg/35 border border-brand-gold/15 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark shadow-inner"
            />
          </div>

          {/* Comment Box */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-wider block">
              Your Review *
            </label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full bg-brand-bg/35 border border-brand-gold/15 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark resize-none shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer shadow-md"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
