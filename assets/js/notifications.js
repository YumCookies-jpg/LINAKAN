/**
 * LINAKAN Notifications Module
 * Manages in-app notifications and alerts
 */

const NotificationManager = (() => {
  /**
   * Create a new notification
   * @param {object} notificationData - Notification details
   * @returns {object} - Created notification
   */
  const createNotification = (notificationData) => {
    const notification = {
      id: "notif_" + Date.now(),
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const notifications = JSON.parse(
      localStorage.getItem(DataManager.STORAGE_KEYS.NOTIFICATIONS) || "[]",
    );
    notifications.push(notification);
    localStorage.setItem(
      DataManager.STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(notifications),
    );

    // Show toast notification
    showToast(notification);

    return notification;
  };

  /**
   * Get unread notifications for a user
   * @param {string} userId - User ID
   * @returns {array} - Array of unread notifications
   */
  const getUnreadNotifications = (userId) => {
    const notifications = JSON.parse(
      localStorage.getItem(DataManager.STORAGE_KEYS.NOTIFICATIONS) || "[]",
    );
    return notifications.filter((n) => n.userId === userId && !n.read);
  };

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  const markAsRead = (notificationId) => {
    const notifications = JSON.parse(
      localStorage.getItem(DataManager.STORAGE_KEYS.NOTIFICATIONS) || "[]",
    );
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem(
        DataManager.STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications),
      );
    }
  };

  /**
   * Notify farmer of instant match
   * @param {string} farmerId - Farmer ID
   * @param {object} listing - Listing object
   * @param {number} compatibilityScore - Compatibility percentage
   */
  const notifyInstantMatch = (farmerId, listing, compatibilityScore) => {
    return createNotification({
      userId: farmerId,
      type: "instant_match",
      title: `Instant Match: ${listing.wasteName}`,
      message: `${listing.sellerName} memiliki limbah cocok untuk ternak Anda (${compatibilityScore}% cocok)`,
      listingId: listing.id,
      icon: "⚡",
      priority: "high",
    });
  };

  /**
   * Notify seller of new match
   * @param {string} sellerId - Seller ID
   * @param {object} listing - Listing object
   * @param {object} farmer - Farmer object
   * @param {number} compatibilityScore - Compatibility percentage
   */
  const notifySellerMatch = (sellerId, listing, farmer, compatibilityScore) => {
    return createNotification({
      userId: sellerId,
      type: "new_match",
      title: `Pembeli Potensial: ${farmer.name}`,
      message: `${farmer.name} tertarik dengan limbah ${listing.wasteName} Anda (${compatibilityScore}% cocok)`,
      listingId: listing.id,
      farmerId: farmer.id,
      icon: "👥",
      priority: "medium",
    });
  };

  /**
   * Notify of listing reserved
   * @param {string} sellerId - Seller ID
   * @param {object} listing - Listing object
   * @param {object} farmer - Farmer object
   */
  const notifyListingReserved = (sellerId, listing, farmer) => {
    return createNotification({
      userId: sellerId,
      type: "listing_reserved",
      title: "Limbah Dipesan",
      message: `${farmer.name} telah memesan limbah ${listing.wasteName} Anda`,
      listingId: listing.id,
      farmerId: farmer.id,
      icon: "📦",
      priority: "high",
    });
  };

  /**
   * Notify of transaction confirmation
   * @param {string} userId - User ID
   * @param {string} type - 'farmer' or 'seller'
   * @param {object} transaction - Transaction object
   */
  const notifyTransactionConfirmed = (userId, type, transaction) => {
    const title =
      type === "farmer" ? "Pembelian Dikonfirmasi" : "Penjualan Dikonfirmasi";
    const message =
      type === "farmer"
        ? `Pesanan Anda untuk ${transaction.wasteName} telah dikonfirmasi`
        : `Limbah ${transaction.wasteName} Anda telah dipesan`;

    return createNotification({
      userId,
      type: "transaction_confirmed",
      title,
      message,
      transactionId: transaction.id,
      icon: "✅",
      priority: "high",
    });
  };

  /**
   * Notify of wallet update
   * @param {string} userId - User ID
   * @param {number} amount - Amount added/deducted
   * @param {string} type - 'top_up', 'payment', 'earning'
   */
  const notifyWalletUpdate = (userId, amount, type) => {
    let title, message, icon;

    switch (type) {
      case "top_up":
        title = "Top Up Berhasil";
        message = `Dompet Anda ditambah Rp ${PricingEngine.formatPrice(amount)}`;
        icon = "💰";
        break;
      case "payment":
        title = "Pembayaran Berhasil";
        message = `Anda membayar Rp ${PricingEngine.formatPrice(amount)}`;
        icon = "💳";
        break;
      case "earning":
        title = "Penghasilan Diterima";
        message = `Anda menerima Rp ${PricingEngine.formatPrice(amount)}`;
        icon = "🎉";
        break;
    }

    return createNotification({
      userId,
      type: "wallet_update",
      title,
      message,
      amount,
      walletType: type,
      icon,
      priority: "medium",
    });
  };

  /**
   * Show toast notification UI
   * @param {object} notification - Notification object
   */
  const showToast = (notification) => {
    if (typeof document === "undefined") return; // For SSR compatibility

    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${notification.priority || "info"}`;
    toast.innerHTML = `
      <span class="toast-icon">${notification.icon || "📢"}</span>
      <div class="toast-content">
        <strong>${notification.title}</strong>
        <p>${notification.message}</p>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  };

  /**
   * Notify of expiring listing
   * @param {string} sellerId - Seller ID
   * @param {object} listing - Listing object
   */
  const notifyExpiringListing = (sellerId, listing) => {
    const expiryInfo = ShelfLifeManager.getExpiryInfo(
      listing.category,
      listing.createdAt,
    );

    return createNotification({
      userId: sellerId,
      type: "listing_expiring",
      title: "Limbah Segera Kadaluarsa",
      message: `Limbah ${listing.wasteName} akan kadaluarsa dalam ${expiryInfo.remainingHours} jam`,
      listingId: listing.id,
      icon: "⏰",
      priority: "high",
    });
  };

  /**
   * Get all notifications for a user (with pagination)
   * @param {string} userId - User ID
   * @param {number} limit - Number of notifications per page
   * @param {number} offset - Offset for pagination
   * @returns {object} - { notifications, total, unread }
   */
  const getNotifications = (userId, limit = 10, offset = 0) => {
    const allNotifications = JSON.parse(
      localStorage.getItem(DataManager.STORAGE_KEYS.NOTIFICATIONS) || "[]",
    );

    const userNotifications = allNotifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unread = userNotifications.filter((n) => !n.read).length;
    const paged = userNotifications.slice(offset, offset + limit);

    return {
      notifications: paged,
      total: userNotifications.length,
      unread,
      limit,
      offset,
    };
  };

  /**
   * Clear all notifications for a user
   * @param {string} userId - User ID
   */
  const clearNotifications = (userId) => {
    let notifications = JSON.parse(
      localStorage.getItem(DataManager.STORAGE_KEYS.NOTIFICATIONS) || "[]",
    );
    notifications = notifications.filter((n) => n.userId !== userId);
    localStorage.setItem(
      DataManager.STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(notifications),
    );
  };

  // Public API
  return {
    createNotification,
    getUnreadNotifications,
    markAsRead,
    notifyInstantMatch,
    notifySellerMatch,
    notifyListingReserved,
    notifyTransactionConfirmed,
    notifyWalletUpdate,
    notifyExpiringListing,
    getNotifications,
    clearNotifications,
    showToast,
  };
})();
