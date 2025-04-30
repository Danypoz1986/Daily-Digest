# 📰 Daily Digest App

A mobile-friendly news aggregation app built with **Ionic React**, powered by **NewsData API** and **Firebase** for authentication and storage. The app allows users to:

- Browse trending news
- Save favorite articles
- Enable dark mode
- View personal metrics
- Register/login securely
---
<br>

## 🚀 Features

- 🔒 User authentication (Firebase Auth)
- 🗞️ Live news feed with hourly updates
- ❤️ Save and view favorite articles
- 🌙 Dark mode support
- 📊 User metrics tracking
- 📱 Responsive, mobile-first design
- 🌍 Multilingual articles (EN, FI, IT)
---

<br>

## 📦 Tech Stack

- **Frontend**: Ionic React, Swiper, TypeScript
- **Backend/Storage**: Firebase Firestore
- **Authentication**: Firebase Auth
- **News API**: [NewsData.io](https://newsdata.io/)
- **Styling**: Custom CSS, Ionicons
- **Analytics**: In-app metrics view
- **Routing**: React Router
---

<br>

## 🧪 Testing

- ✅ Unit testing with **Vitest**
- 🧪 E2E testing with **Cypress**
---

<br>

## 🔐 Environment Variables

Rename `.env.example` → `.env` and set the following:

```env
VITE_NEWSDATA_API_KEY_1=your_key
VITE_NEWSDATA_API_KEY_2=your_key
VITE_NEWSDATA_API_KEY_3=your_key
VITE_FIREBASE_API_KEY=your_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```
---

<br>

## 📱 Build & Run
### Local Development
```bash
npm install
npm run dev
```
### Android Production Build
```bash
npm install
npm run dev
```
In Android Studio: build → generate signed bundle → upload to Play Store or test locally.

---

<br>

## 🎨 Style Guide
The design of **Daily Digest** focuses on clarity, readability, and responsiveness. Below are the key guidelines and components used across the app:

### 🔵 Color Palette

| Element            | Light Mode            | Dark Mode              |
|--------------------|-----------------------|------------------------|
| Primary Background | `#ffffff`             | `#121212`              |
| Header Bar         | `#0057B8` (blue)      | `#0057B8`              |
| Text               | `#000000`             | `#ffffff`              |
| Accent Icons       | `red`, `#4CAF50`      | `red`, `#4CAF50`       |

### 🔤 Typography

- **Base Font**: System default (Ionic uses `Roboto`, `Helvetica Neue`, `Arial`)
- **Font Sizes**:
  - Titles: `1.2rem` – `1.5rem`
  - Body: `0.9rem` – `1.1rem`
  - Small text: `0.75rem`
- **Font Weight**: Medium to Bold for titles and section headings

### 🧱 Layout & Spacing

- **Grid system**: Based on Ionic’s `IonGrid`, `IonRow`, and `IonCol`
- **Card Layout**:
  - Used for displaying articles and feed content
  - Border-radius: `10px`
  - Shadow: subtle for light mode; flat for dark mode
- **Swiper Slides**:
  - Responsive horizontal cards
  - Autoplay enabled with pause-on-hover
  - Adaptive layout for 1–4 cards depending on screen width

### 🌓 Theme Modes

Dark mode is user-specific and persisted in Firestore. It affects:

- `IonContent` background
- Card backgrounds and titles
- Text color inversion
- Swiper container class:
  - `swiper-wrapper-fullwidth-dark`
  - `swiper-wrapper-fullwidth-light`

### 🧩 Components

| Component      | Customization Notes                                           |
|----------------|---------------------------------------------------------------|
| `IonSegment`   | Scrollable, styled for category switching                     |
| `IonCard`      | Light/dark themed, holds article image, title, metadata       |
| `IonIcon`      | Used for 'save to favorites' (heart), home, etc.              |
| `IonButton`    | Small size, primary styling, used for "View Full Article"     |
| `IonImg`       | Images auto-cropped via `object-fit: cover`, size `300x300px` |

### 💡 Alerts & Toasts

- Powered by `sonner` toast library
- Position: `top-center`
- Duration: `4000ms`
- Variants: `info`, `success`, `error`
- Example: _"This article is already in your favorites."_ (info)

### 📱 Responsiveness

- Swiper and layout adapt at breakpoints:
  - `320px`: 1 slide
  - `600px`: 2 slides
  - `1100px`: 3 slides
  - `1500px`: 4 slides
- Mobile-first layout with spacing adjusted using `ion-padding` and CSS flexbox

### 📁 File Organization

- `Home.css`, `Favorites.css`, `Login.css`, etc. scoped per page
- Global classes follow naming like `.colored-card-dark`, `.swiper-title`, etc.

---

## 🚧 Areas for Improvement

While the Daily Digest App is functional and user-friendly, there are some known limitations and improvement opportunities:

### 🕒 News Fetching Model

- Currently, the app fetches fresh articles only on user login to avoid exceeding API rate limits.

- Ideally, all users should receive the same hourly news, regardless of login time.

- Implementing a background server fetch or cron job would require a paid NewsData.io subscription or cloud backend.

### 🔄 Favorites Sync Enhancements
- Favorites are stored in Firestore but are not yet synced across multiple devices for the same user.
  
- Could improve with real-time Firestore listeners or cloud functions.

### 📂 Article Categorization

- Categories are based on free-form API data and may result in inconsistent classification.
  
- A manual or AI-based tagging layer could enhance discoverability.

### 🧪 Testing Coverage

- Basic unit and e2e testing are implemented.
  
- Could be expanded with more edge cases and error-handling tests, especially for network failures.