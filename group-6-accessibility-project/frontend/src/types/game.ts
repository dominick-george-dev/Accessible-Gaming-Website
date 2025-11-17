export interface AccessibilityTag {
  id: string;
  name: string;
  category: 'visual' | 'hearing' | 'dexterity' | 'cognitive';
  verified: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  images: string[];
  trailer: string;
  transcript: string;
  genre: string[];
  developer: string;
  rating: number;
  reviewCount: number;
  accessibilityTags: AccessibilityTag[];
  detailedDescription: string;
  screenshots: string[];
  verified: boolean;
}

export interface Review {
  id: number;
  gameId: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  accessibilityFeedback: string[];
  createdAt: Date;
  updatedAt: Date;
  helpful: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[];
  isAdmin: boolean;
  accessibilityPreferences: {
    visual: boolean;
    hearing: boolean;
    dexterity: boolean;
    cognitive: boolean;
    textSize: number; // Base font size in pixels
    highContrast: boolean; // High contrast mode for color blind/visually impaired
  };
}
