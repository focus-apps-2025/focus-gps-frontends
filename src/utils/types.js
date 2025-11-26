// frontend/src/utils/types.ts

// --- API Response Types ---
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string; // Optional, can be included if needed
}

export interface IPhoto {
  _id: string;
  userId: string | IUser; // Can be string (ID) or populated IUser object
  imageUrl: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string; // ISO string
  createdAt?: string;
}

export interface IAuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

// --- Context Types ---
export interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register?: (name: string, email: string, password: string) => Promise<void>; // Register is removed for public, kept optional
  logout: () => void;
}

// --- Geolocation Type ---
export interface GeolocationPositionCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface GeolocationPosition {
  coords: GeolocationPositionCoords;
  timestamp:number;
}

// --- Component Props Types (Examples) ---
// If you had a PhotoCard component:
// export interface PhotoCardProps {
//   photo: IPhoto;
//   onViewMap: (lat: number, lng: number) => void;
// }