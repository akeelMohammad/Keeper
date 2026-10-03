export interface Appliance {
  id: string;
  name: string;
  brand: string;
  location: string;
  added: string;
  status: string;
  details: string;
  price: number;
  purchaseDate?: string;
  expiryDate?: string;
  imageUri?: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUri: string | null;
  alertDays: number;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: '#d1fae5', text: '#059669' },
  EXPIRING: { bg: '#fef3c7', text: '#d97706' },
  EXPIRED: { bg: '#fee2e2', text: '#dc2626' },
};

export const KNOWN_BRANDS = ['BREVILLE', 'SONY', 'LG', 'SAMSUNG', 'DYSON', 'APPLE', 'BOSCH', 'PHILIPS', 'PANASONIC', 'KITCHENAID'];
export const CATEGORY_OPTIONS = ['Kitchen', 'Living Room', 'Laundry', 'Office', 'Garage', 'Other'];