import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchNotifications } from '../services/notificationService';
import { useIsFocused } from '@react-navigation/native';

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

  // Utiliser useIsFocused pour détecter quand l'écran est actif
  const isFocused = useIsFocused();

  // Utiliser useFocusEffect pour recharger les notifications à chaque fois que l'écran est focalisé
  useFocusEffect(
    useCallback(() => {
      // console.log(
      //   'NotificationBadge: Screen focused, loading notifications...'
      // );
      // Charger immédiatement les notifications
      loadNotifications();

      // Recharger après un court délai pour s'assurer que les notifications ont été marquées comme lues
      // Cela est particulièrement utile lorsqu'on revient de l'écran des notifications
      // const immediateTimer = setTimeout(loadNotifications, 300);

      // // Recharger à nouveau après un délai plus long pour s'assurer que les mises à jour sont prises en compte
      // const delayedTimer = setTimeout(loadNotifications, 1000);

      // // Mettre à jour les notifications toutes les 10 secondes quand l'écran est actif
      // const interval = setInterval(loadNotifications, 10000);

      return () => {
        // clearTimeout(immediateTimer);
        // clearTimeout(delayedTimer);
        // clearInterval(interval);
      };
    }, [])
  );

  // Effet supplémentaire pour recharger quand l'écran devient actif
  // Cela est complémentaire à useFocusEffect et assure une meilleure réactivité
  useEffect(() => {
    if (isFocused) {
      // console.log('NotificationBadge: Screen is focused via useIsFocused');
      loadNotifications();

      // Recharger après un court délai
      const timer = setTimeout(loadNotifications, 500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const loadNotifications = async () => {
    try {
      // console.log('NotificationBadge: Chargement des notifications...');
      const notifications = await fetchNotifications();
      // Vérifier si notifications est défini avant d'appeler filter
      if (notifications && Array.isArray(notifications)) {
        const unreadNotifications = notifications.filter(
          (notification) => notification.status === 'unread'
        );
        console.log(
          `NotificationBadge: ${unreadNotifications.length} notifications non lues trouvées`
        );
        setUnreadCount(unreadNotifications.length);
      } else {
        // Si notifications n'est pas un tableau, initialiser à 0
        console.log(
          'NotificationBadge: Aucune notification trouvée ou format invalide'
        );
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
