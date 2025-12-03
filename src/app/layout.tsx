import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { Providers } from '@/components/providers/Providers';
import { CallDock } from '@/components/webphone/CallDock';
import { IncomingToast } from '@/components/webphone/IncomingToast';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Wavenet Care - Dental Hospital Management System',
  description: 'Professional dental hospital management system for Wavenet Care. Manage patients, appointments, dental procedures and more.',
  keywords: 'dental hospital, management system, wavenet care, dental practice, patient management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Providers>
          <ThemeProvider>
            <AuthProvider>
              <PatientProvider>
                <SidebarProvider>
                  {children}
                  
                  {/* Global Webphone Components */}
                  <CallDock />
                  <IncomingToast />
                  
                  {/* Hidden audio elements for telephony */}
                  <audio
                    id="remoteAudio"
                    autoPlay
                    style={{ display: 'none' }}
                  />
                  <audio
                    id="ringtone"
                    src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIaBD2X2+/AbiMFl2+z9N17KQYhfsp+0IJ4LwUVaJ3szpFDBhmC3Y29ajEFOH/K79l+OAEPhv/3ckJPGBSc5Kp5mY4cVOH5WENZGxrP8Jt7bDIGNW/VmbtUXYkNl3q+qZ+JEhKk1P2yYEINT87o1Fpc"
                    loop
                    preload="auto"
                    style={{ display: 'none' }}
                  />
                </SidebarProvider>
              </PatientProvider>
            </AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
