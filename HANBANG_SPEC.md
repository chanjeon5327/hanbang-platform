# HANBANG Platform Specification (Baseline: 4:55 Video)

## 1. Design System & Layout
- **Theme:** Dark Mode Only (#000000 Background).
- **Color Palette:** Primary(#7c3aed), Success/Up(#ef4444), Sell/Down(#3b82f6), Text(#ffffff).
- **Global Navigation:** - **Top Header:** Fixed. Left: Logo, Right: Login/Join Button.
  - **Bottom Nav:** Fixed floating pill-shape bar. Icons: Home, Market, Wallet, Admin, MyPage. (Always visible).

## 2. Page: Main (Home) `app/page.tsx`
1.  **News Ticker (Top):** Purple background (#7c3aed, opacity 0.9). Rolling text (News/Notice).
2.  **Hero Section:** - Full-screen height. Background: Video iframe (Seventeen Concert) with `pointer-events: none`.
    - Content: Title "SEVENTEEN Stadium Tour", Sub "Ticket Revenue Share Open", Button "Invest Now".
    - Animation: Slide transition every 4 seconds.
3.  **Quick Menu Bar (Crucial):** - Located below Hero. 4 Cards Row: [Real-time Ranking], [New Listing], [Closing Soon], [Notice].
    - This section was missing in previous builds. MUST be included.
4.  **Why HANBANG:**
    - 3 Cards Grid: [Global Fandom Revenue], [Secure Blockchain], [My Created Asset].
    - Content must match the video text exactly.

## 3. Page: Market List `app/active-invest/page.tsx`
- **Filter:** Buttons (TRENDS, ALL, K-POP, DRAMA, MOVIE).
- **Grid Layout:** - Mobile: 1 Column (Full width cards).
  - PC: 3 Columns.
- **Card Item:** 16:9 Thumbnail. Title, Category, Returns(%), Price.
- **Interaction:** Hovering card plays the teaser video instantly.

## 4. Page: Product Detail (Trading) `app/active-invest/product/page.tsx`
**Layout Rule:** Single View (No Scroll, No Tabs hiding core features).
- **Left Column (65%):**
  - Top: YouTube Player (Autoplay).
  - Bottom: Price Chart (Canvas). *Chart updates ONLY on trade execution.*
- **Right Column (35%):**
  - **Section A (Order Book):** 5 Asks (Blue) / 5 Bids (Red). *Clicking price updates Order Form.*
  - **Section B (Order Form):** - Tabs: [Buy] / [Sell] AND [Limit] / [Market].
    - Inputs: Price, Quantity (Large +/- buttons).
    - Action: Large [Buy] / [Sell] Button.
  - **Section C (Chat):** Fixed at bottom right. Real-time user messages.

## 5. Core Logic (Rules)
- **Trade Execution:** Clicking 'Buy' button -> Decreases User Cash -> Increases User Stock -> *Then* Chart updates. (NO random fake movements).
- **Navigation:** Back button works. Logo links to Home. Bottom Nav works on all pages.
- **Data:** All text must match the video source exactly (e.g., "100만 뷰당 수익 정산").