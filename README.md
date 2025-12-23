# RustyWeb 🌐

**RustyWeb** is the official web portal and administrative dashboard for the **Rusty** ecosystem. It serves as both a high-conversion landing page for the mobile app and a powerful tool for administrators to manage and verify reported vehicles.

[**🚀 View Live Demo**](https://rusty-web-two.vercel.app/)

---

## 🌟 Features

- **🖥️ Admin Dashboard**: specific interface for admins to review, accept, or reject vehicle reports.
- **📱 Interactive Demo**: A fully interactive, pixel-perfect simulation of the mobile app directly on the landing page.
- **🔐 Secure Authentication**: Robust user management using **Firebase Auth**.
- **🌍 Bilingual Support**: Seamlessly switch between **English** and **Polish**.
- **🌗 Dark Mode**: Fully responsive dark and light themes that adapt to your system preference.
- **💨 High Performance**: Built with **Next.js** for blazing fast load times and SEO optimization.

---

## 👨‍💻 For Developers

This section is designed to help developers set up the RustyWeb project locally.

### Prerequisites

Ensure you have the following installed on your machine:

- **[Node.js](https://nodejs.org/)** (LTS version recommended)
- **Git**
- **npm** (comes with Node.js)

### 🚀 Getting Started

Follow these steps to get the web app running:

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/struggyyy/RustyWeb.git
    cd RustyWeb
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Configuration**

    The app requires environment variables to function correctly (Firebase & Maps). Create a `.env` file in the root directory:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

    # Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
    ```

    > **⚠️ Important**: If you are a collaborator, please request the specific API keys from the project lead (@struggyyy).

4.  **Run the Application**

    Start the development server:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 🧪 Running Tests

We use **Vitest** for unit and integration testing.

```bash
npm test
```

### 📦 Deployment

The application is optimized for deployment on **Vercel**.

1.  Push your changes to the `production` branch.
2.  Vercel will automatically build and deploy the new version.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (v15+)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Icons**: Lucide React
- **Backend / Auth**: Firebase (v11)
- **Internationalization**: `i18next` & `react-i18next`
- **Testing**: Vitest & React Testing Library
- **Deployment**: Vercel

---

**Copyright © 2025 @struggyyy. All Rights Reserved.**
