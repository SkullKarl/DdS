const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wxekgvnqyhyjuvjmtnfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZWtndm5xeWh5anV2am10bmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzMzODcsImV4cCI6MjA2NDQ0OTM4N30.d1t-9F31Nh9KnprLnIMN1NjxCnWLX13IjIXcIYdSOP4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const usuarios = [
  {
    email: 'ana.perez@email.com',
    password: 'contraseñaAna123',
    nombre: 'Ana Pérez',
    telefono: '+56911112222',
    direccion: "Avenida Libertador Bernardo O'Higgins 456, Concepción",
    preferencia_notificacion: 'email'
  },
  {
    email: 'luis.gonzalez@email.com',
    password: 'contraseñaLuis123',
    nombre: 'Luis González',
    telefono: '+56922223333',
    direccion: 'Calle San Martín 890, Talcahuano',
    preferencia_notificacion: 'sms'
  },
  {
    email: 'maria.rodriguez@email.com',
    password: 'contraseñaMaria123',
    nombre: 'María Rodríguez',
    telefono: '+56933334444',
    direccion: 'Pasaje Los Aromos 123, Hualpén',
    preferencia_notificacion: 'email'
  },
  {
    email: 'pedro.soto@email.com',
    password: 'contraseñaPedro123',
    nombre: 'Pedro Soto',
    telefono: '+56944445555',
    direccion: 'Avenida Pedro de Valdivia 789, San Pedro de la Paz',
    preferencia_notificacion: 'whatsapp'
  },
  {
    email: 'valentina.diaz@email.com',
    password: 'contraseñaVale123',
    nombre: 'Valentina Díaz',
    telefono: '+56955556666',
    direccion: 'Calle Caupolicán 101, Chiguayante',
    preferencia_notificacion: 'email'
  },
  {
    email: 'javier.morales@email.com',
    password: 'contraseñaJavi123',
    nombre: 'Javier Morales',
    telefono: '+56966667777',
    direccion: 'Pasaje Los Pensamientos 321, Lomas Coloradas, San Pedro de la Paz',
    preferencia_notificacion: 'sms'
  }
];

async function poblarUsuarios() {
  for (const usuario of usuarios) {
    // 1. Registrar en Auth
    const { data, error } = await supabase.auth.signUp({
      email: usuario.email,
      password: usuario.password,
    });

    if (error) {
      console.error(`Error registrando ${usuario.email}:`, error.message);
      continue;
    }

    // 2. Insertar en la tabla cliente
    const { error: dbError } = await supabase
      .from('cliente')
      .insert([{
        nombre: usuario.nombre,
        contraseña: usuario.password,
        correo: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        preferencia_notificacion: usuario.preferencia_notificacion
      }]);

    if (dbError) {
      console.error(`Error insertando en cliente para ${usuario.email}:`, dbError.message);
      continue;
    }

    console.log(`Usuario ${usuario.email} registrado correctamente.`);
  }
  process.exit(0);
}

//poblarUsuarios();

const paquetes = [
  {
    direccion_entrega: "Avenida Libertador Bernardo O'Higgins 456, Concepción",
    estado: 'en bodega',
    peso: 2.5,
    dimensiones: '20x15x10 cm',
    correo_cliente: 'ana.perez@email.com'
  },
  {
    direccion_entrega: 'Calle San Martín 890, Talcahuano',
    estado: 'en bodega',
    peso: 1.8,
    dimensiones: '10x10x10 cm',
    correo_cliente: 'luis.gonzalez@email.com'
  },
];

async function asignarPaquetes() {
  // 1. Buscar o crear un envío (puedes personalizar la lógica)
  let id_envio;
  // Busca un envío existente (puedes cambiar la lógica de búsqueda)
  const { data: envios } = await supabase.from('envio').select('id_envio').limit(1);
  if (envios && envios.length > 0) {
    id_envio = envios[0].id_envio;
  } else {
    // Si no existe, crea uno
    const { data: envioNuevo, error: envioError } = await supabase
      .from('envio')
      .insert([{ paquetes_totales: paquetes.length, id_ruta: null }])
      .select()
      .single();
    if (envioError) {
      console.error('Error creando envío:', envioError.message);
      return;
    }
    id_envio = envioNuevo.id_envio;
  }

  // 2. Para cada paquete, busca el id_cliente y crea el paquete
  for (const paquete of paquetes) {
    // Buscar el id_cliente por correo
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('id_cliente')
      .eq('correo', paquete.correo_cliente)
      .single();

    if (clienteError || !cliente) {
      console.error(`No se encontró el cliente para ${paquete.correo_cliente}`);
      continue;
    }

    // Insertar el paquete
    const { error: paqueteError } = await supabase
      .from('paquete')
      .insert([{
        fecha_e: new Date().toISOString().slice(0, 10), // Fecha actual
        direccion_entrega: paquete.direccion_entrega,
        estado: paquete.estado,
        id_envio: id_envio,
        id_cliente: cliente.id_cliente,
        peso: paquete.peso,
        dimensiones: paquete.dimensiones
      }]);

    if (paqueteError) {
      console.error(`Error insertando paquete para ${paquete.correo_cliente}:`, paqueteError.message);
      continue;
    }

    console.log(`Paquete asignado a ${paquete.correo_cliente}`);
  }
  process.exit(0);
}
asignarPaquetes();