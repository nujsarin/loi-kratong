# Loi Krathong Web App (Front‑end only, optional realtime)
A lightweight web app for decorating and floating krathongs with a Thai‑style river scene.

## Features
- Choose **base materials** (5), **flowers** (pick up to 5), **candles** (0–9), and add a **short blessing**.
- 3D‑ish float animation to the **left** with depth, tilt, and glow.
- **Local demo** works out of the box (no backend).
- **Optional realtime**: paste a Firebase **Firestore** config to sync floats from multiple users.

## How to Use
1. Upload the 3 files to any static host (GitHub Pages, Netlify, Vercel, S3, internal web server).
2. Share the **URL**. Create a **QR code** pointing to that URL (use any QR generator).
3. Users open the link, design a krathong, and press **Float**.

## Realtime (Optional)
1. Create a Firebase project → enable **Firestore** in test mode.
2. Copy your web app config (apiKey, authDomain, projectId, etc.).
3. In **index.html**, uncomment Firebase script tags.
4. In the page, open **Realtime (Optional)**, paste the JSON config, and press **Connect Firebase**.
5. Everyone’s floats will stream in. (Collection name: `krathongs`).

### Basic Firestore Security (recommended quick rule)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For events only; replace with proper auth later.
    }
  }
}
```
> For production, implement auth/rate‑limits and stricter rules.

## File list
- `index.html` — UI skeleton and optional Firebase includes
- `styles.css` — Thai‑tone river theme (yellow/white/black) + animations
- `app.js` — Logic, builder, animation, optional Firestore listener

## Notes
- Duration per float is randomized **10–15s**; old floats auto‑fade to reduce clutter.
- This repository is framework‑free (HTML/CSS/JS only) for easy hosting.
- You can theme colors and assets to match your brand.
