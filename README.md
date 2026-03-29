# Pausely™

## About

Pausely is a digital wellbeing tool designed to address compulsive social media usage. Unlike passive trackers or hard blockers, Pausely introduces lightweight, dismissible, reflective prompts embedded at key points within a simulated social media feed (session entry, mid-session, time overrun, and exit). By introducing structured moments of reflection, the app aims to help users align their behavior with their stated intentions, reduce compulsive scrolling, and increase their perceived sense of interaction control.

## Team

Developed for **SOEN 357 – User Interface Design** (Winter 2026) at Concordia University.

- **Ryan Cheung** – 40282200
- **Danial Kuba** – 40277789
- **Massimo Paolini** – 40280323
- **Ammar Ranko** – 40281232

## Setup Instructions

Follow these steps to set up the project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MassPaol/SOEN-357-Pausely.git
   cd SOEN-357-Pausely
   ```

2. **Install dependencies (at the root of the project):**

   ```bash
   npm install
   ```

   _(Note: If you encounter an error with `husky`, run `npm install --ignore-scripts` instead.)_


3. **If you want to save session data using a physical IOS device, add the export server URL to `pausely/.env`:**

   Set the Expo public export server URL to the machine that will run the CSV export server.

   ```env
   EXPO_PUBLIC_EXPORT_SERVER_URL=http://<your-local-ip>:4001
   ```

   Replace `<your-local-ip>` with the LAN IP address of your computer so your Expo app can reach it.


4. **Start the export server from the repository root if you want session data to be saved:**

   ```bash
   npm run export-server
   ```

   Completed sessions are only written to `exports/pausely-session-log.csv` while this server is running.


5. **Navigate to the application directory:**

   ```bash
   cd pausely
   ```

6. **Start the development server:**
   ```bash
   npx expo start
   ```

## How to Run the App

Once you run `npx expo start`, Metro Bundler will start and display a QR code in the terminal.
> Note: Ensure that your directory is pausely

If you want completed session data exported to CSV, keep `npm run export-server` running in a separate terminal at the repository root while using the app.

- **Physical Device (Recommended):** Download the **Expo Go** app on your iOS or Android device. Scan the QR code (using the Camera app on iOS or the Expo Go app on Android) to open the project.
- **Web Browser:** Press `w` in the terminal to launch the app in your default web browser.
- **iOS Simulator:** Press `i` in the terminal (Requires macOS with Xcode installed).
- **Android Emulator:** Press `a` in the terminal (Requires Android Studio and a configured virtual device).
