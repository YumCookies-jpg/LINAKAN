# LINAKAN UI Prototype --- Machine Skill Specification

## 0. Mission

Build a polished, responsive, competition-ready frontend prototype for
**LINAKAN**, a micro-scale food-waste supply and dynamic matching
platform connecting household/UMKM food-waste suppliers with local
farmers.

The prototype must use:

-   HTML
-   CSS
-   Vanilla JavaScript
-   No framework required
-   No backend required for V1
-   Dummy/local data and simulated business logic are acceptable
-   Clean, modular, well-organized files

The primary goal is to demonstrate the product concept, user journey,
matching mechanism, shelf-life logic, transaction flow, and a credible
revenue model through an e-wallet.

**Important:** Business rules from the PRD are strict. Improve UX/UI
freely, but do not alter or contradict the defined business logic.

------------------------------------------------------------------------

# 1. Source of Truth

The supplied PRD is the primary source of truth.

Core PRD scope:

1.  Micro-scale waste listing by IRT, bakery, and UMKM.
2.  Automatic shelf-life calculation.
3.  Farmer screening and matching based on waste category, animal/feed
    needs, and location.
4.  Instant Match notification.
5.  Buyer confirmation before a listing becomes reserved.
6.  Internal monitoring/dashboard capability.
7.  MVP does not require payment-gateway integration.
8.  Pickup is handled independently by the farmer/local agreement.
9.  Nutritional validation is category-based, not laboratory-grade.

The PRD defines waste categories and shelf-life rules including: - Dry
carbohydrate waste such as bread/flour: 14 days. - Processed/wet food
waste: 24--48 hours. - Raw vegetables: 48 hours.

The PRD also defines a maximum farmer matching radius of 15 km and an
Instant Match label when category/location compatibility reaches at
least 85%.

Minimum listing quantity for this prototype: **2 kg**.

The PRD originally lists CSV/Excel export as an open question. For this
prototype, implement **CSV/Excel export as a V1 admin feature**.

------------------------------------------------------------------------

# 2. Product Positioning

LINAKAN should feel like a **circular-economy startup**, not a generic
marketplace.

Visual personality:

-   Modern
-   Clean
-   Trustworthy
-   Sustainable
-   Practical
-   Friendly but professional
-   Appropriate for Indonesian IRT, UMKM, and farmers
-   Avoid overly futuristic "AI dashboard" aesthetics
-   Avoid excessive green gradients
-   Avoid childish illustrations

Suggested visual direction:

-   Off-white / warm neutral backgrounds
-   Deep natural green as the primary brand color
-   Secondary earthy tones
-   Dark charcoal text
-   Subtle borders
-   Soft shadows
-   Rounded but not excessively pill-shaped components
-   Strong information hierarchy

Create a lightweight LINAKAN design system using CSS variables.

------------------------------------------------------------------------

# 3. User Roles

There are exactly two customer-facing roles in this prototype:

## A. Seller / Penyuplai

Target users: - IRT - Bakery - Food UMKM

Primary responsibilities: - Create waste listing - Upload waste photo -
Enter waste category - Enter weight - Enter pickup location - Review
machine-generated price - Override suggested price if desired - Preview
listing - Publish listing - Monitor listing status - Receive transaction
information

## B. Farmer / Peternak

Primary responsibilities: - Define animal type - Define feed
requirements - Define storage/receiving capacity - Define location -
View Instant Match - Browse suitable waste - View compatibility - View
pickup location - Contact seller - Confirm & Buy - Monitor
active/reserved/completed transactions - Manage e-wallet balance and
transaction history

------------------------------------------------------------------------

# 4. Admin

The PRD requires an internal admin monitoring dashboard.

Admin is **not a primary customer-facing onboarding role**, but the
prototype must include an admin dashboard route/page so the concept can
be demonstrated.

Admin capabilities: - Monitor listings - Monitor sellers - Monitor
matching status - Monitor transactions - Filter listing status - View
supply/demand information - Export CSV/Excel

Required listing statuses:

-   available
-   reserved
-   completed
-   expired

Do not invent additional business statuses unless needed purely as a
visual/UI state.

------------------------------------------------------------------------

# 5. Information Architecture

Recommended structure:

