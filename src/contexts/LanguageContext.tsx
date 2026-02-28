import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'am';

interface Translations {
  // App title and branding
  appName: string;
  appTagline: string;
  
  // Search
  searchPlaceholder: string;
  searchStart: string;
  searchDestination: string;
  
  // Navigation
  getDirections: string;
  startNavigation: string;
  stopNavigation: string;
  clearRoute: string;
  
  // Transport modes
  driving: string;
  walking: string;
  
  // Route info
  distance: string;
  duration: string;
  estimatedArrival: string;
  
  // Directions
  turnLeft: string;
  turnRight: string;
  goStraight: string;
  arrive: string;
  depart: string;
  
  // Location
  myLocation: string;
  currentLocation: string;
  locating: string;
  
  // Actions
  search: string;
  cancel: string;
  close: string;
  
  // Status messages
  noResults: string;
  searching: string;
  calculating: string;
  routeFound: string;
  noRouteFound: string;
  
  // Units
  km: string;
  m: string;
  min: string;
  hour: string;
  hours: string;
  
  // Misc
  favorites: string;
  recent: string;
  shareRoute: string;
  enterApiKey: string;
  apiKeyPlaceholder: string;
  saveApiKey: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Gebeta Navigate',
    appTagline: 'Ethiopian Navigation',
    
    searchPlaceholder: 'Search places in Ethiopia...',
    searchStart: 'Starting point',
    searchDestination: 'Where to?',
    
    getDirections: 'Get Directions',
    startNavigation: 'Start Navigation',
    stopNavigation: 'Stop Navigation',
    clearRoute: 'Clear Route',
    
    driving: 'Driving',
    walking: 'Walking',
    
    distance: 'Distance',
    duration: 'Duration',
    estimatedArrival: 'Estimated Arrival',
    
    turnLeft: 'Turn left',
    turnRight: 'Turn right',
    goStraight: 'Continue straight',
    arrive: 'Arrive at destination',
    depart: 'Depart from',
    
    myLocation: 'My Location',
    currentLocation: 'Current Location',
    locating: 'Locating...',
    
    search: 'Search',
    cancel: 'Cancel',
    close: 'Close',
    
    noResults: 'No results found',
    searching: 'Searching...',
    calculating: 'Calculating route...',
    routeFound: 'Route found',
    noRouteFound: 'No route found',
    
    km: 'km',
    m: 'm',
    min: 'min',
    hour: 'hr',
    hours: 'hrs',
    
    favorites: 'Favorites',
    recent: 'Recent',
    shareRoute: 'Share Route',
    enterApiKey: 'Enter your Gebeta Maps API key',
    apiKeyPlaceholder: 'Your API key',
    saveApiKey: 'Save API Key',
  },
  am: {
    appName: 'ገበታ ናቪጌት',
    appTagline: 'የኢትዮጵያ ናቪጌሽን',
    
    searchPlaceholder: 'በኢትዮጵያ ውስጥ ቦታዎችን ይፈልጉ...',
    searchStart: 'የመነሻ ቦታ',
    searchDestination: 'የት መሄድ ይፈልጋሉ?',
    
    getDirections: 'አቅጣጫዎችን ያግኙ',
    startNavigation: 'ናቪጌሽን ጀምር',
    stopNavigation: 'ናቪጌሽን አቁም',
    clearRoute: 'መንገድ አጥፋ',
    
    driving: 'መኪና',
    walking: 'እግር',
    
    distance: 'ርቀት',
    duration: 'ጊዜ',
    estimatedArrival: 'የሚገመተው የመድረሻ ጊዜ',
    
    turnLeft: 'ወደ ግራ ታጠፍ',
    turnRight: 'ወደ ቀኝ ታጠፍ',
    goStraight: 'ቀጥታ ቀጥል',
    arrive: 'መድረሻ ላይ ደርሰሃል',
    depart: 'ከ ተነሳ',
    
    myLocation: 'የእኔ ቦታ',
    currentLocation: 'አሁን ያለሁበት ቦታ',
    locating: 'ቦታ በመፈለግ ላይ...',
    
    search: 'ፈልግ',
    cancel: 'ተወው',
    close: 'ዝጋ',
    
    noResults: 'ውጤት አልተገኘም',
    searching: 'በመፈለግ ላይ...',
    calculating: 'መንገድ በማስላት ላይ...',
    routeFound: 'መንገድ ተገኘ',
    noRouteFound: 'መንገድ አልተገኘም',
    
    km: 'ኪሜ',
    m: 'ሜ',
    min: 'ደቂቃ',
    hour: 'ሰዓት',
    hours: 'ሰዓታት',
    
    favorites: 'ተወዳጆች',
    recent: 'የቅርብ ጊዜ',
    shareRoute: 'መንገድ አጋራ',
    enterApiKey: 'የገበታ ማፕስ API ቁልፍዎን ያስገቡ',
    apiKeyPlaceholder: 'የእርስዎ API ቁልፍ',
    saveApiKey: 'API ቁልፍ አስቀምጥ',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isAmharic: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isAmharic: language === 'am',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
