import { ShieldCheck, Leaf, Flame, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

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
          </div>

          <div className="relative">
            {/* Masonry image layout */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&auto=format&fit=crop&q=80"
                alt="Cooking spices"
                className="rounded-2xl shadow-md w-full h-[250px] object-cover mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80"
                alt="Clay oven cooking"
                className="rounded-2xl shadow-md w-full h-[250px] object-cover"
              />
            </div>
            {/* Absolute background accent */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-44 h-44 bg-brand-gold/10 rounded-full blur-2xl" />
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
    </div>
  );
}
