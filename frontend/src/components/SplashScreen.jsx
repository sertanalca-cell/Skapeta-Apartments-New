import React, { useEffect, useState } from 'react';

const animations = {
  fade: {
    initial: 'opacity-0',
    animate: 'opacity-100',
    exit: 'opacity-0'
  },
  slide: {
    initial: 'translate-y-full opacity-0',
    animate: 'translate-y-0 opacity-100',
    exit: '-translate-y-full opacity-0'
  },
  zoom: {
    initial: 'scale-0 opacity-0',
    animate: 'scale-100 opacity-100',
    exit: 'scale-150 opacity-0'
  },
  rotate: {
    initial: 'rotate-180 scale-0 opacity-0',
    animate: 'rotate-0 scale-100 opacity-100',
    exit: 'rotate-180 scale-0 opacity-0'
  },
  bounce: {
    initial: '-translate-y-full opacity-0',
    animate: 'translate-y-0 opacity-100',
    exit: 'translate-y-full opacity-0'
  }
};

export const SplashScreen = ({ onComplete, logoUrl, settings }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState('initial');

  const animationType = settings?.splash_animation || 'fade';
  const primaryColor = settings?.splash_primary_color || '#0ea5e9';
  const secondaryColor = settings?.splash_secondary_color || '#3b82f6';
  const duration = settings?.splash_duration || 2000;

  useEffect(() => {
    // Start animation
    setStage('animate');

    // Start fade out
    const fadeTimer = setTimeout(() => {
      setStage('exit');
    }, duration - 300);

    // Complete
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  const currentAnimation = animations[animationType] || animations.fade;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
      }}
    >
      <div
        className={`text-center transition-all duration-500 transform ${
          stage === 'initial' ? currentAnimation.initial : 
          stage === 'animate' ? currentAnimation.animate : 
          currentAnimation.exit
        }`}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl animate-pulse"
            />
          ) : (
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-6xl font-bold" style={{ color: primaryColor }}>S</span>
            </div>
          )}
        </div>

        {/* Website Name */}
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {settings?.hero_title || 'Skapeta Apartments'}
        </h1>
        <p className="text-xl text-white/90">
          {settings?.splash_subtitle || 'Saranda, Albania'}
        </p>

        {/* Loading animation */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
