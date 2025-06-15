import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import type { Garage } from '@/types/garages';
import { Search, MapPin, Star, Clock, ChevronRight } from 'lucide-react-native';
import { useGarageStore } from '@/stores/garages';

export default function GaragesListScreen() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);

  const router = useRouter();
  const { nearbyGarages } = useGarageStore();

  useEffect(() => {
    setGarages(nearbyGarages);
  }, [nearbyGarages]);

  useEffect(() => {
    filterGarages();
  }, [searchQuery, garages]);

  // filter garages by name, address or services
  const filterGarages = () => {
    if (!searchQuery.trim()) {
      setFilteredGarages(garages);
    } else {
      const filtered = garages.filter(
        (garage) =>
          garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          garage.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          garage.services.some((service) =>
            service.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredGarages(filtered);
    }
  };

  const handleGaragePress = (garage: Garage) => {
    router.push({
      pathname: '/garage-details',
      params: { garageId: garage.id },
    });
  };

  const renderGarageItem = ({ item: garage }: { item: Garage }) => (
    <TouchableOpacity
      style={styles.garageCard}
      onPress={() => handleGaragePress(garage)}
    >
      <View style={styles.garageHeader}>
        <View style={styles.garageInfo}>
          <Text style={styles.garageName}>{garage.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.rating}>{garage.rating}</Text>
            <View
              style={[
                styles.statusBadge,
                garage.isOpen ? styles.openBadge : styles.closedBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  garage.isOpen ? styles.openText : styles.closedText,
                ]}
              >
                {garage.isOpen ? 'Ouvert' : 'Fermé'}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color="#64748b" />
      </View>

      <View style={styles.addressContainer}>
        <MapPin size={16} color="#64748b" />
        <Text style={styles.address}>{garage.address}</Text>
        {garage.distance && (
          <Text style={styles.distance}>• {garage.distance.toFixed(1)} km</Text>
        )}
      </View>

      <View style={styles.hoursContainer}>
        <Clock size={16} color="#64748b" />
        <Text style={styles.hours}>{garage.openingHours}</Text>
      </View>

      <View style={styles.servicesContainer}>
        {garage.services.slice(0, 3).map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
        {garage.services.length > 3 && (
          <Text style={styles.moreServices}>+{garage.services.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liste des garages</Text>
        <Text style={styles.subtitle}>
          {filteredGarages.length} garages trouvés
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un garage ou service..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredGarages}
        renderItem={renderGarageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  garageCard: {
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
    marginBottom: 16,
  },
  garageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  garageInfo: {
    flex: 1,
  },
  garageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#059669',
  },
  closedText: {
    color: '#dc2626',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  distance: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  hours: {
    fontSize: 14,
    color: '#64748b',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  serviceTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  moreServices: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});
