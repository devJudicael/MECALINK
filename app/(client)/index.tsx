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
  const hasInitialized = useRef(false); // S'assurer d'une seule exécution

  useEffect(() => {
    if (hasInitialized.current) return;

    const getLocationAndGarages = async () => {
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

        const userRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setLocation(currentLocation);
        setRegion(userRegion);

        await fetchNearbyGarages(currentLocation); // Appel unique ici

        hasInitialized.current = true; // Marquer comme fait
      } catch (err) {
        console.error('Erreur localisation :', err);
        // Coordonnées de fallback
        setRegion({
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getLocationAndGarages();
  }, []); // Exécute une seule fois

  const handleMarkerPress = (garage: Garage) => {
    console.log('marker press', JSON.stringify(garage, null, 2));
    // return;
    router.push({
      pathname: '/garage-details',
      params: { garageId: garage.id },
    });
  };

  const centerOnUserLocation = () => {
    if (location) {
      setRegion((prevRegion) => ({
        ...prevRegion!,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
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
          {nearbyGarages.length} garage(s) trouvé(s)
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
              // console.log(
              //   '-- nearbyGarages -- ',
              //   JSON.stringify(garage, null, 2)
              // );
              return (
                <Marker
                  key={`garage-${garage._id}-${index}`}
                  coordinate={{
                    latitude: garage?.location?.latitude || 0,
                    longitude: garage?.location?.longitude || 0,
                  }}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