/linakan /index.html /seller/ dashboard.html create-listing.html
preview-listing.html listings.html listing-detail.html transactions.html
/farmer/ dashboard.html onboarding.html instant-match.html
marketplace.html listing-detail.html transactions.html wallet.html
profile.html /admin/ dashboard.html listings.html transactions.html
reports.html /assets/ /css/ variables.css base.css components.css
layout.css responsive.css pages.css /js/ app.js data.js storage.js
matching.js shelf-life.js pricing.js wallet.js notifications.js admin.js
ui.js /images/ ... README.md

The machine may adjust the exact folder names, but the separation of
concerns must remain clear.

Do not place all CSS and JavaScript in one enormous file.

------------------------------------------------------------------------

# 6. Core Seller Journey

## Seller onboarding

Seller selects account type:

-   IRT
-   Bakery
-   UMKM makanan

Collect only information useful to the prototype.

## Seller dashboard

Show:

-   Active listings
-   Total available waste
-   Waste approaching expiry
-   Reserved waste
-   Completed transactions
-   Estimated earnings
-   Quick action: "Tambah Limbah"

## Create listing

Required fields:

1.  Waste name
2.  Waste category
3.  Weight in kg
4.  Waste photo
5.  Pickup location
6.  Suggested price
7.  Seller-adjusted price

Minimum weight: **2 kg**.

If less than 2 kg: - prevent publication - show clear validation -
explain that LINAKAN currently requires a minimum of 2 kg per listing

## Category examples

Use PRD-aligned examples:

-   Roti Kering
-   Tepung Afkir
-   Sisa Makanan Olahan
-   Sayuran Mentah

The UI may include "Lainnya" only if the prototype clearly handles
unsupported categories without falsely claiming compatibility.

------------------------------------------------------------------------

# 7. Shelf-Life Logic

Implement dummy but functional frontend logic.

Rules:

  Category                Shelf Life
  --------------------- ------------
  Roti Kering                14 days
  Tepung Afkir               14 days
  Sisa Makanan Olahan       24 hours
  Sayuran Mentah            48 hours

When seller selects a category: - calculate expiry automatically -
display remaining shelf life - display expiry date/time - show a visual
status

Example:

"Layak tayang hingga 16 Sep 2026"

or

"Tersisa 18 jam"

Do not ask the seller to manually enter expiry.

The system should visually support: - Fresh / safe - Expiring soon -
Expired

Expired listings must not appear in active matching results.

Because this is a frontend prototype, local/dummy state is sufficient.

------------------------------------------------------------------------

# 8. Pricing Engine

Add a frontend dummy pricing engine.

Business concept:

The system suggests a price based primarily on: - waste category -
available weight

Seller can accept or override the machine suggestion.

Do not present the suggested price as an externally validated market
price.

Use wording such as:

"Rekomendasi LINAKAN"

and

"Anda tetap dapat mengubah harga."

Suggested pricing must be implemented in a dedicated JS module so it can
easily be replaced by a backend API later.

Example architecture:

calculateSuggestedPrice(category, weight)

The exact formula may be a reasonable prototype assumption, but label it
as a recommendation rather than factual market pricing.

------------------------------------------------------------------------

# 9. Listing Preview

Before publication, seller MUST see a preview.

Preview should resemble the final farmer-facing listing card.

Show: - Waste image - Waste name - Category - Weight - Price/kg or total
price - Pickup area - Shelf-life/expiry - Seller type - Publish action -
Edit action

The preview is an important trust-building step.

------------------------------------------------------------------------

# 10. Farmer Onboarding

Farmer must specify:

1.  Animal/livestock type
2.  Feed requirements
3.  Receiving/storage capacity
4.  Location

Example livestock: - Bebek - Ayam - Unggas lainnya

The system must use these values in the matching UI.

Capacity is important because a farmer should not be recommended more
waste than their stated receiving capacity.

------------------------------------------------------------------------

# 11. Instant Match

Instant Match is the core product experience.

Farmer dashboard should prioritize:

### "Instant Match untuk Anda"

Each card should show:

-   Waste image
-   Waste category
-   Weight
-   Price
-   Distance
-   Compatibility percentage
-   Expiry countdown
-   "Instant Match" badge when eligible
-   CTA: "Lihat Detail"

Compatibility should conceptually combine:

1.  Waste/feed category compatibility
2.  Location/radius compatibility
3.  Farmer capacity suitability

PRD rule: - Maximum location radius: **15 km** - Instant Match label
threshold: **≥85% compatibility**

