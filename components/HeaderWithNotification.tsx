import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import NotificationBadge from './NotificationBadge';

interface HeaderWithNotificationProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
}

const HeaderWithNotification: React.FC<HeaderWithNotificationProps> = ({
  title,
  showBackButton = false,
  rightComponent,
  backgroundColor = '#FFFFFF',
  textColor = '#1e293b',
  iconColor = '#2563EB',
}) => {
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={iconColor} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        {rightComponent}
        <NotificationBadge color={iconColor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HeaderWithNotification;