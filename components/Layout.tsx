
import React from 'react';
import { Home, Users, PlayCircle, ShoppingBag, MessageSquare } from 'lucide-react';
import { ScreenState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: ScreenState;
  onNavigate: (screen: ScreenState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, onNavigate }) => {
  const navItems = [
    { id: ScreenState.HOME, label: 'Início', icon: <Home size={24} /> },
    { id: ScreenState.SOCIAL, label: 'Social', icon: <MessageSquare size={24} /> },
    { id: ScreenState.MATCH, label: 'Jogar', icon: <PlayCircle size={24} /> },
    { id: ScreenState.SQUAD, label: 'Elenco', icon: <Users size={24} /> },
    { id: ScreenState.MARKET, label: 'Mercado', icon: <ShoppingBag size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-gray-200">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.id as ScreenState)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`${isActive ? 'transform scale-110' : ''} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
