import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Users, Gift, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { db } from "../utils/db";
import type { Booking } from "../utils/db";



function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Check if it contains AM/PM
  const match12h = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12h) {
    let h = parseInt(match12h[1], 10);
    const m = parseInt(match12h[2], 10);
    const ampm = match12h[3].toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  
  // Fallback to 24h format
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function normalizeTo24h(timeStr: string): string {
  if (!timeStr) return "";
  const totalMinutes = parseTimeToMinutes(timeStr);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseOpeningHours(timingsStr?: string) {
  const fallback = {
    openMinutes: 11 * 60 + 30,
    closeMinutes: 23 * 60 + 45,
    formattedOpening: "11:30 AM – 11:45 PM",
    minTimeStr: "11:30",
    maxTimeStr: "23:45"
  };
  if (!timingsStr) return fallback;

  const matches = timingsStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[–\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!matches) return fallback;

  let [, startHStr, startMStr, startAmpm, endHStr, endMStr, endAmpm] = matches;

  let startH = parseInt(startHStr, 10);
  let startM = parseInt(startMStr, 10);
  if (startAmpm) {
    const ampm = startAmpm.toUpperCase();
    if (ampm === "PM" && startH < 12) startH += 12;
    if (ampm === "AM" && startH === 12) startH = 0;
  }

  let endH = parseInt(endHStr, 10);
  let endM = parseInt(endMStr, 10);
  if (endAmpm) {
    const ampm = endAmpm.toUpperCase();
    if (ampm === "PM" && endH < 12) endH += 12;
    if (ampm === "AM" && endH === 12) endH = 0;
  }

  const openMinutes = startH * 60 + startM;
  const closeMinutes = endH * 60 + endM;

  let displayOpening = timingsStr;
  if (timingsStr.includes(":")) {
    const parts = timingsStr.split(":");
    if (parts.length >= 3) {
      displayOpening = parts.slice(1).join(":").trim();
    }
  }

  return {
    openMinutes,
    closeMinutes,
    formattedOpening: displayOpening || fallback.formattedOpening,
    minTimeStr: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
    maxTimeStr: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  };
}

function isTimeWithinOpeningHours(timeStr: string, openMinutes: number, closeMinutes: number): boolean {
  if (!timeStr) return false;
  const selectedMinutes = parseTimeToMinutes(timeStr);
  return selectedMinutes >= openMinutes && selectedMinutes <= closeMinutes;
}

function formatTime12h(timeStr: string): string {
  if (!timeStr) return "";
  if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
    return timeStr;
  }
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

const occasions = [
  "None",
  "Birthday Celebration",
  "Anniversary Dinner",
  "Family Gathering",
  "Corporate Lunch/Dinner",
  "Kitty Party",
  "Date Night",
  "Other Celebration"
];

export default function BookTable() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [occasion, setOccasion] = useState("None");
  const [instructions, setInstructions] = useState("");

  // Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerStep, setPickerStep] = useState<1 | 2 | 3>(1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [selectedAmpm, setSelectedAmpm] = useState<"AM" | "PM" | null>(null);
  const [pickerError, setPickerError] = useState("");

  // System State
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<any>(() => db.getSettings());

  const openingInfo = parseOpeningHours(settings?.timings);
  const isCurrentTimeValid = !time || isTimeWithinOpeningHours(time, openingInfo.openMinutes, openingInfo.closeMinutes);

  // Helper to validate selected combinations inside the picker
  const isCombinationValid = (h: number, m: number, ampm: "AM" | "PM"): boolean => {
    let hr = h;
    if (ampm === "PM" && hr < 12) hr += 12;
    if (ampm === "AM" && hr === 12) hr = 0;
    const totalMinutes = hr * 60 + m;
    return totalMinutes >= openingInfo.openMinutes && totalMinutes <= openingInfo.closeMinutes;
  };

  useEffect(() => {
    db.init();
    const loadSettings = () => setSettings(db.getSettings());
    loadSettings();

    window.addEventListener("skd_settings_updated", loadSettings);
    window.addEventListener("storage", loadSettings);

    // Default date to today
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setExistingBookings(db.getBookings());

    return () => {
      window.removeEventListener("skd_settings_updated", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  // Update sameAsPhone
  useEffect(() => {
    if (sameAsPhone) {
      setWhatsapp(phone);
    }
  }, [phone, sameAsPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");

    if (!name || !phone || !date || !time) {
      setFormError("Please fill in all required fields (Name, Phone, Date, Time).");
      return;
    }

    // Phone format validation (simple 10 digit or international check)
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!sameAsPhone) {
      const cleanWhatsapp = whatsapp.replace(/[^0-9+]/g, "");
      if (cleanWhatsapp.length < 10) {
        setFormError("Please enter a valid 10-digit WhatsApp number.");
        return;
      }
    }

    if (!isTimeWithinOpeningHours(time, openingInfo.openMinutes, openingInfo.closeMinutes)) {
      setFormError(
        `Selected time (${formatTime12h(time)}) is outside restaurant opening hours (${openingInfo.formattedOpening}). Please select a time during operating hours.`
      );
      return;
    }

    if (guests > settings.maxGuestsPerBooking) {
      setFormError(`Maximum guests allowed per booking is ${settings.maxGuestsPerBooking}. For larger groups, please contact the restaurant directly.`);
      return;
    }

    // Check if slot capacity is reached
    const targetNormalizedTime = normalizeTo24h(time);
    const slotCount = existingBookings.filter(
      (b) => b.date === date && normalizeTo24h(b.time) === targetNormalizedTime && b.status !== "Cancelled" && b.status !== "Rejected"
    ).length;

    if (slotCount >= settings.maxReservationsPerSlot) {
      setFormError("This time slot is fully reserved. Please choose another date or time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save booking
      const newBooking = db.addBooking({
        name,
        phone,
        whatsapp: sameAsPhone ? phone : whatsapp,
        email: email || undefined,
        guests,
        date,
        time,
        occasion,
        instructions: instructions || undefined
      });

      // Simulate a small delay for premium feel and UX feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      setBookingSuccess(newBooking);
      setExistingBookings(db.getBookings());
    } catch (err: any) {
      setFormError(err.message || "Failed to save reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppAction = (type: "client" | "owner") => {
    if (!bookingSuccess) return;
    const settingsObj = db.getSettings();
    const phoneNum = type === "owner" 
      ? settingsObj.whatsappNumber.replace(/[^0-9]/g, "") 
      : bookingSuccess.whatsapp.replace(/[^0-9]/g, "");

    const text = db.formatBookingNotification(
      bookingSuccess, 
      type === "client"
    );

    window.open(`https://wa.me/${phoneNum}?text=${text}`, "_blank");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen pt-28 pb-20 bg-brand-bg/30 relative">
      <div className="noise-overlay" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {!bookingSuccess ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-black tracking-widest text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3.5 py-1 rounded-full uppercase">
                  Reservation Desk
                </span>
                <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-dark tracking-tight leading-none">
                  Book A Dining Table
                </h1>
                <p className="text-sm text-brand-dark/70">
                  Sri Krishna Dhaba, Pragathi Nagar - Pure Veg Family Experience
                </p>
              </div>

              {/* Promo Banner */}
              <div className="max-w-4xl mx-auto bg-brand-dark text-brand-bg border border-brand-gold/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/10 rounded-full blur-xl" />
                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                    <Gift size={24} />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-0.5 rounded">
                      Exclusive Web Offer
                    </span>
                    <p className="text-sm font-display font-medium leading-relaxed italic text-brand-bg/95">
                      "{db.formatPromoText(settings?.reservationPromoText || "Reserve your table through our website and receive {discount}% OFF on your final dining bill.", settings?.discountPercent ?? 10)}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Reservation Form - Centered */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full">
                <div className="bg-white border border-brand-gold/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-display font-bold text-lg text-brand-dark uppercase tracking-wider pb-3 border-b border-brand-dark/5">
                    Reservation Details
                  </h3>

                  {formError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Customer info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark transition-colors shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark transition-colors shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Guests *</label>
                        <div className="relative">
                          <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark appearance-none cursor-pointer font-bold"
                          >
                            {Array.from({ length: settings.maxGuestsPerBooking }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                              </option>
                            ))}
                          </select>
                          <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/45 pointer-events-none" size={14} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block">WhatsApp Number *</label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sameAsPhone}
                            onChange={(e) => setSameAsPhone(e.target.checked)}
                            className="w-3.5 h-3.5 accent-brand-accent rounded"
                          />
                          <span className="text-[9px] text-brand-dark/50 font-bold uppercase tracking-wide">Same as mobile</span>
                        </label>
                      </div>
                      <input
                        type="tel"
                        required
                        disabled={sameAsPhone}
                        value={sameAsPhone ? phone : whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="WhatsApp contact"
                        className={`w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark transition-colors shadow-inner ${
                          sameAsPhone ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark transition-colors shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Date *</label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            min={todayStr}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none pl-10 pr-4 py-2 rounded-xl text-xs text-brand-dark font-bold cursor-pointer"
                          />
                          <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/45" size={14} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block">Time *</label>
                        </div>

                        <div className="space-y-1">
                          <div
                            onClick={() => {
                              setPickerStep(1);
                              setSelectedHour(null);
                              setSelectedMinute(null);
                              setSelectedAmpm(null);
                              setPickerError("");
                              setShowTimePicker(true);
                            }}
                            className={`w-full bg-brand-bg/35 border px-4 py-2.5 rounded-xl text-xs text-brand-dark font-bold cursor-pointer flex items-center justify-between shadow-inner select-none transition-colors duration-200 ${
                              time && !isCurrentTimeValid
                                ? "border-rose-400 bg-rose-50/50"
                                : "border-brand-gold/20 hover:border-brand-accent/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="text-brand-dark/45 shrink-0" size={14} />
                              <span className={time ? "text-brand-dark font-bold" : "text-brand-dark/40 font-normal"}>
                                {time ? formatTime12h(time) : "Select time"}
                              </span>
                            </div>
                            <span className="text-brand-dark/45 text-xs font-normal">◷</span>
                          </div>
                          <div className="flex flex-col gap-0.5 px-0.5">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="text-brand-dark/50 font-medium">
                                Hours: {openingInfo.formattedOpening}
                              </span>
                              {time && isCurrentTimeValid && (
                                <span className="font-bold text-brand-accent">
                                  Selected: {formatTime12h(time)}
                                </span>
                              )}
                            </div>
                            {time && !isCurrentTimeValid && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded mt-1">
                                ⚠️ Selected time ({formatTime12h(time)}) is outside restaurant opening hours ({openingInfo.formattedOpening}).
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Special Occasion</label>
                      <div className="relative">
                        <select
                          value={occasion}
                          onChange={(e) => setOccasion(e.target.value)}
                          className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark appearance-none cursor-pointer"
                        >
                          {occasions.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <Gift className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/45 pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Special Requests / Notes</label>
                      <textarea
                        rows={2}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Any food preferences, wheelchair access, decorations..."
                        className="w-full bg-brand-bg/35 border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2 rounded-xl text-xs text-brand-dark shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-brand-accent hover:bg-brand-dark text-white py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md border border-brand-accent/10 flex items-center justify-center gap-2 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span>{isSubmitting ? "Processing Request..." : "Request Reservation"}</span>
                    {!isSubmitting && <ArrowRight size={14} />}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Success View */
            <motion.div
              key="booking-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto bg-white border border-brand-gold/15 p-8 sm:p-12 rounded-3xl shadow-2xl text-center space-y-8 relative overflow-hidden"
            >
              {/* Corner borders */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-gold" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-gold" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-gold" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-gold" />

              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
                  Request Placed Successfully
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark leading-tight tracking-tight">
                  Reservation Received!
                </h2>
                <p className="text-xs sm:text-sm text-brand-dark/65 max-w-md mx-auto leading-relaxed">
                  Your reservation request has been logged. Our booking controller is reviewing availability.
                </p>
              </div>

              {/* Summary details */}
              <div className="bg-brand-bg/40 border border-brand-gold/10 rounded-2xl p-6 text-left space-y-3 max-w-md mx-auto text-xs">
                <div className="flex justify-between border-b border-brand-dark/5 pb-2">
                  <span className="text-brand-dark/50">Reservation ID</span>
                  <span className="font-bold text-brand-dark">{bookingSuccess.id}</span>
                </div>
                <div className="flex justify-between border-b border-brand-dark/5 pb-2">
                  <span className="text-brand-dark/50">Guest Name</span>
                  <span className="font-bold text-brand-dark">{bookingSuccess.name}</span>
                </div>
                <div className="flex justify-between border-b border-brand-dark/5 pb-2">
                  <span className="text-brand-dark/50">Date & Time</span>
                  <span className="font-bold text-brand-dark">{bookingSuccess.date} at {bookingSuccess.time}</span>
                </div>
                <div className="flex justify-between border-b border-brand-dark/5 pb-2">
                  <span className="text-brand-dark/50">Guests count</span>
                  <span className="font-bold text-brand-dark">{bookingSuccess.guests} {bookingSuccess.guests === 1 ? "Guest" : "Guests"}</span>
                </div>
                {bookingSuccess.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-brand-dark/50">Preferred Seating</span>
                    <span className="font-bold text-brand-accent">Table {bookingSuccess.tableNumber}</span>
                  </div>
                )}
              </div>

              {/* Unique Reservation QR Code */}
              <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-brand-gold/5 to-transparent border border-brand-gold/15 rounded-2xl max-w-md mx-auto space-y-3 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingSuccess.id}`}
                  alt="Unique Reservation QR Code"
                  className="w-36 h-36 border border-brand-gold/10 p-2 bg-white rounded-xl shadow-inner"
                />
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest">
                    Unique Reservation Ticket
                  </p>
                  <p className="text-[9px] text-brand-dark/50 font-bold max-w-xs mx-auto">
                    Please present this QR code at the reception desk for scanning and instant check-in.
                  </p>
                </div>
              </div>

              {/* WhatsApp Action Buttons */}
              <div className="pt-4 space-y-3 max-w-md mx-auto">
                <button
                  onClick={() => handleWhatsAppAction("client")}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon size={16} />
                  <span>Get Confirmation on WhatsApp</span>
                </button>

                <button
                  onClick={() => handleWhatsAppAction("owner")}
                  className="w-full bg-brand-dark hover:bg-brand-accent text-brand-bg hover:text-brand-bg py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border border-brand-dark/10"
                >
                  <WhatsAppIcon size={14} />
                  <span>Notify Manager via WhatsApp</span>
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="text-xs text-brand-dark/50 hover:text-brand-accent underline"
                >
                  Make Another Reservation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Time Picker Modal */}
      <AnimatePresence>
        {showTimePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-[320px] w-full p-5 shadow-2xl border border-brand-gold/15 relative space-y-4"
            >
              {/* Header */}
              <div className="text-center relative">
                <h4 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wider">
                  {pickerStep === 1 && "Select Hour"}
                  {pickerStep === 2 && "Select Minute"}
                  {pickerStep === 3 && "Select AM / PM"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(false)}
                  className="absolute right-0 top-0 text-brand-dark/40 hover:text-brand-dark text-xs p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Time display indicator */}
              <div className="bg-brand-bg/45 border border-brand-gold/10 rounded-xl p-3 flex items-center justify-center gap-1.5 text-center">
                <span
                  onClick={() => setPickerStep(1)}
                  className={`text-lg font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    pickerStep === 1
                      ? "bg-brand-dark/10 text-brand-dark border border-brand-dark/20"
                      : selectedHour !== null
                      ? "text-brand-dark"
                      : "text-brand-dark/30"
                  }`}
                >
                  {selectedHour !== null ? selectedHour : "--"}
                </span>
                <span className="text-lg font-bold text-brand-dark/40">:</span>
                <span
                  onClick={() => {
                    if (selectedHour !== null) setPickerStep(2);
                  }}
                  className={`text-lg font-bold px-1.5 py-0.5 rounded transition-colors ${
                    selectedHour === null
                      ? "text-brand-dark/20 cursor-not-allowed"
                      : pickerStep === 2
                      ? "bg-brand-dark/10 text-brand-dark border border-brand-dark/20 cursor-pointer"
                      : selectedMinute !== null
                      ? "text-brand-dark cursor-pointer"
                      : "text-brand-dark/30 cursor-pointer"
                  }`}
                >
                  {selectedMinute !== null ? String(selectedMinute).padStart(2, "0") : "--"}
                </span>
                <span
                  onClick={() => {
                    if (selectedHour !== null && selectedMinute !== null) setPickerStep(3);
                  }}
                  className={`text-sm font-bold ml-2 px-1.5 py-0.5 rounded transition-colors ${
                    selectedHour === null || selectedMinute === null
                      ? "text-brand-dark/20 cursor-not-allowed"
                      : pickerStep === 3
                      ? "bg-brand-dark/10 text-brand-dark border border-brand-dark/20 cursor-pointer"
                      : selectedAmpm !== null
                      ? "text-brand-dark cursor-pointer"
                      : "text-brand-dark/30 cursor-pointer"
                  }`}
                >
                  {selectedAmpm !== null ? selectedAmpm : "AM/PM"}
                </span>
              </div>

              {/* Error messages if any */}
              {pickerError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] px-3 py-2 rounded-xl flex items-start gap-1.5 leading-tight shadow-sm">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  <span>{pickerError}</span>
                </div>
              )}

              {/* Step content */}
              <div className="flex items-center justify-center min-h-[220px]">
                {pickerStep === 1 && (
                  <div className="relative w-48 h-48 rounded-full border border-brand-gold/10 bg-brand-bg/15 flex items-center justify-center">
                    {/* Center dot */}
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                    {/* Hour numbers */}
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const h = idx + 1;
                      const angle = (h * 30 - 90) * (Math.PI / 180);
                      const radius = 68; // fit within 192px circle
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      const isSelected = selectedHour === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setSelectedHour(h);
                            setPickerError("");
                            setTimeout(() => setPickerStep(2), 200);
                          }}
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-dark text-white shadow-md scale-110"
                              : "text-brand-dark/75 hover:bg-brand-dark/10 hover:text-brand-dark"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                )}

                {pickerStep === 2 && (
                  <div className="relative w-48 h-48 rounded-full border border-brand-gold/10 bg-brand-bg/15 flex items-center justify-center">
                    {/* Center dot */}
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                    {/* Minute numbers */}
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const m = idx * 5;
                      const mStr = String(m).padStart(2, "0");
                      const angle = (idx * 30 - 90) * (Math.PI / 180);
                      const radius = 68;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      const isSelected = selectedMinute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedMinute(m);
                            setPickerError("");
                            setTimeout(() => setPickerStep(3), 200);
                          }}
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-dark text-white shadow-md scale-110"
                              : "text-brand-dark/75 hover:bg-brand-dark/10 hover:text-brand-dark"
                          }`}
                        >
                          {mStr}
                        </button>
                      );
                    })}
                  </div>
                )}

                {pickerStep === 3 && (
                  <div className="flex flex-col items-center justify-center gap-4 w-full">
                    <span className="text-[10px] font-bold text-brand-dark/50 uppercase tracking-wider mb-2">Select Period</span>
                    <div className="flex gap-4 w-full max-w-[200px]">
                      {(["AM", "PM"] as const).map((period) => {
                        const isSelected = selectedAmpm === period;
                        return (
                          <button
                            key={period}
                            type="button"
                            onClick={() => {
                              setSelectedAmpm(period);
                              setPickerError("");
                              
                              if (selectedHour !== null && selectedMinute !== null) {
                                const valid = isCombinationValid(selectedHour, selectedMinute, period);
                                if (!valid) {
                                  setPickerError("Please select a time between 11:30 AM and 11:45 PM.");
                                } else {
                                  const finalTimeStr = `${selectedHour}:${String(selectedMinute).padStart(2, "0")} ${period}`;
                                  setTime(finalTimeStr);
                                  setShowTimePicker(false);
                                }
                              }
                            }}
                            className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-brand-dark text-white border-brand-dark shadow-md scale-105"
                                : "bg-brand-bg/20 text-brand-dark/70 border-brand-gold/15 hover:border-brand-dark/50 hover:bg-brand-dark/5"
                            }`}
                          >
                            {period}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer navigation */}
              <div className="flex justify-between items-center pt-2 border-t border-brand-dark/5 text-xs">
                {pickerStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPickerStep((prev) => (prev - 1) as any);
                      setPickerError("");
                    }}
                    className="text-brand-dark hover:underline font-bold cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => setShowTimePicker(false)}
                  className="text-brand-dark/50 hover:text-brand-dark cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

