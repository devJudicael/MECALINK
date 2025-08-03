import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, X, Save } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useRouter } from 'expo-router';

export default function GarageSkillsScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(['', '', '', '', '']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer le token d'authentification
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setError('Vous devez être connecté pour accéder à cette page');
          return;
        }

        // Récupérer les compétences du garage depuis l'API
        const response = await fetch(`${API_URL}/garages/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les données du garage');
        }

        const garageData = await response.json();

        // Si le garage a des compétences, les afficher
        if (
          garageData.garage &&
          garageData.garage.skills &&
          Array.isArray(garageData.garage.skills)
        ) {
          // Remplir le tableau avec les compétences existantes et compléter avec des chaînes vides
          const newSkills = [...garageData.garage.skills];
          while (newSkills.length < 5) {
            newSkills.push('');
          }
          setSkills(newSkills.slice(0, 5));
        } else {
          // Vérifier si les compétences sont directement dans garageData
          if (garageData.skills && Array.isArray(garageData.skills)) {
            const newSkills = [...garageData.skills];
            while (newSkills.length < 5) {
              newSkills.push('');
            }
            setSkills(newSkills.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des compétences:', err);
        setError('Impossible de charger les compétences');
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [currentUser]);

  const handleSaveSkills = async () => {
    if (!currentUser) {
      Alert.alert(
        'Erreur',
        'Vous devez être connecté pour effectuer cette action'
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Filtrer les compétences vides
      const filteredSkills = skills.filter((skill) => skill.trim() !== '');

      // S'assurer qu'on a au maximum 5 compétences
      const limitedSkills = filteredSkills.slice(0, 5);

      // Récupérer le token d'authentification
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert(
          'Erreur',
          'Vous devez être connecté pour effectuer cette action'
        );
        return;
      }

      // Mettre à jour les compétences du garage dans l'API
      const response = await fetch(`${API_URL}/garages/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skills: limitedSkills,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la mise à jour des compétences'
        );
      }

      // Récupérer les données mises à jour depuis l'API pour s'assurer d'avoir les données les plus récentes
      const updatedResponse = await fetch(`${API_URL}/garages/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (updatedResponse.ok) {
        const updatedGarageData = await updatedResponse.json();
        const updatedSkills =
          updatedGarageData.garage?.skills ||
          updatedGarageData.skills ||
          limitedSkills;

        // Mettre à jour les compétences dans AsyncStorage
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          const updatedUser = {
            ...user,
            skills: updatedSkills,
          };
          await AsyncStorage.setItem(
            'currentUser',
            JSON.stringify(updatedUser)
          );
        }
      } else {
        // Si la récupération échoue, utiliser les compétences que nous venons d'envoyer
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          const updatedUser = {
            ...user,
            skills: limitedSkills,
          };
          await AsyncStorage.setItem(
            'currentUser',
            JSON.stringify(updatedUser)
          );
        }
      }

      Alert.alert(
        'Succès',
        'Vos compétences ont été mises à jour avec succès',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des compétences:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour les compétences');
    } finally {
      setSaving(false);
    }
  };

  const handleSkillChange = (text: string, index: number) => {
    const newSkills = [...skills];
    newSkills[index] = text;
    setSkills(newSkills);
  };

  const clearSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills[index] = '';
    setSkills(newSkills);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compétences</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des compétences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compétences</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setLoading(true)}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compétences</Text>
      </View> */}

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos compétences</Text>
          <Text style={styles.sectionDescription}>
            Ajoutez jusqu'à 5 compétences qui seront affichées sur votre profil.
          </Text>

          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillInputContainer}>
                <TextInput
                  style={styles.skillInput}
                  placeholder={`Compétence ${index + 1}`}
                  placeholderTextColor="#64748b"
                  value={skill}
                  onChangeText={(text) => handleSkillChange(text, index)}
                  maxLength={30}
                />
                {skill.trim() !== '' && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => clearSkill(index)}
                  >
                    <X size={16} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveSkills}
            disabled={saving}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  skillsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  skillInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
