// Configuration de l'API

// URL de base de l'API
// Utiliser l'adresse IP de votre ordinateur au lieu de localhost
// car sur un appareil mobile, localhost fait référence à l'appareil lui-même
export const API_URL = 'https://mecalinkapi-3dmdr00n.b4a.run/api';
// export const API_URL = 'http://192.168.1.2:5000/api';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    REGISTER: `${API_URL}/auth/register`,
    LOGIN: `${API_URL}/auth/login`,
    PROFILE: `${API_URL}/auth/profile`,
  },
  // Garages
  GARAGES: {
    ALL: `${API_URL}/garages`,
    NEARBY: `${API_URL}/garages/nearby`,
    DETAILS: (id: string) => `${API_URL}/garages/${id}`,
    PROFILE: `${API_URL}/garages/profile`,
  },
  // Demandes de service
  SERVICE_REQUESTS: {
    CREATE: `${API_URL}/service-requests`,
    CLIENT: `${API_URL}/service-requests/client`,
    GARAGE: `${API_URL}/service-requests/garage`,
    DETAILS: (id: string) => `${API_URL}/service-requests/${id}`,
    UPDATE_STATUS: (id: string) => `${API_URL}/service-requests/${id}/status`,
    CANCEL: (id: string) => `${API_URL}/service-requests/${id}/cancel`,
  },
  // Checklists
  CHECKLISTS: {
    CREATE: `${API_URL}/checklists`,
    HISTORY: `${API_URL}/checklists`,
    DETAILS: (id: string) => `${API_URL}/checklists/${id}`,
    VEHICLE_BRAND: `${API_URL}/checklists/vehicle-brand`,
  },
  // Publicités
  ADVERTISEMENTS: {
    ALL: `${API_URL}/advertisements`,
    CREATE: `${API_URL}/advertisements`,
    UPDATE: (id: string) => `${API_URL}/advertisements/${id}`,
    DELETE: (id: string) => `${API_URL}/advertisements/${id}`,
  },
};

// Fonction pour obtenir les headers d'authentification
export const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { 'Content-Type': 'application/json' };
  }
};

// Importer AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
