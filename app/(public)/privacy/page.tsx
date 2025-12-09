import CustomCursor from "@/components/ui/CustomCursor";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans cursor-none bg-[#F5F5F5]">
      <CustomCursor />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-2 uppercase tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-neutral-500 font-medium mb-12">
          Last updated: November 28, 2025
        </p>

        <div className="h-px bg-neutral-200 w-full my-10" />

        <div className="prose prose-neutral prose-lg max-w-none">
          <p>
            This Privacy Policy describes how Rusty collects, uses, and
            discloses your information when you use our mobile application
            Rusty.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
            1. Information We Collect
          </h2>

          <h3 className="text-xl font-bold text-neutral-800 mt-6 mb-3">
            1.1. Permissions and Device Data
          </h3>
          <p>
            To provide the core functionality of reporting abandoned vehicles,
            the App requires access to certain features of your device:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600">
            <li>
              <strong className="text-neutral-900">Camera:</strong> We use the
              camera permission to allow you to take photographs of abandoned
              vehicles directly within the App. These images are uploaded to our
              servers as part of your report.
            </li>
            <li>
              <strong className="text-neutral-900">Location:</strong> We use
              your device's location services (GPS) to automatically tag the
              precise location of the reported vehicle. This helps us identify
              where the vehicle is located.
            </li>
            <li>
              <strong className="text-neutral-900">Notifications:</strong> We
              may use notifications to update you on the status of your reports.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-3">
            1.2. Personal Information
          </h3>
          <p>
            When you create an account, we collect the following personal
            information:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600">
            <li>Email address</li>
            <li>Authentication credentials (via email/password)</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
            2. How We Use Your Information
          </h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600">
            <li>
              <strong className="text-neutral-900">
                To provide the Service:
              </strong>{" "}
              To allow you to create, submit, and track reports of abandoned
              vehicles.
            </li>
            <li>
              <strong className="text-neutral-900">To improve the App:</strong>{" "}
              We analyze usage data to improve the functionality and user
              experience.
            </li>
            <li>
              <strong className="text-neutral-900">Authentication:</strong> To
              verify your identity and secure your account.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
            3. Third-Party Services
          </h2>
          <p>
            We use third-party services that may collect information used to
            identify you:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600">
            <li>
              <strong className="text-neutral-900">Google Firebase:</strong> We
              use Firebase for authentication, database storage, and analytics.
            </li>
            <li>
              <strong className="text-neutral-900">Google Maps:</strong> We use
              Google Maps to display vehicle locations.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
            4. Data Retention
          </h2>
          <p>
            We retain your reports and associated data (photos, location) as
            long as necessary to fulfill the purpose of the report or as
            required by law.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <a
            href="mailto:jakub.strugala.business@gmail.com"
            className="text-brand-primary font-bold hover:underline mb-12 block"
          >
            struggyyycompany@gmail.com
          </a>
        </div>

        <div className="h-px bg-neutral-200 w-full mt-16 mb-6" />

        <footer className="w-full text-center text-neutral-400 text-sm font-bold uppercase tracking-widest">
          © 2025 Created by struggyyy
        </footer>
      </main>
    </div>
  );
}
