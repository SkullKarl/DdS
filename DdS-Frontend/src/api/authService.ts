// src/api/authService.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { crearConductor, crearDespachador } from './backendService';
import { auth } from './firebaseConfig';
const BASE_URL = "http://127.0.0.1:8000";

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


export const login = async (correo: string, contraseña: string) => {
  // 1. Login con Firebase
  const userCredential = await signInWithEmailAndPassword(auth, correo, contraseña);
  const firebaseUser = userCredential.user;

  // 2. Obtener UID
  const uid = firebaseUser.uid;

  // 3. Consultar a Django por el UID
  const response = await fetch(`${BASE_URL}/usuario_por_uid/${uid}/`);
  if (!response.ok) throw new Error("Usuario no registrado en Django");
  const userData = await response.json();

  // 4. Retornar datos para redirección
  return userData; // { id, nombre, correo, rol }
};