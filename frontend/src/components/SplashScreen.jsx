import React, { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete, logoUrl }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // After 1.8 seconds, start fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    // After 2 seconds total (including fade out), call onComplete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center animate-pulse">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Skapeta Logo"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl animate-[scale_1s_ease-in-out_infinite]"
            />
          ) : (
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-[scale_1s_ease-in-out_infinite]">
              <span className="text-sky-600 font-bold text-6xl">S</span>
            </div>
          )}
        </div>

        {/* Website Name */}
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Skapeta Apartments
        </h1>
        <p className="text-xl text-sky-100">Saranda, Albania</p>
      </div>
    </div>
  );
};