Do not display recommendations outside the allowed radius.

------------------------------------------------------------------------

# 12. Matching Logic

Create a dedicated `matching.js` module.

Use deterministic dummy rules.

Example conceptual scoring:

-   Category/feed compatibility: high weight
-   Distance compatibility: high weight
-   Capacity compatibility: supporting factor

Do not claim this prototype's score is scientifically validated.

The UI should clearly communicate:

"82% cocok"

rather than "82% nutrisi cocok" unless actual nutrition data exists.

PRD's nutritional matching is category-based.

Example:

Roti Kering → Bebek/Unggas

The prototype must make it obvious that LINAKAN is matching **usable
food-waste categories to stated livestock/feed needs**, not performing
laboratory nutritional analysis.

------------------------------------------------------------------------

# 13. Listing Detail --- Farmer

Detail page should contain:

-   Large waste image
-   Waste name
-   Category
-   Available weight
-   Price
-   Price calculation
-   Seller type
-   Pickup location
-   Distance
-   Shelf-life countdown
-   Compatibility score
-   Why this is a match
-   Seller contact CTA
-   "Konfirmasi & Beli"

The pickup area must have a map-style visual or map placeholder.

Since dynamic maps are outside the scope, use a polished static map/mock
map component.

Do not pretend that an actual map API is connected.

------------------------------------------------------------------------

# 14. Contact Seller

Provide a prominent:

"Hubungi Seller"

button.

For prototype purposes, this may: - open a modal - show a simulated
contact channel - or display a placeholder contact interface

Do not claim real messaging integration exists.

------------------------------------------------------------------------

# 15. Transaction Flow

When farmer clicks:

"Konfirmasi & Beli"

the UI should show a confirmation modal.

Show: - Item - Quantity - Price - Pickup location - Seller - Payment
method - Wallet balance - Total

Upon confirmation: - listing status changes from `available` to
`reserved` - transaction is created in dummy/local state - farmer
receives transaction confirmation - seller receives transaction
notification

The PRD explicitly requires buyer action before reservation/transaction
creation.

Do not automatically complete a transaction merely because a match
occurs.

------------------------------------------------------------------------

# 16. E-Wallet Revenue Model

The original PRD states that direct payment-gateway integration is out
of scope and MVP payment uses COD/manual transfer.

For this prototype, add an **e-wallet concept as a future-facing revenue
layer**, while keeping the prototype technically frontend-only.

Important: - Do not pretend a real payment gateway exists. - Do not
claim actual money movement. - Use simulated wallet balances and
transactions.

Recommended model:

### LINAKAN Wallet

Farmer: - Top up - Pay for waste - View balance - View transaction
history

Seller: - Receive transaction proceeds - View wallet balance - Request
withdrawal - View earnings

### LINAKAN revenue

Use a small platform service fee.

Example prototype:

"Biaya layanan LINAKAN"

The fee is displayed transparently before confirmation.

Do NOT hard-code an arbitrary percentage as an official business rule.
Store the prototype fee as a configurable constant so it can be changed
later.

Example:

PLATFORM_FEE_RATE = configurable demo value

The checkout breakdown should show:

Waste subtotal + LINAKAN service fee = Total

This allows the prototype to demonstrate a credible revenue mechanism
without misrepresenting real payment integration.

------------------------------------------------------------------------

# 17. Wallet UI

Wallet page should show:

-   Current balance
-   Recent transactions
-   Top up CTA
-   Withdrawal CTA for seller
-   Transaction status
-   Fee information

Use dummy data.

Top-up flow: 1. Select amount 2. Select simulated method 3. Confirm 4.
Update dummy balance 5. Show success feedback

Withdrawal flow: 1. Enter amount 2. Confirm 3. Show pending/simulated
success state

Clearly label prototype/simulation where appropriate.

------------------------------------------------------------------------

# 18. Notifications

Create a notification component.

Farmer notifications: - New Instant Match - Reservation confirmed -
Transaction update - Wallet update

Seller notifications: - New buyer match - Listing reserved - Transaction
update - Wallet proceeds

Use: - notification badge - dropdown/panel - timestamp - read/unread
state

------------------------------------------------------------------------

# 19. Admin Dashboard

Admin dashboard should feel operational and data-driven.

Top KPI cards:

