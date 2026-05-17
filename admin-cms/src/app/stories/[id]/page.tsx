"use client";

import { useEffect } from "react";

export default function FallbackPage() {
  useEffect(() => {
    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    const playStoreLink = "https://play.google.com/store/apps/details?id=com.asiaze.mobile_app";
    const appStoreLink = "https://apps.apple.com/app/id123456789"; // Placeholder for iOS

    // Attempt to redirect to store after a short delay
    const timeout = setTimeout(() => {
      if (isAndroid) {
        window.location.href = playStoreLink;
      } else if (isIOS) {
        window.location.href = appStoreLink;
      } else {
        // Fallback for desktop or other OS
        window.location.href = playStoreLink;
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>ASIAZE</h1>
      <p style={{ color: '#666' }}>Opening in the Asiaze App...</p>
      <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>If you don't have the app installed, you will be redirected to the App Store.</p>
    </div>
  );
}
