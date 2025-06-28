import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Car, Wrench, MapPin } from 'lucide-react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'client' | 'garage'>('client');
  const [address, setAddress] = useState('Abidjan');
  const [isLoading, setIsLoading] = useState(false);

  const { register, registerGarage } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (role === 'garage' && !address) {
      Alert.alert('Erreur', "Veuillez fournir l'adresse de votre garage");
      return;
    }

    setIsLoading(true);

    try {
      let success;

      if (role === 'client') {
        success = await register({ email, name, phone, password, role });
        if (success) {
          router.replace('/(client)');
        }
      } else {
        // Pour les garages, on utilise registerGarage avec les informations de localisation
        success = await registerGarage({
          email,
          name,
          phone,
          password,
          role,
          location: {
            latitude: 0,
            longitude: 0,
            address: address,
          },
          services: [],
        });
        if (success) {
          router.replace('/(garage)');
        }
      }

      if (!success) {
        Alert.alert('Erreur', "Erreur lors de l'inscription");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue : ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Car size={32} color="#2563EB" />
            </View>
            <Text style={styles.title}>Dépannage Auto</Text>
            <Text style={styles.subtitle}>Créez votre compte</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.roleSelector}>
              <Text style={styles.roleLabel}>Type de compte</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'client' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('client')}
                >
                  <Car
                    size={20}
                    color={role === 'client' ? '#fff' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'client' && styles.roleButtonTextActive,
                    ]}
                  >
                    Client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'garage' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('garage')}
                >
                  <Wrench
                    size={20}
                    color={role === 'garage' ? '#fff' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'garage' && styles.roleButtonTextActive,
                    ]}
                  >
                    Garagiste
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {role === 'garage' && (
              <View style={styles.addressContainer}>
                <MapPin size={20} color="#64748b" style={styles.addressIcon} />
                <TextInput
                  style={styles.addressInput}
                  placeholder="Adresse du garage"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <UserPlus size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Chargement...' : "S'inscrire"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.switchButtonText}>
                Déjà un compte ? Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    gap: 16,
  },
  roleSelector: {
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  roleButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
  },
  addressIcon: {
    marginRight: 10,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    padding: 16,
  },
  switchButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
});
