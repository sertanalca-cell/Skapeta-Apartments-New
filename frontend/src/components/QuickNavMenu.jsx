import React from 'react';
import { Building2, UtensilsCrossed, MapIcon, CloudSun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickNavMenu = ({ settings }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'apartments',
      icon: Building2,
      label: 'Apartments',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-500',
      onClick: () => document.getElementById('apartments')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'menu',
      icon: UtensilsCrossed,
      label: 'Menu',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500',
      onClick: () => navigate('/food-service')
    },
    {
      id: 'things_to_do',
      icon: MapIcon,
      label: 'Things to Do',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-500',
      onClick: () => document.getElementById('sightseeing')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'weather',
      icon: CloudSun,
      label: settings?.weather_location || 'Weather',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500',
      onClick: () => window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(settings?.weather_location || 'Tirana, Albania')}`, '_blank')
    }
  ];

  return (
    <div className="w-full py-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  item.bgColor
                } animate-fadeIn`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg text-center">
                    {item.label}
                  </span>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};