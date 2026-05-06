# ASIAZE – Mobile App + Admin CMS Product Requirements Document

## Brand Guidelines
- Brand Name: ASIAZE
- Primary Color: Crimson Red `#DC143C`
- Secondary Colors: White, Black
- UI Style: Modern, minimal, clean, premium, high readability
- Platform: React Native Mobile App (Android + iOS) + Web Admin Dashboard CMS
- Content Style: Inshorts-style short news + Reels + Category-first content

---

# PART 1: USER MOBILE APP

## Bottom Navigation (Only 3 Icons)
1. Search / Explore
2. Home Feed
3. Profile

---

## 1. Splash Screen
### Features
- Full red background
- White centered ASIAZE logo
- Minimal layout
- Auto redirect after 2–3 seconds

### Flow
- First-time user → onboarding
- Existing user → home feed

---

## 2. Onboarding (3 Intro Slides)
### Slide 1
- Stay Updated in Seconds
- Short news concept

### Slide 2
- News in English, Hindi & Bengali
- Language support explanation

### Slide 3
- Watch Short News Reels Instantly
- Reels/video explanation

### Features
- Progress dots
- Next / Get Started CTA

---

## 3. Authentication

### Login Screen
- Email / Phone
- Password
- Google Login
- Facebook Login
- Login CTA
- Sign Up link

### Signup Screen
- Full Name
- Email / Phone
- Password
- Social signup

### OTP Verification
- 6 digit OTP input
- Verify button
- Resend option

---

## 4. Language + Category Preference Setup
### Language Toggle
- English
- Hindi
- Bengali

### Category Selection
- Politics
- Sports
- Business
- Technology
- Entertainment
- Lifestyle
- Finance
- Health
- Good News

### Flow
- Save preferences → Home Feed

---

## 5. Home Feed (Main Screen)

## Core Logic
- One news card visible at a time
- Maximum 60-word summary
- Vertical swipe navigation
- Swipe up/down loads next/previous news
- No read more button
- Tapping entire card opens Full Article screen

## Layout
### Header
- Search bar at top
- Horizontal scrollable categories bar
- Active category highlighted
- Breaking news banner

### News Card
- Image
- Headline
- 60-word summary
- Small bookmark button
- Small share button

### Notes
- Admin must provide full article link for every news card

---

## 6. Full Article Screen

## Behavior
- Opens when user taps any news card
- Opens inside in-app web view

## Layout
- Back button
- Source/category title
- Share button
- Feature image
- Headline
- Subheadline
- Source + publish time
- Full article body or embedded webview
- Sticky bottom actions:
  - Like
  - Bookmark
  - Share
  - Font size toggle

---

## 7. Category Page

## Purpose
Shows all categories available in app

## Layout
- Categories title
- Search icon
- Grid/list of category cards
- Tapping category opens Category Detail Page

---

## 8. Category Detail Page

## Purpose
Dedicated first page for each category

## Layout per Story
- Large hero image
- Headline only
- Sub-headline
- Optional source + time
- Large visual-first layout

## Behavior
- Tapping card opens Full Article screen
- Infinite scroll for more stories

---

## 9. News Stories (Web Stories Format)

## Purpose
Swipe-based rich visual news stories

## Layout
- Full screen background image
- Headline
- Subtext/source
- Category tag
- Progress bar
- Bookmark button
- Share button

## Behavior
- Vertical swipe navigation
- Tap story → Full Article
- Full immersive mode

---

## 10. Reels / Video Feed

## Layout
- Full-screen vertical video
- One reel per screen
- Auto-play
- Swipe up/down navigation

## Right-side Actions
- Like
- Comment
- Bookmark
- Share

## Bottom Overlay
- Headline
- Caption (~60 words max)
- Source + timestamp

## Behavior
- Tap video → Full Article screen
- Admin must provide full article link for every reel

---

## 11. Search / Explore

## Layout
- Search bar
- Category filters
- News list preview cards
- Notifications bell icon

## Behavior
- Search by keyword
- Filter by category
- Open article on tap

---

## 12. Search Results Screen
- Results list
- Thumbnail + headline + preview
- Empty state if no results

---

## 13. Notifications Screen

## Layout
- Notification list
- Breaking items highlighted
- Timestamp

## Behavior
- Tap notification → Full Article

---

## 14. Profile Screen

## Layout
- Avatar
- Name
- Email
- Saved Articles
- Settings
- Logout button

---

## 15. Saved Articles
- List of bookmarked articles
- Share option
- Remove bookmark option

---

## 16. Settings Screen

## Options
- Language toggle
- Category preferences
- Notification toggle/settings
- Privacy Policy
- Terms & Conditions
- About Us
- Logout

---

## 17. Rewards System

## Purpose
Encourage sharing + referrals using reward points

## Point Sources
- Share article via trackable link
- Refer friend via referral link
- Optional daily login rewards
- Optional reel engagement rewards

## Rewards
- Amazon Gift Voucher
- Google Play Voucher
- Coupon codes shown after redemption

---

## 18. Rewards Wallet Screen

## Layout
- Current points balance
- Invite friends CTA
- Share articles info
- Redeemable reward cards

## Example
- 500 points → Google Play voucher

---

## 19. Referral Screen

## Layout
- Unique referral code
- Unique referral link
- Share buttons (WhatsApp etc.)
- Referral progress stats

## Logic
- Points only after successful install + signup

---

## 20. Reward Redemption Screen

