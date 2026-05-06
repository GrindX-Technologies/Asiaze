# ASIAZE - Development Plan & Rules

## 1. Project Overview
ASIAZE is a modern, minimal, clean, and premium news application featuring Inshorts-style short news, reels, and category-first content. The platform consists of a Flutter-based mobile app (iOS & Android) and a Next.js-based Admin CMS, all powered by a Node.js backend with a MongoDB database.

## 2. Tech Stack
- **Mobile App:** Flutter
- **Admin CMS:** Next.js
- **Backend:** Node.js (Express) with REST API architecture
- **Database:** MongoDB
- **Deployment:** Hostinger VPS
- **Additional Integrations:** Firebase Push Notifications, CDN for Reels, Trackable Share Links

## 3. Development Rules
1. **CMS-Driven Content:** All mobile app content (news, reels, rewards, etc.) must be strictly controlled from the Admin CMS.
2. **Mandatory Links:** Every news item and reel must require a mandatory Full Article Link to be opened in the in-app webview.
3. **Reward System Integrity:** Rewards must only work with trackable share links, and referrals must use unique referral codes/URLs. Points are awarded only after successful install + signup.
4. **Performance & Minimalism:** The mobile app must maintain a minimal footprint, fast load times, and smooth animations (especially for swipe-based interactions and auto-playing reels).
5. **Brand Guidelines Consistency:** UI must strictly adhere to the ASIAZE branding (Primary Color: Crimson Red `#DC143C`, minimal layout, high readability).
6. **Cross-Platform Parity:** The Flutter app must function seamlessly on both Android and iOS devices.
7. **Role-Based Access:** Admin CMS must support roles like Super Admin, Editor, and Moderator to ensure secure operations.
8. **Scalable Backend:** The Node.js API must efficiently handle heavy read operations (news feed, reels) and concurrent reward/referral transactions.

## 4. Development Plan

### Phase 1: Setup & Architecture (Current)
- [x] Read and analyze PRD.
- [x] Establish development rules and plan.
- [x] Initialize mono-repo or multi-repo structure (`mobile-app`, `admin-cms`, `backend`).
- [ ] **Pending:** Review Figma screens and exact UI guidelines from the user.

### Phase 2: Backend Development (Node.js + MongoDB)
- [ ] Initialize Node.js + Express project.
- [ ] Setup MongoDB schema (Users, News, Reels, Categories, Rewards, Notifications).
- [ ] Develop Authentication APIs (Admin & User).
- [ ] Develop Content Management APIs (News & Reels CRUD).
- [ ] Develop Rewards & Referral tracking logic.
- [ ] Implement Firebase Push Notifications service.

### Phase 3: Admin CMS (Next.js)
- [ ] Setup Next.js project with TailwindCSS.
- [ ] Implement Admin Login and JWT Auth.
- [ ] Build Dashboard (Stats, Charts).
- [ ] Build Content Management Modules (News, Reels, Categories, Tags).
- [ ] Build Users, Notifications, and Rewards Management.
- [ ] Build Reports & Analytics UI.

### Phase 4: Mobile App (Flutter)
- [ ] Initialize Flutter project.
- [ ] Implement Splash Screen & Onboarding.
- [ ] Implement Auth flow & Language/Category Setup.
- [ ] Build Main Home Feed (Swipeable News Cards).
- [ ] Implement Full Article in-app WebView.
- [ ] Build Reels/Video Feed with auto-play & swipe navigation.
- [ ] Implement Category, Search, Notifications, and Profile screens.
- [ ] Integrate Rewards Wallet & Referral flows.

### Phase 5: Testing & Deployment
- [ ] End-to-end testing (App <-> Backend <-> CMS).
- [ ] Performance optimization (Image caching, Video CDN).
- [ ] Deploy Backend and Next.js CMS to Hostinger VPS.
- [ ] Publish Apps to Google Play Store and Apple App Store.
