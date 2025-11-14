import type { Game, Review, User, AccessibilityTag } from '../types/game';

export const accessibilityTags: AccessibilityTag[] = [
  { id: 'v1', name: 'Colorblind Mode', category: 'visual', verified: true },
  { id: 'v2', name: 'High Contrast', category: 'visual', verified: true },
  { id: 'v3', name: 'Adjustable Text Size', category: 'visual', verified: true },
  { id: 'v4', name: 'Screen Reader Support', category: 'visual', verified: true },
  { id: 'h1', name: 'Subtitles/Captions', category: 'hearing', verified: true },
  { id: 'h2', name: 'Visual Cues', category: 'hearing', verified: true },
  { id: 'h3', name: 'No Audio Required', category: 'hearing', verified: true },
  { id: 'd1', name: 'One-Hand Mode', category: 'dexterity', verified: true },
  { id: 'd2', name: 'Voice Control', category: 'dexterity', verified: true },
  { id: 'd3', name: 'Switch Control', category: 'dexterity', verified: true },
  { id: 'd4', name: 'Adjustable Speed', category: 'dexterity', verified: true },
  { id: 'c1', name: 'Simple Interface', category: 'cognitive', verified: true },
  { id: 'c2', name: 'Tutorial Mode', category: 'cognitive', verified: true },
  { id: 'c3', name: 'Pause Anytime', category: 'cognitive', verified: true },
];

