import { useState, useMemo, useEffect } from "react";
import { Star, Search, MessageSquarePlus, CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TestimonialCard from "../components/TestimonialCard";
import { db } from "../utils/db";
import type { Review } from "../utils/db";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "All">("All");
  const [sortBy, setSortBy] = useState<"recent" | "high" | "low">("recent");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    quote: "",
    source: "Website Guest"
  });

  const [formError, setFormError] = useState("");

  const loadReviews = () => {
    // Show only Approved reviews on public page
    setReviews(db.getReviews().filter((r) => r.status === "Approved"));
  };
  useEffect(() => {
    loadReviews();
    window.addEventListener("storage", loadReviews);
    return () => window.removeEventListener("storage", loadReviews);
  }, []);
  // Calculate statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? (sum / total).toFixed(1) : "0.0";

    const counts = [0, 0, 0, 0, 0]; // 5 to 1 star counts
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[5 - r.rating]++;
      }
    });

    return { total, average, counts };
  }, [reviews]);

  // Filter & Sort
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.quote.toLowerCase().includes(q)
      );
    }

    if (ratingFilter !== "All") {
      result = result.filter((r) => r.rating === ratingFilter);
    }

    if (sortBy === "recent") {
      // Sort pinned reviews first, then keep list order (newest first in localStorage)
      result.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
    } else if (sortBy === "high") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "low") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [reviews, searchQuery, ratingFilter, sortBy]);

  const handleWriteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.quote) {
      setFormError("Please fill out both your name and review message.");
      return;
    }

    db.addReview({
      name: newReview.name,
      role: "Guest Reviewer",
      rating: newReview.rating,
      quote: newReview.quote,
      source: "Website Guest"
    });

    setFormSubmitted(true);
    setFormError("");

    setTimeout(() => {
      setIsFormOpen(false);
      setFormSubmitted(false);
      setNewReview({ name: "", rating: 5, quote: "", source: "Website Guest" });
      loadReviews();
    }, 2000);
  };


  return (
    <div className="min-h-screen pt-28 pb-20 relative bg-brand-bg/30">
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-brand-accent/15 border border-brand-accent/25 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-accent">
            Customer Experiences
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-brand-dark tracking-tight leading-none">
            Customer Reviews
          </h1>
          <p className="font-telugu text-brand-gold font-bold text-base sm:text-lg">
            కృష్ణ ఫ్యామిలీ ధాబ - వినియోగదారుల సమీక్షలు
          </p>
        </div>

        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Summary Box */}
          <div className="glass-panel p-8 rounded-3xl border border-brand-gold/15 flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-display font-black text-brand-dark">{stats.average}</span>
            <div className="flex space-x-1 my-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.round(Number(stats.average))
                      ? "text-brand-gold fill-brand-gold"
                      : "text-brand-dark/15"
                  }
                />
              ))}
            </div>
            <p className="text-xs text-brand-dark/65 font-sans">
              Based on {stats.total + 321} reviews<br />(327 Google Reviews + website customer submissions)
            </p>
          </div>

          {/* Rating Distribution Bars */}
          <div className="glass-panel p-8 rounded-3xl border border-brand-gold/15 col-span-1 md:col-span-2 flex flex-col justify-center space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.counts[5 - stars];
              const totalForBars = reviews.length;
              const percentage = totalForBars > 0 ? ((count / totalForBars) * 100).toFixed(0) : "0";

              return (
                <div key={stars} className="flex items-center gap-4 text-xs font-semibold text-brand-dark">
                  <span className="w-12 flex items-center gap-1 shrink-0">
                    <span>{stars}</span>
                    <Star size={12} className="fill-brand-gold text-brand-gold" />
                  </span>
                  <div className="flex-1 h-2.5 bg-brand-dark/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-gold rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right shrink-0 text-brand-dark/65">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Filters and Write Review Buttons */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-bg rounded-2xl p-4 shadow-sm border border-brand-gold/15 mb-10">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={16} />
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-bg/50 border border-brand-gold/15 focus:outline-none focus:border-brand-accent text-xs text-brand-dark"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-end w-full md:w-auto">
            {/* Rating tab buttons filter */}
            <div className="flex flex-wrap gap-1 bg-brand-bg/30 border border-brand-gold/15 rounded-xl p-1 text-[10px] sm:text-xs">
              {[
                { label: "ALL STARS", value: "All" },
                { label: "5 STARS", value: 5 },
                { label: "4 STARS", value: 4 },
                { label: "3 STARS", value: 3 },
                { label: "2 STARS", value: 2 },
                { label: "1 STAR", value: 1 }
              ].map((opt) => {
                const isSel = ratingFilter === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setRatingFilter(opt.value as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                      isSel
                        ? "bg-brand-gold text-brand-dark shadow-sm"
                        : "text-brand-dark/70 hover:text-brand-gold hover:bg-brand-dark/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Select */}
            <div className="relative flex items-center bg-brand-bg/50 border border-brand-gold/15 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer py-1"
              >
                <option value="recent">Most Recent</option>
                <option value="high">Highest Rating</option>
                <option value="low">Lowest Rating</option>
              </select>
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-brand-accent hover:bg-brand-dark text-brand-bg text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow"
            >
              <MessageSquarePlus size={14} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Review list */}
        <div className="space-y-6 overflow-hidden py-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-brand-dark/50 font-sans">
              No reviews found matching your criteria.
            </div>
          ) : (
            <>
              {/* Row 1: Scrolling Left */}
              <div className="marquee-container flex gap-6 overflow-hidden py-2 relative">
                <div className="marquee-content flex gap-6 animate-marquee-left shrink-0">
                  {(() => {
                    const repeated = Array.from({ length: Math.ceil(10 / filteredReviews.length) })
                      .flatMap(() => filteredReviews);
                    const marqueeItems = [...repeated, ...repeated];
                    return marqueeItems.map((review, idx) => (
                      <TestimonialCard
                        key={`row1-${review.id}-${idx}`}
                        testimonial={review}
                        onClick={() => setSelectedReview(review)}
                      />
                    ));
                  })()}
                </div>
              </div>

              {/* Row 2: Scrolling Right */}
              {filteredReviews.length > 2 && (
                <div className="marquee-container hidden md:flex gap-6 overflow-hidden py-2 relative">
                  <div className="marquee-content flex gap-6 animate-marquee-right shrink-0">
                    {(() => {
                      const reversed = [...filteredReviews].reverse();
                      const repeated = Array.from({ length: Math.ceil(10 / reversed.length) })
                        .flatMap(() => reversed);
                      const marqueeItems = [...repeated, ...repeated];
                      return marqueeItems.map((review, idx) => (
                        <TestimonialCard
                          key={`row2-${review.id}-${idx}`}
                          testimonial={review}
                          onClick={() => setSelectedReview(review)}
                        />
                      ));
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-brand-bg rounded-3xl p-8 shadow-2xl border border-brand-gold/25 z-10"
              >
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-dark/10 hover:bg-brand-accent hover:text-brand-bg flex items-center justify-center text-brand-dark transition-colors duration-300"
                >
                  <X size={16} />
                </button>

                <AnimatePresence mode="wait">
                  {!formSubmitted ? (
                    <form onSubmit={handleWriteReview} className="space-y-4">
                      <h3 className="font-display font-bold text-xl text-brand-dark">Write Your Review</h3>
                      <p className="text-[10px] text-brand-dark/50">Your dining experience helps others make delicious decisions.</p>

                      {formError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 mb-1">Your Name</label>
                        <input
                          type="text"
                          value={newReview.name}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-gold/15 focus:outline-none focus:border-brand-accent text-xs text-brand-dark"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 mb-1">Rating</label>
                        <div className="flex space-x-1.5 py-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                              className="text-brand-gold"
                            >
                              <Star
                                size={22}
                                className={star <= newReview.rating ? "fill-brand-gold" : "text-brand-dark/20"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 mb-1">Review Message</label>
                        <textarea
                          rows={3}
                          value={newReview.quote}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, quote: e.target.value }))}
                          placeholder="Tell us about the food quality, service, and ambiance..."
                          className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-gold/15 focus:outline-none focus:border-brand-accent text-xs text-brand-dark"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-accent hover:bg-brand-dark text-brand-bg font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow transition-colors"
                      >
                        Submit Review
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-3 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-brand-accent/15 flex items-center justify-center text-brand-accent">
                        <CheckCircle2 size={24} className="animate-bounce" />
                      </div>
                      <h4 className="font-display font-extrabold text-lg text-brand-dark">Review Submitted!</h4>
                      <p className="text-xs text-brand-dark/70 max-w-xs">
                        Thank you for your valuable feedback. It has been successfully added to our customer registry.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Review Detail Modal */}
        <AnimatePresence>
          {selectedReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedReview(null)}
                className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-brand-bg rounded-3xl p-8 shadow-2xl border border-brand-gold/25 z-10"
              >
                <button
                  onClick={() => setSelectedReview(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-dark/10 hover:bg-brand-accent hover:text-brand-bg flex items-center justify-center text-brand-dark transition-colors duration-300"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-gold/20 flex items-center justify-center font-bold text-brand-accent font-display text-base">
                    {selectedReview.avatar}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-brand-dark text-base">{selectedReview.name}</h3>
                    <p className="text-xs text-brand-dark/65">{selectedReview.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < selectedReview.rating
                            ? "text-brand-gold fill-brand-gold"
                            : "text-brand-dark/15"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {selectedReview.source}
                  </span>
                </div>

                <p className="text-sm text-brand-dark/85 leading-relaxed italic font-sans mb-6">
                  "{selectedReview.quote}"
                </p>

                <div className="text-xs text-brand-dark/50 border-t border-brand-dark/10 pt-4 flex justify-between">
                  <span>Dined: {selectedReview.date}</span>
                  <span>Verified Visitor</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