## Layout
- Success screen
- Reward details
- Coupon code box
- Copy button

---

# PART 2: ADMIN CMS

## Fixed Sidebar Navigation
1. Dashboard
2. Manage News
3. Manage Reels
4. Users Management
5. Notifications
6. Rewards Management
7. Reports / Analytics
8. Settings
9. Logout

Sidebar must remain visible across all pages.

---

## 1. Admin Login
- Email / Username
- Password
- Remember me
- Forgot password

---

## 2. Dashboard Home

## Stats Cards
- Total Users
- Total Articles
- Total Reels
- Total Shares / Bookmarks

## Charts
- User growth
- Article vs reel engagement

## Quick Lists
- Latest News
- Latest Reels

---

# MANAGE NEWS

## Sub Pages
1. Add News
2. All News List
3. Edit News
4. View News Preview
5. Categories Management
6. Tags Management

---

## Add News
### Required Fields
- Headline
- 60-word summary
- Full article link (mandatory)
- Category
- Language
- Tags
- Image upload
- Source name
- Timestamp

### Actions
- Publish
- Save as Draft

---

## All News List
- Search
- Filters
- Bulk actions
- Edit
- Delete
- View
- Publish/Unpublish

---

## View Preview
Must show exactly how card appears in mobile app.

---

## Categories Management
- Add/Edit/Delete categories
- EN/HIN/BEN labels
- Visibility toggle
- Display order priority

---

## Tags Management
- Add/Edit/Delete tags
- Breaking
- Trending
- Elections
etc.

---

# MANAGE REELS

## Sub Pages
1. Add Reel
2. All Reels List
3. Edit Reel
4. View Reel Preview

---

## Add Reel
### Required Fields
- Reel title
- Caption (~60 words)
- Full article link (mandatory)
- Category
- Language
- Tags
- Video upload
- Thumbnail upload
- Source
- Duration
- Featured toggle
- Enable comments toggle

---

## All Reels List
- Views count
- Likes count
- Edit
- Delete
- View
- Publish/Unpublish

---

## Reel Preview
Must show exact mobile app reel UI inside mobile frame.

---

# USERS MANAGEMENT

## User List
- Search
- Filter by role/status
- Block / Unblock
- Delete
- View profile

## User Profile
- User details
- Saved articles
- Reel engagement
- Login history

---

# NOTIFICATIONS MANAGEMENT

## Push Notifications
- Title
- Body
- Link
- Audience targeting
- Category targeting
- Language targeting
- Send now / Schedule later

## Past Notifications
- View history
- Resend
- Delete

---

# REWARDS MANAGEMENT

## Admin Features
- Add/Edit reward vouchers
- Voucher title
- Logo
- Description
- Points required
- Stock quantity
- Upload voucher coupon codes
- Auto deactivate when stock ends

## Points Tracker Dashboard
- User points
- Earned
- Redeemed
- Pending
- Action source (share/referral)

## Referral Tracking
- Total invites
- Successful installs
- Fraud prevention checks

---

# REPORTS & ANALYTICS

## Charts
- User growth
- Category performance
- Language distribution
- Top Articles
- Top Reels
- Shares / Likes / Comments

## Export
- PDF
- CSV

---

# SETTINGS

## General Settings
- App name
- Logo
- Contact email
- Footer text

## Language Settings
- Default language
- Enable/disable language
- Category translations

## Policies
- Privacy Policy
- Terms & Conditions
- About Us

## Admin Users
- Add/Edit/Delete admin users
- Roles: Super Admin / Editor / Moderator

## Notification Defaults
- Default delivery settings

---

# TECH STACK

## Mobile App Tech Stack

### Frontend
- Flutter (Android + iOS cross-platform development)
- Clean, modern UI with high performance and smooth animations
- State management optimized for scalable news feed + reels + rewards system

### Backend
- Node.js
- REST API architecture for app + admin CMS sync
- Secure authentication, rewards tracking, referral tracking, notifications, and analytics handling

### Database
- MongoDB
- Flexible schema for news, reels, users, rewards, referrals, notifications, and analytics

### Additional Integrations
- Firebase Push Notifications
- Trackable share links for rewards system
- Referral tracking system
- In-app webview for full article links
- CDN support for reels/video delivery

---

## Admin Dashboard Tech Stack

### Frontend
- Next.js
- Fast, SEO-friendly, scalable admin panel
- Modern dashboard UI for content management and analytics

### Backend
- Node.js API integration with shared backend services
- Real-time CMS operations for app sync

### Database
- MongoDB
- Shared centralized database for both mobile app + admin panel

### Hosting & Deployment
- Hostinger VPS Deployment
- Production-ready deployment with scalability support
- Secure server environment with backups and monitoring

### Admin Features Coverage
- News Management
- Reels Management
- Users Management
- Notifications Management
- Rewards & Referral Management
- Reports & Analytics
- Settings & Admin Controls

---

# IMPORTANT DEVELOPMENT RULES

1. All mobile app content must be controlled from Admin CMS
2. Every news item and reel must have a mandatory Full Article Link
3. Rewards must work with trackable links only
4. Referral system must use unique referral codes/URLs
5. Mobile app must stay minimal and fast
6. UI must strictly follow ASIAZE branding
7. Category-first experience must be strong
8. Reels + Stories + Short News are all core features
9. Admin must be simple for editors to manage daily operations
10. Performance and scalability should be production-ready

