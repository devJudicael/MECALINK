import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { useGarageStore } from '@/stores/garages';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Car,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';

export default function GarageDetailsScreen() {
  const { garageId } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createRequest } = useService();
  const { getGarageById, selectedGarage, setSelectedGarage } = useGarageStore();
  
  const [loading, setLoading] = useState(true);
  const [garage, setGarage] = useState(null);
  
  useEffect(() => {
    const fetchGarageDetails = async () => {
      setLoading(true);
      try {
        const garageDetails = await getGarageById(garageId as string);
        if (garageDetails) {
          setGarage(garageDetails);
          setSelectedGarage(garageDetails);
        } else {
          Alert.alert('Erreur', 'Impossible de trouver les détails du garage');
        }
      } catch (error) {
        console.error('Error fetching garage details:', error);
        Alert.alert('Erreur', 'Impossible de récupérer les détails du garage');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGarageDetails();
    
    return () => {
      setSelectedGarage(null);
    };
  }, [garageId]);

  const [description, setDescription] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!garage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du garage</Text>
        </View>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#dc2626" />
          <Text style={styles.errorText}>Garage non trouvé</Text>
          <TouchableOpacity 
            style={styles.backToListButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToListText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitRequest = async () => {
    if (!currentUser) {
      Alert.alert(
        'Erreur',
        'Vous devez être connecté pour envoyer une demande'
      );
      return;
    }

    if (
      !description.trim() ||
      !vehicleMake.trim() ||
      !vehicleModel.trim() ||
      !vehicleYear.trim() ||
      !licensePlate.trim()
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let userLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
        address: 'Paris, France',
      };

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const reverseGeocodeResult = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocodeResult.length > 0) {
          const address = reverseGeocodeResult[0];
          userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: `${address.street || ''} ${address.streetNumber || ''}, ${
              address.city || ''
            }, ${address.region || ''}`.trim(),
          };
        }
      }

      await createRequest({
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientPhone: currentUser.phone,
        clientEmail: currentUser.email,
        garageId: garage.id,
        garageName: garage.name,
        description: description.trim(),
        location: userLocation,
        vehicleInfo: {
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          year: vehicleYear.trim(),
          licensePlate: licensePlate.trim(),
        },
        urgency,
      });

      Alert.alert(
        'Demande envoyée',
        'Votre demande de dépannage a été envoyée au garage. Vous recevrez une réponse sous peu.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert(
        'Erreur',
        "Une erreur est survenue lors de l'envoi de votre demande"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du garage</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.garageCard}>
            <View style={styles.garageHeader}>
              <Text style={styles.garageName}>{garage.name}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MapPin size={20} color="#64748b" />
                <Text style={styles.infoText}>{garage.address}</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={20} color="#64748b" />
                <Text style={styles.infoText}>{garage.openingHours}</Text>
              </View>
              <View style={styles.infoItem}>
                <Phone size={20} color="#64748b" />
                <Text style={styles.infoText}>{garage.phone}</Text>
              </View>
              <View style={styles.infoItem}>
                <Mail size={20} color="#64748b" />
                <Text style={styles.infoText}>{garage.email}</Text>
              </View>
            </View>

            <Text style={styles.description}>{garage.description}</Text>

            <View style={styles.servicesContainer}>
              <Text style={styles.servicesTitle}>Services proposés</Text>
              <View style={styles.servicesList}>
                {garage.services.map((service: any, index: number) => (
                  <View key={index} style={styles.serviceTag}>
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.requestForm}>
            <Text style={styles.formTitle}>Demander un dépannage</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description du problème</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Décrivez votre problème en détail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* <View style={styles.vehicleSection}>
              <Text style={styles.sectionTitle}>Informations du véhicule</Text>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Marque *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Renault"
                    value={vehicleMake}
                    onChangeText={setVehicleMake}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Modèle *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Clio"
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Année *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: 2020"
                    value={vehicleYear}
                    onChangeText={setVehicleYear}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Plaque *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: AB-123-CD"
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View> */}

            {/* <View style={styles.urgencySection}>
              <Text style={styles.sectionTitle}>Niveau d'urgence</Text>
              <View style={styles.urgencyButtons}>
                {[
                  { key: 'low', label: 'Faible', color: '#059669' },
                  { key: 'medium', label: 'Moyen', color: '#EA580C' },
                  { key: 'high', label: 'Urgent', color: '#dc2626' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.urgencyButton,
                      urgency === option.key && {
                        backgroundColor: option.color,
                      },
                    ]}
                    onPress={() => setUrgency(option.key as any)}
                  >
                    <Text
                      style={[
                        styles.urgencyButtonText,
                        urgency === option.key &&
                          styles.urgencyButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View> */}

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitRequest}
              disabled={isSubmitting}
            >
              <Car size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  backToListButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  garageCard: {
    backgroundColor: '#fff',
    margin: 20,
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
  garageHeader: {
    marginBottom: 20,
  },
  garageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  openText: {
    color: '#059669',
  },
  closedText: {
    color: '#dc2626',
  },
  infoContainer: {
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  servicesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  requestForm: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
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
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  vehicleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  urgencySection: {
    marginBottom: 24,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  urgencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  urgencyButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
