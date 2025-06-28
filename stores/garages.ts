import { create } from 'zustand';
import * as Location from 'expo-location';
import type { Garage } from '../types';
import { distanceBetweenTwo } from '@/utils/distanceBetweenTwo';
import { Alert } from 'react-native';
import { API_URL } from '../config/api';

type GarageStore = {
  nearbyGarages: Garage[];
  selectedGarage: Garage | null;
  isLoading: boolean;
  error: string | null;
  fetchNearbyGarages: (
    position: Location.LocationObject,
    radius?: number
  ) => Promise<void>;
  getGarageById: (id: string) => Promise<Garage | null>;
  setSelectedGarage: (garage: Garage | null) => void;
};

export const useGarageStore = create<GarageStore>((set, get) => ({
  nearbyGarages: [],
  selectedGarage: null,
  isLoading: false,
  error: null,

  fetchNearbyGarages: async (
    position: Location.LocationObject,
    radius = 10
  ) => {
    // console.log('fetch garages');
    const { latitude, longitude } = position.coords;

    set({ isLoading: true, error: null });

    try {
      // Appel à l'API pour récupérer les garages à proximité
      const response = await fetch(
        `${API_URL}/garages/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error('Impossible de récupérer les garages à proximité');
      }

      const garages = await response.json();

      // Si l'API ne renvoie pas la distance, la calculer localement
      const garagesWithDistance = garages.map((garage: Garage) => ({
        ...garage,
        distance:
          garage.distance ||
          distanceBetweenTwo(
            { latitude, longitude },
            { latitude: garage.latitude, longitude: garage.longitude }
          ),
      }));

      set({
        nearbyGarages: garagesWithDistance.sort(
          (a: Garage, b: Garage) => a.distance! - b.distance!
        ),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching nearby garages:', error);

      // En cas d'erreur, générer des garages fictifs pour la démo
      const mockGarages = Array.from({ length: 5 }, (_, index) => {
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

      set({
        nearbyGarages: mockGarages.sort((a, b) => a.distance! - b.distance!),
        isLoading: false,
        error:
          'Impossible de se connecter au serveur. Affichage de données fictives.',
      });

      Alert.alert(
        'Erreur de connexion',
        'Impossible de récupérer les garages depuis le serveur. Des données fictives sont affichées à la place.'
      );
    }
  },

  getGarageById: async (id: string) => {
    // console.log('-- garage id getGarageById -- ', id);
    try {
      // Vérifier d'abord si le garage est déjà dans le store
      const { nearbyGarages } = get();
      // console.log(
      //   '-- nearbyGarages --',
      //   JSON.stringify(nearbyGarages, null, 2)
      // );
      const cachedGarage = nearbyGarages.find((garage) => garage._id === id);

      if (cachedGarage) {
        // console.log(
        //   '-- return here cached garage --',
        //   JSON.stringify(cachedGarage, null, 2)
        // );
        return cachedGarage;
      }

      // Sinon, appeler l'API
      const response = await fetch(`${API_URL}/garages/${id}`);

      if (!response.ok) {
        throw new Error('Impossible de récupérer les détails du garage');
      }

      const garage = await response.json();
      return garage;
    } catch (error) {
      console.error('Error fetching garage details:', error);
      return null;
    }
  },

  setSelectedGarage: (garage: Garage | null) => {
    set({ selectedGarage: garage });
  },
}));
