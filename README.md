# Student-Teacher Booking Appointment System

Simple web-based appointment booking system built with **HTML, CSS, JavaScript** and **Firebase** (Auth + Firestore).

## Project structure
- `index.html` — Landing page.
- `student.html` — Student register/login, search teachers, book appointment.
- `teacher.html` — Teacher login, add slots, approve/cancel appointments.
- `admin.html` — Admin UI to add teachers.
- `scripts/app.js` — Core application logic (uses Firebase compat SDK for simplicity).
- `firebase-config.js` — Put your Firebase project's config here.
- `styles.css` — Basic styling.
- `LLD.md`, `architecture.md`, `testcases.md` — design and evaluation documents.

## Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password).
3. Create a Firestore database (Start in test or locked mode, adjust rules for production).
4. Replace `firebase-config.js` with your project's config.
5. Serve the folder (e.g., `npx http-server .` or use VSCode Live Server).
6. To create teacher accounts that are also Firebase Auth users:
   - Create accounts manually in Firebase Authentication console, then create a user document in `users` collection with `{ role: 'teacher', name: '...' }`.

## Notes on logging
Actions are logged to Firestore `logs` collection. For a production system, consider adding structured logging with severity and retention.

## Testing & Deployment
- Test user flows: register/login, add teacher, add slots, book appointment, approve/cancel.
- Deploy static site to GitHub Pages or Firebase Hosting.

## Limitations of this demo
- No server-side validation (Firestore rules required).
- Teacher accounts created by admin view are only documents in `teachers` collection; to enable teacher auth, create an auth user and `users/{uid}` doc with `role: 'teacher'`.
- For large datasets add indexed fields and pagination.

