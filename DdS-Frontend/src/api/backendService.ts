const BASE_URL = "http://127.0.0.1:8000";

export const crearCliente = async (data: {
  nombre: string;
  correo: string;
  contraseña: string;
  telefono: string;
  direccion: string;
  preferencia_notificacion: string;
}) => {
  const response = await fetch(`${BASE_URL}/clientes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear cliente");
  return await response.json();
};

export const crearDespachador = async (data: {
  nombre: string;
  correo: string;
  contraseña: string;
  telefono: string;
}) => {
  const response = await fetch(`${BASE_URL}/despachadores/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear despachador");
  return await response.json();
};

// Registrar un nuevo conductor
export const crearConductor = async (data: {
  nombre: string;
  correo: string;
  contraseña: string;
  telefono: string;
  estado: string;
  licencia: string;
  vehiculo: string;
}) => {
  const response = await fetch(`${BASE_URL}/conductores/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear conductor");
  return await response.json();
};

