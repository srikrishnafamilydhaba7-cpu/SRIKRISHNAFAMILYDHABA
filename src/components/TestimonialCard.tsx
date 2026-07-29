import { Star } from "lucide-react";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  date: string;
  source: string;
  tags?: string[];
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick?: () => void;
}

export default function TestimonialCard({ testimonial, onClick }: TestimonialCardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel p-6 rounded-2xl border border-brand-gold/15 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[230px] w-[320px] shrink-0 ${
        onClick ? "cursor-pointer hover:border-brand-accent/30" : ""
      }`}
    >
      <div>
        {/* Rating and Source */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < testimonial.rating
                    ? "text-brand-gold fill-brand-gold"
                    : "text-brand-dark/15"
                }
              />
            ))}
          </div>
          <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {testimonial.source}
          </span>
        </div>

        {/* Quote */}
        <p className="text-xs text-brand-dark/80 line-clamp-4 leading-relaxed font-sans mb-4 italic">
          "{testimonial.quote}"
        </p>
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-3 pt-3 border-t border-brand-dark/5 mt-auto">
        <div className="w-10 h-10 rounded-full bg-brand-accent/10 border border-brand-gold/20 flex items-center justify-center font-bold text-brand-accent font-display text-sm shrink-0 overflow-hidden">
          {testimonial.avatar && testimonial.avatar.startsWith("http") ? (
            <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
          ) : (
            testimonial.avatar || testimonial.name?.charAt(0) || "G"
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-display font-bold text-xs text-brand-dark truncate">{testimonial.name}</h4>
          <p className="text-[10px] text-brand-dark/50 truncate mt-0.5">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
