// Types pour les utilisateurs
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'garage';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isActive?: boolean;
}

// Types pour les garages
export interface Garage {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  isOpen: boolean;
  openingHours: string;
  description: string;
  distance?: number;
}

// Types pour les demandes de service
export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  garageId: string;
  garageName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  rejectedAt?: string;
}

// Types pour la localisation
export type Location = {
  latitude: number;
  longitude: number;
  address: string;
};

// Types pour les véhicules
export type VehicleInfo = {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
};
