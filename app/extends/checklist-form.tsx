import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function ChecklistForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    time: '',
    registration: '',
    mileage: '',
    exteriorChecks: {
      tires: 'Bon',
      wheelNuts: 'Oui',
      body: 'OK',
      spareTire: 'OK',
      windshield: 'OK',
      wipers: 'OK',
      lights: 'OK',
      indicators: 'Aucun',
    },
    mechanicalChecks: {
      oilLevel: 'OK',
      coolant: 'OK',
      battery: 'OK',
      belt: 'OK',
    },
    interiorChecks: {
      seatsBelts: 'OK',
      brakes: 'OK',
      ac: 'OK',
      fourByFour: 'OK',
      extinguisher: 'OK',
      firstAid: 'OK',
      triangle: 'Présent',
      jackTools: 'OK',
    },
    observations: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setForm((prev) => ({ ...prev, time: timeStr }));
  }, []);

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(API_ENDPOINTS.CHECKLISTS.CREATE, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError('');
      Alert.alert('Succès', 'Fiche soumise avec succès');
      router.back();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
      Alert.alert(
        'Erreur',
        err.response?.data?.message || 'Erreur lors de la soumission'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TextInput
          placeholder="Immatriculation"
          value={form.registration}
          onChangeText={(t) => setForm({ ...form, registration: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Kilométrage"
          value={form.mileage}
          onChangeText={(t) => setForm({ ...form, mileage: t })}
          style={styles.input}
          keyboardType="numeric"
        />
        {/* Tous les Pickers comme dans profile.tsx */}
        <Text style={styles.pickerLabel}>État Pneus</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.tires}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, tires: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="Bon" value="Bon" />
            <Picker.Item label="Moyen" value="Moyen" />
            <Picker.Item label="Mauvais" value="Mauvais" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Écrous des roues</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.wheelNuts}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, wheelNuts: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="Oui" value="Oui" />
            <Picker.Item label="Non" value="Non" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Carrosserie</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.body}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, body: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Rayures" value="Rayures" />
            <Picker.Item label="Bosses" value="Bosses" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Pneu de secours</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.spareTire}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, spareTire: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="À revoir" value="À revoir" />
            <Picker.Item label="Absent" value="Absent" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Pare-brise</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.windshield}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, windshield: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Impact" value="Impact" />
            <Picker.Item label="Fissuré" value="Fissuré" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Essuie-glaces</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.wipers}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, wipers: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="À changer" value="À changer" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Feux</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.lights}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, lights: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Défaut" value="Défaut" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Voyants</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.exteriorChecks.indicators}
            onValueChange={(v) =>
              setForm({
                ...form,
                exteriorChecks: { ...form.exteriorChecks, indicators: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="Aucun" value="Aucun" />
            <Picker.Item label="Anormal" value="Anormal" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Niveau d'huile</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.mechanicalChecks.oilLevel}
            onValueChange={(v) =>
              setForm({
                ...form,
                mechanicalChecks: { ...form.mechanicalChecks, oilLevel: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Faible" value="Faible" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Liquide de refroidissement</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.mechanicalChecks.coolant}
            onValueChange={(v) =>
              setForm({
                ...form,
                mechanicalChecks: { ...form.mechanicalChecks, coolant: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Fuite" value="Fuite" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Batterie</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.mechanicalChecks.battery}
            onValueChange={(v) =>
              setForm({
                ...form,
                mechanicalChecks: { ...form.mechanicalChecks, battery: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="À vérifier" value="À vérifier" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Courroie</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.mechanicalChecks.belt}
            onValueChange={(v) =>
              setForm({
                ...form,
                mechanicalChecks: { ...form.mechanicalChecks, belt: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Défectueuse" value="Défectueuse" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Sièges et ceintures</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.seatsBelts}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, seatsBelts: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="À réparer" value="À réparer" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Freins</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.brakes}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, brakes: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Faible" value="Faible" />
            <Picker.Item label="Non fonctionnel" value="Non fonctionnel" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Climatisation</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.ac}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, ac: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Mauvais" value="Mauvais" />
            <Picker.Item label="Non fonctionnel" value="Non fonctionnel" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Système 4x4</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.fourByFour}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, fourByFour: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Non testé" value="Non testé" />
            <Picker.Item label="Problème" value="Problème" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Extincteur</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.extinguisher}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, extinguisher: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Expiré" value="Expiré" />
            <Picker.Item label="Absent" value="Absent" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Trousse de secours</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.firstAid}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, firstAid: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Incomplète" value="Incomplète" />
            <Picker.Item label="Absente" value="Absente" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Triangle</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.triangle}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, triangle: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="Présent" value="Présent" />
            <Picker.Item label="Absent" value="Absent" />
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Cric et outils</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.interiorChecks.jackTools}
            onValueChange={(v) =>
              setForm({
                ...form,
                interiorChecks: { ...form.interiorChecks, jackTools: v },
              })
            }
            style={styles.picker}
          >
            <Picker.Item label="OK" value="OK" />
            <Picker.Item label="Incomplets" value="Incomplets" />
            <Picker.Item label="Absents" value="Absents" />
          </Picker>
        </View>
        <TextInput
          placeholder="Observations"
          value={form.observations}
          onChangeText={(t) => setForm({ ...form, observations: t })}
          multiline
          style={styles.input}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Soumettre</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginTop: 8,
    textAlign: 'center',
  },
  spacer: {
    height: 60,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
});
