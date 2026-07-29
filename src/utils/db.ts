import type { Dish } from "../components/DishCard";
import { menuData as initialMenu } from "./menuData";
import { db as firestore } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit
} from "firebase/firestore";

export interface LoyaltyVoucher {
  id: string;
  billNumber: string;
  phone: string;
  baseAmount: number;
  discountPercent: number;
  discountValue: number;
  finalAmount: number;
  category: string;
  status: "ACTIVE" | "REDEEMED";
  createdAt: string;
  expiresAt: string;
}

export interface GiftCoupon {
  id: string;
  code: string;
  secureToken: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  minimumBillAmount: number;
  discountPercentage: number;
  category: string;
  customCategory?: string;
  createdAt: string;
  expiresAt: string;
  status: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";
  createdBy: string;
  redeemedAt?: string;
  redeemedBy?: string;
  billAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface WhatsAppOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  status: "Pending" | "Accepted" | "Out For Delivery" | "Delivered" | "Cancelled";
  createdAt: string;
  deliveredAt?: string;
  reviewToken?: string;
  isReviewed?: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface LoginAudit {
  id: string;
  loginAttemptId: string;
  timestamp: string;
  result: "SUCCESS" | "FAILED";
  ipAddress: string;
  browser: string;
  deviceType: string;
  userAgent: string;
  snapshotUrl?: string | null;
  adminUid?: string;
  createdAt: string;
  snapshotStatus?: "SUCCESS" | "PERMISSION_DENIED" | "NO_IMAGE";
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  guests: number;
  date: string;
  time: string;
  occasion: string;
  instructions?: string;
  tableNumber?: string;
  status: "Pending" | "Approved" | "Rejected" | "Arrived" | "Completed" | "Cancelled";
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
  date: string;
  source: string;
  avatar: string;
  status: "Pending" | "Approved" | "Rejected";
  pinned?: boolean;
  orderId?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: "Dishes" | "Tandoor" | "Sweets" | "Ambience";
  title: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "Pending" | "Resolved";
  createdAt: string;
}

export interface RestaurantSettings {
  discountPercent: number;
  whatsappNumber: string;
  maxGuestsPerBooking: number;
  maxReservationsPerSlot: number;
  advanceBookingDays: number;
  timings: string;
  holidayClosures: string[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  googleMapsEmbedUrl: string;
  heroVideo?: string;
  // Promo visibility toggles
  showWebExclusiveBar: boolean;   // top announcement bar
  showMenuPromo: boolean;          // promo banner on menu page
  webExclusiveText: string;        // customizable top bar text
  reservationPromoText?: string;   // customizable reservation desk text
}

// Initial default reviews
const defaultReviews: Review[] = [
  {
    id: "rev-1",
    name: "Venkata Ratnam Rayala",
    role: "Local Guide • 1,288 reviews",
    rating: 5,
    quote: "Food was good (both quality and quantity wise) Family atmosphere and good staff. We ordered Paneer Chatpata, Butter Naan, Garlic Naan and Butter Roti from this place. Highly satisfied!",
    date: "8 months ago",
    source: "Google Reviews",
    avatar: "VR",
    status: "Approved",
    pinned: true
  },
  {
    id: "rev-2",
    name: "K Monesh Chary",
    role: "Local Guide",
    rating: 4,
    quote: "Nice restaurant with good ambience lighting need to bit more. Food was very tasty, and service is quick. Worth visiting with families.",
    date: "4 months ago",
    source: "Google Reviews",
    avatar: "KM",
    status: "Approved"
  },
  {
    id: "rev-3",
    name: "Sai Kumar",
    role: "2 reviews • 9 photos",
    rating: 4,
    quote: "Ordered Paneer Biryani and Tandoori Roti. The quantity was massive and the taste was authentic. Great experience in Pragathi Nagar.",
    date: "4 months ago",
    source: "Google Reviews",
    avatar: "SK",
    status: "Approved"
  },
  {
    id: "rev-4",
    name: "Jyothi Reddy",
    role: "Verified Customer",
    rating: 5,
    quote: "Excellent pure veg family dhaba on HMT road. Extremely hygienic and the staff is really humble. Highly recommended!",
    date: "2 months ago",
    source: "Swiggy",
    avatar: "JR",
    status: "Approved"
  },
  {
    id: "rev-5",
    name: "Abhinav Rao",
    role: "Foodie Guide",
    rating: 5,
    quote: "The Gobi 65 and Chana Masala were spot on. Real clay oven tandoor roti taste, which is hard to find in local restaurants here.",
    date: "1 month ago",
    source: "Zomato",
    avatar: "AR",
    status: "Approved"
  },
  {
    id: "rev-6",
    name: "Priya Darshini",
    role: "Local Guide",
    rating: 4,
    quote: "Comforting food. The Sweet Tomato Soup and Sweet Lassi are a must-try. Safe and friendly environment for kids and elderly.",
    date: "3 weeks ago",
    source: "Google Reviews",
    avatar: "PD",
    status: "Approved"
  }
];

// Initial default gallery items
const defaultGallery: GalleryItem[] = [
  {
    id: "g-1",
    url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    category: "Dishes",
    title: "Paneer Biryani Dum Cooking"
  },
  {
    id: "g-2",
    url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80",
    category: "Tandoor",
    title: "Sizzling Paneer Tikka Platter"
  },
  {
    id: "g-3",
    url: "/images/gallery-naan-types.jpg",
    category: "Tandoor",
    title: "Different Naan Types (Kashmiri, Plain, Butter, Garlic)"
  },
  {
    id: "g-5",
    url: "/images/gallery-dish-paneer.jpg",
    category: "Dishes",
    title: "Paneer Butter Masala & Butter Naan Combo"
  },
  {
    id: "g-7",
    url: "/images/gallery-ambience-1.jpg",
    category: "Ambience",
    title: "Premium Family Dining Area"
  },
  {
    id: "g-8",
    url: "/images/gallery-ambience-2.jpg",
    category: "Ambience",
    title: "Cozy Dining with Artistic Decor"
  },
  {
    id: "g-9",
    url: "/images/gallery-ambience-3.jpg",
    category: "Ambience",
    title: "Spacious Banquet Seating Layout"
  }
];

const defaultSettings: RestaurantSettings = {
  discountPercent: 10,
  whatsappNumber: "+91 90322 92421",
  maxGuestsPerBooking: 15,
  maxReservationsPerSlot: 4,
  advanceBookingDays: 30,
  timings: "Mon – Sun: 11:30 AM – 11:45 PM",
  holidayClosures: [],
  contactEmail: "contact@srikrishnadhaba.com",
  contactPhone: "+91 90322 92421",
  contactAddress: "A/1, Oop Godavari Cuts, Bajrang Towers, 6-109/1760, Pragathi Nagar Rd, Hyderabad, Telangana 500090",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.378779646875!2d78.3924395!3d17.5254461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8f0052362da1%3A0xd093fe41bf080e4d!2sSri%20Krishna%20Family%20Dhaba!5e0!3m2!1sen!2sin!4v1704481029192!5m2!1sen!2sin",
  showWebExclusiveBar: true,
  showMenuPromo: true,
  webExclusiveText: "Book a table online & get 10% OFF your dining bill",
  reservationPromoText: "Reserve your dining slot online today to receive a dynamic digital check-out voucher for 10% OFF your total bill amount."
};

// Generates mock bookings to populate analytics
const generateMockBookings = (): Booking[] => {
  const list: Booking[] = [];
  const names = ["Ram Charan", "Vijay Devarakonda", "Niharika Konidela", "Allu Arjun", "Pooja Hegde", "Rashmika Mandanna", "Mahesh Babu", "K. R. Srinivas", "G. Lakshmi", "Priya Nair", "Nithin Kumar", "Sneha Rao", "Rohan Mehta", "Suresh G.", "Anusha Patel"];
  const occasions = ["None", "Birthday", "Anniversary", "Family Gathering", "Corporate Meeting", "Kitty Party"];
  const times = ["12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
  const statuses: Booking["status"][] = ["Approved", "Completed", "Arrived", "Cancelled", "Rejected"];

  const today = new Date();
  for (let i = 0; i < 45; i++) {
    const dateOffset = Math.floor(Math.random() * 8); // 0 to 7 days ago
    const bDate = new Date(today);
    bDate.setDate(today.getDate() - dateOffset);
    const dateStr = bDate.toISOString().split("T")[0];

    const hourStr = times[Math.floor(Math.random() * times.length)];
    const status = dateOffset === 0 ? "Pending" : statuses[Math.floor(Math.random() * statuses.length)];
    const phone = `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`;

    list.push({
      id: `r-${1000 + i}`,
      name: names[Math.floor(Math.random() * names.length)],
      phone,
      whatsapp: phone,
      email: Math.random() > 0.5 ? "guest@example.com" : undefined,
      guests: Math.floor(Math.random() * 6) + 1,
      date: dateStr,
      time: hourStr,
      occasion: occasions[Math.floor(Math.random() * occasions.length)],
      instructions: Math.random() > 0.7 ? "Extra chairs needed." : undefined,
      tableNumber: String(Math.floor(Math.random() * 10) + 1),
      status,
      notes: Math.random() > 0.8 ? "Frequent diner. Likes window seat." : undefined,
      createdAt: new Date(bDate.getTime() - 3600000).toISOString()
    });
  }
  return list;
};

const defaultVouchers: LoyaltyVoucher[] = [
  {
    id: "RSD-REWARD-4DE9LW-5513",
    billNumber: "INV-2026-9812",
    phone: "9849498681",
    baseAmount: 1000,
    discountPercent: 55,
    discountValue: 550,
    finalAmount: 450,
    category: "Happy Hour",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 24 * 14).toISOString()
  },
  {
    id: "RSD-REWARD-7Y2K9P-1288",
    billNumber: "INV-2026-9810",
    phone: "9032292421",
    baseAmount: 1500,
    discountPercent: 10,
    discountValue: 150,
    finalAmount: 1350,
    category: "Manual Custom",
    status: "REDEEMED",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 24 * 12).toISOString()
  }
];

const defaultOrders: WhatsAppOrder[] = [
  {
    id: "ORD-9801",
    customerName: "Harish Rao",
    phone: "9848012345",
    address: "Plot 42, Huda Colony, Pragathi Nagar, Hyderabad",
    items: [
      { id: "spl-starter-7", name: "Paneer Chatpata", price: 240, quantity: 2 },
      { id: "roti-2", name: "Butter Naan", price: 40, quantity: 4 }
    ],
    totalAmount: 640,
    discountApplied: 64,
    finalAmount: 576,
    status: "Delivered",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "ORD-9802",
    customerName: "Sandeep G.",
    phone: "9177098765",
    address: "Flat 302, Sai Residency, Pragathi Nagar, Hyderabad",
    items: [
      { id: "biryani-6", name: "Paneer Biryani", price: 260, quantity: 1 },
      { id: "softdrink-1", name: "Thums Up", price: 40, quantity: 2 }
    ],
    totalAmount: 340,
    discountApplied: 34,
    finalAmount: 306,
    status: "Pending",
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    user: "Srinivas Rao (Owner)",
    action: "Voucher Generation",
    details: "Generated voucher RSD-REWARD-4DE9LW-5513 for Phone 9849498681",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "log-2",
    user: "Karthik Uppari (Manager)",
    action: "Reservation Status Update",
    details: "Approved reservation r-1002 for Vijay Devarakonda",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

const KEYS = {
  MENU: "skd_menu",
  BOOKINGS: "skd_bookings",
  REVIEWS: "skd_reviews",
  GALLERY: "skd_gallery",
  CONTACTS: "skd_contacts",
  SETTINGS: "skd_settings",
  SETTINGS_DRAFT: "skd_settings_draft",
  VISITS: "skd_visits",
  VOUCHERS: "skd_vouchers",
  ORDERS: "skd_orders",
  AUDIT_LOGS: "skd_audit_logs",
  GIFT_COUPONS: "skd_gift_coupons",
  LOGIN_AUDITS: "skd_login_audits"
};

const appId = "sri-krishna-dhaba";
const publicPath = `publicData/${appId}`;

function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanForFirestore(val);
    }
  }
  return cleaned;
}

