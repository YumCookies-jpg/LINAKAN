/**
 * LINAKAN E-Wallet Module
 * Manages wallet balances, transactions, and revenue model
 */

const WalletManager = (() => {
  /**
   * Top up wallet balance (for farmer or seller)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   * @param {string} method - Top-up method (e.g., 'bank_transfer', 'e_money')
   * @returns {object} - { success, newBalance, transaction }
   */
  const topUpWallet = (userId, amount, method = "bank_transfer") => {
    const user = DataManager.getFarmer(userId) || DataManager.getSeller(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newBalance = user.walletBalance + amount;
    const updateKey = user.livestock ? "farmer" : "seller";

    if (updateKey === "farmer") {
      DataManager.updateFarmer(userId, { walletBalance: newBalance });
    } else {
      DataManager.updateSeller(userId, { walletBalance: newBalance });
    }

    const transaction = {
      id: "topup_" + Date.now(),
      userId,
      type: "top_up",
      amount,
      method,
      newBalance,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    return {
      success: true,
      newBalance,
      transaction,
    };
  };

  /**
   * Process transaction payment
   * @param {object} transactionData - Transaction details
   * @returns {object} - { success, updatedTransaction, farmerBalance, sellerBalance }
   */
  const processTransaction = (transactionData) => {
    const farmer = DataManager.getFarmer(transactionData.farmerId);
    const seller = DataManager.getSeller(transactionData.sellerId);

    if (!farmer || !seller) {
      return { success: false, error: "Farmer or seller not found" };
    }

    const listing = DataManager.getListing(transactionData.listingId);
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    // Calculate amounts
    const priceBreakdown = PricingEngine.calculateSellerEarnings(
      listing.finalPrice,
    );
    const totalFarmerPays = listing.finalPrice + priceBreakdown.platformFee;
    const sellerReceives = priceBreakdown.amountReceived;

    // Check farmer has enough balance
    if (farmer.walletBalance < totalFarmerPays) {
      return {
        success: false,
        error: "Insufficient wallet balance",
        required: totalFarmerPays,
        available: farmer.walletBalance,
      };
    }

    // Update balances
    const newFarmerBalance = farmer.walletBalance - totalFarmerPays;
    const newSellerBalance = seller.walletBalance + sellerReceives;

    DataManager.updateFarmer(transactionData.farmerId, {
      walletBalance: newFarmerBalance,
    });
    DataManager.updateSeller(transactionData.sellerId, {
      walletBalance: newSellerBalance,
    });

    // Update listing status
    DataManager.updateListing(transactionData.listingId, {
      status: "reserved",
    });

    // Create transaction record
    const transaction = DataManager.createTransaction({
      ...transactionData,
      listingWeight: listing.weight,
      wasteCategory: listing.category,
      wasteName: listing.wasteName,
      totalPrice: listing.finalPrice,
      platformFee: priceBreakdown.platformFee,
      sellerReceives,
      farmerPays: totalFarmerPays,
      status: "confirmed",
    });

    return {
      success: true,
      updatedTransaction: transaction,
      farmerBalance: newFarmerBalance,
      sellerBalance: newSellerBalance,
      breakdown: {
        itemPrice: listing.finalPrice,
        platformFee: priceBreakdown.platformFee,
        totalFarmerPays,
        sellerReceives,
      },
    };
  };

  /**
   * Get wallet balance for a user
   * @param {string} userId - User ID
   * @returns {object} - { userId, balance, lastUpdate }
   */
  const getBalance = (userId) => {
    const farmer = DataManager.getFarmer(userId);
    const seller = DataManager.getSeller(userId);
    const user = farmer || seller;

    if (!user) {
      return null;
    }

    return {
      userId,
      balance: user.walletBalance,
      lastUpdate: new Date().toISOString(),
      formattedBalance: formatCurrency(user.walletBalance),
    };
  };

  /**
   * Get transaction history
   * @param {string} userId - User ID
   * @param {number} limit - Number of recent transactions
   * @returns {array} - Array of transactions
   */
  const getTransactionHistory = (userId, limit = 20) => {
    const transactions = DataManager.getTransactionsByUser(userId);
    return transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((txn) => ({
        ...txn,
        formattedDate: formatDate(new Date(txn.createdAt)),
        formattedAmount: formatCurrency(txn.totalPrice || txn.amount),
      }));
  };

  /**
   * Get wallet summary for seller
   * @param {string} sellerId - Seller ID
   * @returns {object} - Summary including balance, earnings, etc.
   */
  const getSellerWalletSummary = (sellerId) => {
    const seller = DataManager.getSeller(sellerId);
    if (!seller) return null;

    const transactions = DataManager.getTransactionsByUser(sellerId);
    const completedTransactions = transactions.filter(
      (t) => t.status === "completed" || t.status === "confirmed",
    );
    const totalEarnings = completedTransactions.reduce(
      (sum, t) => sum + (t.sellerReceives || 0),
      0,
    );

    return {
      userId: sellerId,
      name: seller.name,
      balance: seller.walletBalance,
      formattedBalance: formatCurrency(seller.walletBalance),
      totalEarnings: totalEarnings,
      formattedEarnings: formatCurrency(totalEarnings),
      totalTransactions: completedTransactions.length,
      averageEarningPerTransaction:
        completedTransactions.length > 0
          ? Math.round(totalEarnings / completedTransactions.length)
          : 0,
    };
  };

  /**
   * Get wallet summary for farmer
   * @param {string} farmerId - Farmer ID
   * @returns {object} - Summary including balance, spending, etc.
   */
  const getFarmerWalletSummary = (farmerId) => {
    const farmer = DataManager.getFarmer(farmerId);
    if (!farmer) return null;

    const transactions = DataManager.getTransactionsByUser(farmerId);
    const completedTransactions = transactions.filter(
      (t) => t.status === "completed" || t.status === "confirmed",
    );
    const totalSpent = completedTransactions.reduce(
      (sum, t) => sum + (t.farmerPays || 0),
      0,
    );

    return {
      userId: farmerId,
      name: farmer.name,
      balance: farmer.walletBalance,
      formattedBalance: formatCurrency(farmer.walletBalance),
      totalSpent: totalSpent,
      formattedSpent: formatCurrency(totalSpent),
      totalTransactions: completedTransactions.length,
      averageSpendPerTransaction:
        completedTransactions.length > 0
          ? Math.round(totalSpent / completedTransactions.length)
          : 0,
    };
  };

  /**
   * Request withdrawal (for seller)
   * @param {string} sellerId - Seller ID
   * @param {number} amount - Amount to withdraw
   * @param {string} bankAccount - Bank account details
   * @returns {object} - { success, withdrawalId, status, estimatedTime }
   */
  const requestWithdrawal = (sellerId, amount, bankAccount) => {
    const seller = DataManager.getSeller(sellerId);
    if (!seller) {
      return { success: false, error: "Seller not found" };
    }

    if (seller.walletBalance < amount) {
      return {
        success: false,
        error: "Insufficient balance",
        available: seller.walletBalance,
      };
    }

    const withdrawal = {
      id: "withdrawal_" + Date.now(),
      sellerId,
      amount,
      bankAccount,
      createdAt: new Date().toISOString(),
      status: "pending",
      estimatedProcessingTime: "1-3 business days",
      formattedAmount: formatCurrency(amount),
    };

    // In real system, update balance when withdrawal is confirmed
    // For now, just return pending status
    return {
      success: true,
      withdrawal,
      currentBalance: seller.walletBalance,
    };
  };

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format date
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  /**
   * Get platform revenue statistics (for admin)
   * @returns {object} - Platform fees collected, total transactions, etc.
   */
  const getPlatformRevenue = () => {
    const allTransactions = DataManager.getAllTransactions();
    const completedTransactions = allTransactions.filter(
      (t) => t.status === "completed" || t.status === "confirmed",
    );

    const totalFees = completedTransactions.reduce(
      (sum, t) => sum + (t.platformFee || 0),
      0,
    );
    const totalVolume = completedTransactions.reduce(
      (sum, t) => sum + (t.totalPrice || 0),
      0,
    );

    return {
      totalTransactions: completedTransactions.length,
      totalVolume: totalVolume,
      formattedVolume: formatCurrency(totalVolume),
      totalFees: totalFees,
      formattedFees: formatCurrency(totalFees),
      averageFeePerTransaction:
        completedTransactions.length > 0
          ? Math.round(totalFees / completedTransactions.length)
          : 0,
      feeRate: `${(DataManager.CONFIG.PLATFORM_FEE_RATE * 100).toFixed(0)}%`,
    };
  };

  // Public API
  return {
    topUpWallet,
    processTransaction,
    getBalance,
    getTransactionHistory,
    getSellerWalletSummary,
    getFarmerWalletSummary,
    requestWithdrawal,
    formatCurrency,
    formatDate,
    getPlatformRevenue,
  };
})();
