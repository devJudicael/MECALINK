import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { ServiceRequest } from '../../types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Car,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  RefreshCw,
} from 'lucide-react-native';

export default function GarageRequestsScreen() {
  const { currentUser } = useAuth();
  const { getRequestsForGarage, updateRequestStatus, refreshRequests } =
    useService();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);

  // Charger les demandes au chargement de l'écran
  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  // Filtrer les demandes en attente lorsque les demandes changent
  useEffect(() => {
    setPendingRequests(
      requests.filter((request) => request.status === 'pending')
    );
  }, [requests]);

  // Fonction pour charger les demandes
  const loadRequests = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const fetchedRequests = await getRequestsForGarage();
      // console.log('fetchedRequests', JSON.stringify(fetchedRequests, null, 2));

      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Erreur', 'Impossible de charger les demandes');
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

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert(
      'Accepter la demande',
      'Êtes-vous sûr de vouloir accepter cette demande de dépannage ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Accepter',
          style: 'default',
          onPress: async () => {
            try {
              await updateRequestStatus(requestId, 'accepted');
              await loadRequests();
            } catch (error) {
              console.error('Error accepting request:', error);
              Alert.alert('Erreur', "Impossible d'accepter la demande");
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert(
      'Refuser la demande',
      'Êtes-vous sûr de vouloir refuser cette demande de dépannage ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateRequestStatus(requestId, 'rejected');
              await loadRequests();
            } catch (error) {
              console.error('Error rejecting request:', error);
              Alert.alert('Erreur', 'Impossible de rejeter la demande');
            }
          },
        },
      ]
    );
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

  const renderRequestItem = ({ item: request }: { item: ServiceRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.clientName}>{request?.clientName}</Text>
        <Text style={styles.dateText}>{formatDate(request?.createdAt)}</Text>
      </View>

      <Text style={styles.description}>
        {' '}
        Probleme : {request?.description ?? 'panne'}
      </Text>

      <View style={styles.locationContainer}>
        <MapPin size={16} color="#64748b" />
        <Text style={styles.locationText}>{request?.location.address}</Text>
      </View>

      <View style={styles.contactContainer}>
        <View style={styles.contactItem}>
          <Phone size={16} color="#64748b" />
          <Text style={styles.contactText}>{request?.clientPhone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Mail size={16} color="#64748b" />
          <Text style={styles.contactText}>{request?.clientEmail}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectRequest(request.id)}
        >
          <XCircle size={20} color="#dc2626" />
          <Text style={styles.rejectButtonText}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(request._id)}
        >
          <CheckCircle size={20} color="#fff" />
          <Text style={styles.acceptButtonText}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des demandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demandes reçues</Text>
        <View style={styles.headerActions}>
          <Text style={styles.subtitle}>
            {pendingRequests.length} demande(s) en attente
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

      {pendingRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
          <Text style={styles.emptyText}>
            Les nouvelles demandes de dépannage apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
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
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
  },
  urgencyContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
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
  description: {
    fontSize: 16,
    color: '#dc2453',
    marginBottom: 16,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  contactContainer: {
    gap: 8,
    marginBottom: 16,
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
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  vehicleText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  plateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
