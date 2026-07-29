import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Clock, Phone, MapPin, X, Mail, ChevronDown, ShieldAlert, Sparkles } from "lucide-react";
import DishCard from "../components/DishCard";
import TestimonialCard from "../components/TestimonialCard";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { db } from "../utils/db";
import type { Review } from "../utils/db";
import type { Dish } from "../components/DishCard";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapSrc: string;
  googleMapsUrl: string;
}

const branches: Branch[] = [
  {
    id: "pragathinagar",
    name: "Sri Krishna Dhaba - Pragathi Nagar",
    address:
      "A/1, Oop Godavari Cuts, Bajrang Towers, 6-109/1760, Pragathi Nagar Rd, 3rd layout, Pragathi Nagar, Nizampet, Hyderabad, Telangana 500090",
    phone: "+91 90322 92421",
    hours: "Mon – Sun: 11:30 AM – 11:45 PM",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.378779646875!2d78.3924395!3d17.5254461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8f0052362da1%3A0xd093fe41bf080e4d!2sSri%20Krishna%20Family%20Dhaba!5e0!3m2!1sen!2sin!4v1704481029192!5m2!1sen!2sin",
    googleMapsUrl: "https://maps.app.goo.gl/gCPA6gsC3D5yoXos6"
  },
  {
    id: "aziznagar",
    name: "Balaji Chilkur Dhaba",
    address:
      "4-15/2part,Aziz Nagar,Himayth Sagar Rd,Moinabad Aziz Nagar, Himayat Sagar Rd, Moinabad, Telangana 500075",
    phone: "+91 90322 92421",
    hours: "Mon – Sun: 11:00 AM – 11:30 PM",
    mapSrc:
      "https://maps.google.com/maps?q=17.3484252,78.3184651(Balaji%20Chilkur%20Family%20Dhaba)&ll=17.3518,78.3184651&z=16&hl=en&output=embed",
    googleMapsUrl: "https://maps.app.goo.gl/geAW7347GGMi1GXH6"
  }
];



// Testimonials loaded dynamically from database

const resolveVideoUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If it's a relative video filename, resolve it to the default Cloudinary directory
  return `https://res.cloudinary.com/or5e9kak/video/upload/v1783783688/${url}`;
};

export interface HomeProps {
  previewData?: any;
}

