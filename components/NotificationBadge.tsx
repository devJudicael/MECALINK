import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchNotifications } from '../services/notificationService';

interface NotificationBadgeProps {
  size?: number;
  color?: string;
  badgeColor?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 24,
  color = '#000',
  badgeColor = '#FF3B30',
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Charger les notifications au montage du composant
    loadNotifications();

    // Mettre à jour les notifications toutes les 60 secondes
    const interval = setInterval(loadNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const notifications = await fetchNotifications();
      // Vérifier si notifications est défini avant d'appeler filter
      if (notifications && Array.isArray(notifications)) {
        const unreadNotifications = notifications.filter(
          (notification) => notification.status === 'unread'
        );
        setUnreadCount(unreadNotifications.length);
      } else {
        // Si notifications n'est pas un tableau, initialiser à 0
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      // En cas d'erreur, initialiser à 0
      setUnreadCount(0);
    }
  };

  const handlePress = () => {
    router.push('/extends/notifications');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Bell size={size} color={color} />
      {unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor },
            unreadCount > 99 ? styles.largeBadge : null,
          ]}
        >
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  largeBadge: {
    minWidth: 24,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;