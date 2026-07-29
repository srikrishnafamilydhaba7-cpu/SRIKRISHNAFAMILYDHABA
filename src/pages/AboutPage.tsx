import { useState, useEffect } from "react";
import { ShieldCheck, Leaf, Flame, Sparkles, Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const values = [
  {
    icon: <Leaf className="text-brand-gold" size={24} />,
    title: "100% Pure Vegetarian",
    desc: "We strictly observe vegetarian regulations. No meat, fish, or egg ingredients enter our kitchen, providing you complete dining peace of mind."
  },
  {
    icon: <ShieldCheck className="text-brand-gold" size={24} />,
    title: "Vedic Quality Hygiene",
    desc: "All staff wear headwear, masks, and gloves. Kitchen workspaces are thoroughly steam-cleaned twice daily with natural disinfectant compounds."
  },
  {
    icon: <Flame className="text-brand-gold" size={24} />,
    title: "Authentic Clay Tandoors",
    desc: "Our breads and tikkas are slow-baked on hot charcoal embers inside traditional clay tandoors, creating that beautiful signature smoky finish."
  }
];

const team = [
  {
    name: "Chef Krishna Rao",
    role: "Master Tandoor Chef",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80",
    bio: "With over 18 years of experience across popular Hyderabadi dhabas, Chef Rao handles the fire, baking every Naan and Tikka to tandoori perfection."
  },
  {
    name: "Chef Ramu Swamy",
    role: "Head Biryani & Curry Specialist",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&auto=format&fit=crop&q=80",
    bio: "The spice alchemist of our kitchen. Chef Ramu ensures that every batch of Kaju Biryani and Paneer Chatpata is layered with precise aromatic blends."
  }
];

export default function AboutPage() {
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);

  useEffect(() => {
    if (isLegacyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLegacyModalOpen]);

  return (
    <div className="min-h-screen pt-28 pb-20 relative bg-brand-bg/25">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="inline-flex items-center gap-1 bg-brand-accent/15 border border-brand-accent/25 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-accent">
            <Heart size={12} className="fill-brand-accent" />
            <span>Our Journey & Roots</span>
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-brand-dark tracking-tight leading-none">
            Serving Taste & Tradition
          </h1>
          <p className="font-telugu text-brand-gold font-bold text-base sm:text-lg">
            శ్రీ కృష్ణ ఫ్యామిలీ ధాబ — మా చరిత్ర
          </p>
        </div>

        {/* Storytelling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <h2 className="font-display font-bold text-3xl text-brand-dark leading-tight">
              A Culinary Sanctuary Built On Family Trust
            </h2>
            <p className="text-sm text-brand-dark/75 leading-relaxed font-sans">
              Founded with a dream to provide a premium dining experience that feels like a home-cooked meal, Sri Krishna Family Dhaba has stood as a beacon of delicious vegetarian food in Pragathi Nagar, Hyderabad.
            </p>
            <p className="text-sm text-brand-dark/75 leading-relaxed font-sans">
              Inspired by the spiritual purity of traditional Indian cooking and localized Hyderabadi preferences, our menu blends fiery rustic dhaba spices with high-end culinary plating. We source all raw items daily from local farmer markets, ensuring that only the freshest green produce, clean cashews, and soft paneer reach your plates.
            </p>
            <div className="p-5 border-l-4 border-brand-accent bg-brand-accent/5 rounded-r-xl">
              <p className="text-xs italic text-brand-dark/85 font-sans leading-relaxed">
                "We believe that clean ingredients cooked with devotion feed not just the body, but the soul. This is the simple philosophy behind every hot roti and aromatic curry we serve."
              </p>
              <span className="block text-[10px] font-bold text-brand-accent uppercase tracking-wider mt-3">
                — Management, Sri Krishna Dhaba
              </span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setIsLegacyModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4332] hover:bg-brand-accent text-white hover:text-brand-dark text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
              >
                <span>Discover Our Legacy</span>
                <Sparkles size={14} className="fill-brand-gold/10 text-brand-gold" />
              </button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm rounded-[24px] overflow-hidden aspect-[3/4] border border-brand-gold/25 shadow-2xl group bg-brand-dark/5">
              <img
                src="/images/owner.png"
                alt="Sri Krishna Dhaba Founder"
                className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#1B4332]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

              {/* Hover Overlay Card (Glassmorphism) */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#FFFDF8]/20 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl z-20 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-center">
                <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest block mb-0.5">Founder & Culinary Visionary</span>
                <h4 className="font-display font-black text-base text-white tracking-tight">Praveen Kumar Solanki</h4>
              </div>
            </div>            {/* Absolute background accents */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-44 h-44 bg-brand-gold/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -z-10 -top-6 -left-6 w-44 h-44 bg-brand-accent/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Pillars / Values Section */}
        <div className="bg-brand-dark text-brand-bg rounded-3xl p-8 sm:p-12 mb-24 relative overflow-hidden border border-brand-gold/15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white text-center mb-12">
              Our Core Culinary Standards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    {v.icon}
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">{v.title}</h4>
                  <p className="text-xs text-brand-bg/75 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chefs Section */}
        <div className="space-y-16">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent block mb-2">Culinary Creators</span>
            <h2 className="font-display font-extrabold text-3xl text-brand-dark">
              Meet Our Head Chefs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {team.map((chef, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="glass-panel border border-brand-gold/15 rounded-3xl overflow-hidden shadow-md flex flex-col sm:flex-row h-full"
              >
                <div className="w-full sm:w-2/5 h-[200px] sm:h-full min-h-[200px]">
                  <img
                    src={chef.image}
                    alt={chef.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider block mb-1">
                      {chef.role}
                    </span>
                    <h3 className="font-display font-bold text-lg text-brand-dark mb-3">
                      {chef.name}
                    </h3>
                    <p className="text-xs text-brand-dark/70 leading-relaxed font-sans">
                      {chef.bio}
                    </p>
                  </div>
                  <div className="flex gap-1.5 items-center text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-6 pt-3 border-t border-brand-dark/5">
                    <Sparkles size={12} className="fill-brand-gold/10" />
                    <span>Pure Taste Master</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Luxurious Modal Pop-up */}
      <AnimatePresence>
        {isLegacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLegacyModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm"
            />

            {/* Popup Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl bg-[#F9F7F4] rounded-[22px] shadow-2xl border border-brand-gold/25 overflow-hidden flex flex-col z-10 max-h-[85vh]"
            >
              {/* Noise Overlay */}
              <div className="absolute inset-0 noise-overlay pointer-events-none -z-10" />

              {/* Modal Header */}
              <header className="px-6 py-4 border-b border-brand-gold/10 flex justify-between items-center bg-[#F9F7F4]/90 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-brand-gold rounded-full" />
                  <span className="font-display font-extrabold text-xs md:text-sm tracking-widest text-[#1B4332] uppercase">Our Heritage & Legacy</span>
                </div>
                <button
                  onClick={() => setIsLegacyModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1B4332]/5 hover:bg-[#1B4332] hover:text-white flex items-center justify-center text-[#1B4332] transition-all duration-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </header>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-16">
                {/* Hero Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left Side: Large Image */}
                  <div className="relative">
                    <div className="rounded-[24px] overflow-hidden aspect-[4/3] border border-brand-gold/25 shadow-xl">
                      <img
                        src="/images/owner.png"
                        alt="Praveen Kumar Solanki"
                        className="w-full h-full object-cover object-[center_20%]"
                      />
                    </div>
                    {/* Floating Since Badge */}
                    <div className="absolute -bottom-3 -left-3 bg-[#1B4332] text-white border border-brand-gold/30 px-4 py-2.5 rounded-xl shadow-lg flex flex-col items-center justify-center">
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold">Established</span>
                      <span className="font-display text-sm font-black tracking-tight text-white">Since 2018</span>
                    </div>
                    {/* Floating leaves decorator */}
                    <div className="absolute -top-3 -right-3 bg-[#F9F7F4] border border-brand-gold/15 p-2 rounded-full shadow-md text-brand-accent animate-bounce" style={{ animationDuration: '3s' }}>
                      🍃
                    </div>
                  </div>

                  {/* Right Side: Welcome info */}
                  <div className="space-y-4">
                    <h1 className="font-display font-black text-3xl md:text-4xl text-[#1B4332] uppercase tracking-tight leading-none">
                      100% Pure Veg
                    </h1>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-[#1B4332]/10 border border-[#1B4332]/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-brand-accent">
                        🍃 Authentic Family Dining
                      </span>
                    </div>
                    <h2 className="font-display font-extrabold text-lg md:text-xl text-[#1B4332]/85 leading-tight">
                      Welcome to Sri Krishna Family Dhaba
                    </h2>
                    <h4 className="font-display font-bold text-sm text-brand-gold italic">
                      Where Every Meal Feels Like Home
                    </h4>
                    <p className="text-xs text-brand-dark/80 leading-relaxed font-sans">
                      Experience authentic flavors, warm hospitality, and unforgettable family moments crafted with passion and served with love.
                    </p>
                  </div>
                </section>

                {/* Our Philosophy (Glassmorphism card) */}
                <section className="relative flex justify-center">
                  <div className="absolute inset-0 bg-brand-gold/5 rounded-2xl blur-xl -z-10" />
                  <div className="w-full bg-[#1B4332]/5 backdrop-blur-md border border-[#1B4332]/10 rounded-2xl p-6 text-center max-w-2xl space-y-3 hover:border-brand-gold/30 transition-colors duration-500">
                    <span className="text-[10px] uppercase tracking-widest text-brand-gold font-black block">Our Philosophy</span>
                    <p className="font-display text-sm md:text-base font-bold text-[#1B4332] leading-relaxed italic">
                      "Great food is more than taste—it's tradition, togetherness, and memories shared around every table."
                    </p>
                    <div className="w-8 h-0.5 bg-brand-gold mx-auto mt-2" />
                  </div>
                </section>

                {/* Our Story */}
                <section className="space-y-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-brand-accent uppercase tracking-widest block mb-0.5">Our Heritage</span>
                    <h3 className="font-display font-black text-xl text-[#1B4332]">A Journey Built on Passion</h3>
                  </div>
                  <div className="space-y-3 text-xs text-brand-dark/85 leading-relaxed font-sans text-justify">
                    <p>
                      Every great restaurant begins with a dream. Sri Krishna Family Dhaba was established with a simple vision—to create a place where delicious food, genuine hospitality, and family values come together.
                    </p>
                    <p>
                      From carefully selected ingredients to recipes perfected over time, every dish reflects our commitment to quality and authenticity. Our kitchen follows traditional cooking methods while maintaining the highest standards of hygiene and consistency.
                    </p>
                    <p>
                      Today, we proudly welcome countless guests who return not only for our food but also for the warmth, comfort, and memorable dining experience that defines Sri Krishna Family Dhaba.
                    </p>
                  </div>
                </section>

                {/* Experience Timeline */}
                <section className="space-y-8">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-brand-gold uppercase tracking-widest block mb-0.5">Milestones</span>
                    <h3 className="font-display font-black text-xl text-[#1B4332]">Experience Timeline</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Item 1 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">01</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">🌱</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-black text-sm text-[#1B4332] uppercase tracking-wider">Foundation</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">A dream to serve authentic family-style meals.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">02</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">🍛</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-black text-sm text-[#1B4332] uppercase tracking-wider">Growth</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">Expanded our menu with signature dishes loved by customers.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">03</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">❤️</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-black text-sm text-[#1B4332] uppercase tracking-wider">Trust</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">Built lasting relationships through quality, consistency, and hospitality.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">04</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">🏆</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-black text-sm text-[#1B4332] uppercase tracking-wider">Today</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">A preferred destination for families seeking delicious food.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Why Families Choose Us */}
                <section className="space-y-8">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-brand-accent uppercase tracking-widest block mb-0.5">Our Values</span>
                    <h3 className="font-display font-black text-xl text-[#1B4332]">Why Families Choose Us</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">01</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">🍽️</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-bold text-xs text-[#1B4332] uppercase tracking-wider">Authentic Recipes</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">Traditional flavors prepared with care.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">02</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">🥬</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-bold text-xs text-[#1B4332] uppercase tracking-wider">Fresh Ingredients</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">Quality ingredients sourced every day.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">03</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">🏡</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-bold text-xs text-[#1B4332] uppercase tracking-wider">Family Atmosphere</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">Comfortable spaces designed for family gatherings.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="relative p-[2px] rounded-[22px] overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12),0_0_20px_rgba(22,163,74,0.25)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-[350ms] ease-in-out flex">
                      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,#16A34A_47%,#ffffff_49%,#ffffff_51%,#22C55E_53%,transparent_60%)] opacity-70 group-hover:opacity-100 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] pointer-events-none z-0 transition-opacity duration-350" />
                      <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFCFC] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden min-h-[190px] z-10 w-full h-full">
                        <div className="absolute top-4 right-6 font-display font-black text-4xl text-black/[0.10] select-none">04</div>
                        <div className="space-y-4">
                          <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-black/[0.04] shadow-inner flex items-center justify-center group-hover:bg-[#EAEAEA] transition-colors duration-[350ms] self-start">
                            <span className="text-lg group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-[350ms] block">⭐</span>
                          </div>
                          <div className="space-y-2 text-left">
                            <h5 className="font-display font-bold text-xs text-[#1B4332] uppercase tracking-wider">Trusted Quality</h5>
                            <div className="w-10 h-[3px] rounded-full bg-[#2D2D2D] group-hover:w-[60px] transition-all duration-[350ms]" />
                            <p className="text-[10px] text-brand-dark/70 leading-relaxed font-sans pt-1">Consistent taste and exceptional service.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Signature Promise */}
                <section className="bg-[#1B4332] text-white rounded-2xl p-6 md:p-8 relative overflow-hidden border border-brand-gold/20 shadow-lg">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 max-w-xl mx-auto text-center space-y-3">
                    <span className="text-[8px] font-bold text-brand-gold uppercase tracking-widest block">Signature Promise</span>
                    <h4 className="font-display font-black text-lg text-white">Our Promise</h4>
                    <p className="text-[10px] text-brand-bg/85 leading-relaxed font-sans">
                      Every guest who walks through our doors is treated like family. We are committed to serving fresh food, maintaining exceptional hygiene, and creating a dining experience that keeps you coming back.
                    </p>
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <footer className="px-6 py-4 border-t border-brand-gold/10 flex justify-center bg-[#F9F7F4]/95 backdrop-blur-md sticky bottom-0 z-30">
                <button
                  onClick={() => setIsLegacyModalOpen(false)}
                  className="px-8 py-2.5 bg-[#1B4332] hover:bg-brand-accent text-white hover:text-brand-dark flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md cursor-pointer"
                >
                  Close
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}




