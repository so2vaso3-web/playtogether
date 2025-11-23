'use client';

import { useState } from 'react';
import { CheckCircle2, Settings, Map, Bug, Fish, Package, Gift, Gamepad2, Sparkles, Sun, Box } from 'lucide-react';

interface Feature {
  name: string;
  description?: string;
  enabled?: boolean;
}

interface TabFeatures {
  [key: string]: Feature[];
}

interface PackageFeaturesProps {
  features: TabFeatures;
  compact?: boolean; // For homepage cards
  price?: number; // Package price to show feature count
}

const tabs = [
  { id: 'chung', label: 'Chung', icon: Settings, color: 'text-primary' },
  { id: 'map', label: 'MAP', icon: Map, color: 'text-pink-400' },
  { id: 'contrung', label: 'Côn Trùng', icon: Sun, color: 'text-yellow-400' },
  { id: 'cauca', label: 'Câu Cá', icon: Fish, color: 'text-pink-400' },
  { id: 'thuthap', label: 'Thu Thập', icon: Box, color: 'text-primary' },
  { id: 'sukien', label: 'Sự Kiện', icon: Gift, color: 'text-red-400' },
  { id: 'minigame', label: 'Mini', icon: Gamepad2, color: 'text-pink-400' },
  { id: 'caidat', label: 'Cài Đặt', icon: Settings, color: 'text-primary' },
];

export default function PackageFeatures({ features, compact = false, price }: PackageFeaturesProps) {
  const [activeTab, setActiveTab] = useState('chung');

  const activeFeatures = features[activeTab] || [];
  
  // Xác định số tính năng hiển thị dựa trên giá gói (chỉ cho compact mode)
  let maxFeatures: number | undefined = undefined;
  if (compact) {
    if (price !== undefined) {
      // Gói rẻ (< 250k): Hiển thị ít tính năng (3-4)
      // Gói trung bình (250k - 450k): Hiển thị nhiều hơn (6-8)
      // Gói cao cấp (>= 450k): Hiển thị tất cả
      if (price < 250000) {
        maxFeatures = 4; // Gói rẻ: ít tính năng
      } else if (price < 450000) {
        maxFeatures = 8; // Gói trung bình: nhiều hơn
      } else {
        maxFeatures = undefined; // Gói cao cấp: hiển thị tất cả
      }
    } else {
      maxFeatures = 3; // Default cho compact mode
    }
  }
  
  // Tính tổng số tính năng trong tất cả các category
  const totalFeaturesCount = Object.values(features).flat().length;

  return (
    <div className={compact ? '' : 'gaming-card'}>
      <div className={compact ? '' : 'mb-6'}>
        {!compact && (
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Tính Năng Hack
          </h2>
        )}
        
        {/* Tabs - Giống GUI trong hình với underline cho active tab */}
        <div className={`flex gap-1 sm:gap-2 overflow-x-auto pb-0 mb-3 ${compact ? '' : 'mb-4 sm:mb-6'} scrollbar-hide`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const hasFeatures = features[tab.id] && features[tab.id].length > 0;
            
            if (!hasFeatures) return null;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0 relative ${
                  activeTab === tab.id
                    ? `text-primary`
                    : `text-gray-400 hover:text-white`
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-primary' : tab.color}`} />
                <span>{tab.label}</span>
                {/* Underline cho active tab */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Features List - 2 Columns Layout */}
        {activeFeatures.length > 0 ? (
          <div className={`${compact ? 'max-h-[150px] sm:max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30' : ''}`}>
            {/* Chia tính năng thành 2 cột */}
            {(() => {
              const featuresToShow = maxFeatures ? activeFeatures.slice(0, maxFeatures) : activeFeatures;
              const midPoint = Math.ceil(featuresToShow.length / 2);
              const leftColumn = featuresToShow.slice(0, midPoint);
              const rightColumn = featuresToShow.slice(midPoint);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Cột trái */}
                  <div className="space-y-2 sm:space-y-2.5">
                    {leftColumn.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 sm:gap-3 transition-all group"
                      >
                        {/* Circular purple icon với white checkmark - giống GUI */}
                        {feature.enabled !== false ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="white" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-dark-secondary border-2 border-gray-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="text-white text-sm sm:text-base flex items-center gap-1.5 break-words">
                            {feature.name}
                          </span>
                          {feature.description && (
                            <span 
                              className="text-gray-400 text-sm sm:text-base cursor-help flex-shrink-0 hover:text-primary transition" 
                              title={feature.description}
                            >
                              (?)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cột phải */}
                  <div className="space-y-2 sm:space-y-2.5">
                    {rightColumn.map((feature, index) => (
                      <div
                        key={midPoint + index}
                        className="flex items-center gap-2 sm:gap-3 transition-all group"
                      >
                        {/* Circular purple icon với white checkmark - giống GUI */}
                        {feature.enabled !== false ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="white" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-dark-secondary border-2 border-gray-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="text-white text-sm sm:text-base flex items-center gap-1.5 break-words">
                            {feature.name}
                          </span>
                          {feature.description && (
                            <span 
                              className="text-gray-400 text-sm sm:text-base cursor-help flex-shrink-0 hover:text-primary transition" 
                              title={feature.description}
                            >
                              (?)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {compact && maxFeatures && activeFeatures.length > maxFeatures && (
              <div className="text-center text-gray-500 text-[10px] sm:text-xs pt-2 mt-2">
                + {activeFeatures.length - maxFeatures} tính năng khác trong tab này
                {price && (
                  <div className="text-[9px] text-gray-600 mt-1">
                    Tổng cộng: {totalFeaturesCount} tính năng {price < 250000 ? '(Gói Cơ Bản)' : price < 450000 ? '(Gói Premium)' : '(Gói Elite)'}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-3 sm:py-4 text-[10px] sm:text-xs">
            Chưa có tính năng
          </div>
        )}
      </div>
    </div>
  );
}

