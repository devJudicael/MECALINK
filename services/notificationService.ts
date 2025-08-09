import { API_URL, getAuthHeaders, API_ENDPOINTS } from '../config/api';
import { Notification } from '../types';

/**
 * Récupère toutes les notifications de l'utilisateur connecté
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    console.log('Début de la récupération des notifications');
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.ALL, {
      headers,
    });

    if (!response.ok) {
      console.error('Réponse non OK:', response.status, response.statusText);
      throw new Error(`Erreur lors de la récupération des notifications: ${response.status}`);
    }

    const data = await response.json();

    console.log('-----response notfs --->  ', JSON.stringify(data, null, 2));

    // Vérifier si data.data existe et si c'est un tableau
    if (data && data.success && Array.isArray(data.data)) {
      try {
        // Extraire uniquement les clés nécessaires pour chaque notification
        // et s'assurer que les objets dans data sont correctement traités
        return data.data.map(notification => {
          // Vérifier que notification est un objet valide
          if (!notification || typeof notification !== 'object') {
            console.warn('Notification invalide dans la réponse:', notification);
            return null;
          }
          
          // Extraire les propriétés avec des valeurs par défaut pour éviter les erreurs
          const {
            _id = '',
            accountId = '',
            accountType = '',
            title = '',
            body = '',
            status = 'unread',
            createdAt = new Date().toISOString()
          } = notification;
          
          // Gérer le cas où data est un [Object] dans la réponse
          let notificationData = {};
          try {
            notificationData = notification.data && typeof notification.data === 'object'
              ? notification.data
              : {};
          } catch (err) {
            console.warn('Erreur lors du traitement des données de notification:', err);
          }
          
          return {
            _id,
            accountId,
            accountType,
            title,
            body,
            data: notificationData,
            status,
            createdAt
          };
        }).filter(Boolean); // Filtrer les notifications nulles
      } catch (err) {
        console.error('Erreur lors du traitement des notifications:', err);
        return [];
      }
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
    console.log(`Marquage de la notification ${notificationId} comme lue`);
    const headers = await getAuthHeaders();
    const response = await fetch(
      API_ENDPOINTS.NOTIFICATIONS.READ(notificationId),
      {
        method: 'PATCH',
        headers,
      }
    );

    if (!response.ok) {
      console.error('Réponse non OK:', response.status, response.statusText);
      throw new Error(`Erreur lors du marquage de la notification comme lue: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse du marquage comme lu:', JSON.stringify(data, null, 2));
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
    console.log('Marquage de toutes les notifications comme lues');
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      console.error('Réponse non OK:', response.status, response.statusText);
      throw new Error(
        `Erreur lors du marquage de toutes les notifications comme lues: ${response.status}`
      );
    }

    const data = await response.json();
    console.log('Réponse du marquage de toutes comme lues:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur markAllNotificationsAsRead:', error);
    return false;
  }
};