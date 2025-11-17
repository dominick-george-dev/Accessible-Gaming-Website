// API service for backend communication
const API_BASE_URL = 'http://localhost:3000'; // Updated to correct backend port

export interface UserAccessibilitySettings {
  id?: number;
  userId: number;
  
  // Text settings
  textSize?: number;
  fontFamily?: string;
  
  // Visual settings
  highContrast?: boolean;
  colorBlindMode?: string;
  colourMode?: string;
  
  // Accessibility preferences
  visualAccessibility?: boolean;
  hearingAccessibility?: boolean;
  motorDexterityAccessibility?: boolean;
  cognitiveAccessibility?: boolean;
  
  // Magnifier
  screenMagnifier?: boolean;
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers with authentication
const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Get user accessibility settings
export async function getUserAccessibilitySettings(userId: number): Promise<UserAccessibilitySettings> {
  const response = await fetch(`${API_BASE_URL}/user-accessibility-settings/${userId}`, {
    headers: createAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user accessibility settings');
  }
  return response.json();
}

// Update user accessibility settings
export async function updateUserAccessibilitySettings(
  userId: number, 
  settings: Partial<UserAccessibilitySettings>
): Promise<UserAccessibilitySettings> {
  const response = await fetch(`${API_BASE_URL}/user-accessibility-settings/${userId}`, {
    method: 'PUT',
    headers: createAuthHeaders(),
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user accessibility settings');
  }
  return response.json();
}

// Create user accessibility settings
export async function createUserAccessibilitySettings(
  userId: number, 
  settings: Partial<UserAccessibilitySettings>
): Promise<UserAccessibilitySettings> {
  const response = await fetch(`${API_BASE_URL}/user-accessibility-settings/${userId}`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user accessibility settings');
  }
  return response.json();
}
