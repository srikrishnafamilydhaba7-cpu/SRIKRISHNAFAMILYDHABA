import { useState, useMemo, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Star, Sparkles, ShoppingCart, Trash2, X, Plus, Minus, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import DishCard from "../components/DishCard";
import type { Dish } from "../components/DishCard";
import { getNumericPrice } from "../utils/menuHelpers";
import { db } from "../utils/db";

const staticCategories = [
  "All",
  "SOUPS",
  "STARTERS",
  "SPL. STARTERS",
  "65' KI PASAND",
  "CURRIES",
  "SPL. PANEER CURRIES",
  "SPL. VEG. CURRIES",
  "CHINESE",
  "SALAD",
  "DAL BAHAR",
  "KOFTA KI CURRIES",
  "ROTI",
  "NAAN",
  "PARATHA in TANDOOR",
  "RICE",
  "FRIED RICE",
  "PULAO",
  "BIRYANI",
  "PAPAD",
  "RAITA",
  "SOFT DRINKS",
  "JUMBO FAMILY PACK",
  "COMBO FAMILY PACK"
];

interface CartItem {
  dish: Dish;
  quantity: number;
  instructions: string;
}

export default function Menu() {
  const [menuData, setMenuData] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"none" | "price-asc" | "price-desc" | "rating">("none");
  const [showChefSpecialsOnly, setShowChefSpecialsOnly] = useState(false);
  const [showHighRatingOnly, setShowHighRatingOnly] = useState(false);
  const [showMenuPromo, setShowMenuPromo] = useState(true);
  const [liveDiscount, setLiveDiscount] = useState(10);

  // Custom Categories States
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  const categories = useMemo(() => {
    const list = ["All", ...staticCategories.filter(c => c !== "All")];
    
    const checkAndAdd = (cat: string) => {
      const upper = cat.trim().toUpperCase();
      if (!upper) return;
      const exists = list.some(item => item.toUpperCase() === upper);
      if (!exists) {
        list.push(upper);
      }
    };

    customCategories.forEach(checkAndAdd);
    // Also include any other categories present in menuData
    menuData.forEach((dish) => {
      checkAndAdd(dish.category);
    });
    return list;
  }, [customCategories, menuData]);

  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<"Pickup" | "Delivery">("Pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [showWhatsAppConfirmModal, setShowWhatsAppConfirmModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  const [orderPlatform, setOrderPlatform] = useState<"WhatsApp" | "Swiggy" | "Zomato">("WhatsApp");
  const [addedItemToast, setAddedItemToast] = useState<{ dish: Dish; quantity: number } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const [showWebExclusiveBar, setShowWebExclusiveBar] = useState(true);

  const categoryTabContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const scrollTimeout = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Increment visits and load dynamic menu
    db.init();
    const loadData = () => {
      setMenuData(db.getMenu().filter((item: any) => !item.hidden));
      const s = db.getSettings();
      setShowMenuPromo(s.showMenuPromo !== false);
      setLiveDiscount(s.discountPercent ?? 10);
      setShowWebExclusiveBar(s.showWebExclusiveBar !== false);
    };
    loadData();

    const savedCats = localStorage.getItem("skd_custom_categories");
    if (savedCats) {
      setCustomCategories(JSON.parse(savedCats));
    }

    window.addEventListener("skd_settings_updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("skd_settings_updated", loadData);
      window.removeEventListener("storage", loadData);
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Filter and sort items
  const allFilteredDishes = useMemo(() => {
    let result = [...menuData];

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (dish) =>
          dish.title.toLowerCase().includes(q) ||
          dish.teluguTitle.toLowerCase().includes(q) ||
          dish.description.toLowerCase().includes(q)
      );
    }

    // Filter by Chef Specials
    if (showChefSpecialsOnly) {
      result = result.filter((dish) => dish.isChefSpecial);
    }

    // Filter by High Rating (>= 4.5)
    if (showHighRatingOnly) {
      result = result.filter((dish) => dish.rating >= 4.5);
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [menuData, searchQuery, sortBy, showChefSpecialsOnly, showHighRatingOnly]);

  // Group dishes by category
  const groupedDishes = useMemo(() => {
    const groups: { [key: string]: Dish[] } = {};
    allFilteredDishes.forEach((dish) => {
      if (!groups[dish.category]) {
        groups[dish.category] = [];
      }
      groups[dish.category].push(dish);
    });
    return groups;
  }, [allFilteredDishes]);

  // Handle Category click / smooth scroll
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    isScrollingProgrammatically.current = true;

    if (category === "All") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 500);
      return;
    }

    const id = `category-section-${category.replace(/\s+/g, '-').replace(/'/g, '')}`;
    const element = document.getElementById(id);
    if (element) {
      const offset = 210;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Clear lock once scroll completes
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = window.setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 850);
    }
  };

  const scrollCategoryContainer = (category: string, direction: "left" | "right") => {
    const containerId = `scroll-container-${category.replace(/\s+/g, '-').replace(/'/g, '')}`;
    const element = document.getElementById(containerId);
    if (element) {
      const scrollAmount = direction === "left" ? -295 : 295;
      element.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const formatCategoryName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Scroll spy to highlight active category tab
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingProgrammatically.current) return;

      // If near the top of the page, default to highlighting "All"
      if (window.scrollY < 120) {
        if (selectedCategory !== "All") {
          setSelectedCategory("All");
          const container = categoryTabContainerRef.current;
          const activeTabEl = container?.querySelector(`[data-category="All"]`) as HTMLElement;
          if (container && activeTabEl) {
            container.scrollTo({
              left: 0,
              behavior: "smooth"
            });
          }
        }
        return;
      }

      let active = "All";
      const triggerY = 250; // trigger point Y below sticky header

      // Find all category elements
      const sectionElements = categories
        .filter(c => c !== "All")
        .map(category => {
          const id = `category-section-${category.replace(/\s+/g, '-').replace(/'/g, '')}`;
          const el = document.getElementById(id);
          return { category, el };
        })
        .filter(item => item.el !== null) as { category: string; el: HTMLElement }[];

      // Find the last section whose top is at or above the trigger line
      let currentActive = null;
      for (const { category, el } of sectionElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentActive = category;
        }
      }

      if (currentActive) {
        active = currentActive;
      }

      if (active !== selectedCategory) {
        setSelectedCategory(active);
        // Center the active tab button inside its scroll container horizontally
        const container = categoryTabContainerRef.current;
        const activeTabEl = container?.querySelector(`[data-category="${active}"]`) as HTMLElement;
        if (container && activeTabEl) {
          const containerWidth = container.clientWidth;
          const tabOffsetLeft = activeTabEl.offsetLeft;
          const tabWidth = activeTabEl.clientWidth;
          const targetScrollLeft = tabOffsetLeft - (containerWidth / 2) + (tabWidth / 2);
          container.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth"
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [selectedCategory, categories]);

  // Pre-select order type and platform based on query parameters from direct links
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ot = query.get("orderType");
    if (ot === "Delivery" || ot === "Pickup") {
      setOrderType(ot);
    }
    const op = query.get("orderPlatform");
    if (op === "WhatsApp" || op === "Swiggy" || op === "Zomato") {
      setOrderPlatform(op);
    }
  }, [location.search]);

  // Deep-link scrolling check on mount
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const item = query.get("item");
    if (item && menuData.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`dish-item-${item}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-brand-accent", "ring-offset-4");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-brand-accent", "ring-offset-4");
          }, 3000);
        }
      }, 500);
    }
  }, [location, menuData]);

  // Cart Functions
  const handleAddToCart = (dish: Dish) => {
    if ((dish as any).outOfStock) return;
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.dish.id === dish.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { dish, quantity: 1, instructions: "" }];
    });

    setIsCartOpen(true);

    // Show custom toast notification
    setAddedItemToast({ dish, quantity: 1 });
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setAddedItemToast(null);
    }, 2500);
  };

  const updateQuantity = (dishId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.dish.id === dishId ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const updateInstructions = (dishId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.dish.id === dishId ? { ...item, instructions: note } : item))
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + getNumericPrice(item.dish.price) * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return cartTotal * (liveDiscount / 100);
  }, [cartTotal, liveDiscount]);

  const finalTotal = useMemo(() => {
    return cartTotal - discountAmount;
  }, [cartTotal, discountAmount]);

  const checkCartAvailability = (): boolean => {
    const latestMenu = db.getMenu();
    for (const item of cart) {
      const matchedDish = latestMenu.find(d => d.id === item.dish.id);
      if (matchedDish && matchedDish.outOfStock) {
        alert(`${item.dish.title} is currently out of stock. Please remove it from your order.`);
        return false;
      }
    }
    return true;
  };

  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return;
    if (!checkCartAvailability()) return;
    if (!customerName || !customerPhone) {
      alert("Please fill in your Name and Contact Number.");
      return;
    }
    if (orderType === "Delivery" && !deliveryAddress) {
      alert("Please provide your Delivery Address.");
      return;
    }

    const settings = db.getSettings();
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, "");

    let message = `*SRI KRISHNA DHABA - NEW ORDER*\n`;
    message += `----------------------------------------\n`;
    message += `*Customer:* ${customerName}\n`;
    message += `*Mobile/WhatsApp:* ${customerPhone}\n`;
    message += `*Order Type:* ${orderType}\n\n`;
    message += `*Items Ordered:*\n`;

    cart.forEach((item, index) => {
      const itemPrice = getNumericPrice(item.dish.price);
      message += `${index + 1}. *${item.dish.title}* x ${item.quantity} (Rs. ${itemPrice * item.quantity})\n`;
      if (item.instructions) {
        message += `   _Note: ${item.instructions}_\n`;
      }
    });

    message += `\n----------------------------------------\n`;
    message += `*Subtotal:* Rs. ${cartTotal}\n`;
    message += `*Web Discount (${liveDiscount}%):* -Rs. ${discountAmount.toFixed(0)}\n`;
    message += `*Grand Total:* Rs. ${finalTotal.toFixed(0)}\n`;
    message += `----------------------------------------\n`;

    if (orderType === "Delivery") {
      message += `*Delivery Address:* ${deliveryAddress}\n`;
    }
    if (specialNotes) {
      message += `*Special Instructions:* ${specialNotes}\n`;
    }

    message += `\nThank you!`;

    // Save order data temporarily, DO NOT log to db yet
    setPendingOrder({
      customerName,
      phone: customerPhone,
      address: orderType === "Delivery" ? deliveryAddress : "Self Pick-Up",
      items: cart.map(item => ({
        id: item.dish.id,
        name: item.dish.title,
        price: getNumericPrice(item.dish.price),
        quantity: item.quantity
      })),
      totalAmount: cartTotal,
      discountApplied: discountAmount,
      finalAmount: finalTotal
    });

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    // Open confirmation modal
    setShowWhatsAppConfirmModal(true);
  };

  const confirmWhatsAppOrderSent = () => {
    if (pendingOrder) {
      const savedOrder = db.addOrder(pendingOrder);
      
      try {
        (db as any).addAuditLog(
          "WhatsApp Order Placed",
          `Order for ${pendingOrder.customerName} (Rs. ${pendingOrder.finalAmount.toFixed(0)}) sent and confirmed via WhatsApp`
        );
      } catch (e) {
        console.warn("Audit logging failed on client:", e);
      }
      
      if (orderType === "Pickup") {
        setSuccessOrder(savedOrder);
      }
      setPendingOrder(null);
    }
    setShowWhatsAppConfirmModal(false);
    setCart([]);
    setIsCartOpen(false);
    
    // Reset forms
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setSpecialNotes("");
  };

  const cancelWhatsAppOrderConfirm = () => {
    setPendingOrder(null);
    setShowWhatsAppConfirmModal(false);
  };

  const handleExternalRedirectOrder = () => {
    if (cart.length === 0) return;
    if (!checkCartAvailability()) return;
    
    // Log redirect order to database for Admin tracking
    db.addOrder({
      customerName: "Web Customer",
      phone: "Redirected",
      address: `Order via ${orderPlatform}`,
      items: cart.map(item => ({
        id: item.dish.id,
        name: item.dish.title,
        price: getNumericPrice(item.dish.price),
        quantity: item.quantity
      })),
      totalAmount: cartTotal,
      discountApplied: 0,
      finalAmount: cartTotal
    });

    const targetUrl = orderPlatform === "Swiggy"
      ? "https://www.swiggy.com/search?query=Sri%20Krishna%20Family%20Dhaba"
      : "https://www.zomato.com/hyderabad/search?q=Sri%20Krishna%20Family%20Dhaba";

    window.open(targetUrl, "_blank");

    // Clear cart and close
    setCart([]);
    setIsCartOpen(false);

    alert(`Redirecting you to ${orderPlatform} to complete your order!`);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 relative bg-brand-bg/30">
      <div className="noise-overlay" />

      {/* Cart Float Button */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-brand-accent text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:bg-brand-dark transition-colors duration-300"
        >
          <ShoppingCart size={22} />
          <span className="bg-white text-brand-accent text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
          <span className="text-xs font-bold mr-1">Rs. {finalTotal.toFixed(0)}</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-bg shadow-2xl z-50 flex flex-col h-full border-l border-brand-gold/20"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand-gold/15 flex justify-between items-center bg-brand-dark text-brand-bg">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-brand-gold" />
                  <h3 className="font-display font-extrabold text-lg text-brand-gold uppercase tracking-wider">Your Order Cart</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-brand-bg/60 hover:text-brand-gold transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-grow overflow-y-auto p-6 space-y-5">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-brand-dark/50">
                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Your cart is empty.</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-4 text-xs font-bold text-brand-accent underline">
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.dish.id} className="bg-white rounded-2xl p-4 shadow-sm border border-brand-gold/10 relative">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-display font-bold text-sm text-brand-dark">{item.dish.title}</h4>
                              <p className="text-xs text-brand-accent font-bold mt-1">Rs. {getNumericPrice(item.dish.price)}</p>
                            </div>
                            <div className="flex items-center gap-2 border border-brand-gold/25 rounded-full p-1 bg-brand-bg/40">
                              <button onClick={() => updateQuantity(item.dish.id, -1)} className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-brand-accent hover:text-white transition-colors">
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.dish.id, 1)} className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-brand-accent hover:text-white transition-colors">
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Instructions input */}
                          <div className="mt-3">
                            <input
                              type="text"
                              placeholder="Cooking notes (e.g., make it spicy, no onion)..."
                              value={item.instructions}
                              onChange={(e) => updateInstructions(item.dish.id, e.target.value)}
                              className="w-full text-[11px] bg-brand-bg/50 border border-brand-gold/10 focus:border-brand-accent/50 focus:outline-none px-3 py-1.5 rounded-lg text-brand-dark"
                            />
                          </div>

                          <button onClick={() => updateQuantity(item.dish.id, -item.quantity)} className="absolute top-2 right-2 text-brand-dark/20 hover:text-rose-500 transition-colors p-1" title="Remove Item">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Order Details Form */}
                    <div className="pt-6 border-t border-brand-gold/15 space-y-5">
                      
                      {/* Order Platform Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">
                          Select Ordering Platform
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderPlatform("WhatsApp")}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                              orderPlatform === "WhatsApp"
                                ? "bg-brand-accent/10 border-brand-accent text-brand-accent shadow-sm"
                                : "bg-white border-brand-gold/15 hover:border-brand-accent/50 text-brand-dark/70"
                            }`}
                          >
                            <span className="text-xs font-extrabold">WhatsApp</span>
                            <span className="text-[8px] opacity-75 mt-0.5">{liveDiscount}% Web Off</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOrderPlatform("Swiggy")}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                              orderPlatform === "Swiggy"
                                ? "bg-[#fc8019]/10 border-[#fc8019] text-[#fc8019] shadow-sm"
                                : "bg-white border-brand-gold/15 hover:border-[#fc8019]/50 text-brand-dark/70"
                            }`}
                          >
                            <span className="text-xs font-extrabold">Swiggy</span>
                            <span className="text-[8px] opacity-75 mt-0.5">Order via App</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOrderPlatform("Zomato")}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                              orderPlatform === "Zomato"
                                ? "bg-[#e23744]/10 border-[#e23744] text-[#e23744] shadow-sm"
                                : "bg-white border-brand-gold/15 hover:border-[#e23744]/50 text-brand-dark/70"
                            }`}
                          >
                            <span className="text-xs font-extrabold">Zomato</span>
                            <span className="text-[8px] opacity-75 mt-0.5">Order via App</span>
                          </button>
                        </div>
                      </div>

                      {orderPlatform === "WhatsApp" ? (
                        <div className="space-y-4">
                          <h4 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wider">Delivery Details</h4>

                          {/* Order Type Toggle */}
                          <div className="flex gap-2 bg-brand-bg/60 p-1.5 rounded-xl border border-brand-gold/10">
                            <button
                              type="button"
                              onClick={() => setOrderType("Pickup")}
                              className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                orderType === "Pickup" ? "bg-brand-accent text-white shadow-sm" : "text-brand-dark/70 hover:text-brand-dark"
                              }`}
                            >
                              Self-Pickup
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderType("Delivery")}
                              className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                orderType === "Delivery" ? "bg-brand-accent text-white shadow-sm" : "text-brand-dark/70 hover:text-brand-dark"
                              }`}
                            >
                              Home Delivery
                            </button>
                          </div>

                          {/* Fields */}
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Your Name</label>
                              <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-white border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark shadow-sm"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Contact Number</label>
                              <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="Enter mobile number"
                                className="w-full bg-white border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark shadow-sm"
                              />
                            </div>

                            {orderType === "Delivery" && (
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Delivery Address</label>
                                <textarea
                                  rows={2}
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  placeholder="House No, Landmark, Area details..."
                                  className="w-full bg-white border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2 rounded-xl text-xs text-brand-dark shadow-sm"
                                />
                              </div>
                            )}

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block mb-1">Order Notes (Optional)</label>
                              <input
                                type="text"
                                value={specialNotes}
                                onChange={(e) => setSpecialNotes(e.target.value)}
                                placeholder="Overall order instructions..."
                                className="w-full bg-white border border-brand-gold/20 focus:border-brand-accent/60 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-brand-dark shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-2xl border ${
                          orderPlatform === "Swiggy" 
                            ? "bg-[#fc8019]/5 border-[#fc8019]/25 text-[#7f3900]" 
                            : "bg-[#e23744]/5 border-[#e23744]/25 text-[#7c1c24]"
                        } text-xs space-y-2`}>
                          <p className="font-bold uppercase tracking-wider text-[10px]">
                            Ordering via {orderPlatform}
                          </p>
                          <p className="leading-relaxed text-brand-dark/80">
                            We will redirect you to Sri Krishna Family Dhaba's page on {orderPlatform} to complete your order. Please add your items on the app to check out.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer Summary / Checkout button */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-brand-gold/15 bg-white space-y-4 shrink-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-brand-dark/75">
                      <span>Subtotal</span>
                      <span className="font-semibold">Rs. {cartTotal}</span>
                    </div>
                    {orderPlatform === "WhatsApp" ? (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Web Discount ({liveDiscount}% Off)</span>
                        <span>-Rs. {discountAmount.toFixed(0)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-brand-dark/50 font-medium italic">
                        <span>App Delivery (No Web Discount)</span>
                        <span>—</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-brand-dark pt-2 border-t border-brand-dark/5">
                      <span>Grand Total</span>
                      <span className="text-brand-accent text-base">
                        Rs. {orderPlatform === "WhatsApp" ? finalTotal.toFixed(0) : cartTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={orderPlatform === "WhatsApp" ? sendWhatsAppOrder : handleExternalRedirectOrder}
                    className={`w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md border ${
                      orderPlatform === "WhatsApp" 
                        ? "bg-brand-gold hover:bg-brand-dark text-brand-dark hover:text-brand-bg border-brand-gold/10" 
                        : orderPlatform === "Swiggy" 
                        ? "bg-[#fc8019] hover:bg-[#fc8019]/90 text-white border-[#fc8019]/10 cursor-pointer animate-pulse" 
                        : "bg-[#e23744] hover:bg-[#e23744]/90 text-white border-[#e23744]/10 cursor-pointer animate-pulse"
                    }`}
                  >
                    <span>
                      {orderPlatform === "WhatsApp" 
                        ? "Send Order via WhatsApp" 
                        : `Open Order page on ${orderPlatform}`}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp Order Confirmation Modal */}
      <AnimatePresence>
        {showWhatsAppConfirmModal && (
          <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F5F5F5] rounded-3xl p-6 border border-brand-gold/15 w-full max-w-md space-y-6 shadow-2xl relative text-brand-dark"
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-display font-black text-xl text-brand-dark uppercase tracking-wider">
                  Confirm Order Sent
                </h3>
                <p className="text-xs text-brand-dark/65 leading-relaxed">
                  We have opened WhatsApp to send your order. Please make sure you send the message in WhatsApp and confirm with the Dhaba, then click "Confirm Sent" below to log your order.
                </p>
                <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-gold/10 text-left text-[11px] space-y-1">
                  <p><strong>Customer Name:</strong> {pendingOrder?.customerName}</p>
                  <p><strong>Phone Number:</strong> {pendingOrder?.phone}</p>
                  <p><strong>Grand Total:</strong> Rs. {pendingOrder?.finalAmount.toFixed(0)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelWhatsAppOrderConfirm}
                  className="flex-1 py-3 border border-brand-gold/15 text-brand-dark hover:bg-brand-bg rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmWhatsAppOrderSent}
                  className="flex-1 py-3 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirm Sent
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Self-Pickup QR Code success modal */}
      <AnimatePresence>
        {successOrder && (
          <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 border border-brand-gold/30 w-full max-w-sm space-y-6 shadow-2xl relative text-brand-dark"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-display font-black text-lg text-brand-dark uppercase tracking-wider">
                  Order Registered!
                </h3>
                <p className="text-[11px] text-brand-dark/75 font-semibold leading-relaxed">
                  Thank you for your order, <strong>{successOrder.customerName}</strong>! Please present this QR code to the counter staff when picking up your delivery.
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-brand-bg/40 p-4 rounded-2xl border border-brand-gold/15 max-w-[170px] mx-auto shadow-inner text-center space-y-2">
                <div className="bg-white p-2 rounded-xl border border-brand-gold/15 shadow flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(successOrder.id)}`}
                    alt="Self Pickup QR Code"
                    className="w-[120px] h-[120px]"
                  />
                </div>
                <div className="text-[11px] font-black uppercase text-brand-accent tracking-widest font-mono">
                  {successOrder.id}
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-brand-bg/25 border border-brand-dark/10 rounded-2xl p-4 text-left text-xs space-y-1.5 font-semibold text-brand-dark/85">
                <div className="flex justify-between">
                  <span className="text-brand-dark/50 uppercase text-[9px] font-black tracking-wider">Order ID</span>
                  <span className="font-mono font-extrabold tracking-wider">{successOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-dark/50 uppercase text-[9px] font-black tracking-wider">Status</span>
                  <span className="text-amber-600 font-extrabold uppercase text-[10px] tracking-wide">Pending Pickup</span>
                </div>
                <div className="flex justify-between border-t border-brand-dark/5 pt-1.5 font-bold">
                  <span>Grand Total</span>
                  <span className="text-brand-accent text-sm font-black">Rs. {successOrder.finalAmount.toFixed(0)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccessOrder(null)}
                className="w-full py-3.5 bg-brand-dark hover:bg-brand-accent text-white font-black tracking-widest uppercase text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Close & Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Added to Cart Toast Notification */}
      <AnimatePresence>
        {addedItemToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-brand-dark/95 backdrop-blur-md border border-brand-gold/20 text-brand-bg px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
            >
              {addedItemToast.dish.isSignature && addedItemToast.dish.image && (
                <img
                  src={addedItemToast.dish.image}
                  alt={addedItemToast.dish.title}
                  className="w-10 h-10 rounded-xl object-cover border border-brand-gold/10 shrink-0"
                />
              )}
              <div className="flex-grow min-w-0 text-xs text-left">
                <p className="font-bold text-emerald-400 uppercase tracking-wider text-[9px] mb-0.5">Added to Cart!</p>
                <h4 className="font-display font-bold text-white truncate uppercase tracking-wide">
                  {addedItemToast.dish.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(true);
                  setAddedItemToast(null);
                }}
                className="px-3.5 py-1.5 bg-brand-accent hover:bg-brand-gold hover:text-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer"
              >
                View Cart
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 bg-brand-accent/15 border border-brand-accent/30 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-brand-accent">
              🔥 Sri Krishna Signature Menu
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl text-brand-dark leading-tight">
            Choose Your Flavour
          </h1>

          {/* Telugu subtitle */}
          <p className="font-telugu text-brand-accent font-semibold text-lg sm:text-xl">
            కారా మరియు రుచికరమైన శాకాహార వంటకాలు
          </p>

          {/* Description */}
          <p className="text-sm text-brand-dark/60 leading-relaxed max-w-xl mx-auto">
            From piping hot soups to smoking hot clay tandoori starters, authentic Hyderabadi veg and cashew biryanis. Pure taste that satisfies.
          </p>
        </div>

        {/* Promo Banner - Exclusive Table Reservation */}
        {showMenuPromo && (
          <div className="mb-10 max-w-5xl mx-auto border-2 border-dashed border-brand-gold/30 bg-white/40 p-6 rounded-2xl flex flex-col items-center text-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-0.5 rounded text-brand-accent uppercase tracking-wider block w-fit">
                Special Discount
              </span>
              <p className="text-sm font-display font-bold text-brand-dark mt-2.5">
                🎉 Reserve your table through our website and receive <strong className="text-brand-accent">{liveDiscount}% OFF</strong> on your final dining bill.
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("menu-catalog-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="shrink-0 bg-brand-accent hover:bg-brand-dark text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Order Now
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div id="menu-catalog-section" className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-brand-gold/10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/45" size={18} />
              <input
                type="text"
                placeholder="Search dishes (e.g. Paneer Biryani, Naan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg/30 border border-brand-gold/15 focus:border-brand-accent/60 focus:outline-none pl-12 pr-4 py-3 rounded-2xl text-sm text-brand-dark shadow-inner transition-colors duration-300"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3 relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-brand-bg/30 border border-brand-gold/15 focus:border-brand-accent/60 focus:outline-none px-4 py-3 rounded-2xl text-xs font-bold text-brand-dark/80 appearance-none cursor-pointer"
              >
                <option value="none">Sort by: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating: Highest First</option>
              </select>
              <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/45 pointer-events-none" size={14} />
            </div>

            {/* Filter Badges */}
            <div className="md:col-span-3 flex gap-2">
              <button
                onClick={() => setShowChefSpecialsOnly(!showChefSpecialsOnly)}
                className={`flex-grow flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 border ${
                  showChefSpecialsOnly
                    ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                    : "bg-brand-bg/50 text-brand-dark/70 border-brand-gold/15 hover:border-brand-accent/40"
                }`}
              >
                <Sparkles size={11} className={showChefSpecialsOnly ? "fill-white" : ""} />
                <span>Chef Specials</span>
              </button>

              <button
                onClick={() => setShowHighRatingOnly(!showHighRatingOnly)}
                className={`flex-grow flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 border ${
                  showHighRatingOnly
                    ? "bg-brand-gold text-brand-dark border-brand-gold shadow-sm"
                    : "bg-brand-bg/50 text-brand-dark/70 border-brand-gold/15 hover:border-brand-accent/40"
                }`}
              >
                <Star size={11} className={showHighRatingOnly ? "fill-brand-dark" : ""} />
                <span>Top Rated</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Categories Tab Bar */}
        <div
          style={{
            "--sticky-top-mobile": showWebExclusiveBar ? "114px" : "82px",
            "--sticky-top-desktop": showWebExclusiveBar ? "118px" : "86px",
          } as React.CSSProperties}
          className="sticky top-[var(--sticky-top-mobile)] lg:top-[var(--sticky-top-desktop)] z-30 bg-brand-bg/95 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all duration-300 mb-10"
        >
          <div
            ref={categoryTabContainerRef}
            className="flex overflow-x-auto pb-1 gap-2 scrollbar-thin scrollbar-thumb-brand-accent/60 scrollbar-track-transparent max-w-7xl mx-auto"
          >
            {categories.map((category) => (
              <button
                key={category}
                data-category={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-3 rounded-full text-xs font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-300 shadow-sm border ${
                  selectedCategory === category
                    ? "bg-brand-dark text-brand-bg border-brand-dark"
                    : "bg-brand-bg text-brand-dark hover:bg-brand-accent/10 border-brand-gold/15 hover:border-brand-accent/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Categories Unified List Layout */}
        <div className="space-y-16">
          {categories.filter(c => c !== "All").map((category) => {
            const dishes = groupedDishes[category] || [];
            if (dishes.length === 0) return null;

            const elementId = `category-section-${category.replace(/\s+/g, '-').replace(/'/g, '')}`;

            return (
              <div key={category} id={elementId} className="scroll-mt-[205px]">
                {/* Category Heading & Controls */}
                <div className="pb-4 mb-6 flex justify-between items-center border-b border-brand-gold/15">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark tracking-tight">
                      {formatCategoryName(category)}
                    </h2>
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block mt-1">
                      {dishes.length} {dishes.length === 1 ? "Item" : "Items"} Available
                    </span>
                  </div>
                  
                  {/* Scroll controls (left and right arrow buttons) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCategoryContainer(category, 'left')}
                      className="w-9 h-9 rounded-full border border-brand-dark/20 hover:border-brand-accent hover:bg-brand-accent hover:text-brand-bg flex items-center justify-center text-brand-dark transition-all duration-300 cursor-pointer shadow-sm animate-fade-in"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => scrollCategoryContainer(category, 'right')}
                      className="w-9 h-9 rounded-full border border-brand-dark/20 hover:border-brand-accent hover:bg-brand-accent hover:text-brand-bg flex items-center justify-center text-brand-dark transition-all duration-300 cursor-pointer shadow-sm animate-fade-in"
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scroll Layout */}
                <div 
                  id={`scroll-container-${category.replace(/\s+/g, '-').replace(/'/g, '')}`}
                  className="flex overflow-x-auto gap-6 pb-6 pt-2 scroll-smooth scrollbar-thin scrollbar-thumb-brand-accent/40 scrollbar-track-transparent snap-x snap-mandatory"
                >
                  {dishes.map((dish) => (
                    <div 
                      key={dish.id} 
                      id={`dish-item-${dish.id}`} 
                      className="scroll-mt-[225px] rounded-2xl transition-all duration-300 shrink-0 w-[230px] sm:w-[270px] snap-start"
                    >
                      <DishCard 
                        dish={dish} 
                        showImage={true}
                        onOrderOverride={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Render any dynamic categories not present in static categories list */}
          {Object.keys(groupedDishes)
            .filter((cat) => !categories.includes(cat) && (groupedDishes[cat]?.length || 0) > 0)
            .map((category) => {
              const dishes = groupedDishes[category];
              const elementId = `category-section-${category.replace(/\s+/g, '-').replace(/'/g, '')}`;

              return (
                <div key={category} id={elementId} className="scroll-mt-[205px]">
                  <div className="pb-4 mb-6 flex justify-between items-center border-b border-brand-gold/15">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark tracking-tight">
                        {formatCategoryName(category)}
                      </h2>
                      <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block mt-1">
                        {dishes.length} {dishes.length === 1 ? "Item" : "Items"} Available
                      </span>
                    </div>
                  </div>

                  <div 
                    id={`scroll-container-${category.replace(/\s+/g, '-').replace(/'/g, '')}`}
                    className="flex overflow-x-auto gap-6 pb-6 pt-2 scroll-smooth scrollbar-thin scrollbar-thumb-brand-accent/40 scrollbar-track-transparent snap-x snap-mandatory"
                  >
                    {dishes.map((dish) => (
                      <div 
                        key={dish.id} 
                        id={`dish-item-${dish.id}`} 
                        className="scroll-mt-[225px] rounded-2xl transition-all duration-300 shrink-0 w-[230px] sm:w-[270px] snap-start"
                      >
                        <DishCard 
                          dish={dish} 
                          showImage={true}
                          onOrderOverride={handleAddToCart}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Fallback for when absolutely no dishes are found in any category */}
          {allFilteredDishes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-brand-bg rounded-3xl border border-brand-gold/15 shadow-sm p-8"
            >
              <h3 className="font-display font-extrabold text-xl text-brand-dark mb-2">No Culinary Matches Found</h3>
              <p className="text-xs text-brand-dark/65 max-w-sm mx-auto">
                We couldn't find any dishes fitting your search parameters. Try clearing your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("none");
                  setShowChefSpecialsOnly(false);
                  setShowHighRatingOnly(false);
                }}
                className="mt-6 bg-brand-accent text-brand-bg text-xs font-bold px-6 py-2.5 rounded-full shadow hover:bg-brand-dark transition-colors duration-300"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
