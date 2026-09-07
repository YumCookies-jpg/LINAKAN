/**
 * LINAKAN Matching Algorithm Module
 * Implements waste-to-farmer matching logic
 */

const MatchingEngine = (() => {
  /**
   * Calculate distance between two coordinates (simple Haversine)
   * @param {number} lat1, lng1 - Listing location
   * @param {number} lat2, lng2 - Farmer location
   * @returns {number} - Distance in km
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  };

  /**
   * Check if waste category is compatible with farmer's livestock
   * @param {string} wasteCategory - Waste category ID
   * @param {array} livestockTypes - Array of livestock type IDs
   * @returns {object} - { compatible, score, reasons }
   */
  const checkCategoryCompatibility = (wasteCategory, livestockTypes) => {
    const categoryData = DataManager.WASTE_CATEGORIES[wasteCategory];
    if (!categoryData) {
      return {
        compatible: false,
        score: 0,
        reasons: ["Kategori limbah tidak dikenali"],
      };
    }

    const compatibleWith = categoryData.compatibleLivestock;
    const matchingLivestock = livestockTypes.filter((lt) =>
      compatibleWith.includes(lt),
    );

    const compatible = matchingLivestock.length > 0;
    const score = compatible ? 100 : 0;

    const reasons = compatible
      ? [
          `Cocok untuk ternak: ${matchingLivestock.map((lt) => DataManager.LIVESTOCK_TYPES[lt]?.name).join(", ")}`,
        ]
      : [`${categoryData.name} tidak cocok untuk ternak Anda`];

    return {
      compatible,
      score,
      reasons,
      matchingLivestock,
    };
  };

  /**
   * Check location radius compatibility
   * @param {object} listing - Listing object with lat/lng
   * @param {object} farmer - Farmer object with lat/lng
   * @returns {object} - { compatible, distance, score }
   */
  const checkLocationCompatibility = (listing, farmer) => {
    const distance = calculateDistance(
      listing.lat,
      listing.lng,
      farmer.lat,
      farmer.lng,
    );
    const maxRadius = DataManager.CONFIG.MAX_RADIUS;
    const compatible = distance <= maxRadius;

    // Score: 100 if < 5km, decreasing to 0 at max radius
    let score = 0;
    if (distance <= 5) {
      score = 100;
    } else if (distance <= maxRadius) {
      score = Math.round(100 * ((maxRadius - distance) / (maxRadius - 5)));
    }

    return {
      compatible,
      distance,
      maxRadius,
      score,
      distanceText: `${distance} km`,
    };
  };

  /**
   * Check capacity compatibility
   * @param {number} listing weight - Listing weight in kg
   * @param {number} farmerCapacity - Farmer capacity in kg/week
   * @returns {object} - { compatible, score, reasons }
   */
  const checkCapacityCompatibility = (listingWeight, farmerCapacity) => {
    // Simple check: listing weight should not exceed 50% of weekly capacity
    const maxPercentage = 0.5;
    const threshold = farmerCapacity * maxPercentage;
    const compatible = listingWeight <= threshold;

    let score = 0;
    if (compatible) {
      // Score based on how well it fits the capacity
      score = Math.min(100, Math.round((listingWeight / threshold) * 100));
    } else {
      // Partial score if over capacity
      score = Math.max(0, Math.round((threshold / listingWeight) * 100));
    }

    return {
      compatible,
      score,
      listingWeight,
      farmerCapacity,
      usagePercentage: Math.round((listingWeight / farmerCapacity) * 100),
      reasons: [
        `Beban limbah: ${listingWeight}kg / Kapasitas mingguan: ${farmerCapacity}kg`,
      ],
    };
  };

  /**
   * Calculate overall compatibility score
   * Weights:
   * - Category compatibility: 40%
   * - Location compatibility: 40%
   * - Capacity compatibility: 20%
   *
   * @param {object} listing - Listing object
   * @param {object} farmer - Farmer object
   * @returns {object} - { score, isInstantMatch, details }
   */
  const calculateCompatibility = (listing, farmer) => {
    // Check if listing is expired
    const expiryInfo = ShelfLifeManager.getExpiryInfo(
      listing.category,
      listing.createdAt,
    );
    if (expiryInfo.isExpired) {
      return {
        score: 0,
        isInstantMatch: false,
        expired: true,
        details: {
          categoryScore: 0,
          locationScore: 0,
          capacityScore: 0,
        },
      };
    }

    const categoryCheck = checkCategoryCompatibility(
      listing.category,
      farmer.livestock,
    );
    const locationCheck = checkLocationCompatibility(listing, farmer);
    const capacityCheck = checkCapacityCompatibility(
      listing.weight,
      farmer.capacity,
    );

    // Weighted score calculation
    const weights = {
      category: 0.4,
      location: 0.4,
      capacity: 0.2,
    };

    const score = Math.round(
      categoryCheck.score * weights.category +
        locationCheck.score * weights.location +
        capacityCheck.score * weights.capacity,
    );

    const threshold = DataManager.CONFIG.INSTANT_MATCH_THRESHOLD;
    const isInstantMatch = score >= threshold;

    return {
      score,
      isInstantMatch,
      threshold,
      details: {
        categoryScore: categoryCheck.score,
        categoryReasons: categoryCheck.reasons,
        locationScore: locationCheck.score,
        distance: locationCheck.distance,
        capacityScore: capacityCheck.score,
        capacityPercentage: capacityCheck.usagePercentage,
      },
    };
  };

  /**
   * Get matching listings for a farmer (with scores)
   * @param {object} farmer - Farmer object
   * @param {array} listings - Array of listings
   * @returns {array} - Sorted array of { listing, score, isInstantMatch }
   */
  const findMatchesForFarmer = (farmer, listings = null) => {
    const allListings = listings || DataManager.getAllListings();

    // Filter active, non-expired listings
    const activeListings = allListings.filter((l) => l.status === "available");
    const validListings = ShelfLifeManager.filterActiveListings(activeListings);

    // Calculate matches
    const matches = validListings
      .map((listing) => ({
        listing,
        ...calculateCompatibility(listing, farmer),
      }))
      .filter(
        (m) =>
          m.score > 0 &&
          !m.expired &&
          m.details.distance <= DataManager.CONFIG.MAX_RADIUS,
      )
      .sort((a, b) => b.score - a.score); // Sort by score descending

    return matches;
  };

  /**
   * Get buyers for a listing (reverse matching)
   * @param {object} listing - Listing object
   * @param {array} farmers - Array of farmers
   * @returns {array} - Sorted array of { farmer, score, isInstantMatch }
   */
  const findBuyersForListing = (listing, farmers = null) => {
    const allFarmers = farmers || DataManager.getAllFarmers();

    // Calculate matches
    const matches = allFarmers
      .map((farmer) => ({
        farmer,
        ...calculateCompatibility(listing, farmer),
      }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    return matches;
  };

  /**
   * Get instant matches (high compatibility)
   * @param {object} farmer - Farmer object
   * @returns {array} - Listings with 85%+ compatibility
   */
  const getInstantMatches = (farmer) => {
    const matches = findMatchesForFarmer(farmer);
    return matches.filter((m) => m.isInstantMatch);
  };

  /**
   * Get explanation text for compatibility score
   * @param {object} matchResult - Result from calculateCompatibility
   * @returns {string} - Human-readable explanation
   */
  const getCompatibilityExplanation = (matchResult) => {
    const { score, details } = matchResult;
    const threshold = DataManager.CONFIG.INSTANT_MATCH_THRESHOLD;

    let explanation = `Kompatibilitas: ${score}%\n\n`;

    if (matchResult.isInstantMatch) {
      explanation +=
        "✓ Instant Match - Limbah ini sangat cocok untuk Anda!\n\n";
    }

    explanation += `Kategori: ${details.categoryScore}%\n`;
    if (details.categoryReasons && details.categoryReasons.length > 0) {
      explanation += `  ${details.categoryReasons[0]}\n\n`;
    }

    explanation += `Lokasi: ${details.locationScore}% (${details.distance} km)\n`;
    explanation += `Kapasitas: ${details.capacityScore}% (${details.capacityPercentage}% dari kapasitas mingguan)\n`;

    return explanation;
  };

  /**
   * Validate matching (for display purposes)
   * @param {array} matches - Array of match results
   * @returns {object} - Statistics
   */
  const getMatchingStats = (matches) => {
    const total = matches.length;
    const instantMatches = matches.filter((m) => m.isInstantMatch).length;
    const highCompatibility = matches.filter((m) => m.score >= 70).length;

    return {
      total,
      instantMatches,
      highCompatibility,
      percentInstant:
        total > 0 ? Math.round((instantMatches / total) * 100) : 0,
    };
  };

  // Public API
  return {
    calculateDistance,
    checkCategoryCompatibility,
    checkLocationCompatibility,
    checkCapacityCompatibility,
    calculateCompatibility,
    findMatchesForFarmer,
    findBuyersForListing,
    getInstantMatches,
    getCompatibilityExplanation,
    getMatchingStats,
  };
})();
