/**
 * LINAKAN Data & Storage Module
 * Manages all data persistence and in-memory state
 */

const DataManager = (() => {
  // Configuration Constants
  const CONFIG = {
    PLATFORM_FEE_RATE: 0.05, // 5% platform fee
    MIN_LISTING_WEIGHT: 2, // 2 kg minimum
    MAX_RADIUS: 15, // 15 km
    INSTANT_MATCH_THRESHOLD: 85, // 85% compatibility for instant match
  };

  // Waste Categories & Shelf Life
  const WASTE_CATEGORIES = {
    roti_kering: {
      id: "roti_kering",
      name: "Roti Kering",
      shelfLife: 14, // days
      compatibleLivestock: ["ayam", "bebek", "unggas_lainnya"],
    },
    tepung_afkir: {
      id: "tepung_afkir",
      name: "Tepung Afkir",
      shelfLife: 14,
      compatibleLivestock: ["ayam", "bebek", "unggas_lainnya"],
    },
    sisa_makanan_olahan: {
      id: "sisa_makanan_olahan",
      name: "Sisa Makanan Olahan",
      shelfLife: 1, // 24 hours
      compatibleLivestock: ["ayam", "bebek", "babi", "sapi"],
    },
    sayuran_mentah: {
      id: "sayuran_mentah",
      name: "Sayuran Mentah",
      shelfLife: 2, // 48 hours
      compatibleLivestock: ["sapi", "kambing", "kelinci"],
    },
  };

  // Livestock Types
  const LIVESTOCK_TYPES = {
    ayam: { id: "ayam", name: "Ayam" },
    bebek: { id: "bebek", name: "Bebek" },
    unggas_lainnya: { id: "unggas_lainnya", name: "Unggas Lainnya" },
    sapi: { id: "sapi", name: "Sapi" },
    kambing: { id: "kambing", name: "Kambing" },
    kelinci: { id: "kelinci", name: "Kelinci" },
    babi: { id: "babi", name: "Babi" },
  };

  // Seller Types
  const SELLER_TYPES = {
    irt: { id: "irt", name: "IRT" },
    bakery: { id: "bakery", name: "Bakery" },
    umkm_food: { id: "umkm_food", name: "UMKM Makanan" },
  };

  // Storage Keys
  const STORAGE_KEYS = {
    DATA_VERSION: "linakan_data_version",
    SELLERS: "linakan_sellers",
    FARMERS: "linakan_farmers",
    LISTINGS: "linakan_listings",
    TRANSACTIONS: "linakan_transactions",
    NOTIFICATIONS: "linakan_notifications",
    CURRENT_USER: "linakan_current_user",
  };

  /**
   * Initialize local storage with default data if empty
   */
  const initialize = () => {
    const seedVersion = "ui-polish-v2";
    const shouldReseed = localStorage.getItem(STORAGE_KEYS.DATA_VERSION) !== seedVersion;

    if (shouldReseed) {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(getDummySellers()));
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(getDummyFarmers()));
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(getDummyListings()));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, seedVersion);
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
      localStorage.setItem(
        STORAGE_KEYS.SELLERS,
        JSON.stringify(getDummySellers()),
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.FARMERS)) {
      localStorage.setItem(
        STORAGE_KEYS.FARMERS,
        JSON.stringify(getDummyFarmers()),
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
      localStorage.setItem(
        STORAGE_KEYS.LISTINGS,
        JSON.stringify(getDummyListings()),
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
  };

  /**
   * Dummy Data Generators
   */
  const getDummySellers = () => [
    {
      id: "seller1",
      name: "Bakery Sejahtera",
      type: "bakery",
      email: "bakery@linakan.id",
      phone: "+62812345678",
      location: "Jakarta Selatan",
      lat: -6.2297,
      lng: 106.8419,
      verified: true,
      joinDate: "2024-01-15",
      walletBalance: 500000,
      averageRating: 4.5,
      totalTransactions: 12,
    },
    {
      id: "seller2",
      name: "IRT Roti Lezat",
      type: "irt",
      email: "irt@linakan.id",
      phone: "+62812345679",
      location: "Tangerang",
      lat: -6.1728,
      lng: 106.6326,
      verified: true,
      joinDate: "2024-02-20",
      walletBalance: 250000,
      averageRating: 4.8,
      totalTransactions: 8,
    },
  ];

  const getDummyFarmers = () => [
    {
      id: "farmer1",
      name: "Pak Budi - Peternak Bebek",
      livestock: ["ayam", "bebek"],
      feedRequirements: "Tepung, sisa roti",
      capacity: 20, // kg/week
      email: "farmer1@linakan.id",
      phone: "+62812345680",
      location: "Cilandak",
      lat: -6.2784,
      lng: 106.8027,
      verified: true,
      joinDate: "2024-01-10",
      walletBalance: 1000000,
      averageRating: 4.7,
      totalTransactions: 15,
    },
    {
      id: "farmer2",
      name: "Kebun Sayur Mandiri",
      livestock: ["sapi", "kambing"],
      feedRequirements: "Sayuran, limbah makanan",
      capacity: 200,
      email: "farmer2@linakan.id",
      phone: "+62812345681",
      location: "Depok",
      lat: -6.403,
      lng: 106.8193,
      verified: true,
      joinDate: "2024-01-20",
      walletBalance: 750000,
      averageRating: 4.6,
      totalTransactions: 10,
    },
  ];

  const getDummyListings = () => [
    {
      id: "listing1",
      sellerId: "seller1",
      sellerName: "Bakery Sejahtera",
      sellerType: "bakery",
      wasteName: "Roti Kering Sisa Produksi",
      category: "roti_kering",
      weight: 12, // kg
      pricePerKg: 5000,
      totalPrice: 60000,
      suggestedPrice: 6000,
      finalPrice: 60000,
      imageUrl: "https://via.placeholder.com/400x300?text=Roti+Kering",
      location: "Jakarta Selatan",
      lat: -6.2297,
      lng: 106.8419,
      pickupAddress: "Jl. Terogong Raya No. 42, Jakarta",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "available",
      quality: "Baik",
      notes: "Roti kering sisa produksi kemarin",
    },
    {
      id: "listing2",
      sellerId: "seller2",
      sellerName: "IRT Roti Lezat",
      sellerType: "irt",
      wasteName: "Tepung Afkir",
      category: "tepung_afkir",
      weight: 20,
      pricePerKg: 4000,
      totalPrice: 80000,
      suggestedPrice: 5000,
      finalPrice: 80000,
      imageUrl: "https://via.placeholder.com/400x300?text=Tepung",
      location: "Tangerang",
      lat: -6.1728,
      lng: 106.6326,
      pickupAddress: "Jl. Balaraja No. 15, Tangerang",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "available",
      quality: "Sangat Baik",
      notes: "Tepung kualitas tinggi, sisa produksi",
    },
  ];

  /**
   * Seller Operations
   */
  const addSeller = (sellerData) => {
    const sellers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SELLERS) || "[]",
    );
    const newSeller = {
      id: "seller_" + Date.now(),
      ...sellerData,
      joinDate: new Date().toISOString().split("T")[0],
      verified: false,
      walletBalance: 0,
      averageRating: 0,
      totalTransactions: 0,
    };
    sellers.push(newSeller);
    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(sellers));
    return newSeller;
  };

  const getSeller = (sellerId) => {
    const sellers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SELLERS) || "[]",
    );
    return sellers.find((s) => s.id === sellerId);
  };

  const getAllSellers = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SELLERS) || "[]");
  };

  const updateSeller = (sellerId, updates) => {
    const sellers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SELLERS) || "[]",
    );
    const seller = sellers.find((s) => s.id === sellerId);
    if (seller) {
      Object.assign(seller, updates);
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(sellers));
    }
    return seller;
  };

  /**
   * Farmer Operations
   */
  const addFarmer = (farmerData) => {
    const farmers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FARMERS) || "[]",
    );
    const newFarmer = {
      id: "farmer_" + Date.now(),
      ...farmerData,
      joinDate: new Date().toISOString().split("T")[0],
      verified: false,
      walletBalance: 0,
      averageRating: 0,
      totalTransactions: 0,
    };
    farmers.push(newFarmer);
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
    return newFarmer;
  };

  const getFarmer = (farmerId) => {
    const farmers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FARMERS) || "[]",
    );
    return farmers.find((f) => f.id === farmerId);
  };

  const getAllFarmers = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FARMERS) || "[]");
  };

  const updateFarmer = (farmerId, updates) => {
    const farmers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FARMERS) || "[]",
    );
    const farmer = farmers.find((f) => f.id === farmerId);
    if (farmer) {
      Object.assign(farmer, updates);
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
    }
    return farmer;
  };

  /**
   * Listing Operations
   */
  const addListing = (listingData) => {
    const listings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]",
    );
    const newListing = {
      id: "listing_" + Date.now(),
      ...listingData,
      createdAt: new Date().toISOString(),
      status: "available",
    };
    listings.push(newListing);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    return newListing;
  };

  const getListing = (listingId) => {
    const listings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]",
    );
    return listings.find((l) => l.id === listingId);
  };

  const getAllListings = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]");
  };

  const getListingsByStatus = (status) => {
    const listings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]",
    );
    return listings.filter((l) => l.status === status);
  };

  const getListingsBySeller = (sellerId) => {
    const listings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]",
    );
    return listings.filter((l) => l.sellerId === sellerId);
  };

  const updateListing = (listingId, updates) => {
    const listings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]",
    );
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      Object.assign(listing, updates);
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    }
    return listing;
  };

  const deleteListing = (listingId) => {
    const listings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTINGS) || "[]",
    );
    const remainingListings = listings.filter((l) => l.id !== listingId);
    localStorage.setItem(
      STORAGE_KEYS.LISTINGS,
      JSON.stringify(remainingListings),
    );
    return remainingListings.length !== listings.length;
  };

  /**
   * Transaction Operations
   */
  const createTransaction = (transactionData) => {
    const transactions = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]",
    );
    const newTransaction = {
      id: "txn_" + Date.now(),
      ...transactionData,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    transactions.push(newTransaction);
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions),
    );
    return newTransaction;
  };

  const getTransaction = (transactionId) => {
    const transactions = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]",
    );
    return transactions.find((t) => t.id === transactionId);
  };

  const getAllTransactions = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
  };

  const getTransactionsByUser = (userId) => {
    const transactions = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]",
    );
    return transactions.filter(
      (t) => t.farmerId === userId || t.sellerId === userId,
    );
  };

  const updateTransaction = (transactionId, updates) => {
    const transactions = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]",
    );
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      Object.assign(transaction, updates);
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions),
      );
    }
    return transaction;
  };

  /**
   * Session Management
   */
  const setCurrentUser = (userId, userType) => {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify({ userId, userType }),
    );
  };

  const getCurrentUser = () => {
    const current = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return current ? JSON.parse(current) : null;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // Public API
  return {
    initialize,
    CONFIG,
    WASTE_CATEGORIES,
    LIVESTOCK_TYPES,
    SELLER_TYPES,
    STORAGE_KEYS,
    // Sellers
    addSeller,
    getSeller,
    getAllSellers,
    updateSeller,
    // Farmers
    addFarmer,
    getFarmer,
    getAllFarmers,
    updateFarmer,
    // Listings
    addListing,
    getListing,
    getAllListings,
    getListingsByStatus,
    getListingsBySeller,
    updateListing,
    deleteListing,
    // Transactions
    createTransaction,
    getTransaction,
    getAllTransactions,
    getTransactionsByUser,
    updateTransaction,
    // Session
    setCurrentUser,
    getCurrentUser,
    logout,
  };
})();

// Initialize data on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => DataManager.initialize());
} else {
  DataManager.initialize();
}