-   Active Listings
-   Waste Available
-   Active Matches
-   Reserved
-   Completed
-   Expiring Soon

Additional sections:

### Supply

-   Waste by category
-   Weight available
-   Active sellers

### Demand

-   Farmers by livestock type
-   Feed demand
-   Receiving capacity

### Matching

-   Match rate
-   Instant Match count
-   Unmatched listings

### Transactions

Table with: - ID - Seller - Waste - Weight - Buyer - Status - Date -
Value

### Filters

Required status filters: - All - Available - Reserved - Completed -
Expired

------------------------------------------------------------------------

# 20. CSV / Excel Export

For V1, implement export behavior on the frontend.

At minimum: - Export listings - Export transactions

CSV export must work in the browser.

For Excel: - If no external library is used, provide a CSV-compatible
workflow and label it clearly. - If a lightweight client-side XLSX
library is introduced, keep it isolated and documented.

Do not add a backend dependency solely for exporting.

------------------------------------------------------------------------

# 21. Responsive Design

The prototype must be fully responsive.

### Desktop

Use: - sidebar navigation - dashboard cards - multi-column layout - data
tables

### Mobile

Use: - bottom navigation or compact navigation - stacked cards - large
touch targets - sticky primary CTA when useful - horizontally scrollable
tables where necessary

Never simply shrink the desktop UI.

Design mobile layouts intentionally.

------------------------------------------------------------------------

# 22. Component System

Create reusable UI components in vanilla JS/CSS.

Examples:

-   Navbar
-   Sidebar
-   Bottom navigation
-   Button
-   Badge
-   Status badge
-   Listing card
-   Match card
-   KPI card
-   Modal
-   Toast
-   Dropdown
-   Input
-   Select
-   File upload
-   Progress indicator
-   Countdown
-   Wallet balance card
-   Transaction row
-   Empty state
-   Skeleton/loading state
-   Map placeholder
-   Notification panel

Avoid duplicated HTML structures where reusable rendering functions can
be used.

------------------------------------------------------------------------

# 23. UX States

Every important interaction must account for:

-   Default
-   Hover
-   Focus
-   Active
-   Disabled
-   Loading
-   Empty
-   Error
-   Success
-   Expired
-   Reserved
-   Completed

Do not make the prototype look like a collection of static screenshots.

Interactions should visibly respond.

------------------------------------------------------------------------

# 24. Accessibility

Use:

-   semantic HTML
-   proper labels
-   keyboard-accessible controls
-   visible focus states
-   sufficient text contrast
-   descriptive button labels
-   alt text for images
-   logical heading hierarchy

Do not rely on color alone to communicate status.

------------------------------------------------------------------------

# 25. Data Architecture

Use dummy JSON/JS objects.

Keep sample data centralized in:

`assets/js/data.js`

Suggested entities:

``` text
users
sellerProfiles
farmerProfiles
wasteListings
matches
transactions
wallets
notifications
```

The structure should loosely mirror the PRD's conceptual data model:

-   users
-   waste_listings
-   transactions

Do not build an actual database for this prototype.

------------------------------------------------------------------------

# 26. Local State

Use `localStorage` where useful to simulate persistence.

Examples: - selected role - profile - listings - reservation status -
wallet balance - notifications - transaction state

Create a small storage abstraction rather than scattering `localStorage`
calls across every page.

------------------------------------------------------------------------

# 27. Demo Data

Provide realistic Indonesian sample data.

Example seller: "Roti Harian Ibu Sari" Type: UMKM

Example listing: "Roti Kering Sisa Produksi" Category: Roti Kering
Weight: 12 kg

Example farmer: "Pak Budi --- Peternak Bebek" Livestock: Bebek Capacity:
30 kg Location: local Indonesian context

Avoid using real private individuals or real addresses.

Use fictional locations.

------------------------------------------------------------------------

# 28. Brand System

Create the LINAKAN visual identity.

Suggested direction:

Brand idea: **"Limbah jadi pakan, manfaat berlanjut."**

Potential visual metaphor: - circular arrows - leaf - food grain -
connection/matching

Logo can be a simple text/shape treatment for prototype purposes.

Do not overdesign the logo.

Suggested typography: - modern sans-serif - highly readable -
Indonesian-friendly

Use CSS variables for: - primary - secondary - accent - background -
surface - text - muted - border - success - warning - danger

------------------------------------------------------------------------