// Helper to seed Firestore collection if empty
async function seedCollection(colName: string, defaultList: any[]) {
  const colRef = collection(firestore, publicPath, colName);
  const snap = await getDocs(query(colRef, limit(1)));
  if (snap.empty) {
    console.log(`Seeding collection ${colName}...`);
    for (const item of defaultList) {
      const docRef = doc(firestore, publicPath, colName, item.id);
      await setDoc(docRef, cleanForFirestore(item));
    }
  }
}

async function seedSettings() {
  const docRef = doc(firestore, publicPath, "settings", "default");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.log("Seeding settings...");
    await setDoc(docRef, defaultSettings);
  }
}

async function seedVisits() {
  const docRef = doc(firestore, publicPath, "visits", "counter");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.log("Seeding visits...");
    await setDoc(docRef, { count: 254 });
  }
}

let listenersInitialized = false;

export const db = {
  init() {
    // 1. Initial local storage fallback so app works immediately
    if (!localStorage.getItem(KEYS.MENU)) {
      const cleanedMenu = initialMenu.map((dish) => ({
        ...dish,
        outOfStock: false,
        hidden: false
      }));
      localStorage.setItem(KEYS.MENU, JSON.stringify(cleanedMenu));
    }
    if (!localStorage.getItem(KEYS.REVIEWS)) {
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(defaultReviews));
    }
    if (!localStorage.getItem(KEYS.GALLERY)) {
      localStorage.setItem(KEYS.GALLERY, JSON.stringify(defaultGallery));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(KEYS.SETTINGS_DRAFT)) {
      localStorage.setItem(KEYS.SETTINGS_DRAFT, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(generateMockBookings()));
    }
    if (!localStorage.getItem(KEYS.CONTACTS)) {
      localStorage.setItem(KEYS.CONTACTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.VISITS)) {
      localStorage.setItem(KEYS.VISITS, String(254));
    }
    if (!localStorage.getItem(KEYS.VOUCHERS)) {
      localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(defaultVouchers));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(defaultOrders));
    }
    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(defaultAuditLogs));
    }
    if (!localStorage.getItem(KEYS.GIFT_COUPONS)) {
      localStorage.setItem(KEYS.GIFT_COUPONS, JSON.stringify([]));
    }

    // 2. Setup real-time listeners for Firestore if not already initialized
    if (!listenersInitialized) {
      listenersInitialized = true;

      // Asynchronously seed Firestore collections ONLY if DB is not already initialized
      (async () => {
        try {
          const settingsRef = doc(firestore, publicPath, "settings", "default");
          const settingsSnap = await getDoc(settingsRef);
          if (!settingsSnap.exists()) {
            console.log("DB not initialized. Seeding collections...");
            await seedCollection("menu", initialMenu.map(d => ({ ...d, outOfStock: d.outOfStock || false, hidden: d.hidden || false })));
            await seedCollection("reviews", defaultReviews);
            await seedCollection("gallery", defaultGallery);
            await seedSettings();
            await seedCollection("bookings", generateMockBookings());
            await seedCollection("vouchers", defaultVouchers);
            await seedCollection("orders", defaultOrders);
            await seedCollection("audit_logs", defaultAuditLogs);
            await seedVisits();
          }
        } catch (e) {
          console.error("Error seeding Firestore:", e);
        }
      })();

      // Setup Firestore -> LocalStorage real-time sync
      const syncCollection = (colName: string, storageKey: string) => {
        const colRef = collection(firestore, publicPath, colName);
        onSnapshot(colRef, (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id });
          });
          if (colName === "menu") {
            const current = db.getMenu();
            const map = new Map(current.map(d => [d.id, d]));
            list.forEach(item => {
              if (item && item.id) {
                map.set(item.id, { ...map.get(item.id), ...item });
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem(storageKey, JSON.stringify(merged));
            window.dispatchEvent(new Event("storage"));
          } else {
            localStorage.setItem(storageKey, JSON.stringify(list));
            window.dispatchEvent(new Event("storage"));
          }
        }, (_error) => {
          // Fallback to local data cleanly if Firestore permissions/network are unavailable
        });
      };

      syncCollection("menu", KEYS.MENU);
      syncCollection("reviews", KEYS.REVIEWS);
      syncCollection("gallery", KEYS.GALLERY);
      syncCollection("bookings", KEYS.BOOKINGS);
      syncCollection("vouchers", KEYS.VOUCHERS);
      syncCollection("orders", KEYS.ORDERS);
      syncCollection("audit_logs", KEYS.AUDIT_LOGS);
      syncCollection("contacts", KEYS.CONTACTS);
      syncCollection("gift_coupons", KEYS.GIFT_COUPONS);
      syncCollection("login_audits", KEYS.LOGIN_AUDITS);

      onSnapshot(doc(firestore, publicPath, "settings", "default"), (docSnap) => {
        if (docSnap.exists()) {
          localStorage.setItem(KEYS.SETTINGS, JSON.stringify(docSnap.data()));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("skd_settings_updated"));
        }
      }, () => {});

      onSnapshot(doc(firestore, publicPath, "settings", "draft"), (docSnap) => {
        if (docSnap.exists()) {
          localStorage.setItem(KEYS.SETTINGS_DRAFT, JSON.stringify(docSnap.data()));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("skd_settings_draft_updated"));
        }
      }, () => {});

      onSnapshot(doc(firestore, publicPath, "visits", "counter"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          localStorage.setItem(KEYS.VISITS, String(data.count || 254));
          window.dispatchEvent(new Event("storage"));
        }
      }, () => {});
    }
  },

  // ─── MENU DB ─────────────────────────────────────────────────────────────
  getMenu(): Dish[] {
    this.init();
    const stored = localStorage.getItem(KEYS.MENU);
    let menuList: Dish[] = [];
    if (stored) {
      try {
        menuList = JSON.parse(stored);
      } catch (e) {
        menuList = [];
      }
    }

    const existingMap = new Map<string, Dish>();
    if (Array.isArray(menuList)) {
      menuList.forEach((dish) => {
        if (dish && dish.id) {
          existingMap.set(dish.id, dish);
        }
      });
    }

    let updated = false;

    // Ensure all items from initialMenu are present and image paths are synced
    initialMenu.forEach((masterDish) => {
      const existing = existingMap.get(masterDish.id);
      if (!existing) {
        existingMap.set(masterDish.id, {
          ...masterDish,
          outOfStock: masterDish.outOfStock || false,
          hidden: masterDish.hidden || false
        });
        updated = true;
      } else {
        let changed = false;
        if (masterDish.image && existing.image !== masterDish.image) {
          existing.image = masterDish.image;
          changed = true;
        }
        if (existing.title !== masterDish.title) {
          existing.title = masterDish.title;
          changed = true;
        }
        if (existing.category !== masterDish.category) {
          existing.category = masterDish.category;
          changed = true;
        }
        if (existing.description !== masterDish.description) {
          existing.description = masterDish.description;
          changed = true;
        }
        if (changed) {
          updated = true;
        }
      }
    });

    const fullMenu = Array.from(existingMap.values());

    if (updated || !stored || menuList.length < initialMenu.length) {
      localStorage.setItem(KEYS.MENU, JSON.stringify(fullMenu));
      window.dispatchEvent(new Event("storage"));
    }

    return fullMenu;
  },

  addDish(dish: Omit<Dish, "id"> & { id?: string }): Dish {
    const id = dish.id || `dish-${Date.now()}`;
    const newDish = {
      ...dish,
      id,
      rating: dish.rating || 4.0
    } as Dish;

    const menu = this.getMenu();
    menu.push(newDish);
    localStorage.setItem(KEYS.MENU, JSON.stringify(menu));
    window.dispatchEvent(new Event("storage"));

    const cleanedDish = Object.keys(newDish).reduce((acc, key) => {
      const val = (newDish as any)[key];
      if (val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as any);

    setDoc(doc(firestore, publicPath, "menu", id), cleanedDish).catch(e => console.error(e));
    return newDish;
  },

  async updateDish(id: string, updates: Partial<Dish>): Promise<Dish> {
    const menu = this.getMenu();
    const index = menu.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Dish not found");
    const updated = { ...menu[index], ...updates };
    menu[index] = updated;
    localStorage.setItem(KEYS.MENU, JSON.stringify(menu));
    window.dispatchEvent(new Event("storage"));

    const cleanedUpdates = Object.keys(updates).reduce((acc, key) => {
      const val = (updates as any)[key];
      if (val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as any);

    await updateDoc(doc(firestore, publicPath, "menu", id), cleanedUpdates);
    return updated;
  },

  deleteDish(id: string): void {
    const menu = this.getMenu();
    const filtered = menu.filter((d) => d.id !== id);
    localStorage.setItem(KEYS.MENU, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    deleteDoc(doc(firestore, publicPath, "menu", id)).catch(e => console.error(e));
  },

  // ─── BOOKINGS DB ─────────────────────────────────────────────────────────
  getBookings(): Booking[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || "[]");
  },

  addBooking(booking: Omit<Booking, "id" | "status" | "createdAt"> & { status?: Booking["status"] }): Booking {
    const id = `r-${Date.now().toString().slice(-4)}`;
    const newBooking: Booking = {
      ...booking,
      id,
      status: booking.status || "Pending",
      createdAt: new Date().toISOString()
    };

    const bookings = this.getBookings();
    bookings.push(newBooking);
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "bookings", id), cleanForFirestore(newBooking)).catch(e => console.error(e));
    return newBooking;
  },

  updateBookingStatus(id: string, status: Booking["status"], notes?: string): Booking {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Booking not found");
    bookings[index].status = status;
    if (notes !== undefined) bookings[index].notes = notes;
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new Event("storage"));

    const updates: Partial<Booking> = { status };
    if (notes !== undefined) updates.notes = notes;
    updateDoc(doc(firestore, publicPath, "bookings", id), updates).catch(e => console.error(e));
    return bookings[index];
  },

  updateBooking(id: string, updates: Partial<Booking>): Booking {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Booking not found");
    const updated = { ...bookings[index], ...updates };
    bookings[index] = updated;
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new Event("storage"));

    updateDoc(doc(firestore, publicPath, "bookings", id), cleanForFirestore(updates)).catch(e => console.error(e));
    return updated;
  },

  async deleteBooking(id: string): Promise<void> {
    const bookings = this.getBookings();
    const filtered = bookings.filter((b) => b.id !== id);
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    await deleteDoc(doc(firestore, publicPath, "bookings", id));
    this.addAuditLog("Reservation Deleted", `Permanently deleted reservation request ${id} from database`);
  },

  // ─── REVIEWS DB ──────────────────────────────────────────────────────────
  getReviews(): Review[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.REVIEWS) || "[]");
  },

  addReview(review: Omit<Review, "id" | "avatar" | "date" | "status">): Review {
    const initials = review.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const id = `rev-${Date.now()}`;
    const newReview: Review = {
      ...review,
      id,
      avatar: initials || "G",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "Pending"
    };

    const reviews = this.getReviews();
    reviews.push(newReview);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "reviews", id), cleanForFirestore(newReview)).catch(e => console.error(e));
    return newReview;
  },

  updateReviewStatus(id: string, status: Review["status"], pinned?: boolean): Review {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Review not found");
    reviews[index].status = status;
    if (pinned !== undefined) reviews[index].pinned = pinned;
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new Event("storage"));

    const updates: Partial<Review> = { status };
    if (pinned !== undefined) updates.pinned = pinned;
    updateDoc(doc(firestore, publicPath, "reviews", id), cleanForFirestore(updates)).catch(e => console.error(e));
    return reviews[index];
  },

  deleteReview(id: string): void {
    const reviews = this.getReviews();
    const filtered = reviews.filter((r) => r.id !== id);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    deleteDoc(doc(firestore, publicPath, "reviews", id)).catch(e => console.error(e));
  },

  // ─── GALLERY DB ──────────────────────────────────────────────────────────
  getGallery(): GalleryItem[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.GALLERY) || "[]");
  },

  addImage(item: Omit<GalleryItem, "id">): GalleryItem {
    const id = `g-${Date.now()}`;
    const newItem = {
      ...item,
      id
    };

    const gallery = this.getGallery();
    gallery.push(newItem);
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(gallery));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "gallery", id), newItem).catch(e => console.error(e));
    return newItem;
  },

  deleteImage(id: string): void {
    const gallery = this.getGallery();
    const filtered = gallery.filter((g) => g.id !== id);
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    deleteDoc(doc(firestore, publicPath, "gallery", id)).catch(e => console.error(e));
  },

  updateGallery(items: GalleryItem[]): void {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(items));
    window.dispatchEvent(new Event("storage"));

    // Write all gallery items to Firestore
    (async () => {
      try {
        // Delete all first
        const snap = await getDocs(collection(firestore, publicPath, "gallery"));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(firestore, publicPath, "gallery", docSnap.id));
        }
        // Write new ones
        for (const item of items) {
          await setDoc(doc(firestore, publicPath, "gallery", item.id), item);
        }
      } catch (e) {
        console.error("Error updating gallery in Firestore:", e);
      }
    })();
  },

  // ─── CONTACTS DB ─────────────────────────────────────────────────────────
  getContacts(): ContactInquiry[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.CONTACTS) || "[]");
  },

  addContact(inquiry: Omit<ContactInquiry, "id" | "status" | "createdAt">): ContactInquiry {
    const id = `c-${Date.now()}`;
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    const contacts = this.getContacts();
    contacts.push(newInquiry);
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "contacts", id), cleanForFirestore(newInquiry)).catch(e => console.error(e));
    return newInquiry;
  },

  updateContactStatus(id: string, status: ContactInquiry["status"]): ContactInquiry {
    const contacts = this.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Inquiry not found");
    contacts[index].status = status;
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
    window.dispatchEvent(new Event("storage"));

    updateDoc(doc(firestore, publicPath, "contacts", id), { status }).catch(e => console.error(e));
    return contacts[index];
  },

  deleteContact(id: string): void {
    const contacts = this.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    deleteDoc(doc(firestore, publicPath, "contacts", id)).catch(e => console.error(e));
  },

  // ─── SETTINGS DB ─────────────────────────────────────────────────────────
  getSettings(): RestaurantSettings {
    this.init();
    const stored = localStorage.getItem(KEYS.SETTINGS);
    if (!stored) return defaultSettings;
    try {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      return defaultSettings;
    }
  },

  updateSettings(updates: Partial<RestaurantSettings>): RestaurantSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("skd_settings_updated"));

    updateDoc(doc(firestore, publicPath, "settings", "default"), cleanForFirestore(updates)).catch(e => console.error(e));
    return updated;
  },

  getSettingsDraft(): RestaurantSettings {
    this.init();
    const stored = localStorage.getItem(KEYS.SETTINGS_DRAFT);
    if (!stored) return this.getSettings();
    try {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      return this.getSettings();
    }
  },

  async updateSettingsDraft(updates: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const current = this.getSettingsDraft();
    const updated = { ...current, ...updates };
    localStorage.setItem(KEYS.SETTINGS_DRAFT, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("skd_settings_draft_updated"));

    await setDoc(doc(firestore, publicPath, "settings", "draft"), cleanForFirestore(updated));
    return updated;
  },

  async publishSettings(): Promise<RestaurantSettings> {
    const draft = this.getSettingsDraft();
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(draft));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("skd_settings_updated"));

    await setDoc(doc(firestore, publicPath, "settings", "default"), cleanForFirestore(draft));
    return draft;
  },

  formatPromoText(text: string, discount: number): string {
    if (!text) return "";
    if (text.includes("{discount}")) {
      return text.replace(/{discount}/g, String(discount));
    }
    return text.replace(/(\d+)\s*%/g, `${discount}%`);
  },

  // ─── ANALYTICS & STATS ───────────────────────────────────────────────────
  incrementWebsiteVisits(): number {
    this.init();
    const current = parseInt(localStorage.getItem(KEYS.VISITS) || "120", 10);
    const updated = current + 1;
    localStorage.setItem(KEYS.VISITS, String(updated));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "visits", "counter"), { count: updated }).catch(e => console.error(e));
    return updated;
  },

  getWebsiteVisits(): number {
    this.init();
    return parseInt(localStorage.getItem(KEYS.VISITS) || "250", 10);
  },

  getAnalytics() {
    const bookings = this.getBookings();
    const visits = parseInt(localStorage.getItem(KEYS.VISITS) || "250", 10);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter((b) => b.date === todayStr && (b.status === "Approved" || b.status === "Arrived" || b.status === "Completed"));

    const pending = bookings.filter((b) => b.status === "Pending").length;
    const approved = bookings.filter((b) => b.status === "Approved").length;
    const completed = bookings.filter((b) => b.status === "Completed").length;
    const arrived = bookings.filter((b) => b.status === "Arrived").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;

    const phoneMap = new Map<string, number>();
    bookings.forEach((b) => {
      phoneMap.set(b.phone, (phoneMap.get(b.phone) || 0) + 1);
    });

    let totalCustomers = phoneMap.size;
    let returningCustomers = 0;
    phoneMap.forEach((count) => {
      if (count > 1) returningCustomers++;
    });

    const hoursMap: { [key: string]: number } = {};
    bookings.forEach((b) => {
      hoursMap[b.time] = (hoursMap[b.time] || 0) + 1;
    });

    const conversionRate = visits > 0 ? ((bookings.length / visits) * 100).toFixed(1) : "0.0";

    return {
      visits,
      todayBookings: todayBookings.length,
      upcomingBookings: bookings.filter((b) => b.status === "Approved" || b.status === "Pending").length,
      pendingBookings: pending,
      cancelledBookings: cancelled + bookings.filter((b) => b.status === "Rejected").length,
      totalCustomers,
      returningCustomers,
      conversionRate,
      statusCounts: { pending, approved, completed, arrived, cancelled },
      busiestHours: Object.entries(hoursMap)
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  },

  // ─── INTEGRATIONS WHATSAPP MESSENGER ─────────────────────────────────────
  formatBookingNotification(booking: Booking, isClientAck: boolean = false, isApproved: boolean = false, isRejected: boolean = false): string {
    const settings = this.getSettings();
    if (isClientAck) {
      return encodeURIComponent(
        `*SRI KRISHNA DHABA - RESERVATION RECEIVED*\n` +
        `----------------------------------------\n` +
        `Hello ${booking.name},\n` +
        `We have received your reservation request under ID: *${booking.id}*.\n\n` +
        `*Details:*\n` +
        `- Date: ${booking.date}\n` +
        `- Time: ${booking.time}\n` +
        `- Guests: ${booking.guests}\n\n` +
        `Your reservation is currently *PENDING APPROVAL*. We will notify you once confirmed by the restaurant.\n\n` +
        `Thank you for choosing Sri Krishna Dhaba!`
      );
    }

    if (isApproved) {
      return encodeURIComponent(
        `*SRI KRISHNA DHABA - RESERVATION CONFIRMED* ✅\n` +
        `----------------------------------------\n` +
        `Great news ${booking.name}! Your reservation *${booking.id}* has been *APPROVED*.\n\n` +
        `*Reservation Summary:*\n` +
        `- Date: ${booking.date}\n` +
        `- Time: ${booking.time}\n` +
        `- Guests: ${booking.guests} Guests\n` +
        `${booking.tableNumber ? `- Assigned Table: Table ${booking.tableNumber}\n` : ""}\n` +
        `*Restaurant Address:*\n` +
        `${settings.contactAddress}\n\n` +
        `*Google Maps Directions:*\n` +
        `https://maps.google.com/?q=Sri+Krishna+Family+Dhaba+Hyderabad\n\n` +
        `Need to modify? Call us at ${settings.contactPhone}. See you soon!`
      );
    }

    if (isRejected) {
      return encodeURIComponent(
        `*SRI KRISHNA DHABA - RESERVATION UPDATE*\n` +
        `----------------------------------------\n` +
        `Hello ${booking.name},\n` +
        `Thank you for requesting a reservation. Unfortunately, we are unable to accommodate your booking *${booking.id}* on ${booking.date} at ${booking.time} due to full occupancy.\n\n` +
        `We apologize for the inconvenience and hope to serve you another time. Please contact us directly at ${settings.contactPhone} for custom inquiries.`
      );
    }

    // Owner alert
    return encodeURIComponent(
      `*NEW WEB RESERVATION ALERT* 🚨\n` +
      `----------------------------------------\n` +
      `- ID: ${booking.id}\n` +
      `- Customer: ${booking.name}\n` +
      `- Mobile: ${booking.phone}\n` +
      `- Guests: ${booking.guests}\n` +
      `- Date/Time: ${booking.date} at ${booking.time}\n` +
      `- Occasion: ${booking.occasion}\n` +
      `- Notes: ${booking.instructions || "None"}\n\n` +
      `Manage dashboard: https://app22-seven.vercel.app/#/admin`
    );
  },

  // ─── LOYALTY VOUCHERS DB ──────────────────────────────────────────────────
  getVouchers(): LoyaltyVoucher[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.VOUCHERS) || "[]");
  },

  addVoucher(voucher: Omit<LoyaltyVoucher, "id" | "status" | "createdAt" | "expiresAt"> & { id?: string }): LoyaltyVoucher {
    const id = voucher.id || `RSD-REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiryDays = 14;
    const newVoucher: LoyaltyVoucher = {
      ...voucher,
      id,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24 * expiryDays).toISOString()
    };

    const vouchers = this.getVouchers();
    vouchers.push(newVoucher);
    localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(vouchers));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "vouchers", id), cleanForFirestore(newVoucher)).catch(e => console.error(e));
    this.addAuditLog("Voucher Generation", `Generated voucher ${id} for phone ${voucher.phone}`);
    return newVoucher;
  },

  redeemVoucher(id: string): LoyaltyVoucher {
    const vouchers = this.getVouchers();
    const index = vouchers.findIndex((v) => v.id === id);
    if (index === -1) throw new Error("Voucher not found");
    if (vouchers[index].status === "REDEEMED") throw new Error("Voucher has already been redeemed");
    vouchers[index].status = "REDEEMED";
    localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(vouchers));
    window.dispatchEvent(new Event("storage"));

    updateDoc(doc(firestore, publicPath, "vouchers", id), { status: "REDEEMED" }).catch(e => console.error(e));
    this.addAuditLog("Voucher Redemption", `Redeemed voucher ${id}`);
    return vouchers[index];
  },

  deleteVoucher(id: string): void {
    const vouchers = this.getVouchers();
    const filtered = vouchers.filter((v) => v.id !== id);
    localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    deleteDoc(doc(firestore, publicPath, "vouchers", id)).catch(e => console.error(e));
  },

  // ─── WHATSAPP ORDERS DB ───────────────────────────────────────────────────
  getOrders(): WhatsAppOrder[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
  },

  addOrder(order: Omit<WhatsAppOrder, "id" | "status" | "createdAt">): WhatsAppOrder {
    const id = `ORD-${Math.floor(9000 + Math.random() * 999)}`;
    const newOrder: WhatsAppOrder = {
      ...order,
      id,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    const orders = this.getOrders();
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "orders", id), cleanForFirestore(newOrder)).catch(e => console.error(e));
    this.addAuditLog("Order Received", `New web order received from ${newOrder.customerName} (${id})`);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: WhatsAppOrder["status"], reviewToken?: string): Promise<WhatsAppOrder> {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Order not found");
    if (orders[index].status === "Delivered") {
      throw new Error("Cannot modify a delivered order");
    }
    orders[index].status = status;
    
    const updates: any = { status };
    if (status === "Delivered") {
      const nowStr = new Date().toISOString();
      orders[index].deliveredAt = nowStr;
      updates.deliveredAt = nowStr;
      if (reviewToken) {
        orders[index].reviewToken = reviewToken;
        updates.reviewToken = reviewToken;
      }
    }

    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event("storage"));

    await updateDoc(doc(firestore, publicPath, "orders", id), cleanForFirestore(updates));
    this.addAuditLog("Order Status Update", `Updated order ${id} status to ${status}`);
    return orders[index];
  },

  submitOrderReview(orderId: string, name: string, rating: number, comment: string): void {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].isReviewed = true;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new Event("storage"));
      updateDoc(doc(firestore, publicPath, "orders", orderId), { isReviewed: true }).catch(e => console.error(e));
    }

    this.addReview({
      name,
      role: "WhatsApp Customer",
      rating,
      quote: comment,
      source: "WhatsApp Delivery",
      pinned: false,
      orderId
    });
  },

  deleteOrder(id: string): void {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== id);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    deleteDoc(doc(firestore, publicPath, "orders", id)).catch(e => console.error(e));
  },

  // ─── GIFT COUPONS DB ──────────────────────────────────────────────────────
  getGiftCoupons(): GiftCoupon[] {
    this.init();
    const list: GiftCoupon[] = JSON.parse(localStorage.getItem(KEYS.GIFT_COUPONS) || "[]");
    
    // Check auto-expiry
    let changed = false;
    const now = new Date().getTime();
    const updated = list.map(c => {
      if (c.status === "ACTIVE" && new Date(c.expiresAt).getTime() < now) {
        c.status = "EXPIRED";
        changed = true;
        updateDoc(doc(firestore, publicPath, "gift_coupons", c.id), { status: "EXPIRED" }).catch(e => console.error(e));
      }
      return c;
    });

    if (changed) {
      localStorage.setItem(KEYS.GIFT_COUPONS, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    }

    return updated;
  },

  addGiftCoupon(coupon: Omit<GiftCoupon, "id" | "secureToken" | "createdAt" | "status" | "createdBy">): GiftCoupon {
    const id = `gft-${Date.now()}`;
    const secureToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    let sessionUser = "Admin";
    try {
      const savedUser = sessionStorage.getItem("skd_admin_session");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        sessionUser = parsed.name || parsed.username || "Admin";
      }
    } catch (e) {}

    const newCoupon: GiftCoupon = {
      ...coupon,
      id,
      secureToken,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      createdBy: sessionUser
    };

    const coupons = this.getGiftCoupons();
    coupons.push(newCoupon);
    localStorage.setItem(KEYS.GIFT_COUPONS, JSON.stringify(coupons));
    window.dispatchEvent(new Event("storage"));

    setDoc(doc(firestore, publicPath, "gift_coupons", id), cleanForFirestore(newCoupon)).catch(e => console.error(e));
    this.addAuditLog("GIFT_COUPON_CREATED", `Created gift coupon ${newCoupon.code} for ${newCoupon.customerName}`);
    return newCoupon;
  },

  redeemGiftCoupon(id: string, details: { redeemedBy: string; billAmount: number; discountAmount: number; finalAmount: number }): GiftCoupon {
    const coupons = this.getGiftCoupons();
    const idx = coupons.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Coupon not found");
    if (coupons[idx].status !== "ACTIVE") throw new Error(`Coupon is not active (Status: ${coupons[idx].status})`);
    
    const nowStr = new Date().toISOString();
    coupons[idx] = {
      ...coupons[idx],
      status: "REDEEMED",
      redeemedAt: nowStr,
      ...details
    };

    localStorage.setItem(KEYS.GIFT_COUPONS, JSON.stringify(coupons));
    window.dispatchEvent(new Event("storage"));

    updateDoc(doc(firestore, publicPath, "gift_coupons", id), cleanForFirestore({
      status: "REDEEMED",
      redeemedAt: nowStr,
      ...details
    })).catch(e => console.error(e));

    this.addAuditLog("GIFT_COUPON_REDEEMED", `Redeemed coupon ${coupons[idx].code} for customer ${coupons[idx].customerName}. Bill: Rs. ${details.billAmount}, Discount: Rs. ${details.discountAmount}`);
    return coupons[idx];
  },

  cancelGiftCoupon(id: string, adminUser: string): GiftCoupon {
    const coupons = this.getGiftCoupons();
    const idx = coupons.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Coupon not found");
    if (coupons[idx].status !== "ACTIVE") throw new Error("Only active coupons can be cancelled");

    coupons[idx].status = "CANCELLED";
    localStorage.setItem(KEYS.GIFT_COUPONS, JSON.stringify(coupons));
    window.dispatchEvent(new Event("storage"));

    updateDoc(doc(firestore, publicPath, "gift_coupons", id), { status: "CANCELLED" }).catch(e => console.error(e));
    this.addAuditLog("GIFT_COUPON_CANCELLED", `Cancelled coupon ${coupons[idx].code} for customer ${coupons[idx].customerName}`, adminUser);
    return coupons[idx];
  },

  async deleteGiftCoupon(id: string): Promise<void> {
    const coupons = this.getGiftCoupons();
    const c = coupons.find(x => x.id === id);
    const code = c ? c.code : id;
    const customer = c ? c.customerName : "Unknown";
    
    const filtered = coupons.filter((x) => x.id !== id);
    localStorage.setItem(KEYS.GIFT_COUPONS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    await deleteDoc(doc(firestore, publicPath, "gift_coupons", id));
    this.addAuditLog("GIFT_COUPON_DELETED", `Permanently deleted gift coupon ${code} for customer ${customer} from database`);
  },

  // ─── AUDIT LOGS DB ────────────────────────────────────────────────────────
  getAuditLogs(): AuditLog[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || "[]");
  },

  addAuditLog(action: string, details: string, user: string = "Admin"): AuditLog {
    const logs = this.getAuditLogs();
    let sessionUser = user;
    try {
      const savedUser = localStorage.getItem("skd_admin_session");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        sessionUser = parsed.name || parsed.username || user;
      }
    } catch (e) {}
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newLog: AuditLog = {
      id,
      user: sessionUser,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    const sliced = logs.slice(-200);
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(sliced));
    return newLog;
  },

  getLoginAudits(): LoginAudit[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.LOGIN_AUDITS) || "[]");
  },

  async addLoginAudit(audit: Omit<LoginAudit, "id">): Promise<LoginAudit> {
    const list = this.getLoginAudits();
    const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAudit: LoginAudit = { ...audit, id };
    list.push(newAudit);
    
    const sliced = list.slice(-200);
    localStorage.setItem(KEYS.LOGIN_AUDITS, JSON.stringify(sliced));
    window.dispatchEvent(new Event("storage"));

    await setDoc(doc(firestore, publicPath, "login_audits", id), cleanForFirestore(newAudit));
    return newAudit;
  },

  async deleteLoginAudit(id: string): Promise<void> {
    const list = this.getLoginAudits();
    const filtered = list.filter(a => a.id !== id);
    localStorage.setItem(KEYS.LOGIN_AUDITS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    await deleteDoc(doc(firestore, publicPath, "login_audits", id));
  },

  async updateLoginAuditSnapshot(id: string, snapshotUrl: string | null, status: "SUCCESS" | "PERMISSION_DENIED" | "NO_IMAGE"): Promise<void> {
    const list = this.getLoginAudits();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        snapshotUrl,
        snapshotStatus: status
      };
      localStorage.setItem(KEYS.LOGIN_AUDITS, JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
      
      const docRef = doc(firestore, publicPath, "login_audits", id);
      await setDoc(docRef, cleanForFirestore(list[idx]));
    }
  },

  deleteBookingsByDate(dateString: string): void {
    const bookings = this.getBookings();
    const filtered = bookings.filter((b) => b.date !== dateString);
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    (async () => {
      try {
        const snap = await getDocs(collection(firestore, publicPath, "bookings"));
        for (const docSnap of snap.docs) {
          if (docSnap.data().date === dateString) {
            await deleteDoc(doc(firestore, publicPath, "bookings", docSnap.id));
          }
        }
      } catch (e) {
        console.error("Error in deleteBookingsByDate Firestore:", e);
      }
    })();

    this.addAuditLog("Bookings Deletion", `Deleted all reservations for date: ${dateString}`);
  },

  deleteOrdersByDate(dateString: string): void {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.createdAt.split("T")[0] !== dateString);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    (async () => {
      try {
        const snap = await getDocs(collection(firestore, publicPath, "orders"));
        for (const docSnap of snap.docs) {
          const createdAt = docSnap.data().createdAt;
          if (createdAt && createdAt.split("T")[0] === dateString) {
            await deleteDoc(doc(firestore, publicPath, "orders", docSnap.id));
          }
        }
      } catch (e) {
        console.error("Error in deleteOrdersByDate Firestore:", e);
      }
    })();

    this.addAuditLog("Orders Deletion", `Deleted all WhatsApp orders for date: ${dateString}`);
  },

  deleteAuditLogsByDate(dateString: string): void {
    const logs = this.getAuditLogs();
    const filtered = logs.filter((l) => l.timestamp.split("T")[0] !== dateString);
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    (async () => {
      try {
        const snap = await getDocs(collection(firestore, publicPath, "audit_logs"));
        for (const docSnap of snap.docs) {
          const timestamp = docSnap.data().timestamp;
          if (timestamp && timestamp.split("T")[0] === dateString) {
            await deleteDoc(doc(firestore, publicPath, "audit_logs", docSnap.id));
          }
        }
      } catch (e) {
        console.error("Error in deleteAuditLogsByDate Firestore:", e);
      }
    })();

    this.addAuditLog("Audit Logs Deletion", `Deleted all audit logs for date: ${dateString}`);
  },

  deleteCustomers(phones: string[]): void {
    const normalize = (phone: string) => {
      if (!phone) return "";
      let cleaned = phone.trim().replace(/[\s\-\+]/g, "");
      if (cleaned.length === 12 && cleaned.startsWith("91")) {
        cleaned = cleaned.substring(2);
      }
      return cleaned;
    };

    const normTargetPhones = phones.map(normalize);

    const bookings = this.getBookings();
    const filteredBookings = bookings.filter((b) => !normTargetPhones.includes(normalize(b.phone)));
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(filteredBookings));

    const orders = this.getOrders();
    const filteredOrders = orders.filter((o) => !normTargetPhones.includes(normalize(o.phone)));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filteredOrders));

    const vouchers = this.getVouchers();
    const filteredVouchers = vouchers.filter((v) => !normTargetPhones.includes(normalize(v.phone)));
    localStorage.setItem(KEYS.VOUCHERS, JSON.stringify(filteredVouchers));
    
    window.dispatchEvent(new Event("storage"));

    (async () => {
      try {
        const bookingsSnapshot = await getDocs(collection(firestore, publicPath, "bookings"));
        bookingsSnapshot.forEach(docSnap => {
          const phone = docSnap.data().phone;
          if (normTargetPhones.includes(normalize(phone))) {
            deleteDoc(doc(firestore, publicPath, "bookings", docSnap.id));
          }
        });
        const ordersSnapshot = await getDocs(collection(firestore, publicPath, "orders"));
        ordersSnapshot.forEach(docSnap => {
          const phone = docSnap.data().phone;
          if (normTargetPhones.includes(normalize(phone))) {
            deleteDoc(doc(firestore, publicPath, "orders", docSnap.id));
          }
        });
        const vouchersSnapshot = await getDocs(collection(firestore, publicPath, "vouchers"));
        vouchersSnapshot.forEach(docSnap => {
          const phone = docSnap.data().phone;
          if (normTargetPhones.includes(normalize(phone))) {
            deleteDoc(doc(firestore, publicPath, "vouchers", docSnap.id));
          }
        });
      } catch (e) {
        console.error("Error in deleteCustomers from Firestore:", e);
      }
    })();

    this.addAuditLog("Customer Deletion", `Deleted customer profiles and all associated bookings/orders/vouchers for mobile numbers: ${phones.join(", ")}`);
  },

  async clearAllBookings(): Promise<void> {
    localStorage.setItem(KEYS.BOOKINGS, "[]");
    window.dispatchEvent(new Event("storage"));

    try {
      const snap = await getDocs(collection(firestore, publicPath, "bookings"));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(firestore, publicPath, "bookings", docSnap.id));
      }
    } catch (e) {
      console.error("Error in clearAllBookings Firestore:", e);
    }
    this.addAuditLog("Bookings Cleared", "Permanently deleted all reservation records from database");
  },

  async clearAllOrders(): Promise<void> {
    localStorage.setItem(KEYS.ORDERS, "[]");
    window.dispatchEvent(new Event("storage"));

    try {
      const snap = await getDocs(collection(firestore, publicPath, "orders"));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(firestore, publicPath, "orders", docSnap.id));
      }
    } catch (e) {
      console.error("Error in clearAllOrders Firestore:", e);
    }
    this.addAuditLog("Orders Cleared", "Permanently deleted all order records from database");
  },

  async clearAllAuditLogs(): Promise<void> {
    localStorage.setItem(KEYS.AUDIT_LOGS, "[]");
    window.dispatchEvent(new Event("storage"));

    try {
      const snap = await getDocs(collection(firestore, publicPath, "audit_logs"));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(firestore, publicPath, "audit_logs", docSnap.id));
      }
    } catch (e) {
      console.error("Error in clearAllAuditLogs Firestore:", e);
    }
    this.addAuditLog("Audit Logs Cleared", "Permanently deleted all audit trail logs from database");
  },

  async clearAllLoginAudits(): Promise<void> {
    localStorage.setItem(KEYS.LOGIN_AUDITS, "[]");
    window.dispatchEvent(new Event("storage"));

    try {
      const snap = await getDocs(collection(firestore, publicPath, "login_audits"));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(firestore, publicPath, "login_audits", docSnap.id));
      }
    } catch (e) {
      console.error("Error in clearAllLoginAudits Firestore:", e);
    }
    this.addAuditLog("Login Audits Cleared", "Permanently deleted all login security audits from database");
  },

  async clearAllCustomers(): Promise<void> {
    localStorage.setItem(KEYS.BOOKINGS, "[]");
    localStorage.setItem(KEYS.ORDERS, "[]");
    localStorage.setItem(KEYS.VOUCHERS, "[]");
    window.dispatchEvent(new Event("storage"));

    try {
      const bookingsSnap = await getDocs(collection(firestore, publicPath, "bookings"));
      for (const docSnap of bookingsSnap.docs) {
        await deleteDoc(doc(firestore, publicPath, "bookings", docSnap.id));
      }

      const ordersSnap = await getDocs(collection(firestore, publicPath, "orders"));
      for (const docSnap of ordersSnap.docs) {
        await deleteDoc(doc(firestore, publicPath, "orders", docSnap.id));
      }

      const vouchersSnap = await getDocs(collection(firestore, publicPath, "vouchers"));
      for (const docSnap of vouchersSnap.docs) {
        await deleteDoc(doc(firestore, publicPath, "vouchers", docSnap.id));
      }
    } catch (e) {
      console.error("Error in clearAllCustomers Firestore:", e);
    }

    this.addAuditLog("Customer DB Purged", "Permanently purged all customer directory profiles, bookings, orders, and vouchers.");
  },

  async clearAllGiftCoupons(): Promise<void> {
    localStorage.setItem(KEYS.GIFT_COUPONS, "[]");
    window.dispatchEvent(new Event("storage"));

    try {
      const snap = await getDocs(collection(firestore, publicPath, "gift_coupons"));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(firestore, publicPath, "gift_coupons", docSnap.id));
      }
    } catch (e) {
      console.error("Error in clearAllGiftCoupons Firestore:", e);
    }

    this.addAuditLog("Gift Coupons Cleared", "Permanently purged all gift coupons from database");
  }
};
