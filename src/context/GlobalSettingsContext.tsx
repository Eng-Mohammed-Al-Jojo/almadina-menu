import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseService } from '../services/firebaseService';

interface GlobalSettings {
  showPrices: boolean;
}

const defaultSettings: GlobalSettings = { showPrices: true };

const GlobalSettingsContext = createContext<GlobalSettings>(defaultSettings);

export const GlobalSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);

  useEffect(() => {
    const unsub = FirebaseService.listen('settings/showPrices', (val) => {
      setSettings(prev => ({
        ...prev,
        showPrices: val === undefined ? true : val
      }));
    });
    return () => unsub();
  }, []);

  return (
    <GlobalSettingsContext.Provider value={settings}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