# 29. Copywriting Rules

Primary UI language: **Bahasa Indonesia**.

Tone: - clear - warm - practical - trustworthy - concise

Avoid technical language in customer-facing UI.

Prefer:

"Temukan pakan dari limbah terdekat"

instead of:

"Execute waste matching engine."

Use "limbah makanan" or "food waste" consistently depending on context.

Avoid stigmatizing terms such as "sampah" when "limbah makanan" is more
appropriate in customer-facing copy.

------------------------------------------------------------------------

# 30. Important Business Constraints

The following must NOT be violated:

1.  Minimum listing quantity = 2 kg.
2.  Maximum farmer matching radius = 15 km.
3.  Instant Match threshold = ≥85% compatibility.
4.  Buyer must explicitly confirm before listing becomes reserved.
5.  Expired listings must not appear in active search/matching.
6.  Shelf-life depends on waste category.
7.  Farmer profile includes livestock type, feed needs, capacity, and
    location.
8.  Seller can override machine price recommendation.
9.  Pickup is independently handled; no dynamic courier routing.
10. No real payment gateway.
11. Wallet is simulated frontend functionality only.
12. No laboratory nutrition analysis.
13. Do not claim real-time backend synchronization.
14. Do not invent unsupported logistics functionality.
15. Do not invent scientific nutritional claims.

------------------------------------------------------------------------

# 31. Prototype Enhancements Allowed

The machine may add UX enhancements that improve clarity, including:

-   onboarding
-   empty states
-   contextual tooltips
-   confirmation modals
-   countdowns
-   visual matching explanations
-   wallet UI
-   activity timeline
-   transaction history
-   responsive navigation
-   demo role switcher
-   sample notifications

However, enhancements must not alter the core business rules.

------------------------------------------------------------------------

# 32. What NOT to Build

Do not build:

-   Real payment gateway
-   Real banking integration
-   Real courier routing
-   Dynamic delivery optimization
-   Laboratory nutrition analysis
-   Complex AI/ML model
-   Real-time WebSocket infrastructure
-   Production authentication backend
-   Production database
-   Real WhatsApp/API integration
-   Unverified market-price claims

The prototype should communicate these as future integrations where
relevant.

------------------------------------------------------------------------

# 33. Demo Mode

Include an optional clearly labeled demo mode.

Purpose: - allow judges/stakeholders to explore both roles quickly -
avoid requiring actual authentication

Example:

"Demo sebagai Seller" "Demo sebagai Peternak" "Demo Admin"

Do not make demo mode look like production authentication.

------------------------------------------------------------------------

# 34. Suggested End-to-End Demo

The prototype should support this story:

### Step 1

Enter as Seller.

### Step 2

Create: "Roti Kering Sisa Produksi --- 12 kg"

### Step 3

System automatically: - determines 14-day shelf life - generates
recommended price - shows pickup location - displays listing preview

### Step 4

Publish listing.

### Step 5

Switch to Farmer.

Farmer profile: - Bebek - Feed need: dry carbohydrate food waste -
Capacity: 20 kg - Location within 15 km

### Step 6

Dashboard displays: "Instant Match ditemukan!"

### Step 7

Open listing.

Show: - 92% cocok - 8 km away - 12 kg available - expiry countdown -
price - pickup point

### Step 8

Farmer clicks: "Konfirmasi & Beli"

### Step 9

Checkout shows: - item - subtotal - LINAKAN service fee - total - wallet
balance

### Step 10

Confirm.

System: - changes listing to reserved - creates transaction - deducts
simulated wallet balance - notifies seller

### Step 11

Seller dashboard shows: "Pesanan baru"

### Step 12

Admin dashboard reflects: - listing reserved - transaction created -
updated supply/demand data

This flow should work entirely with frontend dummy state.

------------------------------------------------------------------------

# 35. Code Quality

The machine must:

-   use semantic HTML
-   use modular CSS
-   use modular JS
-   avoid inline styles unless genuinely useful
-   avoid duplicated logic
-   use meaningful variable/function names
-   comment only where useful
-   keep data separate from rendering
-   keep business logic separate from UI logic
-   make constants configurable
-   avoid giant files

Every major business calculation should live in its own module.

Examples:

`shelf-life.js` `matching.js` `pricing.js` `wallet.js`

------------------------------------------------------------------------

# 36. Progressive Implementation