export default function Home({ previewData }: HomeProps) {
  const navigate = useNavigate();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [activeBranch, setActiveBranch] = useState<string>("pragathinagar");
  const [signatureDishes, setSignatureDishes] = useState<Dish[]>([]);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (previewData) {
      setSettings(previewData);
      const allMenu = db.getMenu();
      let signatures = allMenu.filter((dish) => dish.isSignature);
      if (signatures.length === 0) {
        signatures = [
          allMenu.find((dish) => dish.id === "spl-starter-7"),
          allMenu.find((dish) => dish.id === "spl-starter-4"),
          allMenu.find((dish) => dish.id === "starter-9"),
          allMenu.find((dish) => dish.id === "biryani-6")
        ].filter((dish): dish is Dish => !!dish);
      }
      setSignatureDishes(signatures);

      const approved = db.getReviews().filter((r) => r.status === "Approved");
      setTestimonials(approved);
      return;
    }

    db.incrementWebsiteVisits();
    const isPreview = window.location.search.includes("preview=true");
    const loadSettings = () => setSettings(isPreview ? db.getSettingsDraft() : db.getSettings());
    loadSettings();

    window.addEventListener(isPreview ? "skd_settings_draft_updated" : "skd_settings_updated", loadSettings);
    window.addEventListener("storage", loadSettings);
    
    // Load Dynamic Menu Specials
    const allMenu = db.getMenu();
    let signatures = allMenu.filter((dish) => dish.isSignature);
    if (signatures.length === 0) {
      signatures = [
        allMenu.find((dish) => dish.id === "spl-starter-7"),
        allMenu.find((dish) => dish.id === "spl-starter-4"),
        allMenu.find((dish) => dish.id === "starter-9"),
        allMenu.find((dish) => dish.id === "biryani-6")
      ].filter((dish): dish is Dish => !!dish);
    }
    setSignatureDishes(signatures);

    // Load Approved Reviews
    const approved = db.getReviews().filter((r) => r.status === "Approved");
    setTestimonials(approved);

    return () => {
      window.removeEventListener(isPreview ? "skd_settings_draft_updated" : "skd_settings_updated", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  const dynamicBranches = useMemo(() => {
    if (!settings) return branches;
    return branches.map(b => {
      if (b.id === "pragathinagar") {
        return {
          ...b,
          address: settings.contactAddress || b.address,
          phone: settings.contactPhone || b.phone,
          hours: settings.timings || b.hours
        };
      }
      return b;
    });
  }, [settings]);

  const currentBranch = dynamicBranches.find((b) => b.id === activeBranch)!;
  const mainPhone = settings?.contactPhone || "+91 90322 92421";
  const mainEmail = settings?.contactEmail || "contact@srikrishnadhaba.com";
  const cleanPhone = mainPhone.replace(/[^0-9]/g, "");
  const whatsappNum = settings?.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, "") : "919032292421";
  const instagramUrl = settings?.instagramUrl || "https://instagram.com";
  const facebookUrl = settings?.facebookUrl || "https://facebook.com";
  const zomatoUrl = settings?.zomatoUrl || "https://www.zomato.com/hyderabad/search?q=Sri%20Krishna%20Family%20Dhaba";
  const swiggyUrl = settings?.swiggyUrl || "https://www.swiggy.com/search?query=Sri%20Krishna%20Family%20Dhaba";

  const scrollToNext = () => {
    const nextSection = document.getElementById("signature-dishes");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative pt-0 md:pt-20">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Hero Section (Clean Video Displayer Showcase) */}
      <section className="relative w-full h-[100dvh] md:h-auto md:aspect-video md:min-h-[80vh] bg-brand-dark overflow-hidden z-10 snap-child flex items-center justify-center">
        {videoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-brand-dark text-brand-bg space-y-3 z-20">
            <span className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500">
              <ShieldAlert size={24} />
            </span>
            <p className="font-display font-black text-xs uppercase tracking-widest text-brand-gold">
              Hero video could not be loaded
            </p>
            <p className="text-[10px] text-brand-bg/60 max-w-xs">
              Please check the URL in the CMS console. Rendered rest of the page.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Video: Only render and show if heroVideoMobile is provided */}
            {settings?.heroVideoMobile ? (
              <video
                key={resolveVideoUrl(settings.heroVideoMobile)}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover block md:hidden relative z-10"
              >
                <source src={resolveVideoUrl(settings.heroVideoMobile)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                {/* Blurred background video for filling portrait screens on mobile (Fallback when no mobile-specific video is set) */}
                <video
                  key={settings?.heroVideo ? `bg-${resolveVideoUrl(settings.heroVideo)}` : "default-bg"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-105 pointer-events-none md:hidden"
                >
                  <source 
                    src={resolveVideoUrl(settings?.heroVideo) || "https://res.cloudinary.com/or5e9kak/video/upload/v1783771254/WhatsApp_Video_2026-07-11_at_10.04.14_dnyzq3.mp4"} 
                    type="video/mp4" 
                  />
                </video>
         
                {/* Main foreground video on mobile (Fallback when no mobile-specific video is set) */}
                <video
                  key={settings?.heroVideo ? `fg-${resolveVideoUrl(settings.heroVideo)}` : "default-fg"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-contain relative z-10 md:hidden"
                >
                  <source 
                    src={resolveVideoUrl(settings?.heroVideo) || "https://res.cloudinary.com/or5e9kak/video/upload/v1783771254/WhatsApp_Video_2026-07-11_at_10.04.14_dnyzq3.mp4"} 
                    type="video/mp4" 
                  />
                  Your browser does not support the video tag.
                </video>
              </>
            )}

            {/* Desktop foreground video (always hidden on mobile, shown on desktop) */}
            <video
              key={settings?.heroVideo ? `desktop-${resolveVideoUrl(settings.heroVideo)}` : "default-desktop"}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover hidden md:block relative z-10"
            >
              <source 
                src={resolveVideoUrl(settings?.heroVideo) || "https://res.cloudinary.com/or5e9kak/video/upload/v1783771254/WhatsApp_Video_2026-07-11_at_10.04.14_dnyzq3.mp4"} 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </>
        )}

        {/* Scroll Down Indicator for Mobile */}
        <div 
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 md:hidden flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase group-hover:text-brand-gold transition-colors duration-300">
            Scroll Down
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/70 group-hover:text-brand-gold transition-colors duration-300"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </section>


      {/* Signature Dishes Showcase */}
      <section id="signature-dishes" className="py-24 bg-brand-bg snap-child">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent block mb-2">Our Masterpieces</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-dark tracking-tight">
              Signature Dishes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {signatureDishes.map((dish) => (
              <DishCard 
                key={dish.id} 
                dish={dish} 
                showImage={true}
                onClickOverride={(e) => {
                  e.stopPropagation();
                  navigate(`/menu?item=${dish.id}`);
                }}
              />
            ))}
          </div>

          {/* View Full Menu Button */}
          <div className="flex justify-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-dark text-brand-bg font-bold text-sm tracking-wide px-8 py-4 rounded-full shadow-lg transition-all duration-300 group"
            >
              <span>View Full Menu</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </section>

      {/* Interactive Review Marquee */}
      <section className="py-24 bg-brand-bg/40 border-y border-brand-gold/15 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent block mb-2">Diner Stories</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-dark tracking-tight">
            Hear From Our Guests
          </h2>
          <p className="text-brand-dark/70 text-sm mt-3">
            Click on any card to read their full detailed dining experience.
          </p>
        </div>

        {/* Row 1: Scrolling Left */}
        <div className="marquee-container flex gap-6 overflow-hidden py-2 relative">
          <div className="marquee-content flex gap-6 animate-marquee-left shrink-0">
            {testimonials.concat(testimonials).map((t, idx) => (
              <TestimonialCard
                key={`row1-${t.id}-${idx}`}
                testimonial={t}
                onClick={() => setSelectedReview(t)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Review Modal */}
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

      {/* ──────────── ONLINE RESERVATION PROMOTION ──────────── */}
      <section className="py-20 bg-brand-dark text-brand-bg relative overflow-hidden">
        {/* Noise overlay */}
        <div className="noise-overlay opacity-5" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-brand-bg tracking-tight">
            Reserve Your Table
          </h2>
          
          <div className="max-w-2xl mx-auto border border-brand-gold/30 bg-white/5 backdrop-blur-sm rounded-3xl p-8 my-4 relative">
            {/* Corner gold borders */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brand-gold" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brand-gold" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-brand-gold" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-brand-gold" />
            
            <p className="text-sm sm:text-base font-bold text-brand-gold tracking-wide uppercase mb-2 flex items-center justify-center gap-1.5">
              <Sparkles size={16} className="text-brand-gold shrink-0 animate-pulse" />
              <span>Website Exclusive Offer</span>
            </p>
            <p className="text-base sm:text-lg md:text-xl font-display text-brand-bg/95 leading-relaxed italic">
              "{db.formatPromoText(settings?.reservationPromoText || "Reserve your table through our website and receive {discount}% OFF on your final dining bill.", settings?.discountPercent ?? 10)}"
            </p>
          </div>
          
          <p className="text-xs sm:text-sm text-brand-bg/75 max-w-lg mx-auto leading-relaxed">
            Avoid wait times and get premium seating. Choose your preferred table layouts from our interactive dining map.
          </p>
          
          <div className="pt-4">
            <Link
              to="/book-table"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-gold text-white hover:text-brand-dark font-extrabold text-xs tracking-widest uppercase px-8 py-4.5 rounded-full shadow-lg transition-all duration-300"
            >
              <span>Reserve A Table Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────── CONTACT & DIRECTIONS SECTION ──────────── */}
      <section className="py-24 bg-brand-bg/60 border-t border-brand-gold/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-2">
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-brand-dark relative pb-4 inline-block">
              Contact Us
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-brand-accent rounded-full" />
            </h2>
          </div>

          {/* Two-Column Grid: Contact Cards + Order Online */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8">
            {/* Left Column: Grid of Contact Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${whatsappNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-brand-gold/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <WhatsAppIcon size={18} />
                </div>
                <h3 className="font-sans font-bold text-brand-dark text-xs sm:text-sm">WhatsApp</h3>
                <p className="text-[10px] sm:text-xs text-brand-dark/50 mt-0.5">Chat with us</p>
              </a>

              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-brand-gold/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-brand-dark text-xs sm:text-sm">Instagram</h3>
                <p className="text-[10px] sm:text-xs text-brand-dark/50 mt-0.5">Follow updates</p>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-brand-gold/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-brand-dark text-xs sm:text-sm">Facebook</h3>
                <p className="text-[10px] sm:text-xs text-brand-dark/50 mt-0.5">Join community</p>
              </a>

              {/* Call Us */}
              <a
                href={`tel:${cleanPhone}`}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-brand-gold/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 text-brand-gold flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Phone size={18} className="fill-brand-gold/10" />
                </div>
                <h3 className="font-sans font-bold text-brand-dark text-xs sm:text-sm">Call Us</h3>
                <p className="text-[10px] sm:text-xs text-brand-accent font-bold mt-0.5">{mainPhone}</p>
              </a>

              {/* Mail Us */}
              <a
                href={`mailto:${mainEmail}`}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-brand-gold/10 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center col-span-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
                <h3 className="font-sans font-bold text-brand-dark text-xs sm:text-sm">Mail Us</h3>
                <p className="text-[10px] sm:text-xs text-brand-dark/65 mt-0.5 font-medium">{mainEmail}</p>
              </a>
            </div>

            {/* Right Column: Order Online Delivery */}
            <div className="space-y-6 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-brand-accent inline-block" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-accent">
                  ORDER ONLINE
                </span>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-dark leading-tight">
                  Sri Krishna Flavors
                </h3>
                <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-gold leading-none mt-1">
                  at Your Doorstep
                </h3>
              </div>

              <div className="space-y-4 pt-2">
                {/* Zomato */}
                <a
                  href={zomatoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center text-lg select-none">z</div>
                    <div>
                      <h4 className="font-sans font-bold text-brand-dark text-sm">Zomato</h4>
                      <p className="text-[10px] text-brand-dark/45">Official Partner</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-brand-bg transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </a>

                {/* Swiggy */}
                <a
                  href={swiggyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 font-bold flex items-center justify-center text-lg select-none">s</div>
                    <div>
                      <h4 className="font-sans font-bold text-brand-dark text-sm">Swiggy</h4>
                      <p className="text-[10px] text-brand-dark/45">Official Partner</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-brand-bg transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </a>

                {/* WhatsApp Delivery */}
                <Link
                  to="/menu?orderType=Delivery&orderPlatform=WhatsApp"
                  className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border-l-4 border-emerald-500 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg select-none">
                      <WhatsAppIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-brand-dark text-sm">WhatsApp Delivery</h4>
                      <p className="text-[10px] text-brand-dark/45">Direct Order</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-brand-bg transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* ──────────── VISIT OUR BRANCHES SECTION ──────────── */}
          <div className="mt-24">
            {/* Section Header */}
            <div className="text-center mb-10 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-accent">
                FIND US NEAR YOU
              </span>
              <h3 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark">
                Visit Our Branches
              </h3>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setActiveBranch(branch.id)}
                  className={`px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                    activeBranch === branch.id
                      ? "bg-brand-accent text-white border-brand-accent shadow-md"
                      : "bg-white text-brand-dark border-brand-gold/15 hover:border-brand-accent/40"
                  }`}
                >
                  {branch.id === "pragathinagar" ? "Pragathi Nagar" : "Moinabad"}
                </button>
              ))}
            </div>

            {/* Branch Details + Map Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Left: Branch Info Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-gold/10 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-brand-dark">
                    {currentBranch.name}
                  </h3>

                  {/* Address */}
                  <a
                    href={currentBranch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group/addr cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0 mt-0.5 group-hover/addr:bg-brand-accent group-hover/addr:text-white transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider">Address</h4>
                      <p className="text-xs sm:text-sm text-brand-dark/75 leading-relaxed mt-1 group-hover/addr:text-brand-accent transition-colors duration-300">
                        {currentBranch.address}
                      </p>
                      <span className="text-[10px] text-brand-accent/70 mt-1 inline-block underline underline-offset-2">
                        View on Google Maps →
                      </span>
                    </div>
                  </a>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
                      <Phone size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider">Phone</h4>
                      <a href={`tel:${currentBranch.phone.replace(/\s/g, "")}`} className="text-sm text-brand-dark font-semibold hover:text-brand-accent transition-colors mt-1 block">
                        {currentBranch.phone}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-brand-olive/10 flex items-center justify-center text-brand-olive shrink-0 mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider">Hours</h4>
                      <p className="text-sm text-brand-dark/80 mt-1">
                        {currentBranch.hours}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Get Directions CTA */}
                <a
                  href={currentBranch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-dark text-brand-bg text-xs font-bold tracking-widest uppercase py-3.5 rounded-xl shadow-md transition-all duration-300"
                >
                  <MapPin size={14} />
                  <span>Get Directions</span>
                </a>
              </div>

              {/* Right: Google Maps Embed */}
              <div className="h-[350px] lg:h-auto min-h-[350px] rounded-3xl overflow-hidden border border-brand-gold/10 shadow-sm bg-white relative">
                <iframe
                  key={currentBranch.id}
                  title={`${currentBranch.name} Map`}
                  src={currentBranch.mapSrc}
                  className="border-0 absolute"
                  style={{
                    width: 'calc(100% + 40px)',
                    height: 'calc(100% + 200px)',
                    top: '-160px',
                    left: '-20px'
                  }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
