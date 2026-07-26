import { useState, useEffect, useMemo, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  LayoutDashboard, Menu as MenuIcon, Image as ImageIcon, Star, Mail, Settings as SettingsIcon, 
  LogOut, Check, X, Plus, Edit, Trash2, Calendar, ShieldAlert,
  Lock, ShoppingCart, UserCheck, Eye, EyeOff, Search, FileText,
  Database, Download, RotateCw, Upload, Camera, QrCode, Printer,
  Clock, Users, CheckCircle, Utensils, Folder, MessageSquare
} from "lucide-react";
import { db } from "../../../src/utils/db";
import type { Booking, Review, GalleryItem, ContactInquiry, RestaurantSettings, LoyaltyVoucher, WhatsAppOrder, AuditLog } from "../../../src/utils/db";
import type { Dish } from "../../../src/components/DishCard";

const staticCategories = [
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

type AdminTab = 
  | "dashboard" 
  | "bookings" 
  | "orders"
  | "scanner"
  | "menu" 
  | "gallery" 
  | "homepage"
  | "promos"
  | "reviews" 
  | "contacts"
  | "customers"
  | "audit"
  | "backups";

interface AdminUser {
  username: string;
  role: "Owner" | "Manager" | "Staff";
  name: string;
}

const defaultAdminUsers: AdminUser[] = [
  { username: "owner", role: "Owner", name: "Srinivas Rao (Owner)" },
  { username: "manager", role: "Manager", name: "Karthik Uppari (Manager)" },
  { username: "staff", role: "Staff", name: "Ramesh Kumar (Captain)" }
];

function playScannerBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Ignore audio context restrictions
  }
}

function updateTextDiscountPercent(text: string, newPercent: number): string {
  if (!text) return text;
  return text.replace(/(\d+)\s*%/g, `${newPercent}%`);
}

