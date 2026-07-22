import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Phone } from "lucide-react";
import { db } from "../utils/db";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    db.init();
    setSettings(db.getSettings());
  }, []);

  const phone = settings?.contactPhone || "+91 90322 92421";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const whatsappNum = settings?.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, "") : "919032292421";
  const address = settings?.contactAddress || "A/1, Oop Godavari Cuts, Bajrang Towers, 6-109/1760, Pragathi Nagar Rd, Hyderabad, Telangana 500090";
  const timings = settings?.timings || "Mon – Sun: 11:30 AM – 11:45 PM";
  return (
    <footer className="bg-brand-dark text-brand-bg/85 pt-16 pb-8 border-t border-brand-gold/15 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-olive/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Logo, Brand Text, description, & social icons */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Circular Gold Seal Logo (same as Navbar) */}
              <div className="w-10 h-10 rounded-full bg-brand-dark border-2 border-brand-gold flex items-center justify-center shadow-md relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <svg className="w-8 h-8 text-brand-gold fill-brand-gold" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M50 20 L55 33 L69 33 L58 41 L62 55 L50 47 L38 55 L42 41 L31 33 L45 33 Z" />
                  <text x="50" y="70" textAnchor="middle" fontSize="12" fontWeight="black" fill="#D4AF37" fontFamily="monospace" letterSpacing="1">SKD</text>
                  <text x="50" y="80" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#D4AF37" fontFamily="sans-serif">ESTD 1998</text>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-sm tracking-wider text-white leading-tight uppercase">
                  SRI KRISHNA FAMILY
                </span>
                <span className="font-display font-black text-sm tracking-wider text-white leading-none uppercase">
                  DHABA
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-brand-bg/75 font-sans">
              Serving the finest vegetarian culinary delights in Pragathi Nagar. Famous for our Butter Naan, Paneer Biryani, and welcoming atmosphere.
            </p>

            {/* Social Media Circular Buttons Grid */}
            <div className="flex items-center space-x-3 pt-2">
              {/* Phone (Green) */}
              <a
                href={`tel:${cleanPhone}`}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Call Us"
              >
                <Phone size={16} className="fill-white/10" />
              </a>

              {/* WhatsApp (Green) */}
              <a
                href={`https://wa.me/${whatsappNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#25d366] hover:bg-[#25d366]/90 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>

              {/* Instagram (Instagram gradient) */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* YouTube (Red) */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#ff0000] hover:bg-[#ff0000]/90 text-white flex items-center justify-center transition-transform hover:scale-105"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-white tracking-wide border-b border-brand-gold/20 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-gold transition-colors duration-300">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-brand-gold transition-colors duration-300">Interactive Menu</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-gold transition-colors duration-300">Our Heritage</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-gold transition-colors duration-300">Photo Gallery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-gold transition-colors duration-300">Find Us & Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Opening Hours */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-white tracking-wide border-b border-brand-gold/20 pb-2">
              Opening Hours
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Daily Service</p>
                  <p className="text-brand-bg/70 mt-1">{timings}</p>
                </div>
              </div>
              <div className="text-xs text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-2 rounded-lg">
                ✨ Open on holidays & festivals. Family dining rooms available.
              </div>
            </div>
          </div>

          {/* Column 4: Contact Details */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-white tracking-wide border-b border-brand-gold/20 pb-2">
              Our Branches
            </h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <a
                href="https://www.google.com/maps/place/Sri+Krishna+Family+Dhaba/@17.5254461,78.3950244,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb8f0052362da1:0xd093fe41bf080e4d!8m2!3d17.5254461!4d78.3950244!16s%2Fg%2F11wvt0qq4l"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-2 group/branch hover:text-brand-gold transition-colors duration-200 block"
              >
                <MapPin size={16} className="text-brand-gold shrink-0 mt-0.5 group-hover/branch:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-white group-hover/branch:text-brand-gold">Pragathi Nagar Branch</p>
                  <p className="text-brand-bg/65 text-[11px] leading-tight mt-0.5">{address}</p>
                </div>
              </a>
              <a
                href="https://maps.google.com/?q=Sri+Krishna+Family+Dhaba+Moinabad+Telangana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-2 group/branch hover:text-brand-gold transition-colors duration-200 block"
              >
                <MapPin size={16} className="text-brand-gold shrink-0 mt-0.5 group-hover/branch:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-white group-hover/branch:text-brand-gold">Moinabad Branch</p>
                  <p className="text-brand-bg/65 text-[11px] leading-tight mt-0.5">Himayat Sagar Rd, Moinabad</p>
                </div>
              </a>
              <div className="flex items-center space-x-2 pt-1">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="text-white hover:text-brand-accent font-semibold transition-colors duration-300">
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-brand-bg/60">
          <p>© {new Date().getFullYear()} Sri Krishna Family Dhaba. All rights reserved.</p>
          <p className="mt-4 md:mt-0">
            Made with ♥ in Hyderabad
          </p>
        </div>
      </div>
    </footer>
  );
}
