import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ArrowRight, MapPin, Clock } from "lucide-react";
import { db } from "../utils/db";
import WhatsAppIcon from "../components/WhatsAppIcon";

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

export default function ContactPage() {
  const [activeBranch, setActiveBranch] = useState<string>("pragathinagar");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    db.init();
    setSettings(db.getSettings());
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

  return (
    <div className="min-h-screen pt-28 pb-20 relative bg-brand-bg">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-2">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-brand-dark relative pb-4 inline-block">
            Contact Us
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-brand-accent rounded-full" />
          </h1>
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
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Phone size={18} className="fill-emerald-500/10" />
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
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-dark leading-tight">
                Sri Krishna Flavors
              </h2>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-gold leading-none mt-1">
                at Your Doorstep
              </h2>
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
                href="https://www.swiggy.com/search?query=Sri%20Krishna%20Family%20Dhaba"
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
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark">
              Visit Our Branches
            </h2>
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

                {/* Address (Clickable → Google Maps) */}
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
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
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
    </div>
  );
}
