import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="mb-6">
                  <div className="flex items-center space-x-3">
                    <Image
                      width={64}
                      height={64}
                      src="/images/logo/Icon-blue@2x.png"
                      alt="Wavenet Care Logo"
                      className="w-16 h-16"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-white">Wavenet Care</h1>
                      <p className="text-blue-200 text-sm">Dental Hospital Management</p>
                    </div>
                  </div>
                </Link>
                <p className="text-center text-blue-200 dark:text-white/60">
                  Professional dental practice management system built with modern technology
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
