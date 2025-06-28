import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  LogOut,
  Wrench,
  MapPin,
  Clock,
  Navigation,
} from 'lucide-react-native';
import { Garage, Location } from '@/types';
import * as ExpoLocation from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

export default function GarageProfileScreen() {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [garageData, setGarageData] = useState<Garage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  // Charger les données du garage au chargement de l'écran
  useEffect(() => {
    const loadGarageData = async () => {
      if (!currentUser) return;

      console.log('--- currentUser ---', JSON.stringify(currentUser, null, 2));

      try {
        setLoading(true);

        // Ici, nous utilisons les données de l'utilisateur actuel comme données de garage
        // Dans une implémentation complète, vous feriez un appel API pour obtenir les détails du garage
        setGarageData({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || 'Non spécifié',
          address: currentUser.address || 'Adresse non spécifiée',
          location: currentUser.location || { latitude: 0, longitude: 0 },
          services: currentUser.services || [],
          openingHours: currentUser.openingHours || 'Non spécifié',
          rating: currentUser.rating || 0,
          isOpen: true,
          distance: 0,
          role: currentUser.role,
        });
      } catch (err) {
        console.error('Erreur lors du chargement des données du garage:', err);
        setError('Impossible de charger les données du profil');
      } finally {
        setLoading(false);
      }
    };

    loadGarageData();
  }, [currentUser]);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const updateGarageLocation = async () => {
    if (!currentUser || !garageData) return;

    try {
      // Demander la permission d'accéder à la localisation
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          "L'accès à la localisation est nécessaire pour définir la position de votre garage."
        );
        return;
      }

      setUpdatingLocation(true);

      // Obtenir la position actuelle
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      // Obtenir l'adresse à partir des coordonnées
      const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let address = 'Adresse non disponible';

      if (reverseGeocode.length > 0) {
        const addressData = reverseGeocode[0];
        address = `${addressData.street || ''} ${
          addressData.streetNumber || ''
        }, ${addressData.city || ''}, ${addressData.region || ''}, ${
          addressData.country || ''
        }`
          .replace(/,\s*,/g, ',')
          .replace(/^\s*,\s*|\s*,\s*$/g, '')
          .trim();
      }

      // Récupérer le token d'authentification
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert(
          'Erreur',
          'Vous devez être connecté pour effectuer cette action'
        );
        return;
      }

      // Créer l'objet de localisation
      const newLocation: Location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address,
      };

      // Mettre à jour les données du garage avec la nouvelle position
      const updatedGarageData = {
        ...garageData,
        location: newLocation,
        address: newLocation.address,
      };

      // Mettre à jour les données du garage dans l'API
      const response = await fetch(`${API_URL}/garages/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: newLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la mise à jour de la position'
        );
      }

      // Mettre à jour les données locales avec la nouvelle position
      const updatedGarageWithLocation = {
        ...garageData,
        location: newLocation,
        address: newLocation.address
      };
      setGarageData(updatedGarageWithLocation);

      // Mettre à jour les données de l'utilisateur dans AsyncStorage
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        const newUser = {
          ...user,
          location: newLocation,
          address: newLocation.address
        };
        await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      }

      Alert.alert(
        'Succès',
        'La position de votre garage a été mise à jour avec succès'
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour la position du garage'
      );
    } finally {
      setUpdatingLocation(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setLoading(true)} // Cela déclenchera un nouveau chargement via useEffect
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser || !garageData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Wrench size={32} color="#059669" />
          </View>
          <Text style={styles.name}>{garageData.name}</Text>
          <Text style={styles.role}>Garagiste</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Informations professionnelles
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <User size={20} color="#64748b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nom du garage</Text>
                  <Text style={styles.infoValue}>{garageData.name}</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoItem}>
                <Mail size={20} color="#64748b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{garageData.email}</Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoItem}>
                <Phone size={20} color="#64748b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoValue}>{garageData.phone}</Text>
                </View>
              </View>

              {garageData?.role === 'garage' &&
                garageData?.location?.latitude === 0 && (
                  <>
                    <View style={styles.separator} />
                    <View style={styles.infoItem}>
                      <MapPin size={20} color="#64748b" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Adresse</Text>
                        <Text style={styles.infoValue}>Non spécifié</Text>
                      </View>
                    </View>
                  </>
                )}

              {garageData?.role === 'garage' &&
                garageData?.location?.latitude !== 0 &&
                garageData?.address && (
                  <>
                    <View style={styles.separator} />
                    <View style={styles.infoItem}>
                      <MapPin size={20} color="#64748b" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Adresse</Text>
                        <Text style={styles.infoValue}>
                          {garageData?.address}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

              <View style={styles.separator} />

              {garageData?.role === 'garage' &&
                garageData?.location?.latitude === 0 && (
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={updateGarageLocation}
                    disabled={updatingLocation}
                  >
                    <Navigation size={20} color="#fff" />
                    <Text style={styles.locationButtonText}>
                      {updatingLocation
                        ? 'Mise à jour...'
                        : 'Utiliser ma position actuelle'}
                    </Text>
                    {updatingLocation && (
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                        style={styles.locationLoader}
                      />
                    )}
                  </TouchableOpacity>
                )}
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  serviceTag: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  serviceText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  locationLoader: {
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});
