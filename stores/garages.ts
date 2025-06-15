import { create } from 'zustand';
import * as Location from 'expo-location';
import type { Garage } from '../types/garages';
import { distanceBetweenTwo } from '@/utils/distanceBetweenTwo';

type GarageStore = {
  nearbyGarages: Garage[];
  generateNearbyGarages: (position: Location.LocationObject) => void;
};

export const useGarageStore = create<GarageStore>((set) => ({
  nearbyGarages: [],

  generateNearbyGarages: (position: Location.LocationObject) => {
    const { latitude, longitude } = position.coords;

    const garages = Array.from({ length: 5 }, (_, index) => {
      const garageLatitude = latitude + (Math.random() - 0.5) * 0.01;
      const garageLongitude = longitude + (Math.random() - 0.5) * 0.01;

      return {
        id: String(index + 1),
        name: `Garage ${index + 1}`,
        email: `garage${index + 1}@example.com`,
        phone: `01 ${Math.floor(Math.random() * 100)} ${Math.floor(
          Math.random() * 100
        )} ${Math.floor(Math.random() * 100)} ${Math.floor(
          Math.random() * 100
        )}`,
        address: `${Math.floor(Math.random() * 100)} Rue Example`,
        latitude: garageLatitude,
        longitude: garageLongitude,
        services: ['Dépannage', 'Remorquage', 'Réparation'],
        rating: 3 + Math.random() * 2,
        isOpen: Math.random() > 0.5,
        openingHours: '8h-18h',
        description: 'Garage de proximité',
        distance: distanceBetweenTwo(
          { latitude, longitude },
          { latitude: garageLatitude, longitude: garageLongitude }
        ),
      };
    });

    set({ nearbyGarages: garages });
  },
}));
