import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceRequest } from '../types';
import { mockServiceRequests } from '../utils/mockData';

interface ServiceContextType {
  requests: ServiceRequest[];
  createRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateRequestStatus: (requestId: string, status: ServiceRequest['status']) => Promise<void>;
  getRequestsForClient: (clientId: string) => ServiceRequest[];
  getRequestsForGarage: (garageId: string) => ServiceRequest[];
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    loadRequestsFromStorage();
  }, []);

  const loadRequestsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('serviceRequests');
      if (stored) {
        setRequests(JSON.parse(stored));
      } else {
        setRequests(mockServiceRequests);
        await AsyncStorage.setItem('serviceRequests', JSON.stringify(mockServiceRequests));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests(mockServiceRequests);
    }
  };

  const saveRequestsToStorage = async (newRequests: ServiceRequest[]) => {
    try {
      await AsyncStorage.setItem('serviceRequests', JSON.stringify(newRequests));
    } catch (error) {
      console.error('Error saving requests:', error);
    }
  };

  const createRequest = async (requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: ServiceRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [...requests, newRequest];
    setRequests(updatedRequests);
    await saveRequestsToStorage(updatedRequests);
  };

  const updateRequestStatus = async (requestId: string, status: ServiceRequest['status']) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        const updated = { ...request, status };
        if (status === 'accepted') {
          updated.acceptedAt = new Date().toISOString();
        } else if (status === 'completed') {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      }
      return request;
    });

    setRequests(updatedRequests);
    await saveRequestsToStorage(updatedRequests);
  };

  const getRequestsForClient = (clientId: string) => {
    return requests.filter(request => request.clientId === clientId);
  };

  const getRequestsForGarage = (garageId: string) => {
    return requests.filter(request => request.garageId === garageId);
  };

  return (
    <ServiceContext.Provider value={{
      requests,
      createRequest,
      updateRequestStatus,
      getRequestsForClient,
      getRequestsForGarage,
    }}>
      {children}
    </ServiceContext.Provider>
  );
};