export const mockGames: Game[] = [
  {
    id: '1',
    name: 'Puzzle Quest Adventures',
    description: 'A relaxing puzzle game with full accessibility support for all players.',
    thumbnail: 'https://images.unsplash.com/photo-1758789886442-a796b7d799b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzYwMjYxOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    genre: ['Puzzle', 'Adventure'],
    developer: 'Accessible Games Inc.',
    rating: 4.8,
    reviewCount: 1247,
    verified: true,
    accessibilityTags: [
      accessibilityTags[0], // Colorblind Mode
      accessibilityTags[2], // Adjustable Text Size
      accessibilityTags[4], // Subtitles/Captions
      accessibilityTags[7], // One-Hand Mode
      accessibilityTags[10], // Simple Interface
      accessibilityTags[12], // Pause Anytime
    ],
    detailedDescription: 'Embark on a magical journey through beautifully crafted puzzle worlds. This game features comprehensive accessibility options including colorblind modes, one-handed play, and full voice-over support.',
    screenshots: ['https://images.unsplash.com/photo-1758789886442-a796b7d799b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzYwMjYxOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
  },
  {
    id: '2',
    name: 'Word Master Pro',
    description: 'Voice-controlled word game perfect for players with limited mobility.',
    thumbnail: 'https://images.unsplash.com/photo-1605429201125-37e867327609?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JkJTIwZ2FtZXxlbnwxfHx8fDE3NjAyNjE5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    genre: ['Word', 'Educational'],
    developer: 'VoicePlay Studios',
    rating: 4.6,
    reviewCount: 892,
    verified: true,
    accessibilityTags: [
      accessibilityTags[1], // High Contrast
      accessibilityTags[2], // Adjustable Text Size
      accessibilityTags[3], // Screen Reader Support
      accessibilityTags[8], // Voice Control
      accessibilityTags[9], // Switch Control
      accessibilityTags[11], // Tutorial Mode
    ],
    detailedDescription: 'Challenge your vocabulary with full voice command support. No touching required - play entirely with your voice!',
    screenshots: ['https://images.unsplash.com/photo-1605429201125-37e867327609?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JkJTIwZ2FtZXxlbnwxfHx8fDE3NjAyNjE5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
  },
  {
    id: '3',
    name: 'Rhythm Lights',
    description: 'Music rhythm game with visual feedback for hearing-impaired players.',
    thumbnail: 'https://images.unsplash.com/photo-1550318567-4dacd88b5380?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaHl0aG0lMjBnYW1lfGVufDF8fHx8MTc2MDI2MTk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    genre: ['Music', 'Rhythm'],
    developer: 'Inclusive Entertainment',
    rating: 4.9,
    reviewCount: 2103,
    verified: true,
    accessibilityTags: [
      accessibilityTags[0], // Colorblind Mode
      accessibilityTags[5], // Visual Cues
      accessibilityTags[6], // No Audio Required
      accessibilityTags[7], // One-Hand Mode
      accessibilityTags[10], // Adjustable Speed
    ],
    detailedDescription: 'Experience rhythm gaming through vibrant visual patterns. Designed for deaf and hard-of-hearing players with haptic feedback and visual rhythm indicators.',
    screenshots: ['https://images.unsplash.com/photo-1550318567-4dacd88b5380?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaHl0aG0lMjBnYW1lfGVufDF8fHx8MTc2MDI2MTk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
  },
  {
    id: '4',
    name: 'Chess Companion',
    description: 'Fully accessible chess game with voice guidance and switch control.',
    thumbnail: 'https://images.unsplash.com/photo-1640954244104-2429acf756b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzcyUyMGJvYXJkfGVufDF8fHx8MTc2MDI2MTk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    genre: ['Strategy', 'Board Game'],
    developer: 'Mindful Games',
    rating: 4.7,
    reviewCount: 1556,
    verified: true,
    accessibilityTags: [
      accessibilityTags[1], // High Contrast
      accessibilityTags[3], // Screen Reader Support
      accessibilityTags[4], // Subtitles/Captions
      accessibilityTags[8], // Voice Control
      accessibilityTags[9], // Switch Control
      accessibilityTags[12], // Pause Anytime
    ],
    detailedDescription: 'Play chess with complete accessibility features including voice-guided moves, high contrast boards, and switch control support.',
    screenshots: ['https://images.unsplash.com/photo-1640954244104-2429acf756b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzcyUyMGJvYXJkfGVufDF8fHx8MTc2MDI2MTk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
  },
  {
    id: '5',
    name: 'Memory Match Deluxe',
    description: 'Memory card game with customizable accessibility options.',
    thumbnail: 'https://images.unsplash.com/photo-1657993204179-97ac04ef0985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW1vcnklMjBjYXJkc3xlbnwxfHx8fDE3NjAyNjE5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    genre: ['Puzzle', 'Memory'],
    developer: 'Brain Games Ltd',
    rating: 4.5,
    reviewCount: 678,
    verified: false,
    accessibilityTags: [
      accessibilityTags[0], // Colorblind Mode
      accessibilityTags[2], // Adjustable Text Size
      accessibilityTags[7], // One-Hand Mode
      accessibilityTags[10], // Simple Interface
      accessibilityTags[11], // Tutorial Mode
      accessibilityTags[12], // Pause Anytime
    ],
    detailedDescription: 'Train your brain with this classic memory game, enhanced with accessibility features for all players.',
    screenshots: ['https://images.unsplash.com/photo-1657993204179-97ac04ef0985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW1vcnklMjBjYXJkc3xlbnwxfHx8fDE3NjAyNjE5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
  },
  {
    id: '6',
    name: 'Adventure Echo',
    description: 'Audio-described adventure game with full subtitle support.',
    thumbnail: 'https://images.unsplash.com/photo-1513653357777-f7d1b6b95f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBnYW1lfGVufDF8fHx8MTc2MDIwMDE5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    genre: ['Adventure', 'Story'],
    developer: 'Narrative Games',
    rating: 4.8,
    reviewCount: 1923,
    verified: true,
    accessibilityTags: [
      accessibilityTags[2], // Adjustable Text Size
      accessibilityTags[3], // Screen Reader Support
      accessibilityTags[4], // Subtitles/Captions
      accessibilityTags[7], // One-Hand Mode
      accessibilityTags[11], // Tutorial Mode
      accessibilityTags[12], // Pause Anytime
    ],
    detailedDescription: 'Immerse yourself in an epic story with comprehensive audio descriptions and full subtitle support for all dialogue.',
    screenshots: ['https://images.unsplash.com/photo-1513653357777-f7d1b6b95f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBnYW1lfGVufDF8fHx8MTc2MDIwMDE5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
  },
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    gameId: '1',
    userId: 'u1',
    userName: 'Sarah M.',
    rating: 5,
    comment: 'Amazing accessibility features! The colorblind mode works perfectly.',
    accessibilityFeedback: ['Colorblind Mode', 'One-Hand Mode'],
    date: '2025-10-01',
    helpful: 24,
  },
  {
    id: 'r2',
    gameId: '1',
    userId: 'u2',
    userName: 'James K.',
    rating: 5,
    comment: 'I can play this with one hand easily. Great for my needs!',
    accessibilityFeedback: ['One-Hand Mode', 'Adjustable Text Size'],
    date: '2025-09-28',
    helpful: 18,
  },
  {
    id: 'r3',
    gameId: '2',
    userId: 'u3',
    userName: 'Maria L.',
    rating: 4,
    comment: 'Voice control is responsive. Would love more voice commands though.',
    accessibilityFeedback: ['Voice Control', 'Screen Reader Support'],
    date: '2025-10-05',
    helpful: 12,
  },
];

export const mockUser: User = {
  id: 'user123',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  favorites: ['1', '3'],
  isAdmin: true, // Admin user for testing
  accessibilityPreferences: {
    visual: true,
    hearing: false,
    dexterity: true,
    cognitive: false,
    textSize: 16, // Default font size in pixels
    highContrast: false, // High contrast mode
  },
};
