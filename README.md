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
   git clone <repository-url>
   cd SOEN-357-Pausely
   ```

2. **Install dependencies (at the root of the project):**

   ```bash
   npm install
   ```

   _(Note: If you encounter an error with `husky`, run `npm install --ignore-scripts` instead.)_

3. **Navigate to the application directory:**

   ```bash
   cd pausely
   ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

## How to Run the App

Once you run `npx expo start`, Metro Bundler will start and display a QR code in the terminal.

- **Physical Device (Recommended):** Download the **Expo Go** app on your iOS or Android device. Scan the QR code (using the Camera app on iOS or the Expo Go app on Android) to open the project.
- **Web Browser:** Press `w` in the terminal to launch the app in your default web browser.
- **iOS Simulator:** Press `i` in the terminal (Requires macOS with Xcode installed).
- **Android Emulator:** Press `a` in the terminal (Requires Android Studio and a configured virtual device).
