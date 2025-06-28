import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceRequest } from '../types';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';
import { API_URL } from '../config/api';

interface ServiceContextType {
  requests: ServiceRequest[];
  createRequest: (
    request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>
  ) => Promise<boolean>;
  updateRequestStatus: (
    requestId: string,
    status: ServiceRequest['status']
  ) => Promise<boolean>;
  getRequestsForClient: () => Promise<ServiceRequest[]>;
  getRequestsForGarage: () => Promise<ServiceRequest[]>;
  refreshRequests: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      refreshRequests();
    }
  }, [currentUser]);

  const getAuthHeader = async () => {
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

  const refreshRequests = async () => {
    if (!currentUser) return;

    try {
      const headers = await getAuthHeader();
      const endpoint =
        currentUser.role === 'client'
          ? 'service-requests/client'
          : 'service-requests/garage';

      const response = await fetch(`${API_URL}/${endpoint}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error refreshing requests:', error);
    }
  };

  const createRequest = async (
    requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<boolean> => {
    try {
      const headers = await getAuthHeader();

      const response = await fetch(`${API_URL}/service-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erreur', data.message || 'Impossible de créer la demande');
        return false;
      }

      await refreshRequests();
      return true;
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur');
      return false;
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: ServiceRequest['status']
  ): Promise<boolean> => {
    try {
      const headers = await getAuthHeader();

      const endpoint =
        status === 'cancelled'
          ? `service-requests/${requestId}/cancel`
          : `service-requests/${requestId}/status`;

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Erreur',
          data.message || `Impossible de mettre à jour le statut en ${status}`
        );
        return false;
      }

      await refreshRequests();
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur');
      return false;
    }
  };

  const getRequestsForClient = async (): Promise<ServiceRequest[]> => {
    if (!currentUser || currentUser.role !== 'client') return [];

    try {
      const headers = await getAuthHeader();

      const response = await fetch(`${API_URL}/service-requests/client`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting client requests:', error);
      return [];
    }
  };

  const getRequestsForGarage = async (): Promise<ServiceRequest[]> => {
    if (!currentUser || currentUser.role !== 'garage') return [];

    try {
      const headers = await getAuthHeader();

      const response = await fetch(`${API_URL}/service-requests/garage`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting garage requests:', error);
      return [];
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        requests,
        createRequest,
        updateRequestStatus,
        getRequestsForClient,
        getRequestsForGarage,
        refreshRequests,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
