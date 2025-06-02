import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register } from '../../api/authService';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  // Campos extra
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState('');
  const [licencia, setLicencia] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMsg(null);
    if (!email || !password || !role) {
      setErrorMsg("Completa correo, contraseña y rol.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    // Validar campos extra según el rol
    let extraData: any = {};
    if (role === "conductor") {
      if (!nombre || !telefono || !estado || !licencia || !vehiculo) {
        setErrorMsg("Completa todos los campos de conductor.");
        return;
      }
      extraData = { nombre, telefono, estado, licencia, vehiculo };
    } else if (role === "despachador") {
      if (!nombre || !telefono) {
        setErrorMsg("Completa todos los campos de despachador.");
        return;
      }
      extraData = { nombre, telefono };
    }

    try {
      await register(email, password, role, extraData);
      setErrorMsg(null);
      navigation.navigate('Login');
    } catch (error: any) {
      let mensaje = "No se pudo registrar el usuario.";
      if (error.code === "auth/email-already-in-use") {
        mensaje = "El correo ya está registrado.";
      } else if (error.code === "auth/weak-password") {
        mensaje = "La contraseña es demasiado débil.";
      } else if (error.message) {
        mensaje = error.message;
      }
      setErrorMsg(mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Text style={{ marginBottom: 10 }}>Selecciona un rol:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        {['despachador', 'conductor'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.roleButton,
              role === r && styles.roleButtonSelected
            ]}
            onPress={() => setRole(r)}
          >
            <Text style={{ color: role === r ? '#fff' : '#000' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Campos extra según el rol */}
      {(role === "conductor" || role === "despachador") && (
        <>
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />
          <TextInput
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            style={styles.input}
          />
        </>
      )}
      {role === "conductor" && (
        <>
          <TextInput
            placeholder="Estado"
            value={estado}
            onChangeText={setEstado}
            style={styles.input}
          />
          <TextInput
            placeholder="Licencia"
            value={licencia}
            onChangeText={setLicencia}
            style={styles.input}
          />
          <TextInput
            placeholder="Vehículo"
            value={vehiculo}
            onChangeText={setVehiculo}
            style={styles.input}
          />
        </>
      )}
      <Button title="Registrarse" onPress={handleRegister} />
      <View style={styles.spacer} />
      <Button title="Ir a Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  spacer: { height: 10 },
  roleButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  roleButtonSelected: {
    backgroundColor: '#007bff',
  },
  errorBox: {
    backgroundColor: '#ffdddd',
    borderColor: '#ff5c5c',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    color: '#b00020',
    textAlign: 'center',
  },
});