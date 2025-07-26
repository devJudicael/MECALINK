import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

const ChecklistDetails = () => {
  const { id }: { id: string } = useLocalSearchParams();
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isRetrying) setIsRetrying(true);

      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(API_ENDPOINTS.CHECKLISTS.DETAILS(id), {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 secondes de timeout
      });
      setChecklist(response.data);
      setLoading(false);
      if (isRetrying) setIsRetrying(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      setLoading(false);
      if (isRetrying) setIsRetrying(false);

      if (error.code === 'ECONNABORTED') {
        setError("Délai d'attente dépassé. Veuillez réessayer.");
      } else if (error.response) {
        // Erreur de réponse du serveur
        if (error.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else if (error.response.status === 404) {
          setError('Fiche non trouvée.');
        } else {
          setError(
            `Erreur serveur (${error.response.status}). Veuillez réessayer.`
          );
        }
      } else if (error.request) {
        // Erreur de réseau
        setError(
          'Problème de connexion réseau. Vérifiez votre connexion et réessayez.'
        );
      } else {
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={fetchDetails}
          disabled={isRetrying}
        >
          <Text style={styles.retryButtonText}>
            {isRetrying ? 'Chargement...' : 'Réessayer'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!checklist) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Générales</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(checklist.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Heure:</Text>
              <Text style={styles.infoValue}>{checklist.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Immatriculation:</Text>
              <Text style={styles.infoValue}>{checklist.registration}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kilométrage:</Text>
              <Text style={styles.infoValue}>{checklist.mileage}</Text>
            </View>
          </View>
        </View>

        {checklist.observations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observations</Text>
            <View style={styles.card}>
              <Text style={styles.observations}>{checklist.observations}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contrôles Extérieurs</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pneus:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.tires}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Écrous des roues:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.wheelNuts}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Carrosserie:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.body}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pneu de secours:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.spareTire}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pare-brise:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.windshield}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Essuie-glaces:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.wipers}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Feux:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.lights}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voyants:</Text>
              <Text style={styles.infoValue}>
                {checklist.exteriorChecks.indicators}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contrôles Mécaniques</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Niveau d'huile:</Text>
              <Text style={styles.infoValue}>
                {checklist.mechanicalChecks.oilLevel}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Liquide de refroidissement:</Text>
              <Text style={styles.infoValue}>
                {checklist.mechanicalChecks.coolant}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batterie:</Text>
              <Text style={styles.infoValue}>
                {checklist.mechanicalChecks.battery}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Courroie:</Text>
              <Text style={styles.infoValue}>
                {checklist.mechanicalChecks.belt}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contrôles Intérieurs</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sièges et ceintures:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.seatsBelts}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Freins:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.brakes}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Climatisation:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.ac}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Système 4x4:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.fourByFour}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Extincteur:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.extinguisher}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trousse de secours:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.firstAid}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Triangle:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.triangle}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cric et outils:</Text>
              <Text style={styles.infoValue}>
                {checklist.interiorChecks.jackTools}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#334155',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    textAlign: 'right',
  },
  observations: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  spacer: {
    height: 40,
  },
});

export default ChecklistDetails;
