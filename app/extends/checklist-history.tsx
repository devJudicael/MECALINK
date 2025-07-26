import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChecklistHistory = () => {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError("Vous devez être connecté pour voir l'historique");
        setLoading(false);
        return;
      }

      // Ajouter un timeout pour éviter que la requête ne reste bloquée indéfiniment
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout

      try {
        const response = await axios.get(API_ENDPOINTS.CHECKLISTS.HISTORY, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log('Réponse historique:', response.data);
        setHistory(response.data);
      } catch (axiosError) {
        clearTimeout(timeoutId);
        if (
          axiosError.name === 'AbortError' ||
          axiosError.name === 'CanceledError'
        ) {
          setError(
            'La requête a pris trop de temps. Vérifiez votre connexion internet.'
          );
        } else if (axiosError.message === 'Network Error') {
          setError(
            'Erreur de connexion au serveur. Vérifiez votre connexion internet ou réessayez plus tard.'
          );
        } else if (axiosError.response) {
          // Erreur avec réponse du serveur
          if (axiosError.response.status === 401) {
            setError('Session expirée. Veuillez vous reconnecter.');
          } else {
            setError(`Erreur du serveur: ${axiosError.response.status}`);
          }
        } else {
          setError(
            "Une erreur est survenue lors du chargement de l'historique."
          );
        }
        console.error(
          "Erreur lors de la récupération de l'historique:",
          axiosError
        );
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setError('Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/extends/checklist-details',
          params: { id: item._id },
        })
      }
      style={styles.historyItem}
    >
      <Text>
        {new Date(item.date).toLocaleDateString()} - {item.registration}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucune fiche de pré-démarrage trouvée
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ChecklistHistory;
