import React from "react";
import Image from "next/image";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-6 text-center shadow-lg`}
    >
      <div className="mb-4 flex justify-center">
        <Image
          src="/images/logo/Icon-blue@2x.png"
          alt="Wavenet Care Logo"
          width={64}
          height={64}
          className="drop-shadow-lg"
        />
      </div>
      <h3 className="mb-2 font-bold text-white text-lg">
        Wavenet Care
      </h3>
      <p className="mb-4 text-blue-100 text-sm">
        Professional Dental Hospital Management System - Streamlining dental care operations.
      </p>
      <div className="text-xs text-blue-200">
        <p>© 2025 Wavenet Care</p>
        <p>All Rights Reserved</p>
      </div>
    </div>
  );
}
