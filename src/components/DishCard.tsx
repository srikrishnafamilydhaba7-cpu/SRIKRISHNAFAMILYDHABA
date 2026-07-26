import { useState } from "react";
import { Star, X, Heart, ShieldAlert, Sparkles, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "../utils/menuHelpers";
import WhatsAppIcon from "./WhatsAppIcon";
import { db } from "../utils/db";

export interface Dish {
  id: string;
  title: string;
  teluguTitle: string;
  category: string;
  description: string;
  price: number | string;
  rating: number;
  image: string;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  isSignature?: boolean;
  ingredients?: string[];
  allergens?: string[];
  prepTime?: string;
  outOfStock?: boolean;
  hidden?: boolean;
}

interface DishCardProps {
  dish: Dish;
  onClickOverride?: (e: React.MouseEvent) => void;
  showImage?: boolean;
}

export default function DishCard({ dish, onClickOverride, showImage = true }: DishCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const ordered = false;
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const finalShowImage = showImage;
  const settings = db.getSettings();
  const whatsappNum = settings?.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, "") : "919032292421";

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClickOverride) {
      onClickOverride(e);
      return;
    }
    setIsOrderModalOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClickOverride) {
      onClickOverride(e);
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <motion.div
        layoutId={`card-container-${dish.id}`}
        onClick={handleCardClick}
        className={`bg-brand-bg rounded-2xl border border-brand-dark/20 hover:border-brand-accent/50 transition-all duration-300 cursor-pointer group relative h-full flex ${
          finalShowImage ? "flex-col overflow-hidden hover:shadow-lg min-h-[330px]" : "p-5 justify-between items-center gap-4 hover:shadow-md min-h-[120px]"
        }`}
        whileHover={{ y: finalShowImage ? -5 : -3 }}
      >
        {finalShowImage ? (
          <>
            {/* Top: Image Section */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-dark/5 shrink-0">
              <img 
                src={dish.image} 
                alt={dish.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {dish.outOfStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <span className="bg-rose-600 text-white font-display font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-lg border border-rose-500">
                    OUT OF STOCK
                  </span>
                </div>
              )}
              {/* Wishlist Button floated on Image */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center text-brand-accent shadow-sm transition-all duration-300"
              >
                <Heart size={13} className={isLiked ? "fill-brand-accent text-brand-accent" : ""} />
              </button>

              {/* Badges on Image */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                <span className="border border-emerald-500/30 bg-emerald-500/90 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm uppercase shrink-0">
                  VEG
                </span>
                {dish.isChefSpecial && (
                  <span className="bg-brand-accent/90 border border-brand-accent/25 text-brand-bg text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm shrink-0">
                    <Sparkles size={8} className="fill-brand-bg animate-pulse" />
                    <span>Chef's Choice</span>
                  </span>
                )}
                {dish.isPopular && (
                  <span className="bg-brand-gold/90 border border-brand-gold/25 text-brand-dark text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm shrink-0">
                    Popular
                  </span>
                )}
              </div>
            </div>

            {/* Bottom: Info Section */}
            <div className="p-4 flex flex-col flex-grow justify-between min-h-[135px]">
              <div>
                {/* Title and Telugu Title */}
                <h3 className="font-display font-bold text-[15px] text-brand-dark group-hover:text-brand-accent transition-colors duration-300 truncate">
                  {dish.title}
                </h3>
                <p className="font-telugu text-[11px] text-brand-gold font-semibold mt-0.5 truncate">
                  {dish.teluguTitle}
                </p>

                {/* Short Description */}
                {dish.description && (
                  <p className="text-[11px] text-brand-dark/70 leading-relaxed mt-2 line-clamp-2">
                    {dish.description}
                  </p>
                )}
              </div>

              {/* Price & Quick Add Row */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-brand-dark/10">
                <span className="font-display font-extrabold text-brand-dark text-base">
                  {formatPrice(dish.price)}
                </span>

                <button
                  onClick={handleOrder}
                  disabled={dish.outOfStock}
                  className={`text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md transition-all duration-300 ${
                    dish.outOfStock 
                      ? "bg-gray-200 text-gray-400 border border-gray-300 shadow-none cursor-not-allowed" 
                      : "bg-brand-accent hover:bg-brand-dark text-brand-bg border border-brand-accent"
                  }`}
                >
                  {dish.outOfStock ? "Sold Out" : ordered ? "Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left Side: Info */}
            <div className="flex flex-col flex-grow min-w-0 pr-2">
              {/* Badge Row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {dish.outOfStock ? (
                  <span className="border border-rose-500/30 bg-rose-500/90 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase shrink-0">
                    OUT OF STOCK
                  </span>
                ) : (
                  <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase shrink-0">
                    VEG
                  </span>
                )}
                {dish.isChefSpecial && (
                  <span className="bg-brand-accent/10 border border-brand-accent/25 text-brand-accent text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <Sparkles size={8} className="fill-brand-accent animate-pulse" />
                    <span>Chef's Choice</span>
                  </span>
                )}
                {dish.isPopular && (
                  <span className="bg-brand-gold/10 border border-brand-gold/25 text-brand-dark text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shrink-0">
                    Popular
                  </span>
                )}
              </div>

              {/* Title and Telugu Title */}
              <h3 className="font-display font-bold text-base sm:text-lg text-brand-dark group-hover:text-brand-accent transition-colors duration-300 truncate">
                {dish.title}
              </h3>
              <p className="font-telugu text-[11px] text-brand-gold font-semibold mt-0.5 truncate">
                {dish.teluguTitle}
              </p>

              {/* Short Description */}
              {dish.description && (
                <p className="text-xs text-brand-dark/65 leading-relaxed mt-2 line-clamp-1 max-w-sm hidden sm:block">
                  {dish.description}
                </p>
              )}
            </div>

            {/* Right Side: Price & Quick Add */}
            <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[120px]">
              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="w-7 h-7 rounded-full bg-brand-dark/5 hover:bg-brand-accent/15 flex items-center justify-center text-brand-accent transition-all duration-300 mb-2 self-end"
              >
                <Heart size={14} className={isLiked ? "fill-brand-accent text-brand-accent" : ""} />
              </button>

              {/* Price */}
              <span className="font-display font-extrabold text-brand-dark text-base sm:text-lg">
                {formatPrice(dish.price)}
              </span>

              {/* Quick Add Button */}
              <button
                onClick={handleOrder}
                disabled={dish.outOfStock}
                className={`mt-2 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm transition-all duration-300 border shrink-0 ${
                  dish.outOfStock
                    ? "bg-gray-200 text-gray-400 border-gray-300 shadow-none cursor-not-allowed"
                    : "bg-brand-accent/90 hover:bg-brand-accent text-brand-bg border-transparent"
                }`}
              >
                {dish.outOfStock ? "Sold Out" : ordered ? "Added!" : "Add to Cart"}
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              layoutId={`card-container-${dish.id}`}
              className="relative w-full max-w-md bg-brand-bg rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-gold/20 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-brand-dark/10 hover:bg-brand-accent hover:text-brand-bg flex items-center justify-center text-brand-dark transition-all duration-300 z-20"
              >
                <X size={18} />
              </button>

              {/* Title & Badge */}
              <div className="mt-4 mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase">
                    VEG
                  </span>
                  <span className="bg-brand-gold/90 text-brand-dark text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded">
                    {dish.category}
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-2xl text-brand-dark leading-tight">
                  {dish.title}
                </h2>
                <p className="font-telugu text-sm text-brand-gold font-semibold mt-1">
                  {dish.teluguTitle}
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto pr-1 mb-6 space-y-4">
                {finalShowImage && dish.image && (
                  <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-brand-dark/5 shadow-sm">
                    <img src={dish.image} alt={dish.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Rating & Prep Time */}
                <div className="flex items-center gap-4 text-xs font-semibold text-brand-dark/75">
                  <div className="flex items-center space-x-1 text-brand-gold">
                    <Star size={14} className="fill-brand-gold" />
                    <span className="font-bold text-brand-dark">{dish.rating} / 5.0</span>
                  </div>
                  {dish.prepTime && <span>• Prep: {dish.prepTime}</span>}
                  <span>• Pure Vegetarian</span>
                </div>

                {/* Description */}
                <p className="text-sm text-brand-dark/80 leading-relaxed font-sans">
                  {dish.description}
                </p>

                {/* Ingredients */}
                {dish.ingredients && dish.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-brand-accent font-bold mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {dish.ingredients.map((ing) => (
                        <span key={ing} className="bg-brand-dark/5 text-brand-dark/80 text-xs px-2.5 py-1 rounded-lg">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergens warning */}
                {dish.allergens && dish.allergens.length > 0 && (
                  <div className="bg-brand-accent/5 border border-brand-accent/15 p-3 rounded-xl flex gap-2 items-start">
                    <ShieldAlert size={16} className="text-brand-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent block">Allergen Info</span>
                      <p className="text-xs text-brand-dark/75">Contains: {dish.allergens.join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Area */}
              <div className="pt-4 border-t border-brand-dark/15 flex items-center justify-between gap-4 mt-auto">
                <div>
                  <span className="text-xs text-brand-dark/50 block">Price</span>
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark">{formatPrice(dish.price)}</span>
                </div>

                <button
                  onClick={(e) => {
                    setIsOpen(false);
                    handleOrder(e);
                  }}
                  className="flex-1 bg-brand-accent hover:bg-brand-dark text-brand-bg font-bold text-sm tracking-wide py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Platform Modal Overlay */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#F5F5F5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-gold/20 z-10 flex flex-col"
            >
              {/* Header: Brand Green branding header */}
              <div className="bg-[#265429] text-white p-8 flex flex-col items-center text-center space-y-3 relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                {/* Gold Seal Shopping Bag icon */}
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-brand-gold/15 flex items-center justify-center text-brand-gold">
                  <ShoppingBag size={20} />
                </div>

                <h3 className="font-display font-black text-2xl tracking-wide uppercase">
                  Order Online
                </h3>
                <p className="text-xs text-brand-bg/75">
                  Choose your platform to order <span className="text-brand-gold font-bold">{dish.title}</span>
                </p>
              </div>

              {/* Body Platform Selection */}
              <div className="p-6 space-y-5">
                {/* Swiggy & Zomato row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Swiggy */}
                  <a
                    href={`https://www.swiggy.com/search?query=${encodeURIComponent(`Sri Krishna Family Dhaba ${dish.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#fc8019] text-white rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-md group/platform"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-[#fc8019] flex items-center justify-center text-lg font-black font-display mb-3 select-none shadow-sm">
                      S
                    </div>
                    <span className="text-xs font-bold font-sans">Swiggy</span>
                    <span className="text-[9px] opacity-80 mt-0.5">Fast delivery - Live tracking</span>
                    <span className="text-[10px] font-bold mt-3 border-b border-white/40 pb-0.5 group-hover/platform:border-white transition-colors">
                      Order Now →
                    </span>
                  </a>

                  {/* Zomato */}
                  <a
                    href={`https://www.zomato.com/hyderabad/search?q=${encodeURIComponent(`Sri Krishna Family Dhaba ${dish.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#cb202d] text-white rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-md group/platform"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-[#cb202d] flex items-center justify-center text-lg font-black font-display mb-3 select-none shadow-sm">
                      Z
                    </div>
                    <span className="text-xs font-bold font-sans">Zomato</span>
                    <span className="text-[9px] opacity-80 mt-0.5">Reviews - Ratings - Delivery</span>
                    <span className="text-[10px] font-bold mt-3 border-b border-white/40 pb-0.5 group-hover/platform:border-white transition-colors">
                      Order Now →
                    </span>
                  </a>
                </div>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`Hello Sri Krishna Family Dhaba, I would like to order "${dish.title}" from the menu.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25d366] text-white rounded-2xl p-4 flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#25d366] flex items-center justify-center shadow-sm">
                      <WhatsAppIcon size={16} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold font-sans">WhatsApp</h4>
                      <p className="text-[9px] opacity-80 mt-0.5">Call or chat to place order directly</p>
                    </div>
                  </div>
                  <span className="text-white text-xs font-bold">→</span>
                </a>
              </div>

              {/* Footer */}
              <div className="pb-6 px-4 text-[9px] text-brand-dark/50 text-center uppercase tracking-wider font-semibold font-sans">
                Sri Krishna Family Dhaba • Pragathi Nagar • +91 90322 92421
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
