'use client'
import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  position: string;
  type: string;
  revenuePerView: number;
}

export default function AdDisplay() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds();
    // Refresh ads every 5 minutes
    const interval = setInterval(fetchActiveAds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveAds = async () => {
    try {
      const res = await fetch('/api/ads/impression');
      const data = await res.json();
      setAds(data.ads || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await fetch('/api/ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId })
      });
      console.log('Ad impression tracked:', adId);
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  };

  const handleAdView = (ad: Ad) => {
    if (!dismissedAds.has(ad.id)) {
      trackImpression(ad.id);
    }
  };

  const handleDismiss = (adId: string) => {
    setDismissedAds(prev => new Set([...prev, adId]));
    // Store in session storage
    const dismissed = JSON.parse(sessionStorage.getItem('dismissedAds') || '[]');
    sessionStorage.setItem('dismissedAds', JSON.stringify([...dismissed, adId]));
  };

  const handleAdClick = (ad: Ad) => {
    if (ad.link) {
      window.open(ad.link, '_blank');
    }
  };

  // Load dismissed ads from session storage on mount
  useEffect(() => {
    const dismissed = JSON.parse(sessionStorage.getItem('dismissedAds') || '[]');
    setDismissedAds(new Set(dismissed));
  }, []);

  // Track impressions when ads become visible
  useEffect(() => {
    const visibleAds = ads.filter(ad => !dismissedAds.has(ad.id));
    visibleAds.forEach(ad => {
      const timer = setTimeout(() => handleAdView(ad), 1000); // Track after 1 second
      return () => clearTimeout(timer);
    });
  }, [ads, dismissedAds]);

  if (loading || ads.length === 0) return null;

  const visibleAds = ads.filter(ad => !dismissedAds.has(ad.id));

  return (
    <>
      {visibleAds.map((ad, index) => {
        const positionStyles = getPositionStyles(ad.position, index);
        const isPopup = ad.type === 'POPUP';

        if (isPopup) {
          return (
            <div
              key={ad.id}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => handleDismiss(ad.id)}
            >
              <div
                className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleDismiss(ad.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
                
                <div
                  className="cursor-pointer"
                  onClick={() => handleAdClick(ad)}
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  {ad.link && (
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-center gap-2 text-sm text-gray-700">
                      <ExternalLink className="w-4 h-4" />
                      <span>Click to learn more</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Banner/Sidebar ads
        return (
          <div
            key={ad.id}
            className={`fixed ${positionStyles} z-40 animate-slideIn`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="relative group">
              <div
                className={`
                  backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border-2 border-white/50 
                  overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-105
                  ${ad.position.includes('BOTTOM') ? 'max-w-sm' : 'max-w-xs'}
                `}
                onClick={() => handleAdClick(ad)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(ad.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>

                <div className="relative">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">
                    {ad.title}
                  </h3>
                  {ad.link && (
                    <div className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 cursor-pointer">
                      <ExternalLink className="w-3 h-3" />
                      <span>Learn more</span>
                    </div>
                  )}
                </div>

                {ad.link && (
                  <div className="absolute inset-0 cursor-pointer" />
                )}
              </div>

              {/* Subtle "Ad" label */}
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className="text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}

function getPositionStyles(position: string, index: number): string {
  const spacing = index * 360; // Spacing for multiple ads

  switch (position) {
    case 'BOTTOM_RIGHT':
      return `bottom-4 right-4`;
    case 'BOTTOM_LEFT':
      return `bottom-4 left-4`;
    case 'TOP_RIGHT':
      return `top-20 right-4`;
    case 'TOP_LEFT':
      return `top-20 left-4`;
    default:
      return `bottom-4 right-4`;
  }
}