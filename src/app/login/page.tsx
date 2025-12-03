import LoginForm from "./LoginForm";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Wavenet Care | Dental Hospital Management System",
  description: "Login to Wavenet Care Dental Hospital Admin Panel",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Image
                src="/images/logo/Icon-blue@2x.png"
                alt="Wavenet Care Logo"
                width={80}
                height={80}
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">Wavenet Care</h1>
            <p className="text-blue-100">Dental Hospital Management System</p>
          </div>
          <div className="text-sm text-blue-100">
            <p className="mb-2">Admin Portal Access:</p>
            <p className="font-mono bg-white/10 p-2 rounded">
              Email: admin@wavenetcare.com<br/>
              Password: dental2024
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <LoginForm />
      </div>
    </div>
  );
}