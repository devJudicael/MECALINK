import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { ServiceRequest } from '../../types';
import {
  Clock,
  MapPin,
  Phone,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';

export default function HistoryScreen() {
  const { currentUser } = useAuth();
  const { getRequestsForClient, refreshRequests } = useService();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      if (currentUser) {
        const clientRequests = await getRequestsForClient();
        setRequests(clientRequests);
      }
    };

    loadRequests();
  }, [currentUser, getRequestsForClient]);

  const getStatusIcon = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={20} color="#059669" />;
      case 'rejected':
        return <XCircle size={20} color="#dc2626" />;
      case 'completed':
        return <CheckCircle size={20} color="#2563EB" />;
      default:
        return <AlertCircle size={20} color="#EA580C" />;
    }
  };

  const getStatusText = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
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
        return '#059669';
      case 'rejected':
        return '#dc2626';
      case 'completed':
        return '#2563EB';
      default:
        return '#EA580C';
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
        <Text style={styles.dateText}>
          {request.createdAt ? formatDate(request.createdAt) : 'Date inconnue'}
        </Text>
      </View>

      <Text style={styles.garageName}>{request.garageName}</Text>

      <View style={styles.locationContainer}>
        <MapPin size={16} color="#64748b" />
        <Text style={styles.locationText}>{request.location.address}</Text>
      </View>

      <Text style={styles.description}>{request.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des demandes</Text>
        <Text style={styles.subtitle}>{requests.length} demandes</Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>Aucune demande</Text>
          <Text style={styles.emptyText}>
            Vos demandes de dépannage apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests
            .filter(() => true)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  garageName: {
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
