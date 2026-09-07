/**
 * LINAKAN Pricing Engine Module
 * Calculates suggested prices and pricing logic
 */

const PricingEngine = (() => {
  // Base prices per category (per kg)
  const BASE_PRICES = {
    roti_kering: 6000,
    tepung_afkir: 5000,
    sisa_makanan_olahan: 8000,
    sayuran_mentah: 4000,
  };

  // Weight adjustment factors (higher volume = lower per-unit price)
  const WEIGHT_MULTIPLIERS = {
    light: { min: 0, max: 5, multiplier: 1.0 }, // 0-5 kg: full price
    medium: { min: 5, max: 20, multiplier: 0.95 }, // 5-20 kg: 5% discount
    heavy: { min: 20, max: 50, multiplier: 0.9 }, // 20-50 kg: 10% discount
    bulk: { min: 50, max: Infinity, multiplier: 0.85 }, // 50+ kg: 15% discount
  };

  /**
   * Calculate suggested price for a listing
   * This is a dummy pricing engine - replace with backend API later
   *
   * @param {string} category - Waste category ID
   * @param {number} weight - Weight in kg
   * @returns {object} - { basePrice, weightMultiplier, suggestedPrice, breakdown }
   */
  const calculateSuggestedPrice = (category, weight) => {
    const basePrice = BASE_PRICES[category] || 5000;

    // Determine weight multiplier
    let weightMultiplier = 1.0;
    let weightTier = "light";

    for (const [tier, config] of Object.entries(WEIGHT_MULTIPLIERS)) {
      if (weight >= config.min && weight < config.max) {
        weightMultiplier = config.multiplier;
        weightTier = tier;
        break;
      }
    }

    const adjustedPrice = Math.round(basePrice * weightMultiplier);
    const totalPrice = Math.round(adjustedPrice * weight);

    return {
      basePrice,
      weightMultiplier,
      weightTier,
      pricePerKg: adjustedPrice,
      totalPrice,
      breakdown: {
        basePrice: `Rp ${formatPrice(basePrice)}`,
        adjustment: `${((1 - weightMultiplier) * 100).toFixed(0)}% untuk ${weight}kg`,
        finalPerKg: `Rp ${formatPrice(adjustedPrice)}`,
        total: `Rp ${formatPrice(totalPrice)}`,
      },
    };
  };

  /**
   * Calculate total with platform fee
   * @param {number} totalPrice - Base listing price
   * @returns {object} - { subtotal, platformFee, total, feePercentage }
   */
  const calculateWithFee = (totalPrice) => {
    const feeRate = DataManager.CONFIG.PLATFORM_FEE_RATE;
    const platformFee = Math.round(totalPrice * feeRate);
    const total = totalPrice + platformFee;

    return {
      subtotal: totalPrice,
      platformFee,
      feePercentage: (feeRate * 100).toFixed(0),
      total,
      breakdown: {
        subtotal: `Rp ${formatPrice(totalPrice)}`,
        fee: `Rp ${formatPrice(platformFee)} (${(feeRate * 100).toFixed(0)}%)`,
        total: `Rp ${formatPrice(total)}`,
      },
    };
  };

  /**
   * Validate price override by seller
   * @param {number} suggestedPrice - Suggested price per kg
   * @param {number} overridePrice - Price overridden by seller
   * @returns {object} - { isValid, warning, adjustment }
   */
  const validatePriceOverride = (suggestedPrice, overridePrice) => {
    const variance = ((overridePrice - suggestedPrice) / suggestedPrice) * 100;

    let isValid = true;
    let warning = "";

    // Allow up to 50% adjustment
    if (Math.abs(variance) > 50) {
      isValid = false;
      warning =
        "Harga yang diajukan terlalu berbeda dari rekomendasi. Maksimal ±50%.";
    } else if (variance < -30) {
      warning = "Harga Anda jauh lebih rendah dari rekomendasi.";
    } else if (variance > 30) {
      warning = "Harga Anda jauh lebih tinggi dari rekomendasi.";
    }

    return {
      isValid,
      warning,
      variance: variance.toFixed(1),
      adjustment: `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%`,
    };
  };

  /**
   * Calculate farmer wallet impact (total they need to pay)
   * @param {number} itemPrice - Price of waste item
   * @returns {object} - { itemPrice, platformFee, total }
   */
  const calculateFarmerCheckout = (itemPrice) => {
    const fee = calculateWithFee(itemPrice);

    return {
      itemPrice,
      platformFee: fee.platformFee,
      totalToPay: fee.total,
      breakdown: fee.breakdown,
    };
  };

  /**
   * Calculate seller wallet impact (what they receive)
   * @param {number} itemPrice - Price of waste item
   * @returns {object} - { itemPrice, platformFee, amountReceived }
   */
  const calculateSellerEarnings = (itemPrice) => {
    const fee = calculateWithFee(itemPrice);
    const amountReceived = itemPrice - fee.platformFee;

    return {
      itemPrice,
      platformFee: fee.platformFee,
      amountReceived,
      breakdown: {
        itemPrice: `Rp ${formatPrice(itemPrice)}`,
        platformFee: `-Rp ${formatPrice(fee.platformFee)} (${fee.feePercentage}%)`,
        amountReceived: `Rp ${formatPrice(amountReceived)}`,
      },
    };
  };

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Get price recommendation text
   * @param {string} category - Category ID
   * @returns {string} - Recommendation text
   */
  const getPriceRecommendationText = (category) => {
    const categoryName =
      DataManager.WASTE_CATEGORIES[category]?.name || "Limbah";
    return `Rekomendasi harga untuk ${categoryName} berdasarkan kategori dan berat. Anda tetap dapat mengubah harga.`;
  };

  /**
   * Apply promotional discount (for future use)
   * @param {number} price - Original price
   * @param {number} discountPercent - Discount percentage
   * @returns {object} - { original, discount, discounted }
   */
  const applyDiscount = (price, discountPercent) => {
    const discount = Math.round(price * (discountPercent / 100));
    const discounted = price - discount;

    return {
      original: price,
      discountPercent,
      discount,
      discounted,
    };
  };

  // Public API
  return {
    calculateSuggestedPrice,
    calculateWithFee,
    validatePriceOverride,
    calculateFarmerCheckout,
    calculateSellerEarnings,
    formatPrice,
    getPriceRecommendationText,
    applyDiscount,
    BASE_PRICES,
  };
})();
