import { API_URL, getAuthHeaders, API_ENDPOINTS } from '../config/api';
import { Notification } from '../types';

/**
 * Récupère toutes les notifications de l'utilisateur connecté
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.ALL, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications');
    }

    const data = await response.json();

    console.log('-----response notfs --->  ', data);

    // Vérifier si data.data existe et si c'est un tableau
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.error('Format de réponse inattendu:', data);
      return [];
    }
  } catch (error) {
    console.error('Erreur fetchNotifications:', error);
    return [];
  }
};

/**
 * Marque une notification comme lue
 * @param notificationId ID de la notification à marquer comme lue
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      API_ENDPOINTS.NOTIFICATIONS.READ(notificationId),
      {
        method: 'PATCH',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de la notification comme lue');
    }

    return true;
  } catch (error) {
    console.error('Erreur markNotificationAsRead:', error);
    return false;
  }
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      throw new Error(
        'Erreur lors du marquage de toutes les notifications comme lues'
      );
    }

    return true;
  } catch (error) {
    console.error('Erreur markAllNotificationsAsRead:', error);
    return false;
  }
};