function QRCameraView({ onScan }: { onScan: (text: string) => void }) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanFlash, setScanFlash] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices.map((d, i) => ({ id: d.id, label: d.label || `Camera ${i + 1}` })));
          setSelectedCameraId(devices[0].id);
        } else {
          setErrorMsg("No active camera devices detected on this system.");
        }
      })
      .catch((err) => {
        console.warn("Camera enumeration error", err);
        setErrorMsg("Camera access permission denied or unavailable.");
      });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startCamera = async (cameraId: string) => {
    if (!cameraId) return;
    setErrorMsg("");

    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const qrInstance = new Html5Qrcode("qr-camera-viewport");
      html5QrCodeRef.current = qrInstance;

      await qrInstance.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText) => {
          playScannerBeep();
          setScanFlash(true);
          setTimeout(() => setScanFlash(false), 500);
          onScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to initialize camera feed. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (selectedCameraId) {
      startCamera(selectedCameraId);
    }
  }, [selectedCameraId]);

  return (
    <div className="space-y-4">
      {/* CSS Override to force video element to fill the container and not show green empty bars */}
      <style dangerouslySetInnerHTML={{ __html: `
        #qr-camera-viewport video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      ` }} />
      {/* Viewfinder Container */}
      <div className="relative w-full aspect-square max-w-sm mx-auto bg-brand-dark rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-gold/30">
        {/* Scanner Stream Container */}
        <div id="qr-camera-viewport" className="w-full h-full object-cover" />

        {/* Laser & Corner Reticle Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {/* Viewfinder Frame */}
            <div className={`w-[220px] h-[220px] relative border-2 transition-all duration-300 rounded-2xl ${
              scanFlash ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.8)]" : "border-emerald-500/30"
            }`}>
              {/* Glowing Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg shadow-[0_0_12px_#10b981]" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg shadow-[0_0_12px_#10b981]" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg shadow-[0_0_12px_#10b981]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg shadow-[0_0_12px_#10b981]" />

              {/* Sweeping Laser Line */}
              <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981,0_0_30px_#10b981] animate-laser-sweep" />

              {/* Reticle Center Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400/40 flex items-center justify-center font-mono text-sm pointer-events-none">
                +
              </div>
            </div>
          </div>
        )}

        {/* HUD Live Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-brand-dark/80 backdrop-blur-md px-3 py-1 rounded-full border border-brand-gold/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest">
            {isScanning ? "OPTICAL DETECT ACTIVE" : "INITIALIZING CAMERA..."}
          </span>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="absolute inset-0 bg-brand-dark/95 z-30 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <ShieldAlert size={32} className="text-amber-500" />
            <p className="text-xs text-white/80 font-medium">{errorMsg}</p>
            <button
              onClick={() => selectedCameraId && startCamera(selectedCameraId)}
              className="px-4 py-2 bg-brand-gold text-brand-dark text-xs font-black uppercase rounded-xl tracking-wider hover:bg-brand-accent hover:text-white transition-all cursor-pointer"
            >
              Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Camera Switcher Dropdown */}
      {cameras.length > 1 && (
        <div className="flex items-center justify-between px-2 text-xs">
          <span className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-wider">Camera Feed:</span>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="bg-white border border-brand-dark/30 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-brand-accent cursor-pointer font-semibold"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}



export default function AdminPortal() {
  // Auth State
  const [user, setUser] = useState<AdminUser | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Nav State
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Custom Categories States
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isCategoryAddMode, setIsCategoryAddMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Database States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menu, setMenu] = useState<Dish[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  
  // New Video States
  const [vouchers, setVouchers] = useState<LoyaltyVoucher[]>([]);
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const allCategories = useMemo(() => {
    const list = [...staticCategories];
    
    const checkAndAdd = (cat: string) => {
      const upper = cat.trim().toUpperCase();
      if (!upper) return;
      const exists = list.some(item => item.toUpperCase() === upper);
      if (!exists) {
        list.push(upper);
      }
    };

    customCategories.forEach(checkAndAdd);
    menu.forEach((dish) => {
      checkAndAdd(dish.category);
    });
    return list;
  }, [customCategories, menu]);

  // Filtering
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>("All");
  const [bookingSearchText, setBookingSearchText] = useState("");
  const [bookingFilterDate, setBookingFilterDate] = useState("");
  const [daysPast, setDaysPast] = useState(30);
  const [menuSearchText, setMenuSearchText] = useState("");
  const [menuFilterStatus, setMenuFilterStatus] = useState<string>("All");
  const [menuSelectedCategory, setMenuSelectedCategory] = useState<string>("All");

  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("All");
  const [orderSearchText, setOrderSearchText] = useState("");
  const [orderFilterDate, setOrderFilterDate] = useState("");
  const [logSearchText, setLogSearchText] = useState("");
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Backup Export States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportPassword, setExportPassword] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportSelections, setExportSelections] = useState({
    whatsappOrders: false,
    reservations: false,
    menuCms: false,
    reviewsCms: false,
    offersCms: false,
    galleryCms: false,
    customerInbox: false,
    siteSettings: false
  });

  // Audit Log Filtering States
  const [selectedAuditDate, setSelectedAuditDate] = useState<string | null>(null);
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("All");
  const datePickerRef = useRef<HTMLInputElement>(null);
  const bookingDatePickerRef = useRef<HTMLInputElement>(null);
  const orderDatePickerRef = useRef<HTMLInputElement>(null);

  // Modals / Selected Items
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingTableNum, setBookingTableNum] = useState("");
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [isDishAddMode, setIsDishAddMode] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState<GalleryItem["category"]>("Dishes");
  
  // Dish Deletion Auth States
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Backups State
  const [backupFile, setBackupFile] = useState<File | null>(null);

  // QR Scanner State
  const [scanInputCode, setScanInputCode] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; voucher?: LoyaltyVoucher; booking?: Booking } | null>(null);
  const [verificationMode, setVerificationMode] = useState<"all" | "booking" | "voucher">("booking");
  const [scanMethod, setScanMethod] = useState<"camera" | "manual">("camera");

  // Homepage CMS State
  const [cmsHeroVideo, setCmsHeroVideo] = useState("");
  const [cmsTimings, setCmsTimings] = useState("");
  const [cmsPhone, setCmsPhone] = useState("");
  const [cmsEmail, setCmsEmail] = useState("");
  const [cmsAddress, setCmsAddress] = useState("");
  const [cmsDiscount, setCmsDiscount] = useState<number>(10);
  const [webExclusiveTextInput, setWebExclusiveTextInput] = useState("");
  const [reservationPromoInput, setReservationPromoInput] = useState("");

  // Load Data on login
  const loadData = () => {
    db.init();
    setBookings(db.getBookings().reverse());
    setMenu(db.getMenu());
    setGallery(db.getGallery());
    setReviews(db.getReviews().reverse());
    setContacts(db.getContacts().reverse());
    setSettings(db.getSettings());
    
    // New operations loads
    setVouchers((db as any).getVouchers().reverse());
    setOrders((db as any).getOrders().reverse());
    setAuditLogs((db as any).getAuditLogs().reverse());
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem("skd_admin_session");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadData();
    }
    const savedCats = localStorage.getItem("skd_custom_categories");
    if (savedCats) {
      setCustomCategories(JSON.parse(savedCats));
    }
    const savedDays = localStorage.getItem("skd_reservation_days_past");
    if (savedDays) {
      setDaysPast(parseInt(savedDays, 10));
    }
  }, []);

  useEffect(() => {
    setSelectedCustomers([]);
  }, [activeTab]);

  useEffect(() => {
    if (settings) {
      setCmsHeroVideo("https://res.cloudinary.com/or5e9kak/video/upload/v1783783688/WhatsApp_Video_2026-07-11_at_20.57.19_c4tq0e.mp4");
      setCmsTimings(settings.timings);
      setCmsPhone(settings.contactPhone);
      setCmsEmail(settings.contactEmail);
      setCmsAddress(settings.contactAddress);
      setCmsDiscount(settings.discountPercent);
      setWebExclusiveTextInput(settings.webExclusiveText || `Book a table online & get ${settings.discountPercent}% OFF your dining bill`);
      setReservationPromoInput(settings.reservationPromoText || "Reserve your table through our website and receive 10% OFF on your final dining bill.");
    }
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const matched = defaultAdminUsers.find(
      (u) => u.username === usernameInput.toLowerCase()
    );

    if (!matched) {
      setAuthError("Invalid username.");
      return;
    }

    const validPassword = `${matched.username}123`;
    if (passwordInput !== validPassword) {
      setAuthError("Invalid password.");
      return;
    }

    setUser(matched);
    sessionStorage.setItem("skd_admin_session", JSON.stringify(matched));
    setUsernameInput("");
    setPasswordInput("");
    loadData();
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("skd_admin_session");
  };

  // RBAC Helper
  const hasAccess = (tab: AdminTab) => {
    if (!user) return false;
    if (user.role === "Owner") return true;
    if (user.role === "Manager") {
      return tab !== "homepage" && tab !== "promos" && tab !== "backups";
    }
    if (user.role === "Staff") {
      return tab === "bookings" || tab === "orders" || tab === "scanner" || tab === "dashboard";
    }
    return false;
  };



  // ----------------------------------------------------
  // RESERVATION ACTIONS
  // ----------------------------------------------------
  const handleUpdateBookingStatus = (id: string, newStatus: Booking["status"]) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    db.updateBookingStatus(id, newStatus);
    
    // Log action to audit logs
    (db as any).addAuditLog(
      "Reservation Status Update",
      `Changed reservation ${id} (${booking.name}) status to ${newStatus}`
    );

    loadData();
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const handleSaveBookingMeta = () => {
    if (!selectedBooking) return;
    db.updateBooking(selectedBooking.id, {
      tableNumber: bookingTableNum || undefined,
      notes: bookingNotes || undefined
    });
    
    // Log action to audit logs
    (db as any).addAuditLog(
      "Reservation Table Assignment",
      `Assigned reservation ${selectedBooking.id} to Table ${bookingTableNum || "None"}. Notes: ${bookingNotes || "None"}`
    );

    loadData();
    setSelectedBooking(null);
    setBookingNotes("");
    setBookingTableNum("");
  };

  // ----------------------------------------------------
  // MENU EDITOR ACTIONS
  // ----------------------------------------------------
  const handleToggleDishStock = (id: string, outOfStock: boolean) => {
    db.updateDish(id, { outOfStock });
    const dish = menu.find((d) => d.id === id);
    (db as any).addAuditLog(
      "Menu Stock Toggle",
      `Marked "${dish?.title || id}" as ${outOfStock ? "Out of Stock" : "In Stock"}`
    );
    loadData();
  };

  const handleToggleDishVisibility = (id: string, hidden: boolean) => {
    db.updateDish(id, { hidden });
    const dish = menu.find((d) => d.id === id);
    (db as any).addAuditLog(
      "Menu Visibility Toggle",
      `Marked "${dish?.title || id}" as ${hidden ? "Hidden" : "Visible"}`
    );
    loadData();
  };

  const handleToggleDishSignature = (id: string, isSignature: boolean) => {
    db.updateDish(id, { isSignature });
    const dish = menu.find((d) => d.id === id);
    (db as any).addAuditLog(
      "Menu Signature Toggle",
      `Marked "${dish?.title || id}" as ${isSignature ? "Signature" : "Regular"}`
    );
    loadData();
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;

    if (isDishAddMode) {
      db.addDish({
        title: editingDish.title || "",
        teluguTitle: editingDish.teluguTitle || "",
        description: editingDish.description || "",
        price: editingDish.price || "Rs. 0",
        image: editingDish.image || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
        rating: editingDish.rating || 4.2,
        category: editingDish.category || "STARTERS",
        isPopular: editingDish.isPopular ?? false,
        isChefSpecial: editingDish.isChefSpecial ?? false,
        isSignature: editingDish.isSignature ?? false,
        outOfStock: false,
        hidden: false
      });
      (db as any).addAuditLog(
        "Menu Dish Added",
        `Created new menu dish "${editingDish.title}" in category ${editingDish.category}`
      );
    } else if (editingDish.id) {
      db.updateDish(editingDish.id, {
        title: editingDish.title ?? "",
        teluguTitle: editingDish.teluguTitle ?? "",
        description: editingDish.description ?? "",
        price: editingDish.price ?? "",
        image: editingDish.image ?? "",
        category: editingDish.category ?? "STARTERS",
        isPopular: editingDish.isPopular ?? false,
        isChefSpecial: editingDish.isChefSpecial ?? false,
        isSignature: editingDish.isSignature ?? false
      });
      (db as any).addAuditLog(
        "Menu Dish Updated",
        `Edited menu dish "${editingDish.title}" (ID: ${editingDish.id})`
      );
    }
    loadData();
    setEditingDish(null);
    setIsDishAddMode(false);
  };

  const handleDeleteDish = (id: string) => {
    const dish = menu.find((d) => d.id === id);
    if (!dish) return;
    setDishToDelete(dish);
    setDeleteUsername("");
    setDeletePassword("");
    setDeleteError("");
  };

  const handleConfirmDeleteDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishToDelete) return;

    const matched = defaultAdminUsers.find(
      (u) => u.username === deleteUsername.toLowerCase()
    );

    if (!matched) {
      setDeleteError("Invalid admin username.");
      return;
    }

    const validPassword = `${matched.username}123`;
    if (deletePassword !== validPassword) {
      setDeleteError("Invalid admin password.");
      return;
    }

    const filtered = menu.filter((d) => d.id !== dishToDelete.id);
    localStorage.setItem("skd_menu", JSON.stringify(filtered));
    (db as any).addAuditLog(
      "Menu Dish Deleted",
      `Removed dish "${dishToDelete.title}" from local catalog (authorized by ${matched.name})`
    );
    loadData();
    setDishToDelete(null);
  };

  // ----------------------------------------------------
  // GALLERY CMS ACTIONS
  // ----------------------------------------------------
  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl) return;
    db.addImage({
      url: newGalleryUrl,
      title: newGalleryTitle || "Gallery Special",
      category: newGalleryCategory
    });
    (db as any).addAuditLog(
      "Gallery CMS Update",
      `Added new image: "${newGalleryTitle || "Untitled"}" to category ${newGalleryCategory}`
    );
    loadData();
    setNewGalleryUrl("");
    setNewGalleryTitle("");
  };

  const handleDeleteGalleryItem = (id: string) => {
    const item = gallery.find((g) => g.id === id);
    if (confirm("Delete this photo?")) {
      db.deleteImage(id);
      (db as any).addAuditLog(
        "Gallery CMS Update",
        `Removed photo "${item?.title || id}" from gallery`
      );
      loadData();
    }
  };



  // ----------------------------------------------------
  // ----------------------------------------------------
  // QR CODE SCANNER ACTIONS
  // ----------------------------------------------------
  const processValidation = (codeVal: string) => {
    setScanResult(null);
    if (!codeVal) return;

    let rawCode = codeVal.trim();
    let code = rawCode.toLowerCase();

    // 1. Check if this exact QR payload / code has already been scanned in scanned history log
    const scannedQRs: string[] = JSON.parse(localStorage.getItem("skd_scanned_qrs") || "[]");
    const isAlreadyScannedInHistory = scannedQRs.includes(code) || scannedQRs.includes(rawCode);

    // If it's a 4-digit number and we are looking for a booking, prepend 'r-'
    if (/^\d{4}$/.test(code) && (verificationMode === "booking" || verificationMode === "all")) {
      code = `r-${code}`;
    } else {
      // Extract booking ID (r-XXXX) if present in URL/text
      const bookingMatchRegex = code.match(/(r-\d{4})/i);
      if (bookingMatchRegex) {
        code = bookingMatchRegex[1].toLowerCase();
      }
    }

    if (verificationMode === "booking" || verificationMode === "all") {
      // Check if it's a booking reservation (starts with 'r-' or matches a booking ID)
      const bookingMatch = bookings.find((b) => b.id.toLowerCase() === code);
      if (bookingMatch) {
        // Enforce single-use: Check if status is already Arrived, Completed, or Cancelled, OR present in scanned history
        if (bookingMatch.status === "Arrived" || isAlreadyScannedInHistory || scannedQRs.includes(bookingMatch.id.toLowerCase())) {
          playScannerBeep();
          setScanResult({
            success: false,
            message: `⚠️ QR CODE ALREADY USED! Reservation #${bookingMatch.id} for ${bookingMatch.name} was already scanned and checked in. Each QR code can only be scanned ONCE.`,
            booking: bookingMatch
          });
          return;
        }

        if (bookingMatch.status === "Completed") {
          playScannerBeep();
          setScanResult({
            success: false,
            message: `⚠️ QR CODE EXPIRED! Reservation #${bookingMatch.id} for ${bookingMatch.name} has already completed their dining session.`,
            booking: bookingMatch
          });
          return;
        }

        if (bookingMatch.status === "Cancelled") {
          playScannerBeep();
          setScanResult({
            success: false,
            message: `⚠️ INVALID QR CODE! Reservation #${bookingMatch.id} for ${bookingMatch.name} was CANCELLED.`,
            booking: bookingMatch
          });
          return;
        }

        try {
          db.updateBookingStatus(bookingMatch.id, "Arrived");

          // Save to scanned history
          const updatedHistory = Array.from(new Set([...scannedQRs, code, rawCode, bookingMatch.id.toLowerCase()]));
          localStorage.setItem("skd_scanned_qrs", JSON.stringify(updatedHistory));

          (db as any).addAuditLog(
            "Reservation Scanned",
            `Checked in reservation ${bookingMatch.id} for ${bookingMatch.name} as Arrived (QR Verification Success)`
          );

          // Auto-generate discount voucher if not already generated
          const existingVouchers = (db as any).getVouchers() as LoyaltyVoucher[];
          let generatedVoucher = existingVouchers.find((v) => v.billNumber === bookingMatch.id);
          
          if (!generatedVoucher) {
            generatedVoucher = (db as any).addVoucher({
              billNumber: bookingMatch.id,
              phone: bookingMatch.phone,
              baseAmount: 0,
              discountPercent: settings?.discountPercent || 10,
              discountValue: 0,
              finalAmount: 0,
              category: "Website Booking"
            });
          }

          playScannerBeep();
          setScanResult({
            success: true,
            message: `Website Booking Verified! Table is reserved for ${bookingMatch.name} (Table: ${bookingMatch.tableNumber || "Unassigned"}). Checked in successfully.`,
            booking: { ...bookingMatch, status: "Arrived" },
            voucher: generatedVoucher
          });
          setScanInputCode("");
          loadData();
        } catch (err: any) {
          setScanResult({ success: false, message: err.message || "Reservation check-in error." });
        }
        return;
      } else if (verificationMode === "booking") {
        setScanResult({
          success: false,
          message: "No website booking matches the entered Registration ID. Please verify the ticket."
        });
        return;
      }
    }

    if (verificationMode === "voucher" || verificationMode === "all") {
      // Fallback: Voucher Validation
      try {
        const match = vouchers.find((v) => v.id.toLowerCase() === code);
        if (!match) {
          if (isAlreadyScannedInHistory) {
            playScannerBeep();
            setScanResult({
              success: false,
              message: `⚠️ QR CODE ALREADY SCANNED! This QR code (${rawCode}) was previously scanned and cannot be reused.`
            });
            return;
          }
          setScanResult({ success: false, message: "Invalid code. No active voucher matches this code." });
          return;
        }

        if (match.status === "REDEEMED" || isAlreadyScannedInHistory || scannedQRs.includes(match.id.toLowerCase())) {
          playScannerBeep();
          setScanResult({
            success: false,
            message: `⚠️ QR CODE ALREADY USED! Voucher ${match.id} has already been redeemed and cannot be scanned again.`,
            voucher: match
          });
          return;
        }

        const redeemed = (db as any).redeemVoucher(match.id);

        // Save to scanned history
        const updatedHistory = Array.from(new Set([...scannedQRs, code, rawCode, match.id.toLowerCase()]));
        localStorage.setItem("skd_scanned_qrs", JSON.stringify(updatedHistory));

        playScannerBeep();
        setScanResult({ success: true, message: `Success! Approved ${match.discountPercent}% Discount of Rs. ${(match.discountValue || 0).toFixed(0)} on Bill ${match.billNumber}.`, voucher: redeemed });
        setScanInputCode("");
        loadData();
      } catch (err: any) {
        setScanResult({ success: false, message: err.message || "Redemption processing error." });
      }
    }
  };

  const handleScanCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInputCode) return;
    processValidation(scanInputCode);
  };

  // ----------------------------------------------------
  // WHATSAPP ORDER ACTIONS
  // ----------------------------------------------------
  const handleUpdateOrderStatus = (id: string, newStatus: WhatsAppOrder["status"]) => {
    (db as any).updateOrderStatus(id, newStatus);
    loadData();
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm(`Remove order record ${id} from ledger?`)) {
      (db as any).deleteOrder(id);
      (db as any).addAuditLog("Order Ledger Updated", `Deleted order ${id} log`);
      loadData();
    }
  };

  const handlePrintOrderBill = (o: WhatsAppOrder) => {
    const s = db.getSettings();
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) {
      alert("Please allow popups to print the order bill receipt.");
      return;
    }

    const itemsHtml = o.items
      .map(
        (it) => `
      <tr>
        <td style="padding: 6px 0; font-weight: 600; border-bottom: 1px dashed #e2e8f0; text-align: left;">${it.name}</td>
        <td style="padding: 6px 0; text-align: center; border-bottom: 1px dashed #e2e8f0;">x${it.quantity}</td>
        <td style="padding: 6px 0; text-align: right; border-bottom: 1px dashed #e2e8f0;">Rs. ${it.price}</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 700; border-bottom: 1px dashed #e2e8f0;">Rs. ${it.price * it.quantity}</td>
      </tr>
    `
      )
      .join("");

    const subtotal = o.totalAmount || o.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const discount = o.discountApplied || 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${o.id}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: 80mm auto; margin: 5mm; }
            }
            body {
              font-family: 'Courier New', Courier, monospace, sans-serif;
              width: 320px;
              margin: 0 auto;
              padding: 15px;
              color: #1a1a1a;
              background: #fff;
              font-size: 12px;
              line-height: 1.4;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; }
            .header h2 { margin: 0; font-size: 16px; font-weight: 900; letter-spacing: 1px; }
            .header p { margin: 2px 0; font-size: 10px; font-weight: 600; }
            .meta { margin-bottom: 12px; border-bottom: 1px dashed #666; padding-bottom: 8px; font-size: 11px; }
            .meta div { display: flex; justify-content: space-between; margin-bottom: 3px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
            th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 4px; font-size: 10px; text-transform: uppercase; }
            .totals { border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; font-size: 11px; }
            .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
            .grand-total { font-size: 14px; font-weight: 900; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 6px 0; margin-top: 6px; }
            .footer { text-align: center; margin-top: 15px; font-size: 10px; font-style: italic; border-top: 1px dashed #666; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SRI KRISHNA DHABA</h2>
            <p>Authentic Pure Veg Restaurant</p>
            <p>${s?.contactAddress || "Pragathi Nagar Rd, Hyderabad"}</p>
            <p>Phone: ${s?.contactPhone || "+91 90322 92421"}</p>
          </div>

          <div class="meta">
            <div><span><strong>ORDER NO:</strong> ${o.id}</span> <span><strong>STATUS:</strong> ${o.status.toUpperCase()}</span></div>
            <div><span><strong>DATE:</strong> ${new Date(o.createdAt).toLocaleDateString()}</span> <span><strong>TIME:</strong> ${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div style="margin-top: 4px;"><span><strong>CUSTOMER:</strong> ${o.customerName}</span></div>
            <div><span><strong>PHONE:</strong> +91 ${o.phone}</span></div>
            ${o.address ? `<div style="margin-top: 2px;"><span><strong>ADDRESS:</strong> ${o.address}</span></div>` : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">ITEM</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">RATE</th>
                <th style="text-align: right;">AMT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span> <span>Rs. ${subtotal}</span></div>
            ${discount > 0 ? `<div><span>Web Promo Discount:</span> <span>-Rs. ${discount}</span></div>` : ""}
            <div class="grand-total">
              <span>NET PAYABLE:</span>
              <span>Rs. ${o.finalAmount}</span>
            </div>
          </div>

          <div class="footer">
            <p>*** THANK YOU FOR YOUR ORDER ***</p>
            <p>Visit us online: srikrishnadhaba.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 750);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    (db as any).addAuditLog("Order Printed", `Printed bill receipt for Order ${o.id}`);
  };

  // ----------------------------------------------------
  // HOMEPAGE & PROMOS CMS ACTIONS
  // ----------------------------------------------------
  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings({
      timings: cmsTimings,
      contactPhone: cmsPhone,
      contactEmail: cmsEmail,
      contactAddress: cmsAddress,
      discountPercent: cmsDiscount
    });
    (db as any).addAuditLog(
      "CMS Settings Updated",
      `Modified default address, operational timings, support email, and discount values.`
    );
    loadData();
    alert("Website configurations updated successfully!");
  };

  // ----------------------------------------------------
  // REVIEWS MODERATION ACTIONS
  // ----------------------------------------------------
  const handleUpdateReviewStatus = (id: string, status: Review["status"]) => {
    const reviews = db.getReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index !== -1) {
      reviews[index].status = status;
      localStorage.setItem("skd_reviews", JSON.stringify(reviews));
      
      const rev = reviews[index];
      (db as any).addAuditLog(
        "Review Moderation Update",
        `Set review by ${rev.name} (Source: ${rev.source}) status to ${status}`
      );
      loadData();
    }
  };

  // ----------------------------------------------------
  // CUSTOMER INBOX ACTIONS
  // ----------------------------------------------------
  const handleResolveContact = (id: string) => {
    db.updateContactStatus(id, "Resolved");
    const contact = contacts.find((c) => c.id === id);
    (db as any).addAuditLog(
      "Customer Inbox Resolve",
      `Marked query by ${contact?.name || id} as Resolved`
    );
    loadData();
  };

  // ----------------------------------------------------
  // CUSTOMER DATABASE ACTIONS
  // ----------------------------------------------------
  const handleDeleteCustomers = (phones: string[]) => {
    if (phones.length === 0) return;
    const confirmMessage = phones.length === 1 
      ? `Are you sure you want to delete this customer profile and all their associated bookings, orders, and vouchers?`
      : `Are you sure you want to delete the selected ${phones.length} customer profiles and all their associated bookings, orders, and vouchers?`;
      
    if (confirm(confirmMessage)) {
      (db as any).deleteCustomers(phones);
      setSelectedCustomers(prev => prev.filter(p => !phones.includes(p)));
      loadData();
    }
  };

  // ----------------------------------------------------
  // DATABASE BACKUP & SEED ACTIONS
  // ----------------------------------------------------
  const handleDownloadBackup = (e: React.FormEvent) => {
    e.preventDefault();
    setExportError("");

    // Verify Owner credentials (username "owner" or "owner@example.com", password "owner123")
    const isOwner = (exportEmail.toLowerCase() === "owner" || exportEmail.toLowerCase() === "owner@example.com") && exportPassword === "owner123";
    if (!isOwner) {
      setExportError("Authentication failed. Only Owner credentials can download database backups.");
      return;
    }

    // Verify that at least one data type is selected
    const hasSelection = Object.values(exportSelections).some(Boolean);
    if (!hasSelection) {
      setExportError("Please select at least one data type to export.");
      return;
    }

    try {
      const data: any = {
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      if (exportSelections.menuCms) data.menu = db.getMenu();
      if (exportSelections.reservations) data.bookings = bookings;
      if (exportSelections.reviewsCms) data.reviews = reviews;
      if (exportSelections.galleryCms) data.gallery = gallery;
      if (exportSelections.customerInbox) data.contacts = contacts;
      if (exportSelections.siteSettings) {
        data.settings = settings;
        data.visits = parseInt(localStorage.getItem("skd_visits") || "120", 10);
        data.auditLogs = auditLogs;
      }
      if (exportSelections.offersCms) data.vouchers = vouchers;
      if (exportSelections.whatsappOrders) data.orders = orders;

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `skd_database_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      (db as any).addAuditLog(
        "Backup Exported",
        `Downloaded database snapshot (Selected: ${Object.keys(exportSelections).filter(k => (exportSelections as any)[k]).join(", ")})`
      );
      
      setIsExportModalOpen(false);
      loadData();
    } catch (err: any) {
      setExportError("Failed to export backup: " + err.message);
    }
  };

  const handleSelectAllExport = () => {
    setExportSelections({
      whatsappOrders: true,
      reservations: true,
      menuCms: true,
      reviewsCms: true,
      offersCms: true,
      galleryCms: true,
      customerInbox: true,
      siteSettings: true
    });
  };

  const handleRestoreBackup = () => {
    if (!backupFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Check if at least one expected schema key is present in the file
        const validKeys = ["menu", "bookings", "reviews", "gallery", "contacts", "settings", "vouchers", "orders"];
        const hasSomeData = validKeys.some(key => key in json);

        if (!hasSomeData) {
          alert("Invalid backup file. Missing required database schemas.");
          return;
        }

        if (confirm("WARNING: This will overwrite current database records for the sections present in the backup file. Are you sure you want to proceed?")) {
          let restoreCount = 0;

          if (json.menu !== undefined) {
            localStorage.setItem("skd_menu", JSON.stringify(json.menu));
            restoreCount++;
          }
          if (json.bookings !== undefined) {
            localStorage.setItem("skd_bookings", JSON.stringify(json.bookings));
            restoreCount++;
          }
          if (json.reviews !== undefined) {
            localStorage.setItem("skd_reviews", JSON.stringify(json.reviews));
            restoreCount++;
          }
          if (json.gallery !== undefined) {
            localStorage.setItem("skd_gallery", JSON.stringify(json.gallery));
            restoreCount++;
          }
          if (json.contacts !== undefined) {
            localStorage.setItem("skd_contacts", JSON.stringify(json.contacts));
            restoreCount++;
          }
          if (json.settings !== undefined) {
            localStorage.setItem("skd_settings", JSON.stringify(json.settings));
            restoreCount++;
          }
          if (json.vouchers !== undefined) {
            localStorage.setItem("skd_vouchers", JSON.stringify(json.vouchers));
            restoreCount++;
          }
          if (json.orders !== undefined) {
            localStorage.setItem("skd_orders", JSON.stringify(json.orders));
            restoreCount++;
          }
          if (json.auditLogs !== undefined) {
            localStorage.setItem("skd_audit_logs", JSON.stringify(json.auditLogs));
          }
          if (json.visits !== undefined) {
            localStorage.setItem("skd_visits", String(json.visits));
          }

          // Log restore action
          (db as any).addAuditLog(
            "Backup Restored",
            `Restored database sections from uploaded JSON snapshot (${restoreCount} sections modified)`
          );

          alert("Database snapshot restored successfully! Reloading page...");
          setBackupFile(null);
          loadData();
          window.location.reload();
        }
      } catch (err) {
        alert("Failed to parse JSON file. Ensure it is a valid backup file.");
      }
    };
    reader.readAsText(backupFile);
  };

  const handleTriggerReseeding = () => {
    if (confirm("WARNING: This will overwrite your database with factory default values. Any custom menus, reviews, or orders will be lost. Do you want to proceed?")) {
      // Clear all keys
      localStorage.removeItem("skd_menu");
      localStorage.removeItem("skd_bookings");
      localStorage.removeItem("skd_reviews");
      localStorage.removeItem("skd_gallery");
      localStorage.removeItem("skd_contacts");
      localStorage.removeItem("skd_settings");
      localStorage.removeItem("skd_vouchers");
      localStorage.removeItem("skd_orders");
      localStorage.removeItem("skd_audit_logs");
      localStorage.removeItem("skd_visits");

      // Re-initialize
      db.init();

      // Log reseeding
      (db as any).addAuditLog(
        "Database Re-seed",
        "Reset database to factory defaults"
      );

      alert("Database re-seeded to factory defaults successfully! Reloading page...");
      loadData();
      window.location.reload();
    }
  };

  // ----------------------------------------------------
  // DYNAMIC COMPUTATIONS
  // ----------------------------------------------------
  const analytics = useMemo(() => {
    const visits = parseInt(localStorage.getItem("skd_visits") || "120", 10);
    const phoneMap = new Map<string, number>();
    bookings.forEach((b) => phoneMap.set(b.phone, (phoneMap.get(b.phone) || 0) + 1));
    orders.forEach((o) => phoneMap.set(o.phone, (phoneMap.get(o.phone) || 0) + 1));
    vouchers.forEach((v) => phoneMap.set(v.phone, (phoneMap.get(v.phone) || 0) + 1));

    const totalCustomers = phoneMap.size;
    let returningCustomers = 0;
    phoneMap.forEach((count) => {
      if (count > 1) returningCustomers++;
    });

    const activeVouchers = vouchers.filter((v) => v.status === "ACTIVE").length;
    const verifiedVouchers = vouchers.filter((v) => v.status === "REDEEMED").length;

    return {
      visits,
      totalBookings: bookings.length,
      todayBookings: bookings.filter((b) => b.date === new Date().toISOString().split("T")[0]).length,
      activeVouchers,
      verifiedVouchers,
      totalOrders: orders.length,
      totalCustomers,
      returningCustomers,
      conversionRate: visits > 0 ? ((bookings.length / visits) * 100).toFixed(1) : "0.0",
      busiestHours: [
        { time: "19:30", count: bookings.filter((b) => b.time === "19:30").length },
        { time: "20:30", count: bookings.filter((b) => b.time === "20:30").length },
        { time: "21:00", count: bookings.filter((b) => b.time === "21:00").length },
        { time: "13:00", count: bookings.filter((b) => b.time === "13:00").length },
        { time: "20:00", count: bookings.filter((b) => b.time === "20:00").length }
      ].sort((a, b) => b.count - a.count)
    };
  }, [bookings, orders, vouchers]);

  // Combined Customer Database
  const customerDatabase = useMemo(() => {
    const profileMap = new Map<string, { name: string; phone: string; visits: number; bookingsCount: number; ordersCount: number; spend: number }>();

    bookings.forEach((b) => {
      const entry = profileMap.get(b.phone) || { name: b.name, phone: b.phone, visits: 0, bookingsCount: 0, ordersCount: 0, spend: 0 };
      entry.visits++;
      entry.bookingsCount++;
      // Approximate billing spend based on occasion / guests
      if (b.status === "Completed") {
        entry.spend += b.guests * 300;
      }
      profileMap.set(b.phone, entry);
    });

    orders.forEach((o) => {
      const entry = profileMap.get(o.phone) || { name: o.customerName, phone: o.phone, visits: 0, bookingsCount: 0, ordersCount: 0, spend: 0 };
      entry.visits++;
      entry.ordersCount++;
      if (o.status === "Delivered") {
        entry.spend += o.finalAmount;
      }
      profileMap.set(o.phone, entry);
    });

    vouchers.forEach((v) => {
      const entry = profileMap.get(v.phone) || { name: `Guest Phone: ${v.phone.substring(0, 5)}...`, phone: v.phone, visits: 0, bookingsCount: 0, ordersCount: 0, spend: 0 };
      if (v.status === "REDEEMED") {
        entry.spend += v.finalAmount;
      }
      profileMap.set(v.phone, entry);
    });

    const list = Array.from(profileMap.values());
    if (!customerSearchText) return list;
    return list.filter(
      (c) => c.name.toLowerCase().includes(customerSearchText.toLowerCase()) || c.phone.includes(customerSearchText)
    );
  }, [bookings, orders, vouchers, customerSearchText]);

  // ----------------------------------------------------
  // FILTERED LEDGERS
  // ----------------------------------------------------
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(bookingSearchText.toLowerCase()) || b.phone.includes(bookingSearchText);
      const matchesStatus = bookingFilterStatus === "All" || b.status === bookingFilterStatus;
      const matchesDate = !bookingFilterDate || b.date === bookingFilterDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, bookingSearchText, bookingFilterStatus, bookingFilterDate]);



  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = o.customerName.toLowerCase().includes(orderSearchText.toLowerCase()) || o.phone.includes(orderSearchText);
      const matchesStatus = orderFilterStatus === "All" || o.status === orderFilterStatus;
      const matchesDate = !orderFilterDate || o.createdAt.split("T")[0] === orderFilterDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, orderSearchText, orderFilterStatus, orderFilterDate]);

  const filteredMenu = useMemo(() => {
    return menu.filter((dish) => {
      const matchesSearch =
        dish.title.toLowerCase().includes(menuSearchText.toLowerCase()) ||
        dish.teluguTitle.toLowerCase().includes(menuSearchText.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(menuSearchText.toLowerCase()));

      let matchesStatus = true;
      if (menuFilterStatus === "In Stock") {
        matchesStatus = !dish.outOfStock;
      } else if (menuFilterStatus === "Out of Stock") {
        matchesStatus = !!dish.outOfStock;
      } else if (menuFilterStatus === "Hidden") {
        matchesStatus = !!dish.hidden;
      } else if (menuFilterStatus === "Visible") {
        matchesStatus = !dish.hidden;
      }

      let matchesCategory = true;
      if (menuSelectedCategory !== "All") {
        matchesCategory = dish.category === menuSelectedCategory;
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [menu, menuSearchText, menuFilterStatus, menuSelectedCategory]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchesSearch = !logSearchText || 
        l.action.toLowerCase().includes(logSearchText.toLowerCase()) || 
        l.user.toLowerCase().includes(logSearchText.toLowerCase()) || 
        l.details.toLowerCase().includes(logSearchText.toLowerCase());
        
      const matchesDate = !selectedAuditDate || l.timestamp.split("T")[0] === selectedAuditDate;
      const matchesAction = selectedActionFilter === "All" || l.action === selectedActionFilter;
      
      return matchesSearch && matchesDate && matchesAction;
    });
  }, [auditLogs, logSearchText, selectedAuditDate, selectedActionFilter]);

  const uniqueAuditActions = useMemo(() => {
    const actions = auditLogs.map(l => l.action);
    return Array.from(new Set(actions));
  }, [auditLogs]);

  const datesList = useMemo(() => {
    const list = [];
    const today = new Date();
    // 23 days in past to 7 days in future (chronological: past on left, future on right)
    for (let offset = -23; offset <= 7; offset++) {
      const d = new Date();
      d.setDate(today.getDate() + offset);
      
      const year = d.getFullYear();
      const monthVal = String(d.getMonth() + 1).padStart(2, '0');
      const dayVal = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${monthVal}-${dayVal}`;

      const isToday = offset === 0;
      const isYesterday = offset === -1;
      const isTomorrow = offset === 1;
      let label = "";
      if (isToday) {
        label = "TODAY";
      } else if (isYesterday) {
        label = "YEST.";
      } else if (isTomorrow) {
        label = "TOM.";
      } else {
        label = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      }

      list.push({
        dateString,
        day: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        label,
        isToday
      });
    }
    return list;
  }, []);

  const reservationDatesList = useMemo(() => {
    const list = [];
    const today = new Date();
    // Reverse chronological order: today (0) down to past (daysPast days)
    for (let offset = 0; offset >= -daysPast; offset--) {
      const d = new Date();
      d.setDate(today.getDate() + offset);
      
      const year = d.getFullYear();
      const monthVal = String(d.getMonth() + 1).padStart(2, '0');
      const dayVal = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${monthVal}-${dayVal}`;

      const isToday = offset === 0;
      const isYesterday = offset === -1;
      const isTomorrow = offset === 1;
      let label = "";
      if (isToday) {
        label = "TODAY";
      } else if (isYesterday) {
        label = "YEST.";
      } else if (isTomorrow) {
        label = "TOM.";
      } else {
        label = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      }

      list.push({
        dateString,
        day: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        label,
        isToday
      });
    }
    return list;
  }, [daysPast]);

  const getMockIp = (logId: string) => {
    const match = logId.match(/\d+$/);
    const val = match ? parseInt(match[0], 10) : 1;
    return `192.168.1.${(val % 250) + 2}`;
  };

  // LOGIN PAGE RENDER
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md p-8 glass-panel-dark border border-brand-dark/40 rounded-3xl shadow-2xl relative z-10 mx-4">
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-brand-gold border-2 border-brand-dark/70 flex items-center justify-center shadow-lg relative overflow-hidden mx-auto">
              <svg className="w-12 h-12 text-brand-dark fill-brand-dark" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#231F20" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M50 20 L55 33 L69 33 L58 41 L62 55 L50 47 L38 55 L42 41 L31 33 L45 33 Z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-wider text-brand-gold uppercase">
                SRI KRISHNA DHABA
              </h2>
              <p className="text-xs text-brand-bg/50 uppercase tracking-widest font-bold mt-1">
                Admin Management Console
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-bg/40"><Lock size={15} /></span>
                <input
                  type="text"
                  placeholder="Enter admin role ID"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-brand-dark/60 border border-brand-dark/35 hover:border-brand-dark/50 focus:border-brand-dark/70 rounded-xl py-3 px-11 text-xs text-white placeholder-brand-bg/35 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-bg/40"><Lock size={15} /></span>
                <input
                  type="password"
                  placeholder="Enter secure passcode"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-brand-dark/60 border border-brand-dark/35 hover:border-brand-dark/50 focus:border-brand-dark/70 rounded-xl py-3 px-11 text-xs text-white placeholder-brand-bg/35 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-gold text-brand-dark hover:bg-brand-accent hover:text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>ACCESS CONSOLE</span>
              <Lock size={13} />
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-[10px] text-brand-bg/40 leading-none">
              Owner: owner / owner123 • Manager: manager / manager123
            </span>
          </div>
        </div>
      </div>
    );
  }

  // CORE DASHBOARD PANEL
  return (
    <div className="min-h-screen bg-brand-bg/25 flex flex-col lg:flex-row font-sans text-brand-dark relative overflow-x-hidden">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-brand-dark border-b border-brand-dark/30 text-brand-bg relative z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-brand-bg/10 hover:bg-brand-bg/20 text-brand-gold focus:outline-none cursor-pointer"
            aria-label="Open Sidebar"
          >
            <MenuIcon size={20} />
          </button>
          <span className="font-display font-black text-xs text-brand-gold uppercase tracking-wider">
            SRI KRISHNA DHABA
          </span>
        </div>
        <span className="text-[9px] bg-brand-accent/20 border border-brand-accent/40 px-2.5 py-0.5 rounded text-brand-accent font-black uppercase tracking-wider">
          {activeTab}
        </span>
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`w-64 bg-brand-dark text-brand-bg/90 border-r border-brand-dark/30 flex flex-col justify-between shrink-0
        fixed inset-y-0 left-0 z-50 transform lg:translate-x-0 lg:static lg:h-screen transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-brand-dark/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-dark border border-brand-dark/70 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-gold fill-brand-gold" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M50 20 L55 33 L69 33 L58 41 L62 55 L50 47 L38 55 L42 41 L31 33 L45 33 Z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-black text-xs text-brand-gold uppercase tracking-wider">
                SRI KRISHNA DHABA
              </h2>
              <span className="text-[9px] uppercase font-bold text-brand-accent tracking-widest leading-none block">
                {user.role} Panel
              </span>
            </div>
          </div>
          
          {/* Close sidebar button on mobile */}
          <button 
            className="lg:hidden p-1 text-brand-bg/60 hover:text-brand-gold cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {[
            { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
            { id: "bookings", label: "RESERVATIONS", icon: Calendar },
            { id: "orders", label: "WHATSAPP ORDERS", icon: ShoppingCart },
            { id: "scanner", label: "VERIFICATION COUNTER", icon: Check },
            { id: "menu", label: "MENU EDITOR", icon: MenuIcon },
            { id: "gallery", label: "GALLERY CMS", icon: ImageIcon },
            { id: "homepage", label: "HOMEPAGE CMS", icon: FileText },
            { id: "promos", label: "OFFERS & PROMOS", icon: SettingsIcon },
            { id: "reviews", label: "TESTIMONIALS", icon: Star },
            { id: "contacts", label: "CUSTOMER INBOX", icon: Mail },
            { id: "customers", label: "CUSTOMER DB", icon: UserCheck },
            { id: "audit", label: "AUDIT TRAIL", icon: ShieldAlert },
            { id: "backups", label: "BACKUPS & SEED", icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const allowed = hasAccess(tab.id as AdminTab);
            if (!allowed) return null;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setIsSidebarOpen(false); // Close drawer on selection on mobile
                }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left text-[11px] font-black tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-brand-gold text-brand-dark shadow-md"
                    : "text-brand-bg/75 hover:bg-brand-gold/10 hover:text-brand-gold"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-6 border-t border-brand-dark/30 space-y-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-gold/25 text-brand-gold font-bold flex items-center justify-center text-xs">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold leading-tight truncate">{user.name}</p>
              <p className="text-[10px] text-brand-bg/40 leading-none mt-0.5 capitalize">{user.role} role</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-brand-bg/25 hover:border-brand-gold text-brand-bg/75 hover:text-brand-gold py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            <LogOut size={13} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 space-y-8 overflow-y-auto h-screen">
        {/* Tab content conditional switches */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in text-brand-dark">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-dark/45 uppercase tracking-wider">
              <span>Management</span>
              <span>/</span>
              <span className="text-brand-dark font-black">Dashboard</span>
            </div>

            {/* Executive Overview Header Card */}
            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-500/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Operational Online</span>
                </div>
                <h1 className="font-display font-black text-2xl uppercase tracking-wider text-brand-dark leading-none">Executive Overview</h1>
                <p className="text-xs text-brand-dark/50 font-medium">
                  Real-time metrics and operational status for Sri Krishna Family Dhaba
                </p>
              </div>
              <button
                onClick={() => setActiveTab("scanner")}
                className="px-6 py-3.5 bg-brand-dark hover:bg-brand-accent text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
              >
                <span>QR Voucher Verification</span>
                <span className="font-bold">→</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today's Bookings */}
              <button
                onClick={() => setActiveTab("bookings")}
                className="bg-white hover:bg-brand-bg/30 text-left rounded-3xl p-6 border border-brand-dark/30 shadow-sm flex items-center gap-4 transition-all group cursor-pointer w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-bg/50 flex items-center justify-center text-brand-accent shrink-0 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                  <Clock size={20} className="stroke-[2.5]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider group-hover:text-brand-accent transition-colors duration-300">Today's Bookings</p>
                  <p className="font-display font-black text-3xl leading-none">{analytics.todayBookings}</p>
                </div>
              </button>

              {/* Total Reservations */}
              <button
                onClick={() => setActiveTab("bookings")}
                className="bg-white hover:bg-brand-bg/30 text-left rounded-3xl p-6 border border-brand-dark/30 shadow-sm flex items-center gap-4 transition-all group cursor-pointer w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-bg/50 flex items-center justify-center text-brand-accent shrink-0 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                  <Users size={20} className="stroke-[2.5]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider group-hover:text-brand-accent transition-colors duration-300">Total Reservations</p>
                  <p className="font-display font-black text-3xl leading-none">{analytics.totalBookings}</p>
                </div>
              </button>

              {/* Verified Vouchers */}
              <button
                onClick={() => setActiveTab("scanner")}
                className="bg-white hover:bg-brand-bg/30 text-left rounded-3xl p-6 border border-brand-dark/30 shadow-sm flex items-center gap-4 transition-all group cursor-pointer w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <CheckCircle size={20} className="stroke-[2.5]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider group-hover:text-emerald-600 transition-colors duration-300">Verified Vouchers</p>
                  <p className="font-display font-black text-3xl leading-none">{analytics.verifiedVouchers}</p>
                </div>
              </button>
            </div>

            {/* System Modules Header */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/45 block px-1">SYSTEM MODULES</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Menu Dishes */}
                <button
                  onClick={() => setActiveTab("menu")}
                  className="bg-white hover:bg-brand-bg/30 text-left rounded-2xl p-5 border border-brand-dark/30 shadow-xs flex items-center justify-between gap-4 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-dark/65 shrink-0 group-hover:text-brand-accent transition-colors">
                      <Utensils size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider">Menu Dishes</p>
                      <p className="font-display font-black text-sm text-brand-dark mt-0.5">{menu.length} Items</p>
                    </div>
                  </div>
                  <span className="text-brand-dark/30 group-hover:text-brand-accent transition-colors font-bold text-sm shrink-0">→</span>
                </button>

                {/* Gallery Media */}
                <button
                  onClick={() => setActiveTab("gallery")}
                  className="bg-white hover:bg-brand-bg/30 text-left rounded-2xl p-5 border border-brand-dark/30 shadow-xs flex items-center justify-between gap-4 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-dark/65 shrink-0 group-hover:text-brand-accent transition-colors">
                      <Folder size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider">Gallery Media</p>
                      <p className="font-display font-black text-sm text-brand-dark mt-0.5">{gallery.length} Assets</p>
                    </div>
                  </div>
                  <span className="text-brand-dark/30 group-hover:text-brand-accent transition-colors font-bold text-sm shrink-0">→</span>
                </button>

                {/* Pending Reviews */}
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="bg-white hover:bg-brand-bg/30 text-left rounded-2xl p-5 border border-brand-dark/30 shadow-xs flex items-center justify-between gap-4 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-dark/65 shrink-0 group-hover:text-brand-accent transition-colors">
                      <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider">Pending Reviews</p>
                      <p className="font-display font-black text-sm text-brand-dark mt-0.5">{reviews.filter((r) => r.status === "Pending").length} Reviews</p>
                    </div>
                  </div>
                  <span className="text-brand-dark/30 group-hover:text-brand-accent transition-colors font-bold text-sm shrink-0">→</span>
                </button>

                {/* Inbox Queries */}
                <button
                  onClick={() => setActiveTab("contacts")}
                  className="bg-white hover:bg-brand-bg/30 text-left rounded-2xl p-5 border border-brand-dark/30 shadow-xs flex items-center justify-between gap-4 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-dark/65 shrink-0 group-hover:text-brand-accent transition-colors">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-brand-dark/45 uppercase tracking-wider">Inbox Queries</p>
                      <p className="font-display font-black text-sm text-brand-dark mt-0.5">{contacts.length} Messages</p>
                    </div>
                  </div>
                  <span className="text-brand-dark/30 group-hover:text-brand-accent transition-colors font-bold text-sm shrink-0">→</span>
                </button>
              </div>
            </div>

            {/* Recent Booking Requests */}
            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-brand-dark/15">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-dark">Recent Booking Requests</h3>
                  <p className="text-[11px] text-brand-dark/50 mt-0.5 font-medium">Live stream of customer table reservations</p>
                </div>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-xs font-black text-brand-accent hover:text-brand-dark transition-colors uppercase tracking-widest cursor-pointer flex items-center gap-1"
                >
                  <span>View Console</span>
                  <span>→</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-brand-dark/45 font-medium">
                  No recent bookings found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-brand-dark/10 text-brand-dark/55 uppercase font-bold text-[9px] tracking-wider">
                        <th className="pb-3 pr-4 font-black">Booking Ref</th>
                        <th className="pb-3 px-4 font-black">Customer Details</th>
                        <th className="pb-3 px-4 font-black">Schedule</th>
                        <th className="pb-3 px-4 font-black">Party Size</th>
                        <th className="pb-3 pl-4 font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark/5">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="text-brand-dark/85">
                          <td className="py-4 pr-4 font-display font-black text-[13px]">{b.id}</td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-brand-dark leading-none">{b.name}</div>
                            <div className="text-[10px] text-brand-dark/45 mt-1 leading-none">{b.phone}</div>
                          </td>
                          <td className="py-4 px-4 font-medium">
                            <div>{b.date}</div>
                            <div className="text-[10px] text-brand-accent font-bold mt-1 leading-none">{b.time}</div>
                          </td>
                          <td className="py-4 px-4 font-extrabold text-brand-dark/75">{b.guests} {b.guests === 1 ? "Guest" : "Guests"}</td>
                          <td className="py-4 pl-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border leading-none inline-block ${
                              b.status === "Pending" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                              b.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                              b.status === "Arrived" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" :
                              b.status === "Completed" ? "bg-blue-500/10 border-blue-500/30 text-blue-600" :
                              "bg-red-500/10 border-red-500/30 text-red-600"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}



        {activeTab === "bookings" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Title and Refresh Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent block mb-1">TABLE MANAGEMENT</span>
                <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Reservations Checklists & Date Logs</h1>
                <p className="text-xs text-brand-dark/50 font-medium mt-1">
                  View, approve, track check-ins, assign tables, and complete dining reservations
                </p>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-4 py-2 border border-brand-dark/35 hover:border-brand-accent rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-white"
              >
                <RotateCw size={13} className="text-brand-dark" />
                <span>REFRESH</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-6">
              {/* Date Filter Section (Matching Audit Trail Date Log) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/15 pb-3">
                  <div className="flex flex-wrap items-center gap-4 text-brand-dark/60">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-brand-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">FILTER BY DATE — SCROLL FOR OLDER DATES</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-brand-dark/20 pl-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-dark/45">Days Past:</span>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={daysPast}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            setDaysPast(val);
                            localStorage.setItem("skd_reservation_days_past", String(val));
                          }
                        }}
                        className="w-12 bg-brand-bg border border-brand-dark/25 rounded-lg py-1 px-1.5 text-center text-[10px] font-black focus:outline-none focus:border-brand-dark/60"
                      />
                    </div>
                  </div>
                  {bookingFilterDate && (
                    <button
                      onClick={() => {
                        const confirmText = `Are you sure you want to delete ALL bookings/reservations for the date: ${bookingFilterDate}?\n\nThis will permanently delete them from both local storage and the database. This action CANNOT be undone.`;
                        if (window.confirm(confirmText)) {
                          db.deleteBookingsByDate(bookingFilterDate);
                          setBookingFilterDate("");
                          loadData();
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-0.5 pr-2"
                    >
                      <span className="text-sm leading-none">×</span>
                      <span>CLEAR</span>
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => bookingDatePickerRef.current?.showPicker()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-dark/35 hover:border-brand-accent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
                    >
                      <Calendar size={12} className="text-brand-dark" />
                      <span>PICK DATE</span>
                    </button>
                    <input
                      ref={bookingDatePickerRef}
                      type="date"
                      className="absolute invisible pointer-events-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          setBookingFilterDate(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Horizontal Scrollable Date list */}
                <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-brand-dark/20 scrollbar-track-transparent">
                  {/* VIEW All Card */}
                  <button
                    onClick={() => setBookingFilterDate("")}
                    className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border transition-all cursor-pointer ${
                      bookingFilterDate === ""
                        ? "bg-brand-dark border-brand-dark text-white shadow-md font-bold"
                        : "bg-white border-brand-dark/20 hover:border-brand-dark/40 text-brand-dark"
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider">VIEW</span>
                    <span className="text-lg font-black mt-1">All</span>
                  </button>

                  {/* Dynamically generated date list */}
                  {reservationDatesList.map((dItem) => {
                    const isSelected = bookingFilterDate === dItem.dateString;
                    return (
                      <button
                        key={dItem.dateString}
                        onClick={() => setBookingFilterDate(dItem.dateString)}
                        className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-dark border-brand-dark text-white shadow-md"
                            : "bg-white border-brand-dark/20 hover:border-brand-dark/40 text-brand-dark"
                        }`}
                      >
                        <span className={`text-[8px] font-black uppercase tracking-wider ${
                          isSelected ? "text-brand-gold" : dItem.isToday ? "text-amber-600" : "text-brand-dark/45"
                        }`}>
                          {dItem.label}
                        </span>
                        <span className="text-lg font-black leading-none mt-1">{dItem.day}</span>
                        <span className="text-[9px] font-bold text-brand-dark/50 mt-1 uppercase leading-none">{dItem.month}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Counter */}
                <div className="text-[10px] text-brand-dark/50 font-bold uppercase px-1">
                  Showing <span className="text-brand-dark font-extrabold">{filteredBookings.length}</span> of <span className="text-brand-dark font-extrabold">{bookings.length}</span> total reservations {bookingFilterDate ? `for ${bookingFilterDate}` : "(all dates)"}
                </div>
              </div>

              {/* Status Filters and Search Row */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t border-brand-dark/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  {["All", "Pending", "Approved", "Arrived", "Completed", "Cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingFilterStatus(st)}
                      className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all cursor-pointer ${
                        bookingFilterStatus === st
                          ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                          : "bg-white text-brand-dark border-brand-dark/35 hover:border-brand-accent"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative max-w-xs w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search name / phone..."
                    value={bookingSearchText}
                    onChange={(e) => setBookingSearchText(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-9 text-xs focus:outline-none focus:border-brand-dark/70 font-semibold"
                  />
                </div>
              </div>

              {/* Reservations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white border border-brand-dark/30 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-display font-black text-sm text-brand-dark leading-none">{b.name}</h4>
                          <span className="text-[10px] text-brand-dark/45 font-semibold mt-1 inline-block">ID: {b.id}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          b.status === "Pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                          b.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                          b.status === "Arrived" ? "bg-purple-500/15 border-purple-500/30 text-purple-700 font-bold" :
                          b.status === "Completed" ? "bg-blue-500/10 border-blue-500/20 text-blue-600" :
                          "bg-brand-dark/10 border-brand-dark/20 text-brand-dark/60"
                        }`}>
                          {b.status === "Arrived" ? "Arrived & Seated" : b.status}
                        </span>
                      </div>

                      <div className="text-xs text-brand-dark/75 space-y-1.5 pt-1.5 border-t border-brand-dark/20">
                        <p><strong>Mobile:</strong> {b.phone}</p>
                        <p><strong>Occasion:</strong> {b.occasion}</p>
                        <p><strong>Dine Time:</strong> {b.date} at {b.time} ({b.guests} guests)</p>
                        {b.tableNumber && <p className="text-brand-accent"><strong>Assigned Table:</strong> Table {b.tableNumber}</p>}
                        {b.instructions && <p className="italic text-brand-dark/50">"Note: {b.instructions}"</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-dark/10">
                      {b.status === "Arrived" && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "Completed")}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check size={14} />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setBookingTableNum(b.tableNumber || "");
                              setBookingNotes(b.notes || "");
                            }}
                            className="px-3 py-2 border border-brand-dark/35 hover:bg-brand-bg rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Table #{b.tableNumber || "Assign"}
                          </button>
                        </>
                      )}

                      {b.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "Approved")}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "Rejected")}
                            className="px-3 py-2 border border-red-500/25 hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {b.status === "Approved" && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "Arrived")}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <UserCheck size={13} />
                            <span>Mark Arrived</span>
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, "Completed")}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setBookingTableNum(b.tableNumber || "");
                              setBookingNotes(b.notes || "");
                            }}
                            className="px-2.5 py-2 border border-brand-dark/35 hover:bg-brand-bg rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Table
                          </button>
                        </>
                      )}

                      {b.status === "Completed" && (
                        <div className="w-full py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                          <Check size={13} />
                          <span>Dining Completed</span>
                        </div>
                      )}

                      {b.status !== "Pending" && b.status !== "Approved" && b.status !== "Arrived" && b.status !== "Completed" && (
                        <span className="text-[10px] font-bold text-brand-dark/45 italic py-1">No actions available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">WhatsApp Delivery Orders</h1>

            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-6">
              {/* Date Filter Section (Matching Reservation Date Log) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/15 pb-3">
                  <div className="flex flex-wrap items-center gap-4 text-brand-dark/60">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-brand-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">FILTER BY DATE — SCROLL FOR OLDER ORDERS</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-brand-dark/20 pl-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-dark/45">Days Past:</span>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={daysPast}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            setDaysPast(val);
                            localStorage.setItem("skd_reservation_days_past", String(val));
                          }
                        }}
                        className="w-12 bg-brand-bg border border-brand-dark/25 rounded-lg py-1 px-1.5 text-center text-[10px] font-black focus:outline-none focus:border-brand-dark/60"
                      />
                    </div>
                  </div>
                  {orderFilterDate && (
                    <button
                      onClick={() => {
                        const confirmText = `Are you sure you want to delete ALL WhatsApp orders for the date: ${orderFilterDate}?\n\nThis will permanently delete them from both local storage and the database. This action CANNOT be undone.`;
                        if (window.confirm(confirmText)) {
                          (db as any).deleteOrdersByDate(orderFilterDate);
                          setOrderFilterDate("");
                          loadData();
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-0.5 pr-2"
                    >
                      <span className="text-sm leading-none">×</span>
                      <span>CLEAR</span>
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => orderDatePickerRef.current?.showPicker()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-dark/35 hover:border-brand-accent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
                    >
                      <Calendar size={12} className="text-brand-dark" />
                      <span>PICK DATE</span>
                    </button>
                    <input
                      ref={orderDatePickerRef}
                      type="date"
                      className="absolute invisible pointer-events-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          setOrderFilterDate(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Horizontal Scrollable Date list */}
                <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-brand-dark/20 scrollbar-track-transparent">
                  {/* VIEW All Card */}
                  <button
                    onClick={() => setOrderFilterDate("")}
                    className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border transition-all cursor-pointer ${
                      orderFilterDate === ""
                        ? "bg-brand-dark border-brand-dark text-white shadow-md font-bold"
                        : "bg-white border-brand-dark/20 hover:border-brand-dark/40 text-brand-dark"
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider">VIEW</span>
                    <span className="text-lg font-black mt-1">All</span>
                  </button>

                  {/* Dynamically generated date list */}
                  {reservationDatesList.map((dItem) => {
                    const isSelected = orderFilterDate === dItem.dateString;
                    return (
                      <button
                        key={dItem.dateString}
                        onClick={() => setOrderFilterDate(dItem.dateString)}
                        className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-dark border-brand-dark text-white shadow-md"
                            : "bg-white border-brand-dark/20 hover:border-brand-dark/40 text-brand-dark"
                        }`}
                      >
                        <span className={`text-[8px] font-black uppercase tracking-wider ${
                          isSelected ? "text-brand-gold" : dItem.isToday ? "text-amber-600" : "text-brand-dark/45"
                        }`}>
                          {dItem.label}
                        </span>
                        <span className="text-lg font-black leading-none mt-1">{dItem.day}</span>
                        <span className="text-[9px] font-bold text-brand-dark/50 mt-1 uppercase leading-none">{dItem.month}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Counter */}
                <div className="text-[10px] text-brand-dark/50 font-bold uppercase px-1 pb-3 border-b border-brand-dark/10">
                  Showing <span className="text-brand-dark font-extrabold">{filteredOrders.length}</span> of <span className="text-brand-dark font-extrabold">{orders.length}</span> total orders {orderFilterDate ? `for ${orderFilterDate}` : "(all dates)"}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {["All", "Pending", "Accepted", "Out For Delivery", "Delivered", "Cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all cursor-pointer ${
                        orderFilterStatus === st
                          ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                          : "bg-white text-brand-dark border-brand-dark/35 hover:border-brand-accent"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search customer name / mobile..."
                    value={orderSearchText}
                    onChange={(e) => setOrderSearchText(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2 px-9 text-xs focus:outline-none focus:border-brand-dark/70"
                  />
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="border border-brand-dark/30 rounded-2xl p-6 bg-white hover:shadow-sm transition-all space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-dark/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm text-brand-dark">{o.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            o.status === "Pending" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                            o.status === "Accepted" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                            o.status === "Out For Delivery" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" :
                            o.status === "Delivered" ? "bg-blue-500/10 border-blue-500/30 text-blue-600" :
                            "bg-red-500/10 border-red-500/30 text-red-600"
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-dark/45 font-bold uppercase">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-brand-dark/50 uppercase tracking-widest">Set Status:</span>
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as WhatsAppOrder["status"])}
                          className="bg-brand-bg border border-brand-dark/35 rounded-xl py-1 px-3 text-xs focus:outline-none focus:border-brand-dark/70"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handlePrintOrderBill(o)}
                          className="px-3 py-1.5 bg-brand-gold hover:bg-brand-dark text-brand-dark hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-brand-dark/30 cursor-pointer shadow-xs"
                          title="Print Receipt / Order Bill"
                        >
                          <Printer size={13} />
                          <span>Print Bill</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      {/* Customer Details */}
                      <div>
                        <h4 className="font-bold text-brand-accent uppercase tracking-widest text-[9px] mb-2">Customer & Address</h4>
                        <p className="font-bold text-brand-dark text-sm">{o.customerName}</p>
                        <p className="text-brand-dark/65 mt-1">Mobile: +91 {o.phone}</p>
                        <p className="text-brand-dark/65 mt-1">Address: {o.address}</p>
                        <button
                          onClick={() => handlePrintOrderBill(o)}
                          className="mt-3 text-[10px] font-extrabold uppercase text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Printer size={12} />
                          <span>Print Order Bill Receipt</span>
                        </button>
                      </div>

                      {/* Items */}
                      <div className="md:col-span-2 space-y-2">
                        <h4 className="font-bold text-brand-accent uppercase tracking-widest text-[9px] mb-2">Items Ordered</h4>
                        <div className="space-y-1 bg-brand-bg/15 rounded-xl p-3">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span><strong>{it.name}</strong> x{it.quantity}</span>
                              <span>Rs. {it.price * it.quantity}</span>
                            </div>
                          ))}
                          <div className="border-t border-brand-dark/30 pt-2 mt-2 flex justify-between font-black text-brand-dark">
                            <span>Grand Total</span>
                            <span>Rs. {o.finalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent block mb-1">FRONT DESK CHECK-IN</span>
                <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Verification Counter & QR Scanner</h1>
                <p className="text-xs text-brand-dark/50 font-medium mt-1">
                  Scan customer reservation QR codes via live camera feed or enter IDs manually.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column - Scanner Console */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-dark/30 shadow-sm space-y-6">
                {/* Method Selector Tabs */}
                <div className="flex bg-brand-bg/40 p-1 rounded-2xl border border-brand-dark/20 gap-1">
                  <button
                    type="button"
                    onClick={() => { setScanMethod("camera"); setScanResult(null); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      scanMethod === "camera"
                        ? "bg-brand-gold text-brand-dark shadow-sm"
                        : "text-brand-dark/60 hover:text-brand-dark"
                    }`}
                  >
                    <Camera size={13} />
                    <span>Live Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setScanMethod("manual"); setScanResult(null); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      scanMethod === "manual"
                        ? "bg-brand-gold text-brand-dark shadow-sm"
                        : "text-brand-dark/60 hover:text-brand-dark"
                    }`}
                  >
                    <QrCode size={13} />
                    <span>Manual ID</span>
                  </button>
                </div>

                {/* Mode Selector (Booking vs Voucher vs Auto-Detect) */}
                <div className="flex items-center justify-between text-xs border-b border-brand-dark/10 pb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-dark/60">Verification Type:</span>
                  <div className="flex items-center gap-1">
                    {(["booking", "voucher", "all"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setVerificationMode(m); setScanResult(null); }}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          verificationMode === m
                            ? "bg-brand-accent text-white border-brand-accent"
                            : "bg-white text-brand-dark/60 border-brand-dark/20 hover:border-brand-dark/40"
                        }`}
                      >
                        {m === "booking" ? "Reservations" : m === "voucher" ? "Vouchers" : "Auto-Detect"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Scanner View depending on scanMethod */}
                {scanMethod === "camera" && (
                  <QRCameraView onScan={(text) => processValidation(text)} />
                )}

                {scanMethod === "manual" && (
                  <form onSubmit={handleScanCode} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">
                        {verificationMode === "booking" 
                          ? "Enter Reservation ID (from ticket or customer)" 
                          : verificationMode === "voucher" 
                          ? "Enter Loyalty Voucher Code" 
                          : "Enter Voucher Code or Reservation ID"}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder={verificationMode === "booking" ? "e.g. r-1002 or 1002" : "e.g. RSD-REWARD-..."}
                          value={scanInputCode}
                          onChange={(e) => setScanInputCode(e.target.value)}
                          className="flex-1 bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brand-dark/70 font-bold"
                          required
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer shrink-0"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column - Verification Screen */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-dark/30 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-brand-dark/10">
                  <h3 className="font-display font-black text-sm text-brand-dark uppercase tracking-wider">Verification Screen</h3>
                  {scanResult && (
                    <button
                      onClick={() => { setScanResult(null); setScanInputCode(""); }}
                      className="text-[10px] font-bold text-brand-accent hover:underline uppercase tracking-wider"
                    >
                      Reset / Scan Next
                    </button>
                  )}
                </div>

                {scanResult ? (
                  <div className={`p-6 rounded-2xl border ${
                    scanResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900"
                      : "bg-red-500/10 border-red-500/30 text-red-900"
                  } space-y-4`}>
                    <div className="flex items-start gap-3">
                      {scanResult.success ? <Check className="text-emerald-600 shrink-0 mt-0.5" size={24} /> : <X className="text-red-500 shrink-0 mt-0.5" size={24} />}
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-wide">
                          {scanResult.success 
                            ? (scanResult.booking ? "Verified Table Reservation" : "Voucher Authorized") 
                            : "Scan Verification Failed"}
                        </h4>
                        <p className="text-xs mt-1 font-medium leading-relaxed">{scanResult.message}</p>
                      </div>
                    </div>

                    {scanResult.booking && (
                      <div className="bg-white/80 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-2 text-brand-dark shadow-xs">
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Reservation ID</span>
                          <span className="text-brand-accent">{scanResult.booking.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Guest Name</span>
                          <span>{scanResult.booking.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Mobile Number</span>
                          <span>+91 {scanResult.booking.phone}</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Date & Time</span>
                          <span>{scanResult.booking.date} at {scanResult.booking.time}</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Guest Count</span>
                          <span>{scanResult.booking.guests} Guests</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-b border-brand-dark/10 pb-2">
                          <span className="text-brand-dark/50 font-bold">Status</span>
                          <span className="font-black text-emerald-600 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase">
                            {scanResult.booking.status}
                          </span>
                        </div>

                        {scanResult.booking.status !== "Completed" && (
                          <button
                            onClick={() => {
                              handleUpdateBookingStatus(scanResult.booking!.id, "Completed");
                              setScanResult({
                                ...scanResult,
                                booking: { ...scanResult.booking!, status: "Completed" },
                                message: `Reservation ${scanResult.booking!.id} marked as Completed!`
                              });
                            }}
                            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Check size={14} />
                            <span>Mark Reservation as Completed</span>
                          </button>
                        )}
                      </div>
                    )}

                    {scanResult.voucher && (
                      <div className="bg-white/80 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-2 text-brand-dark shadow-xs">
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Voucher Code</span>
                          <span className="text-brand-gold font-mono">{scanResult.voucher.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Discount Benefit</span>
                          <span className="text-emerald-600">{scanResult.voucher.discountPercent}% OFF</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-dark/10 pb-1.5 font-bold">
                          <span className="text-brand-dark/50">Status</span>
                          <span className="font-bold uppercase text-[10px]">{scanResult.voucher.status}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => { setScanResult(null); setScanInputCode(""); }}
                      className="w-full py-3 bg-brand-dark hover:bg-brand-accent text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer"
                    >
                      Scan Next Ticket
                    </button>
                  </div>
                ) : (
                  <div className="min-h-[280px] border border-dashed border-brand-dark/30 rounded-2xl flex flex-col items-center justify-center text-brand-dark/40 space-y-3 p-6 text-center">
                    <QrCode size={48} className="stroke-1 text-brand-gold/60" />
                    <div>
                      <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">Awaiting QR Code Scan</p>
                      <p className="text-[10px] text-brand-dark/50 mt-1 max-w-xs leading-relaxed">
                        Point camera at reservation ticket or enter ID to verify check-in status instantly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Restaurant Menu catalog</h1>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsCategoryAddMode(true)}
                  className="py-3 px-6 bg-white text-brand-dark border border-brand-dark/30 hover:bg-brand-dark hover:text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm animate-fade-in"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
                <button
                  onClick={() => {
                    setEditingDish({
                      title: "",
                      teluguTitle: "",
                      description: "",
                      price: "Rs. 250",
                      image: "",
                      category: "STARTERS",
                      isChefSpecial: false,
                      isPopular: false,
                      isSignature: false
                    });
                    setIsDishAddMode(true);
                  }}
                  className="py-3 px-6 bg-brand-gold text-brand-dark hover:bg-brand-accent hover:text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add New Item</span>
                </button>
              </div>
            </div>

            {/* Signature Showcase Section */}
            <div className="bg-gradient-to-br from-brand-gold/5 to-transparent rounded-3xl border border-brand-dark/35 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-black text-base text-brand-dark uppercase tracking-wider flex items-center gap-2">
                    <Star size={16} className="text-brand-gold fill-brand-gold" />
                    <span>Signature Dishes Showcase</span>
                  </h3>
                  <p className="text-[11px] text-brand-dark/50 mt-1">
                    Manage which dishes are featured in the prominent showcase on the homepage.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleToggleDishSignature(e.target.value, true);
                        e.target.value = "";
                      }
                    }}
                    className="bg-white border border-brand-dark/35 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-dark/70 max-w-[220px]"
                  >
                    <option value="">Feature a dish...</option>
                    {menu.filter((dish) => !dish.isSignature).map((dish) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.title} ({dish.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {menu.filter((dish) => dish.isSignature).length === 0 ? (
                <div className="border border-dashed border-brand-dark/35 rounded-2xl p-6 text-center text-brand-dark/45 text-xs">
                  No signature dishes selected. Select a dish from the dropdown above to feature it.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menu.filter((dish) => dish.isSignature).map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-white border border-brand-dark/30 hover:border-brand-dark/50 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {dish.isSignature && dish.image && (
                          <img
                            src={dish.image}
                            alt={dish.title}
                            className="w-12 h-12 rounded-xl object-cover border border-brand-dark/30 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-xs text-brand-dark truncate">
                              {dish.title}
                            </h4>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-gold/10 text-brand-gold font-bold uppercase shrink-0">
                              {dish.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-brand-dark/50 truncate mt-0.5">
                            {dish.description}
                          </p>
                          <p className="text-[10px] font-black text-brand-accent mt-1">
                            {dish.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingDish(dish);
                            setIsDishAddMode(false);
                          }}
                          className="p-1.5 text-brand-dark/45 hover:text-brand-accent hover:bg-brand-bg rounded-lg transition-colors cursor-pointer"
                          title="Edit dish info"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleDishSignature(dish.id, false)}
                          className="p-1.5 text-brand-dark/45 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove from signatures"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search, Filter Status, and Category Bar */}
            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-grow max-w-md">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search menu items by name, translation, description..."
                    value={menuSearchText}
                    onChange={(e) => setMenuSearchText(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-dark/35 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-brand-dark"
                  />
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {["All", "In Stock", "Out of Stock", "Visible", "Hidden"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMenuFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase border transition-all cursor-pointer ${
                        menuFilterStatus === st
                          ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                          : "bg-white text-brand-dark border-brand-dark/35 hover:border-brand-accent"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selectable Bar */}
              <div className="space-y-2 border-t border-brand-dark/10 pt-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-dark/45">FILTER BY CATEGORY</span>
                <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-brand-dark/20 scrollbar-track-transparent">
                  <button
                    type="button"
                    onClick={() => setMenuSelectedCategory("All")}
                    className={`flex items-center justify-center shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      menuSelectedCategory === "All"
                        ? "bg-brand-dark border-brand-dark text-white shadow-md"
                        : "bg-white border-brand-dark/20 hover:border-brand-dark/45 text-brand-dark"
                    }`}
                  >
                    ALL CATEGORIES
                  </button>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMenuSelectedCategory(cat)}
                      className={`flex items-center justify-center shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        menuSelectedCategory === cat
                          ? "bg-brand-dark border-brand-dark text-white shadow-md"
                          : "bg-white border-brand-dark/20 hover:border-brand-dark/45 text-brand-dark"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu List divided by categories */}
            <div className="space-y-6">
              {allCategories
                .filter((category) => menuSelectedCategory === "All" || category === menuSelectedCategory)
                .map((category) => {
                  const categoryDishes = filteredMenu.filter((dish) => dish.category === category);
                  if (categoryDishes.length === 0) return null;

                return (
                  <div key={category} className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-4 animate-fade-in">
                    <h3 className="font-display font-black text-sm text-brand-accent uppercase tracking-wider pb-2 border-b border-brand-dark/20">
                      {category} ({categoryDishes.length})
                    </h3>
                    <div className="divide-y divide-brand-dark/10">
                      {categoryDishes.map((dish) => (
                        <div key={dish.id} className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between py-4 first:pt-0 last:pb-0">
                          <div className="flex gap-4 items-center">
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.title}
                                className="w-16 h-16 rounded-2xl object-cover border border-brand-dark/30 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-brand-bg/50 border border-brand-dark/25 flex items-center justify-center shrink-0">
                                <ImageIcon size={20} className="text-brand-dark/30" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-black text-sm text-brand-dark leading-none">{dish.title}</h4>
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  VEG
                                </span>
                                {dish.isSignature && (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-gold/10 text-brand-gold border border-brand-dark/40 flex items-center gap-0.5">
                                    <Star size={8} className="fill-brand-gold text-brand-gold" />
                                    SIGNATURE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-brand-dark/50 mt-1 max-w-md">{dish.description}</p>
                              <p className="text-xs font-black text-brand-accent mt-1.5">{dish.price}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleToggleDishStock(dish.id, !dish.outOfStock)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                dish.outOfStock
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-white text-emerald-600 border-emerald-500/20 hover:border-emerald-600"
                              }`}
                            >
                              {dish.outOfStock ? "Out of Stock" : "In Stock"}
                            </button>

                            <button
                              onClick={() => handleToggleDishSignature(dish.id, !dish.isSignature)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                dish.isSignature
                                  ? "text-brand-gold hover:bg-brand-gold/10"
                                  : "text-brand-dark/30 hover:text-brand-gold hover:bg-brand-bg"
                              }`}
                              title={dish.isSignature ? "Remove from Signatures" : "Mark as Signature"}
                            >
                              <Star size={16} className={dish.isSignature ? "fill-brand-gold text-brand-gold" : ""} />
                            </button>

                            <button
                              onClick={() => handleToggleDishVisibility(dish.id, !dish.hidden)}
                              className="p-2 text-brand-dark/50 hover:bg-brand-bg rounded-xl transition-all cursor-pointer"
                              title={dish.hidden ? "Show on site" : "Hide from menu"}
                            >
                              {dish.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>

                            <button
                              onClick={() => {
                                setEditingDish(dish);
                                setIsDishAddMode(false);
                              }}
                              className="p-2 text-brand-dark/50 hover:bg-brand-bg rounded-xl transition-all cursor-pointer"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteDish(dish.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Uncategorized dishes */}
              {(() => {
                if (menuSelectedCategory !== "All") return null;
                const uncategorizedDishes = filteredMenu.filter((dish) => !allCategories.includes(dish.category));
                if (uncategorizedDishes.length === 0) return null;

                return (
                  <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-4">
                    <h3 className="font-display font-black text-sm text-red-600 uppercase tracking-wider pb-2 border-b border-brand-dark/20">
                      UNCATEGORIZED ({uncategorizedDishes.length})
                    </h3>
                    <div className="divide-y divide-brand-dark/10">
                      {uncategorizedDishes.map((dish) => (
                        <div key={dish.id} className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between py-4 first:pt-0 last:pb-0">
                          <div className="flex gap-4 items-center">
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.title}
                                className="w-16 h-16 rounded-2xl object-cover border border-brand-dark/30 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-brand-bg/50 border border-brand-dark/25 flex items-center justify-center shrink-0">
                                <ImageIcon size={20} className="text-brand-dark/30" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-black text-sm text-brand-dark leading-none">{dish.title}</h4>
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  VEG
                                </span>
                                {dish.isSignature && (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-gold/10 text-brand-gold border border-brand-dark/40 flex items-center gap-0.5">
                                    <Star size={8} className="fill-brand-gold text-brand-gold" />
                                    SIGNATURE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-brand-dark/50 mt-1 max-w-md">{dish.description}</p>
                              <p className="text-xs font-black text-brand-accent mt-1.5">{dish.price}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleToggleDishStock(dish.id, !dish.outOfStock)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                dish.outOfStock
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-white text-emerald-600 border-emerald-500/20 hover:border-emerald-600"
                              }`}
                            >
                              {dish.outOfStock ? "Out of Stock" : "In Stock"}
                            </button>

                            <button
                              onClick={() => handleToggleDishSignature(dish.id, !dish.isSignature)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                dish.isSignature
                                  ? "text-brand-gold hover:bg-brand-gold/10"
                                  : "text-brand-dark/30 hover:text-brand-gold hover:bg-brand-bg"
                              }`}
                              title={dish.isSignature ? "Remove from Signatures" : "Mark as Signature"}
                            >
                              <Star size={16} className={dish.isSignature ? "fill-brand-gold text-brand-gold" : ""} />
                            </button>

                            <button
                              onClick={() => handleToggleDishVisibility(dish.id, !dish.hidden)}
                              className="p-2 text-brand-dark/50 hover:bg-brand-bg rounded-xl transition-all cursor-pointer"
                              title={dish.hidden ? "Show on site" : "Hide from menu"}
                            >
                              {dish.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>

                            <button
                              onClick={() => {
                                setEditingDish(dish);
                                setIsDishAddMode(false);
                              }}
                              className="p-2 text-brand-dark/50 hover:bg-brand-bg rounded-xl transition-all cursor-pointer"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteDish(dish.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Gallery Image Manager</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Input */}
              <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 shadow-sm h-fit space-y-4">
                <h3 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wider">Add Photo to Gallery</h3>
                <form onSubmit={handleAddGalleryItem} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Photo URL</label>
                    <input
                      type="url"
                      placeholder="https://unsplash.com/..."
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Sizzling starters"
                      value={newGalleryTitle}
                      onChange={(e) => setNewGalleryTitle(e.target.value)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Category</label>
                    <select
                      value={newGalleryCategory}
                      onChange={(e) => setNewGalleryCategory(e.target.value as GalleryItem["category"])}
                      className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                    >
                      <option value="Dishes">Dishes</option>
                      <option value="Tandoor">Tandoor</option>
                      <option value="Sweets">Sweets</option>
                      <option value="Ambience">Ambience</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer"
                  >
                    Add Image URL
                  </button>
                </form>
              </div>

              {/* Gallery Grid */}
              <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wider">Active Photos Catalog</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((g) => (
                    <div key={g.id} className="relative rounded-2xl overflow-hidden group border border-brand-dark/25 shadow-sm aspect-video">
                      <img src={g.url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                        <span className="text-[9px] uppercase font-black tracking-wider text-brand-gold">{g.category}</span>
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-[10px] truncate font-bold leading-tight">{g.title}</p>
                          <button
                            onClick={() => handleDeleteGalleryItem(g.id)}
                            className="p-1 hover:bg-red-500 rounded text-red-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "homepage" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Homepage Content Management</h1>

            <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 shadow-sm max-w-2xl space-y-6">
              <h3 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wider">CMS Settings Console</h3>
              
              <form onSubmit={handleSaveCMS} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Hero Video Cloudinary/MP4 Link</label>
                  <input
                    type="url"
                    value={cmsHeroVideo}
                    onChange={(e) => setCmsHeroVideo(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                    required
                  />
                  <span className="text-[10px] text-brand-dark/45 italic">Direct video file links (.mp4) only. Used for the background loops.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Restaurant Opening Hours</label>
                  <input
                    type="text"
                    value={cmsTimings}
                    onChange={(e) => setCmsTimings(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Contact Phone Number</label>
                    <input
                      type="text"
                      value={cmsPhone}
                      onChange={(e) => setCmsPhone(e.target.value)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Support Email Address</label>
                    <input
                      type="email"
                      value={cmsEmail}
                      onChange={(e) => setCmsEmail(e.target.value)}
                      className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Restaurant Physical Address</label>
                  <textarea
                    value={cmsAddress}
                    onChange={(e) => setCmsAddress(e.target.value)}
                    rows={3}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer"
                >
                  Save Homepage configurations
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "promos" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Offers & Active Promotions</h1>

            {/* Discount Percent Control */}
            <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 shadow-sm max-w-md space-y-4">
              <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Global Discount Rate</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block mb-1.5">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cmsDiscount}
                    onChange={(e) => {
                      const newPercent = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      setCmsDiscount(newPercent);
                      setWebExclusiveTextInput((prev) => {
                        const base = prev || `Book a table online & get ${newPercent}% OFF your dining bill`;
                        return updateTextDiscountPercent(base, newPercent);
                      });
                      setReservationPromoInput((prev) => {
                        const base = prev || `Reserve your table through our website and receive ${newPercent}% OFF on your final dining bill.`;
                        return updateTextDiscountPercent(base, newPercent);
                      });
                    }}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                  />
                </div>
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/40 flex items-center justify-center">
                  <span className="font-display font-black text-xl text-brand-accent">{cmsDiscount}%</span>
                </div>
              </div>
              <p className="text-[10px] text-brand-dark/45 italic">This applies to all cart checkouts and is shown in all active promo banners below.</p>
              <button
                onClick={() => {
                  const updatedWebText = updateTextDiscountPercent(webExclusiveTextInput || `Book a table online & get ${cmsDiscount}% OFF your dining bill`, cmsDiscount);
                  const updatedResText = updateTextDiscountPercent(reservationPromoInput || `Reserve your table through our website and receive ${cmsDiscount}% OFF on your final dining bill.`, cmsDiscount);

                  db.updateSettings({
                    discountPercent: cmsDiscount,
                    webExclusiveText: updatedWebText,
                    reservationPromoText: updatedResText
                  });
                  setWebExclusiveTextInput(updatedWebText);
                  setReservationPromoInput(updatedResText);

                  (db as any).addAuditLog("Promo Updated", `Changed global discount to ${cmsDiscount}% and updated all active offer promo texts`);
                  loadData();
                  window.dispatchEvent(new Event("skd_settings_updated"));
                  window.dispatchEvent(new Event("storage"));
                  alert(`Global discount rate saved as ${cmsDiscount}%! All promo texts and discount banners updated.`);
                }}
                className="w-full py-3 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer"
              >
                Save Discount Rate
              </button>
            </div>

            {/* Promo Toggle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 — Web Exclusive Top Bar */}
              {(() => {
                const s = db.getSettings();
                const isOn = s.showWebExclusiveBar !== false;
                return (
                  <div className={`bg-white rounded-3xl p-6 border-2 shadow-sm space-y-4 transition-all ${isOn ? "border-emerald-400/50" : "border-red-300/40 opacity-75"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display font-black text-sm text-brand-dark uppercase tracking-wider">Web Exclusive Announcement Bar</p>
                        <p className="text-[11px] text-brand-dark/50 mt-1">Slim gold strip at the very top of every page</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 ${isOn ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-red-500/10 text-red-600 border border-red-500/30"}`}>
                        {isOn ? "LIVE" : "HIDDEN"}
                      </span>
                    </div>

                    {/* Text Editor field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Customize Announcement Text</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={webExclusiveTextInput}
                          onChange={(e) => setWebExclusiveTextInput(e.target.value)}
                          placeholder="e.g. Book a table online & get 10% OFF your dining bill"
                          className="flex-1 bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                        />
                        <button
                          onClick={() => {
                            db.updateSettings({ webExclusiveText: webExclusiveTextInput });
                            (db as any).addAuditLog("Promo Text Updated", `Changed Web Exclusive text to "${webExclusiveTextInput}" from Promos`);
                            loadData();
                            window.dispatchEvent(new Event("skd_settings_updated"));
                            window.dispatchEvent(new Event("storage"));
                            alert("Announcement text updated successfully!");
                          }}
                          className="px-4 py-2.5 sm:py-2 bg-brand-gold hover:bg-brand-dark text-brand-dark hover:text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer border border-brand-dark/30 w-full sm:w-auto shrink-0"
                        >
                          Save Text
                        </button>
                      </div>
                    </div>

                    {/* Reservation Desk Promo Text Editor field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Customize Reservation Desk Promo Text</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={reservationPromoInput}
                          onChange={(e) => setReservationPromoInput(e.target.value)}
                          placeholder="e.g. Reserve your table through our website and receive 10% OFF on your final dining bill."
                          className="flex-1 bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-brand-dark/70"
                        />
                        <button
                          onClick={() => {
                            db.updateSettings({ reservationPromoText: reservationPromoInput });
                            (db as any).addAuditLog("Promo Text Updated", `Changed Reservation Desk Promo text to "${reservationPromoInput}" from Promos`);
                            loadData();
                            window.dispatchEvent(new Event("skd_settings_updated"));
                            window.dispatchEvent(new Event("storage"));
                            alert("Reservation desk promo text updated successfully!");
                          }}
                          className="px-4 py-2.5 sm:py-2 bg-brand-gold hover:bg-brand-dark text-brand-dark hover:text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer border border-brand-dark/30 w-full sm:w-auto shrink-0"
                        >
                          Save Text
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className={`rounded-xl overflow-hidden text-center py-2 px-3 text-[10px] font-bold ${isOn ? "bg-[#132b15] text-brand-gold" : "bg-gray-100 text-gray-400 line-through"}`}>
                      🏷️ WEB EXCLUSIVE — {s.webExclusiveText || ("Book a table & get " + cmsDiscount + "% OFF your dining bill")} · [Book Now]
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={() => {
                          db.updateSettings({ showWebExclusiveBar: true });
                          (db as any).addAuditLog("Promo Enabled", "Enabled Web Exclusive announcement top bar");
                          loadData();
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${isOn ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-brand-dark border-brand-dark/40 hover:border-emerald-400"}`}
                      >
                        ✓ Enable
                      </button>
                      <button
                        onClick={() => {
                          db.updateSettings({ showWebExclusiveBar: false });
                          (db as any).addAuditLog("Promo Disabled", "Hid Web Exclusive announcement top bar from website");
                          loadData();
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${!isOn ? "bg-red-500 text-white border-red-500" : "bg-white text-brand-dark border-brand-dark/40 hover:border-red-400"}`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Card 2 — Menu Page Promo Banner */}
              {(() => {
                const s = db.getSettings();
                const isOn = s.showMenuPromo !== false;
                return (
                  <div className={`bg-white rounded-3xl p-6 border-2 shadow-sm space-y-4 transition-all ${isOn ? "border-emerald-400/50" : "border-red-300/40 opacity-75"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display font-black text-sm text-brand-dark uppercase tracking-wider">Menu Page Discount Banner</p>
                        <p className="text-[11px] text-brand-dark/50 mt-1">Promo strip shown at the top of the /menu page</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 ${isOn ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-red-500/10 text-red-600 border border-red-500/30"}`}>
                        {isOn ? "LIVE" : "HIDDEN"}
                      </span>
                    </div>

                    {/* Preview */}
                    <div className={`rounded-xl border-dashed border-2 p-3 text-[10px] leading-relaxed ${isOn ? "border-brand-dark/50 bg-white/40 text-brand-dark" : "border-gray-200 bg-gray-50 text-gray-400 line-through"}`}>
                      🎁 <strong>Reserve your table</strong> through our website and receive <span className="text-brand-accent font-bold">{cmsDiscount}% OFF</span> on your final dining bill.
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => {
                          db.updateSettings({ showMenuPromo: true });
                          (db as any).addAuditLog("Promo Enabled", "Enabled discount banner on /menu page");
                          loadData();
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${isOn ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-brand-dark border-brand-dark/40 hover:border-emerald-400"}`}
                      >
                        ✓ Enable
                      </button>
                      <button
                        onClick={() => {
                          db.updateSettings({ showMenuPromo: false });
                          (db as any).addAuditLog("Promo Disabled", "Removed discount banner from /menu page");
                          loadData();
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${!isOn ? "bg-red-500 text-white border-red-500" : "bg-white text-brand-dark border-brand-dark/40 hover:border-red-400"}`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Testimonials & Review Moderation</h1>

            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-brand-dark/30 rounded-2xl p-5 bg-white space-y-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-brand-dark text-sm">{r.name}</h4>
                        <p className="text-[10px] text-brand-dark/40 font-bold uppercase mt-0.5">{r.role} • {r.source}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        r.status === "Pending" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                        r.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                        "bg-red-500/10 border-red-500/30 text-red-600"
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs text-brand-dark/70 italic leading-relaxed">"{r.quote}"</p>

                    <div className="flex gap-2 justify-end pt-2 border-t border-brand-dark/20">
                      {r.status !== "Approved" && (
                        <button
                          onClick={() => handleUpdateReviewStatus(r.id, "Approved")}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== "Rejected" && (
                        <button
                          onClick={() => handleUpdateReviewStatus(r.id, "Rejected")}
                          className="px-4 py-2 border border-red-500/25 hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Customer Inbox</h1>

            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div key={c.id} className="border border-brand-dark/30 rounded-2xl p-5 bg-white space-y-3 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-brand-dark text-sm">{c.name}</h4>
                        <p className="text-[10px] text-brand-dark/40 font-bold mt-0.5">{c.email} • {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        c.status === "Pending" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                        "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="text-xs text-brand-dark/75 space-y-1 pt-1.5 border-t border-brand-dark/20">
                      <p><strong>Subject:</strong> {c.subject}</p>
                      <p className="mt-2 bg-brand-bg/10 p-3 rounded-xl italic">"{c.message}"</p>
                    </div>

                    {c.status === "Pending" && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleResolveContact(c.id)}
                          className="px-4 py-2 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-12 text-brand-dark/35">
                    <Mail size={32} className="mx-auto mb-2 opacity-50 text-brand-gold" />
                    <p className="text-xs font-semibold">Inbox is completely clean!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Customer Profiles database</h1>

            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="font-display font-bold text-sm text-brand-dark uppercase tracking-wider">Customer Profiles Directory</h3>
                  {selectedCustomers.length > 0 && (
                    <button
                      onClick={() => handleDeleteCustomers(selectedCustomers)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete Selected ({selectedCustomers.length})</span>
                    </button>
                  )}
                </div>
                <div className="relative w-full max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search directory..."
                    value={customerSearchText}
                    onChange={(e) => setCustomerSearchText(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2 px-9 text-xs focus:outline-none focus:border-brand-dark/70"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark/35 text-brand-dark/50 text-[10px] font-bold uppercase tracking-widest">
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={customerDatabase.length > 0 && customerDatabase.every(c => selectedCustomers.includes(c.phone))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allPhones = customerDatabase.map(c => c.phone);
                              setSelectedCustomers(Array.from(new Set([...selectedCustomers, ...allPhones])));
                            } else {
                              const allPhones = customerDatabase.map(c => c.phone);
                              setSelectedCustomers(selectedCustomers.filter(phone => !allPhones.includes(phone)));
                            }
                          }}
                          className="rounded border-brand-dark/35 text-brand-accent focus:ring-brand-accent cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Mobile</th>
                      <th className="py-3 px-4 text-center">Visits/Interactions</th>
                      <th className="py-3 px-4 text-center">Reservations</th>
                      <th className="py-3 px-4 text-center">WhatsApp Orders</th>
                      <th className="py-3 px-4 text-right">Est. Spend</th>
                      <th className="py-3 px-4 text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDatabase.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-brand-dark/40 font-medium">
                          No customer profiles found.
                        </td>
                      </tr>
                    ) : (
                      customerDatabase.map((c, idx) => (
                        <tr key={idx} className="border-b border-brand-dark/20 hover:bg-brand-bg/10 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(c.phone)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCustomers([...selectedCustomers, c.phone]);
                                } else {
                                  setSelectedCustomers(selectedCustomers.filter(phone => phone !== c.phone));
                                }
                              }}
                              className="rounded border-brand-dark/35 text-brand-accent focus:ring-brand-accent cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 font-bold">{c.name}</td>
                          <td className="py-3 px-4 text-brand-dark/70">+91 {c.phone}</td>
                          <td className="py-3 px-4 text-center font-bold">{c.visits}</td>
                          <td className="py-3 px-4 text-center font-bold text-brand-accent">{c.bookingsCount}</td>
                          <td className="py-3 px-4 text-center font-bold text-brand-gold">{c.ordersCount}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-600">Rs. {c.spend.toFixed(0)}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteCustomers([c.phone])}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete Customer Profile"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Title and Refresh Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent block mb-1">SECURITY & COMPLIANCE</span>
                <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Audit Trail Logs</h1>
                <p className="text-xs text-brand-dark/50 font-medium mt-1">
                  Review security-audited operations: who added dishes, exported databases, or modified site templates
                </p>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-4 py-2 border border-brand-dark/35 hover:border-brand-accent rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-white"
              >
                <RotateCw size={13} className="text-brand-dark" />
                <span>REFRESH</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm overflow-hidden p-6 space-y-6">
              {/* Date Filter Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-brand-dark/15 pb-3">
                  <div className="flex items-center gap-2 text-brand-dark/60">
                    <Calendar size={14} className="text-brand-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">FILTER BY DATE — SCROLL FOR OLDER DATES</span>
                  </div>
                  {selectedAuditDate && (
                    <button
                      onClick={() => {
                        const confirmText = `Are you sure you want to delete ALL audit logs for the date: ${selectedAuditDate}?\n\nThis will permanently delete them from both local storage and the database. This action CANNOT be undone.`;
                        if (window.confirm(confirmText)) {
                          (db as any).deleteAuditLogsByDate(selectedAuditDate);
                          setSelectedAuditDate(null);
                          loadData();
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-0.5 pr-2"
                    >
                      <span className="text-sm leading-none">×</span>
                      <span>CLEAR</span>
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => datePickerRef.current?.showPicker()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-dark/35 hover:border-brand-accent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
                    >
                      <Calendar size={12} className="text-brand-dark" />
                      <span>PICK DATE</span>
                    </button>
                    <input
                      ref={datePickerRef}
                      type="date"
                      className="absolute invisible pointer-events-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedAuditDate(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Horizontal Scrollable Date list */}
                <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-brand-dark/20 scrollbar-track-transparent">
                  {/* VIEW All Card */}
                  <button
                    onClick={() => setSelectedAuditDate(null)}
                    className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border transition-all cursor-pointer ${
                      selectedAuditDate === null
                        ? "bg-brand-dark border-brand-dark text-white shadow-md font-bold"
                        : "bg-white border-brand-dark/20 hover:border-brand-dark/40 text-brand-dark"
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider">VIEW</span>
                    <span className="text-lg font-black mt-1">All</span>
                  </button>
                  
                  {/* Dynamically generated date list */}
                  {datesList.map((dItem) => {
                    const isSelected = selectedAuditDate === dItem.dateString;
                    return (
                      <button
                        key={dItem.dateString}
                        onClick={() => setSelectedAuditDate(dItem.dateString)}
                        className={`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-dark border-brand-dark text-white shadow-md"
                            : "bg-white border-brand-dark/20 hover:border-brand-dark/40 text-brand-dark"
                        }`}
                      >
                        <span className={`text-[8px] font-black uppercase tracking-wider ${
                          isSelected ? "text-brand-gold" : dItem.isToday ? "text-amber-600" : "text-brand-dark/45"
                        }`}>
                          {dItem.label}
                        </span>
                        <span className="text-lg font-black leading-none mt-1">{dItem.day}</span>
                        <span className="text-[9px] font-bold text-brand-dark/50 mt-1 uppercase leading-none">{dItem.month}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Counter */}
                <div className="text-[10px] text-brand-dark/50 font-bold uppercase px-1">
                  Showing <span className="text-brand-dark font-extrabold">{filteredAuditLogs.length}</span> of <span className="text-brand-dark font-extrabold">{auditLogs.length}</span> total logs {selectedAuditDate ? `for ${selectedAuditDate}` : "(all dates)"}
                </div>
              </div>

              {/* Search and Action Filter */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t border-brand-dark/10 pt-4">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search by admin email or details"
                    value={logSearchText}
                    onChange={(e) => setLogSearchText(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/35 rounded-xl py-2.5 px-9 text-xs focus:outline-none focus:border-brand-dark/70"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedActionFilter}
                    onChange={(e) => setSelectedActionFilter(e.target.value)}
                    className="bg-white border border-brand-dark/35 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-brand-dark/70 w-full md:w-48 cursor-pointer uppercase font-bold text-[10px] tracking-wider"
                  >
                    <option value="All">ACTION FILTER</option>
                    {uniqueAuditActions.map((action) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark/35 text-brand-dark/50 text-[10px] font-bold uppercase tracking-widest">
                      <th className="py-3 px-4">ADMIN USER</th>
                      <th className="py-3 px-4">ACTION</th>
                      <th className="py-3 px-4">DETAILED DESCRIPTION</th>
                      <th className="py-3 px-4">IP ADDRESS</th>
                      <th className="py-3 px-4">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((l) => (
                      <tr key={l.id} className="border-b border-brand-dark/20 hover:bg-brand-bg/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-brand-accent whitespace-nowrap">{l.user}</td>
                        <td className="py-3 px-4 font-black whitespace-nowrap">{l.action}</td>
                        <td className="py-3 px-4 text-brand-dark/75">{l.details}</td>
                        <td className="py-3 px-4 font-semibold text-brand-dark/60 whitespace-nowrap">{getMockIp(l.id)}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-brand-dark/50">{new Date(l.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-brand-dark/45 font-semibold text-xs">
                          No security audit records match your query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "backups" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Maintenance Card */}
            <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm p-6 space-y-2">
              <div className="flex items-center gap-2 text-brand-accent">
                <Database size={16} className="text-brand-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest">SYSTEM MAINTENANCE</span>
              </div>
              <h1 className="font-display font-black text-2xl text-brand-dark uppercase tracking-wider">Backups & Database Reset</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Export entire database schemas, restore configuration from files, or re-run default seeders.</p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Export & Seeding */}
              <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="font-display font-black text-base text-brand-dark uppercase tracking-wider flex items-center gap-2">
                    <Download size={18} className="text-brand-accent" />
                    <span>Export & Default Seeding</span>
                  </h3>
                  <p className="text-[11px] text-brand-dark/50 mt-1">
                    Export full snapshot or restore template to factory defaults
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Download Section */}
                  <div className="bg-brand-bg/10 rounded-2xl p-5 border border-brand-dark/25 space-y-4">
                    <div>
                      <h4 className="font-bold text-xs text-brand-dark uppercase tracking-wider">Download DB Snapshot</h4>
                      <p className="text-[11px] text-brand-dark/65 mt-1 leading-relaxed">
                        Downloads a single, standalone JSON file containing all Categories, Dishes, Testimonials, Offers, Gallery Photos, Site Settings, and Audit Logs. Use this for server migrations.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsExportModalOpen(true);
                        setExportEmail("");
                        setExportPassword("");
                        setExportError("");
                        setExportSelections({
                          whatsappOrders: false,
                          reservations: false,
                          menuCms: false,
                          reviewsCms: false,
                          offersCms: false,
                          galleryCms: false,
                          customerInbox: false,
                          siteSettings: false
                        });
                      }}
                      className="py-3 px-6 bg-brand-dark hover:bg-brand-dark/95 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full md:w-auto"
                    >
                      <Download size={14} />
                      <span>Download Database JSON Backup</span>
                    </button>
                  </div>

                  {/* Re-seed Section */}
                  <div className="bg-brand-bg/10 rounded-2xl p-5 border border-brand-dark/25 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-red-600">
                        <ShieldAlert size={14} />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Re-seed Factory Defaults</h4>
                      </div>
                      <p className="text-[11px] text-brand-dark/65 mt-1 leading-relaxed">
                        Overwrites the database with default starter values. Useful for resetting local sandbox modifications or cleaning trash assets. Re-runs 'seed-cms.ts'
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerReseeding}
                      className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full md:w-auto"
                    >
                      <RotateCw size={14} />
                      <span>Trigger Database Re-Seeding</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Restore Snapshot */}
              <div className="bg-white rounded-3xl border border-brand-dark/30 shadow-sm p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-base text-brand-dark uppercase tracking-wider flex items-center gap-2">
                      <Upload size={18} className="text-brand-gold" />
                      <span>Restore Database Snapshot</span>
                    </h3>
                    <p className="text-[11px] text-brand-dark/50 mt-1">
                      Upload a JSON backup file to overwrite current configuration
                    </p>
                  </div>

                  {/* File Selector Dropzone */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setBackupFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="backup-upload-input"
                    />
                    <div className="border-2 border-dashed border-brand-dark/40 hover:border-brand-gold/45 rounded-2xl p-8 text-center bg-brand-bg/5 transition-all flex flex-col items-center justify-center space-y-3 min-h-[220px]">
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        <Upload size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-brand-dark">
                          {backupFile ? backupFile.name : "Select JSON Backup File"}
                        </p>
                        <p className="text-[10px] text-brand-dark/45">
                          {backupFile 
                            ? `Size: ${(backupFile.size / 1024).toFixed(1)} KB` 
                            : "Only .json files generated from this CMS portal are supported."
                          }
                        </p>
                      </div>
                      {backupFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setBackupFile(null);
                            const fileInput = document.getElementById("backup-upload-input") as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-[9px] font-bold uppercase transition-colors z-20 cursor-pointer"
                        >
                          Remove File
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRestoreBackup}
                  disabled={!backupFile}
                  className={`w-full py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                    backupFile
                      ? "bg-brand-accent hover:bg-brand-dark text-white cursor-pointer"
                      : "bg-brand-bg text-brand-dark/30 border border-brand-dark/30 cursor-not-allowed"
                  }`}
                >
                  <Upload size={14} />
                  <span>Restore Backup Snapshot</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reservation Meta Modal (Table Assign / Notes) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-sm text-brand-dark uppercase tracking-wider">Assign Reservation Table</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-brand-bg rounded-lg cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Assigned Table Number</label>
                <input
                  type="text"
                  placeholder="e.g. 5, 8, 12"
                  value={bookingTableNum}
                  onChange={(e) => setBookingTableNum(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-dark/70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Internal Check-In Notes</label>
                <textarea
                  placeholder="Internal notes for servers..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-dark/70 resize-none"
                />
              </div>

              <button
                onClick={handleSaveBookingMeta}
                className="w-full py-3 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer"
              >
                Confirm Table Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Edit Modal */}
      {editingDish && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-sm text-brand-dark uppercase tracking-wider">
                {isDishAddMode ? "Add New Dish Item" : "Edit Menu Item"}
              </h3>
              <button onClick={() => setEditingDish(null)} className="p-1 hover:bg-brand-bg rounded-lg cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Dish Title</label>
                  <input
                    type="text"
                    value={editingDish.title || ""}
                    onChange={(e) => setEditingDish({ ...editingDish, title: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Price String</label>
                  <input
                    type="text"
                    placeholder="e.g. Rs. 230"
                    value={editingDish.price || ""}
                    onChange={(e) => setEditingDish({ ...editingDish, price: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Description</label>
                <textarea
                  value={editingDish.description || ""}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  rows={2}
                  className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Photo URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /images/item.jpg or https://..."
                    value={editingDish.image || ""}
                    onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Category</label>
                  <select
                    value={editingDish.category || "STARTERS"}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">Telugu Title / Translation</label>
                <input
                  type="text"
                  placeholder="e.g. పన్నీర్ చట్పటా"
                  value={editingDish.teluguTitle || ""}
                  onChange={(e) => setEditingDish({ ...editingDish, teluguTitle: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70"
                />
              </div>

              <div className="flex flex-wrap gap-4 py-2">
                <label className="flex items-center gap-2 font-bold text-brand-dark uppercase text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isChefSpecial ?? false}
                    onChange={(e) => setEditingDish({ ...editingDish, isChefSpecial: e.target.checked })}
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Chef's Special</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-brand-dark uppercase text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isPopular ?? false}
                    onChange={(e) => setEditingDish({ ...editingDish, isPopular: e.target.checked })}
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Popular Item</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-brand-dark uppercase text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isSignature ?? false}
                    onChange={(e) => setEditingDish({ ...editingDish, isSignature: e.target.checked })}
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Signature Dish</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer"
              >
                Save Menu Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Delete Verification Modal */}
      {dishToDelete && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert size={20} />
                <h3 className="font-display font-black text-sm uppercase tracking-wider">
                  Authentication Required
                </h3>
              </div>
              <button 
                onClick={() => setDishToDelete(null)} 
                className="p-1 hover:bg-brand-bg rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-brand-dark/70 space-y-2">
              <p>
                To delete the menu item <strong className="text-brand-dark">{dishToDelete.title}</strong>, please authenticate by entering your admin credentials.
              </p>
            </div>

            <form onSubmit={handleConfirmDeleteDish} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">
                  Admin Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. owner"
                  value={deleteUsername}
                  onChange={(e) => setDeleteUsername(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">
                  Admin Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-brand-dark/30">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:border-brand-dark/70"
                    required
                  />
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDishToDelete(null)}
                  className="flex-1 py-3 bg-brand-bg hover:bg-brand-dark/5 text-brand-dark border border-brand-dark/35 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Credentials Modal for Backup */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-brand-dark/20 w-full max-w-md space-y-5 shadow-2xl text-brand-dark">
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-brand-dark leading-tight">
                Confirm Credentials
              </h3>
              <p className="text-xs text-brand-dark/65 leading-relaxed font-medium">
                Please verify your administrator credentials to download the database backup snapshot.
              </p>
            </div>

            {/* Checkbox Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-brand-dark/50 tracking-widest uppercase">
                  SELECT DATA TO EXPORT
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllExport}
                  className="text-[9px] font-black text-brand-accent hover:underline uppercase tracking-wider cursor-pointer"
                >
                  SELECT ALL
                </button>
              </div>

              <div className="bg-brand-bg/10 rounded-2xl p-4 border border-brand-dark/15">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.whatsappOrders}
                      onChange={(e) => setExportSelections({ ...exportSelections, whatsappOrders: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>WhatsApp Orders</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.reservations}
                      onChange={(e) => setExportSelections({ ...exportSelections, reservations: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Reservations</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.menuCms}
                      onChange={(e) => setExportSelections({ ...exportSelections, menuCms: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Menu CMS</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.reviewsCms}
                      onChange={(e) => setExportSelections({ ...exportSelections, reviewsCms: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Reviews CMS</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.offersCms}
                      onChange={(e) => setExportSelections({ ...exportSelections, offersCms: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Offers CMS</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.galleryCms}
                      onChange={(e) => setExportSelections({ ...exportSelections, galleryCms: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Gallery CMS</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.customerInbox}
                      onChange={(e) => setExportSelections({ ...exportSelections, customerInbox: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Customer Inbox</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-brand-dark/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelections.siteSettings}
                      onChange={(e) => setExportSelections({ ...exportSelections, siteSettings: e.target.checked })}
                      className="rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span>Site Settings</span>
                  </label>
                </div>
              </div>
            </div>

            <form onSubmit={handleDownloadBackup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-brand-dark/50 tracking-widest uppercase block">
                  ADMIN EMAIL
                </label>
                <input
                  type="text"
                  placeholder="admin@example.com"
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                  className="w-full bg-brand-bg/20 border border-brand-dark/25 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-dark/70 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-brand-dark/50 tracking-widest uppercase block">
                  ADMIN PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  className="w-full bg-brand-bg/20 border border-brand-dark/25 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-dark/70"
                  required
                />
              </div>

              {exportError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                  {exportError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 py-3 bg-brand-dark/5 hover:bg-brand-dark/10 text-brand-dark font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-accent hover:bg-brand-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  DOWNLOAD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add Modal */}
      {isCategoryAddMode && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-dark/30 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-sm text-brand-dark uppercase tracking-wider">
                Add New Category
              </h3>
              <button
                onClick={() => {
                  setIsCategoryAddMode(false);
                  setNewCategoryName("");
                }}
                className="p-1 hover:bg-brand-bg rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleaned = newCategoryName.trim().toUpperCase();
                if (!cleaned) return;
                if (allCategories.includes(cleaned)) {
                  alert("Category already exists!");
                  return;
                }
                const updated = [...customCategories, cleaned];
                setCustomCategories(updated);
                localStorage.setItem("skd_custom_categories", JSON.stringify(updated));
                
                // Add audit log
                (db as any).addAuditLog(
                  "Menu Category Added",
                  `Created new menu category "${cleaned}"`
                );
                
                setIsCategoryAddMode(false);
                setNewCategoryName("");
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-dark/35 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-dark/70 font-semibold"
                  placeholder="e.g. DESSERTS"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-accent hover:bg-brand-dark text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

