/**
 * LINAKAN Shelf-Life Calculation Module
 * Manages expiry dates and shelf-life logic
 */

const ShelfLifeManager = (() => {
  /**
   * Calculate expiry date based on category and creation date
   * @param {string} category - Waste category ID
   * @param {string} createdAt - ISO date string when listing was created
   * @returns {object} - { expiryDate, remainingDays, remainingHours, status }
   */
  const getExpiryInfo = (category, createdAt) => {
    const created = new Date(createdAt);
    const shelfLife = DataManager.WASTE_CATEGORIES[category]?.shelfLife || 1;

    const expiryDate = new Date(created);
    expiryDate.setDate(expiryDate.getDate() + shelfLife);

    const now = new Date();
    const diffMs = expiryDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let status = "fresh";
    if (diffHours <= 0) {
      status = "expired";
    } else if (diffHours <= 12) {
      status = "expiring_soon";
    } else if (diffDays <= 1) {
      status = "expiring_soon";
    }

    const info = {
      expiryDate: expiryDate.toISOString(),
      expiryDateFormatted: formatDate(expiryDate),
      remainingDays: Math.max(0, diffDays),
      remainingHours: Math.max(0, diffHours),
      remainingHoursTotal: Math.max(0, diffHours),
      status,
      isExpired: diffHours <= 0,
      isExpiringIn24h: diffHours > 0 && diffHours <= 24,
      isExpiringIn48h: diffHours > 0 && diffHours <= 48,
    };

    if (info.isExpired) {
      info.message = "Listing ini sudah kadaluarsa";
    } else if (info.isExpiringIn24h) {
      info.message = `Layak tayang hingga ${info.expiryDateFormatted} (${formatTimeRemaining(info.remainingHours)})`;
    } else {
      info.message = `Layak tayang hingga ${info.expiryDateFormatted}`;
    }

    return info;
  };

  /**
   * Format date for display
   * @param {Date} date
   * @returns {string} - Formatted date string
   */
  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  /**
   * Format time remaining as human-readable text
   * @param {number} hours - Number of hours remaining
   * @returns {string} - Human-readable text
   */
  const formatTimeRemaining = (hours) => {
    if (hours <= 0) {
      return "Sudah Kadaluarsa";
    }

    if (hours < 24) {
      return `Tersisa ${Math.ceil(hours)} jam`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) {
      return `Tersisa ${days} hari`;
    }

    return `Tersisa ${days} hari`;
  };

  /**
   * Get status badge display
   * @param {string} status - Status from getExpiryInfo
   * @returns {object} - { badgeClass, icon, text }
   */
  const getStatusBadge = (status) => {
    const badges = {
      fresh: {
        badgeClass: "badge badge-success",
        icon: "✓",
        text: "Layak",
        color: "#00452d",
      },
      expiring_soon: {
        badgeClass: "badge badge-warning",
        icon: "⚠",
        text: "Segera Kadaluarsa",
        color: "#503700",
      },
      expired: {
        badgeClass: "badge badge-error",
        icon: "✗",
        text: "Kadaluarsa",
        color: "#b3261e",
      },
    };

    return badges[status] || badges.fresh;
  };

  /**
   * Filter listings that are not expired
   * @param {array} listings - Array of listing objects
   * @returns {array} - Filtered active listings
   */
  const filterActiveListings = (listings) => {
    return listings.filter((listing) => {
      const expiryInfo = getExpiryInfo(listing.category, listing.createdAt);
      return !expiryInfo.isExpired;
    });
  };

  /**
   * Sort listings by expiry (soonest first)
   * @param {array} listings - Array of listing objects
   * @returns {array} - Sorted listings
   */
  const sortByExpiry = (listings) => {
    return [...listings].sort((a, b) => {
      const expiryA = getExpiryInfo(a.category, a.createdAt);
      const expiryB = getExpiryInfo(b.category, b.createdAt);
      return expiryA.remainingHours - expiryB.remainingHours;
    });
  };

  /**
   * Get listings expiring soon (within 24 hours)
   * @param {array} listings - Array of listing objects
   * @returns {array} - Listings expiring within 24 hours
   */
  const getExpiringListings = (listings, hoursThreshold = 24) => {
    return listings.filter((listing) => {
      const expiryInfo = getExpiryInfo(listing.category, listing.createdAt);
      return (
        expiryInfo.remainingHours > 0 &&
        expiryInfo.remainingHours <= hoursThreshold
      );
    });
  };

  /**
   * Calculate shelf life for a category
   * @param {string} category - Waste category ID
   * @returns {object} - { category, shelfLifeDays, shelfLifeHours }
   */
  const getCategoryShelfLife = (category) => {
    const categoryData = DataManager.WASTE_CATEGORIES[category];
    if (!categoryData) {
      return null;
    }

    return {
      category,
      categoryName: categoryData.name,
      shelfLifeDays: categoryData.shelfLife,
      shelfLifeHours: categoryData.shelfLife * 24,
    };
  };

  /**
   * Generate expiry message for display
   * @param {string} category - Waste category ID
   * @param {string} createdAt - ISO date string
   * @returns {object} - { message, shelfLife, expiryDate }
   */
  const getExpiryMessage = (category, createdAt) => {
    const expiryInfo = getExpiryInfo(category, createdAt);
    const categoryData = DataManager.WASTE_CATEGORIES[category];

    return {
      message: expiryInfo.message,
      shelfLife: `${categoryData?.shelfLife || "N/A"} hari`,
      expiryDate: expiryInfo.expiryDateFormatted,
      expiryDateIso: expiryInfo.expiryDate,
      status: expiryInfo.status,
    };
  };

  /**
   * Calculate progress percentage for visual bar
   * @param {string} category - Waste category ID
   * @param {string} createdAt - ISO date string
   * @returns {number} - Percentage (0-100)
   */
  const getExpiryProgress = (category, createdAt) => {
    const expiryInfo = getExpiryInfo(category, createdAt);
    const categoryData = DataManager.WASTE_CATEGORIES[category];
    const totalHours = (categoryData?.shelfLife || 1) * 24;

    const usedHours = totalHours - expiryInfo.remainingHours;
    const percentage = Math.min(
      100,
      Math.max(0, (usedHours / totalHours) * 100),
    );

    return percentage;
  };

  // Public API
  return {
    getExpiryInfo,
    formatDate,
    formatTimeRemaining,
    getStatusBadge,
    filterActiveListings,
    sortByExpiry,
    getExpiringListings,
    getCategoryShelfLife,
    getExpiryMessage,
    getExpiryProgress,
  };
})();
