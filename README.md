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


3. **If you want to save session data using a physical IOS device, add the export server URL to `pausely/.env`. Otherwise, to run the app without saving user data, skip to step 5. (This step is optional. It's only required if you wish to save user data,
   but is not required if you just want to run the app) :**

   Set the Expo public export server URL to the machine that will run the CSV export server.

   ```env
   EXPO_PUBLIC_EXPORT_SERVER_URL=http://<your-local-ip>:4001
   ```

   Replace `<your-local-ip>` with the LAN IP address of your computer so your Expo app can reach it.

   Continue to step 4.


4. **Start the export server from the repository root i.e. from \SOEN-357-Pausely (This step is optional. It's only required if you wish to save user data,
   but is not required if you just want to run the app):**

   ```bash
   npm run export-server
   ```

   Completed sessions are only written to `exports/pausely-session-log.csv` while this server is running.

   Two terminals are required if you wish to save user data. One will have the export-server running, which you should've done in this step. The second terminal will run the Expo app itself. To run the Expo app continue to step 5. 

5. **Navigate to the application directory:**

   ```bash
   cd pausely
   ```

6. **Choose how you want to run the app from the `pausely` directory:**

   **Run in non-dev mode (final prototype):**

   ```bash
   npm run start
   ```

   Use this when you want to test or demo the final prototype experience. In this mode, the app runs without Expo dev mode, so the debug overlay does not appear.

   **Run in dev mode:**

   ```bash
   npm run start:dev
   ```

   Use this when you want the in-app debug overlay for testing prompt timing and session behavior.

## How to Run the App

Once you run one of the start commands above, Metro Bundler will start and display a QR code in the terminal.
> Note: Ensure that your directory is pausely

If you want completed session data exported to CSV, keep `npm run export-server` running in a separate terminal at the repository root while using the app.

- **Physical Device (Recommended):** Download the **Expo Go** app on your iOS or Android device. Scan the QR code (using the Camera app on iOS or the Expo Go app on Android) to open the project.
- **Web Browser:** Use `npm run web` or `npm run web:dev`.
- **iOS Simulator:** Use `npm run ios` or `npm run ios:dev` (requires macOS with Xcode installed).
- **Android Emulator:** Use `npm run android` or `npm run android:dev` (requires Android Studio and a configured virtual device).
