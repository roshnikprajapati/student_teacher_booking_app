# System Architecture

Client (browser)
  - Static HTML + JS
  - Firebase Auth (Email/Password)
  - Firestore for application data (No custom backend in this demo)

Optional production enhancements:
  - Cloud Functions for heavy logic (notifications, email confirmations)
  - Cloud Scheduler for reminders
  - CI/CD: GitHub Actions -> Firebase Hosting deploy

Deployment options:
- Firebase Hosting (recommended)
- GitHub Pages (static, but secure config keys required)
- Any static-file host (Netlify, Vercel)
