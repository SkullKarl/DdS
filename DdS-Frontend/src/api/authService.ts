// src/api/authService.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { crearConductor, crearDespachador, getConductorByCorreo, getDespachadorByCorreo } from './backendService';
import { auth } from './firebaseConfig';

export const register = async (
  email: string,
  password: string,
  role: string,
  extraData: any
) => {
  // 1. Crea el usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // 2. Guarda en tu backend según el rol
  if (role === "despachador") {
    await crearDespachador({ ...extraData, correo: email, contraseña: password, firebase_uid: uid });
  } else if (role === "conductor") {
    await crearConductor({ ...extraData, correo: email, contraseña: password, firebase_uid: uid });
  }

  return userCredential.user;
};
export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Busca en backend si es conductor o despachador
  const conductor = await getConductorByCorreo(email);
  if (conductor) return { ...userCredential.user, role: 'conductor' };

  const despachador = await getDespachadorByCorreo(email);
  if (despachador) return { ...userCredential.user, role: 'despachador' };

  throw new Error("Usuario no encontrado en backend");
};