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
      onClick: () => document.getElementById('apartments')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'menu',
      icon: UtensilsCrossed,
      label: 'Menu',
      color: 'from-orange-500 to-red-600',
      onClick: () => navigate('/food-service')
    },
    {
      id: 'things_to_do',
      icon: MapIcon,
      label: 'Things to Do',
      color: 'from-purple-500 to-purple-700',
      onClick: () => document.getElementById('sightseeing')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'weather',
      icon: CloudSun,
      label: settings?.weather_location || 'Weather',
      color: 'from-green-500 to-emerald-600',
      onClick: () => window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(settings?.weather_location || 'Tirana, Albania')}`, '_blank')
    }
  ];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-3">
        {/* Tek satır, küçük butonlar */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`group relative overflow-hidden rounded-lg px-4 py-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-gradient-to-r ${item.color}`}
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};