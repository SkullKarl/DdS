import React, { useState } from 'react';
import {
  Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator, Platform, Modal, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import { ClientService } from '../../services/client/ClientService';

interface PackageData {
  fecha_e: Date;
  direccion_entrega: string;
  peso: string;
  dimensiones: string;
}

export default function CreatePackageScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [packageData, setPackageData] = useState<PackageData>({
    fecha_e: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow by default
    direccion_entrega: '',
    peso: '',
    dimensiones: ''
  });

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // On Android, close picker and update date
      setShowDatePicker(false);
      if (selectedDate) {
        setPackageData(prev => ({ ...prev, fecha_e: selectedDate }));
      }
    } else {
      // On iOS, just update the date (modal stays open)
      if (selectedDate) {
        setPackageData(prev => ({ ...prev, fecha_e: selectedDate }));
      }
    }
  };

  const handleCreatePackage = async () => {
    // Validation
    if (!packageData.direccion_entrega.trim()) {
      Alert.alert('Error', 'Por favor ingresa la dirección de entrega');
      return;
    }
    if (!packageData.peso.trim()) {
      Alert.alert('Error', 'Por favor ingresa el peso del paquete');
      return;
    }
    if (!packageData.dimensiones.trim()) {
      Alert.alert('Error', 'Por favor ingresa las dimensiones del paquete');
      return;
    }

    // Validate peso is a number
    const peso = parseFloat(packageData.peso);
    if (isNaN(peso) || peso <= 0) {
      Alert.alert('Error', 'Por favor ingresa un peso válido (mayor a 0)');
      return;
    }

    setLoading(true);
    try {
      await ClientService.createPackage({
        fecha_e: packageData.fecha_e.toISOString().split('T')[0], // Convert Date to string
        direccion_entrega: packageData.direccion_entrega.trim(),
        peso: peso,
        dimensiones: packageData.dimensiones.trim()
      });

      Alert.alert(
        'Éxito',
        'El paquete ha sido creado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el paquete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.backgroundGradient as [string, string, ...string[]]}
        style={styles.background}
      />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground + '95' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Crear Paquete
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Dirección de entrega */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Dirección de entrega *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: focusedField === 'address' ? theme.primary : theme.border,
              backgroundColor: theme.inputBackground,
              borderWidth: focusedField === 'address' ? 2 : 1.5,
            }]}>
              <Ionicons name="location-outline" size={22} color={focusedField === 'address' ? theme.primary : theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={packageData.direccion_entrega}
                onChangeText={(text) => setPackageData(prev => ({ ...prev, direccion_entrega: text }))}
                placeholder="Ingresa la dirección completa"
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={2}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Fecha de entrega */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Fecha de entrega aproximada *
            </Text>
            <TouchableOpacity
              style={[styles.datePickerContainer, { 
                borderColor: focusedField === 'date' ? theme.primary : theme.border,
                backgroundColor: theme.inputBackground,
                borderWidth: focusedField === 'date' ? 2 : 1,
              }]}
              onPress={() => setShowDatePicker(true)}
              onPressIn={() => setFocusedField('date')}
              onPressOut={() => setFocusedField(null)}
            >
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                <View style={styles.dateTextContainer}>
                  <Text style={[styles.dateText, { color: theme.textPrimary }]}>
                    {formatDateForDisplay(packageData.fecha_e)}
                  </Text>
                  <Text style={[styles.dateSubtext, { color: theme.textTertiary }]}>
                    Toca para cambiar
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
            
            {showDatePicker && Platform.OS === 'ios' && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
              >
                <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={[styles.datePickerModal, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                          <TouchableOpacity 
                            onPress={() => setShowDatePicker(false)}
                            style={styles.modalButton}
                          >
                            <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>
                              Cancelar
                            </Text>
                          </TouchableOpacity>
                          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                            Seleccionar Fecha
                          </Text>
                          <TouchableOpacity 
                            onPress={() => setShowDatePicker(false)}
                            style={styles.modalButton}
                          >
                            <Text style={[styles.modalButtonText, { color: theme.primary }]}>
                              Listo
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={packageData.fecha_e}
                          mode="date"
                          display="spinner"
                          onChange={onDateChange}
                          minimumDate={new Date()}
                          textColor={theme.textPrimary}
                          style={styles.datePickerIOS}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}
            
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={packageData.fecha_e}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor={theme.textPrimary}
              />
            )}
          </View>

          {/* Peso */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Peso (kg) *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: focusedField === 'weight' ? theme.primary : theme.border,
              backgroundColor: theme.inputBackground,
              borderWidth: focusedField === 'weight' ? 2 : 1.5,
            }]}>
              <Ionicons name="scale-outline" size={22} color={focusedField === 'weight' ? theme.primary : theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={packageData.peso}
                onChangeText={(text) => setPackageData(prev => ({ ...prev, peso: text }))}
                placeholder="Ej: 2.5"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                onFocus={() => setFocusedField('weight')}
                onBlur={() => setFocusedField(null)}
              />
              <Text style={[styles.unitText, { color: theme.textTertiary }]}>kg</Text>
            </View>
          </View>

          {/* Dimensiones */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Dimensiones *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: focusedField === 'dimensions' ? theme.primary : theme.border,
              backgroundColor: theme.inputBackground,
              borderWidth: focusedField === 'dimensions' ? 2 : 1.5,
            }]}>
              <Ionicons name="cube-outline" size={22} color={focusedField === 'dimensions' ? theme.primary : theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={packageData.dimensiones}
                onChangeText={(text) => setPackageData(prev => ({ ...prev, dimensiones: text }))}
                placeholder="Ej: 30x20x15 cm"
                placeholderTextColor={theme.textTertiary}
                onFocus={() => setFocusedField('dimensions')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Información adicional */}
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>
                Información importante
              </Text>
              <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
                • El paquete será almacenado en bodega hasta su asignación{'\n'}
                • Un despachador asignará el paquete a un envío y conductor{'\n'}
                • Recibirás notificaciones sobre el estado del envío
              </Text>
            </View>
          </View>

          {/* Botón crear */}
          <TouchableOpacity
            style={[styles.createButton, { 
              opacity: loading ? 0.7 : 1
            }]}
            onPress={handleCreatePackage}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark || theme.primary]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator color={theme.textInverse} size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={22} color={theme.textInverse} />
                  <Text style={[styles.createButtonText, { color: theme.textInverse }]}>
                    Crear Paquete
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerBlur: {
    // Removed - no longer needed
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Extra space at bottom for comfortable scrolling
  },
  formContainer: {
    padding: 24,
    paddingTop: 16, // Some space from header
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    minHeight: 58,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 18,
    fontWeight: '400',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    opacity: 0.6,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dateSubtext: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  createButton: {
    marginBottom: 60, // Reduced since we have padding in scrollContent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 16,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: -0.2,
  },
  helperText: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 6,
    opacity: 0.7,
  },
  // Modal styles for iOS date picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerIOS: {
    height: 200,
  },
});
