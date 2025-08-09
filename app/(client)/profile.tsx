import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, LogOut, Car } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HeaderWithNotification from '@/components/HeaderWithNotification';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };
  if (!currentUser) {
    return null;
  }
  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithNotification 
        title={currentUser.name}
        backgroundColor="#fff"
        textColor="#1e293b"
        iconColor="#2563EB"
      />
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Car size={32} color="#2563EB" />
        </View>
        <Text style={styles.role}>Client</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fiches de Pré-Démarrage</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/extends/checklist-history')}
          >
            <Text style={styles.buttonText}>Historique des Fiches</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <User size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>{currentUser.name}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <Mail size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{currentUser.email}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <Phone size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{currentUser.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  role: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoCard: {
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
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  spacer: {
    height: 60,
  },
});
