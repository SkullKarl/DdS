const BASE_URL = "http://127.0.0.1:8000";

export const getClientes = async () => {
  const response = await fetch(`${BASE_URL}/clientes/`);
  if (!response.ok) throw new Error("Error al obtener clientes");
  return await response.json();
};


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

export const getConductorByCorreo = async (correo: string) => {
  const response = await fetch(`${BASE_URL}/conductores/?correo=${correo}`);
  if (!response.ok) throw new Error("Error al buscar conductor");
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
};

export const getDespachadorByCorreo = async (correo: string) => {
  const response = await fetch(`${BASE_URL}/despachadores/?correo=${correo}`);
  if (!response.ok) throw new Error("Error al buscar despachador");
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
};