import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User } from '../types';
import { Alert } from 'react-native';
import { API_URL } from '../config/api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
  registerGarage: (
    userData: Omit<User, 'id'> & {
      location: { latitude: number; longitude: number; address: string };
      services: string[];
    }
  ) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('authToken');

      if (userData && token) {
        setCurrentUser(JSON.parse(userData));
        // Vérifier la validité du token en appelant l'API
        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            // Token invalide, déconnecter l'utilisateur
            await logout();
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          // En cas d'erreur réseau, on garde l'utilisateur connecté
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Erreur de connexion',
          data.message || 'Email ou mot de passe incorrect'
        );
        return false;
      }

      // Créer un objet utilisateur à partir de la réponse de l'API
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        location: data.user.location,
      };

      setCurrentUser(user);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', data.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de se connecter au serveur'
      );
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    console.log('userData front : ', userData);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          // role: 'client'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        Alert.alert(
          "Erreur d'inscription",
          data.message || 'Impossible de créer le compte'
        );
        return false;
      }

      // Créer un objet utilisateur à partir de la réponse de l'API
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      };

      setCurrentUser(user);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', data.token);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        "Erreur d'inscription",
        'Impossible de se connecter au serveur'
      );
      return false;
    }
  };

  const registerGarage = async (
    userData: Omit<User, 'id'> & {
      location: { latitude: number; longitude: number; address: string };
      services: string[];
    }
  ): Promise<boolean> => {
    try {
      // Afficher les données pour le débogage
      console.log("Données d'inscription garage:", JSON.stringify(userData));

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Envoyer les données telles quelles sans les modifier
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Erreur d'inscription",
          data.message || 'Impossible de créer le compte garage'
        );
        return false;
      }

      // Créer un objet utilisateur à partir de la réponse de l'API
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        location: data.user.location,
      };

      setCurrentUser(user);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', data.token);
      return true;
    } catch (error) {
      console.error('Garage registration error:', error);
      Alert.alert(
        "Erreur d'inscription",
        'Impossible de se connecter au serveur'
      );
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear user state
      setCurrentUser(null);

      // Remove all authentication-related items from storage
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.multiRemove(['currentUser', 'authToken']);

      // Redirect to login screen
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        registerGarage,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
