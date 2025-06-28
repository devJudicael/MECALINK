import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { ServiceRequest } from '../../types';
import {
  Clock,
  MapPin,
  Phone,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  RefreshCw,
  Navigation,
} from 'lucide-react-native';

export default function GarageHistoryScreen() {
  const { currentUser } = useAuth();
  const { getRequestsForGarage, refreshRequests } = useService();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [processedRequests, setProcessedRequests] = useState<ServiceRequest[]>(
    []
  );

  // Charger les demandes au chargement de l'écran
  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  // Filtrer les demandes traitées lorsque les demandes changent
  useEffect(() => {
    setProcessedRequests(
      requests.filter((request) => request.status !== 'pending')
    );
  }, [requests]);

  // Fonction pour charger les demandes
  const loadRequests = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const fetchedRequests = await getRequestsForGarage(currentUser.id);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Erreur', "Impossible de charger l'historique des demandes");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les demandes
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshRequests();
      await loadRequests();
    } catch (error) {
      console.error('Error refreshing requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <CheckCircle size={20} color="#059669" />;
      case 'rejected':
        return <XCircle size={20} color="#dc2626" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return '#059669';
      case 'rejected':
        return '#dc2626';
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Fonction pour ouvrir l'application Maps avec les coordonnées
  const openMapsWithLocation = (latitude: number, longitude: number) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}?q=${latLng}&ll=${latLng}`,
      android: `${scheme}0,0?q=${latLng}`,
    });
    
    Linking.canOpenURL(url!).then(supported => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        // Fallback pour le web ou si l'application Maps n'est pas disponible
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
        Linking.openURL(browserUrl);
      }
    }).catch(err => {
      console.error('Erreur lors de l\'ouverture de Maps:', err);
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application Maps');
    });
  };

  const renderRequestItem = ({ item: request }: { item: ServiceRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.statusContainer}>
          {getStatusIcon(request.status)}
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(request.status) },
            ]}
          >
            {getStatusText(request.status)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(request.createdAt)}</Text>
      </View>

      <Text style={styles.clientName}>{request.clientName}</Text>

      <View style={styles.locationContainer}>
        <MapPin size={16} color="#64748b" />
        <Text style={styles.locationText}>{request.location.address}</Text>
      </View>

      <Text style={styles.description}>{request.description}</Text>

      {request.status === 'accepted' && (
        <View style={styles.contactContainer}>
          <View style={styles.contactItem}>
            <Phone size={16} color="#64748b" />
            <Text style={styles.contactText}>{request.clientPhone}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => openMapsWithLocation(request.location.latitude, request.location.longitude)}
          >
            <Navigation size={16} color="#ffffff" />
            <Text style={styles.locationButtonText}>Voir sur Maps</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des demandes</Text>
        <View style={styles.headerActions}>
          <Text style={styles.subtitle}>
            {processedRequests.length} demande(s) traité(es)
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={20}
              color="#059669"
              style={refreshing ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>
      </View>

      {processedRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>Aucune demande traitée</Text>
          <Text style={styles.emptyText}>
            L'historique de vos demandes traitées apparaîtra ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={processedRequests.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshButton: {
    padding: 8,
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 22,
  },
  contactContainer: {
    marginBottom: 12,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#64748b',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 14,
    color: '#64748b',
  },
  plateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  urgencyContainer: {
    alignItems: 'flex-start',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgencyHigh: {
    backgroundColor: '#fecaca',
  },
  urgencyMedium: {
    backgroundColor: '#fed7aa',
  },
  urgencyLow: {
    backgroundColor: '#d1fae5',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgencyHighText: {
    color: '#dc2626',
  },
  urgencyMediumText: {
    color: '#EA580C',
  },
  urgencyLowText: {
    color: '#059669',
  },
});
