import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import type { Garage } from '@/types';
import { Navigation } from 'lucide-react-native';
import { useGarageStore } from '../../stores/garages';

export default function ClientMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    fetchNearbyGarages,
    nearbyGarages,
    isLoading: isLoadingGarages,
    error,
  } = useGarageStore();
  const router = useRouter();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission requise',
            "L'accès à la géolocalisation est nécessaire pour afficher les garages à proximité"
          );
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = currentLocation.coords;

        setLocation(currentLocation);
        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        await fetchNearbyGarages({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        hasInitialized.current = true;
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de la localisation :',
          error
        );
        setRegion({
          latitude: 48.8566, // Paris fallback
          longitude: 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getLocationPermission();
  }, []);

  const handleMarkerPress = (garage: Garage) => {
    router.push({
      pathname: '/garage-details',
      params: { garageId: garage.id },
    });
  };

  const centerOnUserLocation = () => {
    if (location && region) {
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  if (isLoading || isLoadingGarages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  if (error) {
    Alert.alert(
      'Erreur de connexion',
      "Des données fictives sont affichées car nous n'avons pas pu nous connecter au serveur."
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Garages à proximité</Text>
        <Text style={styles.subtitle}>
          {nearbyGarages.length} garages trouvés
        </Text>
      </View>

      {region && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {nearbyGarages.map((garage, index) => {
              const latitude = garage?.location?.latitude;
              const longitude = garage?.location?.longitude;

              if (
                typeof latitude !== 'number' ||
                typeof longitude !== 'number' ||
                isNaN(latitude) ||
                isNaN(longitude)
              ) {
                return null;
              }

              return (
                <Marker
                  key={`garage-${garage._id}-${index}`}
                  coordinate={{ latitude, longitude }}
                  title={garage?.name}
                  description={`${garage?.rating?.toFixed(1)}⭐ - ${
                    garage?.isOpen ? 'Ouvert' : 'Fermé'
                  } - ${garage?.distance?.toFixed(2)} km`}
                  onPress={() => handleMarkerPress(garage)}
                  pinColor={garage?.isOpen ? '#059669' : '#64748b'}
                />
              );
            })}
          </MapView>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={centerOnUserLocation}
          >
            <Navigation size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   header: { padding: 16 },
//   title: { fontSize: 20, fontWeight: 'bold', color: '#111' },
//   subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
//   mapContainer: { flex: 1 },
//   map: { flex: 1 },
//   locationButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     backgroundColor: 'white',
//     borderRadius: 50,
//     padding: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerClosed: {
    backgroundColor: '#f1f5f9',
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
