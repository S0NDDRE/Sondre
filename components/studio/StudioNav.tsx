/**
 * Studio Navigation
 * Main navigation for the music studio
 */

import React from 'react';
import { Music, Layers, Settings, Download, MessageSquare, Sparkles } from 'lucide-react';
import { useMusicStore } from '../../store/musicStore';

export const StudioNav: React.FC = () => {
  const { activeTab, setActiveTab } = useMusicStore();

  const tabs = [
    { id: 'generate' as const, label: 'Generate', icon: Sparkles },
    { id: 'studio' as const, label: 'Studio', icon: Music },
    { id: 'stems' as const, label: 'Stems', icon: Layers },
    { id: 'export' as const, label: 'Export', icon: Download },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-4">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
          <Music className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 flex flex-col gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative p-3 rounded-xl transition ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={tab.label}
            >
              <Icon className="w-6 h-6" />

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                {tab.label}
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-400 rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* AI Bot */}
      <button
        className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition"
        title="AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};
