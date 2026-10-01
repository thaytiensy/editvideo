import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { Shop } from '../types';

interface BrandContextType {
  appName: string;
  logoUrl: string;
  primaryColor: string;
  watermarkText: string;
  currentShop: Shop | undefined;
  updateBranding: (data: {
    appName?: string;
    logoUrl?: string;
    primaryColor?: string;
    watermarkText?: string;
  }) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShop, setCurrentShop] = useState<Shop | undefined>(() => {
    const shops = db.getShops();
    return shops[0];
  });

  const [appName, setAppName] = useState<string>(() => {
    return localStorage.getItem('avm_brand_app_name') || 'Art Video Maker PRO';
  });

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return currentShop?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80';
  });

  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    return currentShop?.primaryColor || '#6366f1';
  });

  const [watermarkText, setWatermarkText] = useState<string>(() => {
    return currentShop?.watermarkText || 'Art Video PRO • ZenStudio';
  });

  // Apply dynamic color styling to root
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    // Convert hex to rgb
    const hex = primaryColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--brand-primary-rgb', `${r}, ${g}, ${b}`);
    }
  }, [primaryColor]);

  const updateBranding = (data: {
    appName?: string;
    logoUrl?: string;
    primaryColor?: string;
    watermarkText?: string;
  }) => {
    if (data.appName !== undefined) {
      setAppName(data.appName);
      localStorage.setItem('avm_brand_app_name', data.appName);
    }
    if (data.logoUrl !== undefined) {
      setLogoUrl(data.logoUrl);
    }
    if (data.primaryColor !== undefined) {
      setPrimaryColor(data.primaryColor);
    }
    if (data.watermarkText !== undefined) {
      setWatermarkText(data.watermarkText);
    }

    if (currentShop) {
      const updated = db.updateShop(currentShop.id, {
        name: data.appName || currentShop.name,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : currentShop.logoUrl,
        primaryColor: data.primaryColor !== undefined ? data.primaryColor : currentShop.primaryColor,
        watermarkText: data.watermarkText !== undefined ? data.watermarkText : currentShop.watermarkText,
      });
      setCurrentShop(updated);
    }

    db.logAudit({
      actorId: 'admin-brand-sync',
      actorEmail: 'system@artvideomaker.pro',
      action: 'BRANDING_UPDATE',
      meta: data,
    });
  };

  return (
    <BrandContext.Provider
      value={{
        appName,
        logoUrl,
        primaryColor,
        watermarkText,
        currentShop,
        updateBranding,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