Build in this order:

## Phase 1 --- Foundation

-   folder structure
-   design tokens
-   base CSS
-   components
-   dummy data
-   navigation

## Phase 2 --- Seller

-   dashboard
-   create listing
-   validation
-   pricing recommendation
-   shelf-life calculation
-   preview
-   publish
-   listing management

## Phase 3 --- Farmer

-   onboarding/profile
-   dashboard
-   Instant Match
-   listing detail
-   pickup map placeholder
-   contact seller
-   checkout
-   transaction

## Phase 4 --- Wallet

-   wallet dashboard
-   simulated balance
-   service fee
-   top up
-   seller proceeds
-   withdrawal simulation

## Phase 5 --- Admin

-   KPIs
-   tables
-   filters
-   supply/demand
-   exports

## Phase 6 --- Polish

-   responsive behavior
-   empty/loading/error states
-   animations
-   accessibility
-   visual consistency
-   final demo flow

------------------------------------------------------------------------

# 37. Validation Checklist

Before considering the prototype complete, verify:

### Seller

-   [ ] Seller can create listing.
-   [ ] Minimum 2 kg is enforced.
-   [ ] Category is required.
-   [ ] Weight is required.
-   [ ] Image upload/preview works.
-   [ ] Pickup location is represented.
-   [ ] Shelf life is calculated automatically.
-   [ ] Suggested price appears.
-   [ ] Seller can override price.
-   [ ] Preview works.
-   [ ] Publish works.
-   [ ] Listing appears in seller dashboard.

### Farmer

-   [ ] Farmer can define livestock.
-   [ ] Farmer can define feed needs.
-   [ ] Farmer can define capacity.
-   [ ] Farmer can define location.
-   [ ] Matching results are shown.
-   [ ] Results are restricted to 15 km.
-   [ ] Compatibility score is shown.
-   [ ] Instant Match appears at ≥85%.
-   [ ] Expired listings are excluded.
-   [ ] Pickup location is visible.
-   [ ] Contact seller UI works.
-   [ ] Confirm & Buy works.

### Transaction

-   [ ] Confirmation is required.
-   [ ] Listing changes to reserved.
-   [ ] Transaction is created.
-   [ ] Seller receives notification.
-   [ ] Farmer receives confirmation.

### Wallet

-   [ ] Balance is displayed.
-   [ ] Service fee is transparent.
-   [ ] Simulated payment works.
-   [ ] Seller proceeds appear.
-   [ ] Wallet history works.
-   [ ] No real payment integration is implied.

### Admin

-   [ ] Listings visible.
-   [ ] Transactions visible.
-   [ ] Status filtering works.
-   [ ] KPIs work from dummy data.
-   [ ] CSV export works.
-   [ ] Excel-compatible export is documented/handled appropriately.

### Technical

-   [ ] Files are organized.
-   [ ] CSS is modular.
-   [ ] JS is modular.
-   [ ] No broken navigation.
-   [ ] No console errors.
-   [ ] Responsive desktop works.
-   [ ] Responsive mobile works.
-   [ ] Keyboard interaction is usable.

------------------------------------------------------------------------

# 38. Machine Behavior Rules

When requirements are ambiguous:

1.  Prefer the PRD.
2.  Prefer the explicit instructions in this file.
3.  Do not invent new business rules.
4.  If a visual decision is ambiguous, choose the simplest professional
    solution.
5.  If a technical feature is outside prototype scope, simulate it
    rather than pretending it is real.
6.  Keep future backend integration possible.
7.  Make important business rules configurable.
8.  Never hide important fees.
9.  Never create a transaction without explicit buyer confirmation.
10. Never show expired waste as an active match.
11. Never imply laboratory-grade nutritional matching.
12. Prioritize the Instant Match experience because it is the product's
    central differentiator.

------------------------------------------------------------------------

# 39. Final Quality Bar

The final prototype should look and feel like a credible early-stage
Indonesian circular-economy startup product that could be shown to:

-   competition judges
-   lecturers
-   potential partners
-   UMKM users
-   farmers

It must not look like: - a generic admin template - a generic e-commerce
clone - a static Figma-to-HTML dump - an AI-generated dashboard full of
meaningless charts

The product story must be immediately understandable:

**Food waste → smart matching → local farmer → useful feed → circular
value.**

The UI should make that story obvious within the first few seconds.
