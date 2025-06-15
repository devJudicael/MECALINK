import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { ServiceRequest } from '../../types';
import { MapPin, Phone, Mail, Clock, Car, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';

export default function GarageRequestsScreen() {
  const { currentUser } = useAuth();
  const { getRequestsForGarage, updateRequestStatus } = useService();

  const requests = currentUser ? getRequestsForGarage(currentUser.id) : [];
  const pendingRequests = requests.filter(request => request.status === 'pending');

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
          onPress: () => updateRequestStatus(requestId, 'accepted'),
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
          onPress: () => updateRequestStatus(requestId, 'rejected'),
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
        <Text style={styles.clientName}>{request.clientName}</Text>
        <Text style={styles.dateText}>{formatDate(request.createdAt)}</Text>
      </View>

      <View style={styles.urgencyContainer}>
        <View style={[
          styles.urgencyBadge,
          request.urgency === 'high' ? styles.urgencyHigh :
          request.urgency === 'medium' ? styles.urgencyMedium : styles.urgencyLow
        ]}>
          <Text style={[
            styles.urgencyText,
            request.urgency === 'high' ? styles.urgencyHighText :
            request.urgency === 'medium' ? styles.urgencyMediumText : styles.urgencyLowText
          ]}>
            {request.urgency === 'high' ? 'Urgent' :
             request.urgency === 'medium' ? 'Moyen' : 'Faible'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{request.description}</Text>

      <View style={styles.locationContainer}>
        <MapPin size={16} color="#64748b" />
        <Text style={styles.locationText}>{request.location.address}</Text>
      </View>

      <View style={styles.contactContainer}>
        <View style={styles.contactItem}>
          <Phone size={16} color="#64748b" />
          <Text style={styles.contactText}>{request.clientPhone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Mail size={16} color="#64748b" />
          <Text style={styles.contactText}>{request.clientEmail}</Text>
        </View>
      </View>

      <View style={styles.vehicleContainer}>
        <Car size={16} color="#64748b" />
        <Text style={styles.vehicleText}>
          {request.vehicleInfo.make} {request.vehicleInfo.model} ({request.vehicleInfo.year})
        </Text>
        <Text style={styles.plateText}>{request.vehicleInfo.licensePlate}</Text>
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
          onPress={() => handleAcceptRequest(request.id)}
        >
          <CheckCircle size={20} color="#fff" />
          <Text style={styles.acceptButtonText}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demandes reçues</Text>
        <Text style={styles.subtitle}>{pendingRequests.length} demandes en attente</Text>
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
          data={pendingRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
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
    color: '#374151',
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