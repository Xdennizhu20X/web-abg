'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerUser } from '../../lib/api';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    ci: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'tecnico'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Usamos el contexto de autenticación

  // Función para validar que solo contenga números
  const isNumericOnly = (value) => {
    return /^\d*$/.test(value);
  };

  // Función para validar números repetidos más de 3 veces consecutivas
  const hasExcessiveRepeatedNumbers = (value) => {
    return /(\d)\1{3,}/.test(value);
  };

  // Validador específico para cédula
  const validateCedula = (ci) => {
    const errors = [];

    if (!isNumericOnly(ci)) {
      errors.push('Solo se permiten números');
    }

    if (ci.length > 0 && ci.length !== 10) {
      errors.push('Debe tener exactamente 10 dígitos');
    }

    if (hasExcessiveRepeatedNumbers(ci)) {
      errors.push('No se permiten más de 3 números iguales consecutivos');
    }

    return errors;
  };

  // Validador específico para teléfono
  const validateTelefono = (telefono) => {
    const errors = [];

    if (telefono && !isNumericOnly(telefono)) {
      errors.push('Solo se permiten números');
    }

    if (telefono && telefono.length > 0 && (telefono.length < 7 || telefono.length > 15)) {
      errors.push('Debe tener entre 7 y 15 dígitos');
    }

    if (telefono && hasExcessiveRepeatedNumbers(telefono)) {
      errors.push('No se permiten más de 3 números iguales consecutivos');
    }

    return errors;
  };

  // Manejar cambios en campos numéricos con validación
  const handleNumericChange = (fieldName, value) => {
    // Solo permitir números
    if (!isNumericOnly(value)) {
      return; // No actualizar si contiene caracteres no numéricos
    }

    // Actualizar el valor
    setForm(prev => ({ ...prev, [fieldName]: value }));

    // Validar en tiempo real
    let errors = [];
    if (fieldName === 'ci') {
      errors = validateCedula(value);
    } else if (fieldName === 'telefono') {
      errors = validateTelefono(value);
    }

    // Actualizar errores del campo
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: errors.length > 0 ? errors : null
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones básicas
    if (!form.nombre || !form.ci || !form.email || !form.password) {
      setError('Todos los campos son obligatorios');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('El formato del email no es válido');
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    // Validaciones mejoradas para cédula
    const cedulaErrors = validateCedula(form.ci);
    if (cedulaErrors.length > 0) {
      setError(`Cédula inválida: ${cedulaErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    // Validaciones para teléfono (solo si se proporciona)
    if (form.telefono) {
      const telefonoErrors = validateTelefono(form.telefono);
      if (telefonoErrors.length > 0) {
        setError(`Teléfono inválido: ${telefonoErrors.join(', ')}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Registrar al usuario
      const registerResponse = await registerUser(form);

      console.log('Register response received:', registerResponse);

      // Verificar si el registro está pendiente de aprobación
      if (registerResponse.isPending) {
        await Swal.fire({
          title: '¡Registro Recibido!',
          text: 'Tu solicitud de registro ha sido enviada correctamente. Debes esperar la aprobación de un administrador para poder acceder al sistema.',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false
        });

        // Redirigir al login con mensaje informativo
        router.push('/login?registered=pending');
        return;
      }

      // Si el registro es exitoso y no está pendiente, hacer login automático
      await login({
        email: form.email,
        password: form.password
      });

      await Swal.fire({
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada y activada correctamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#E10600',
      });

      // Redirigir al dashboard
      router.push('/dashboard');

    } catch (err) {
      console.error('Register error caught:', err);

      // Verificar si el error es realmente sobre usuario pendiente
      const errorMessage = err.message || 'Ocurrió un error al registrarse';

      const isPendingMessage = errorMessage.includes('pendiente') ||
                               errorMessage.includes('aprobación') ||
                               errorMessage.includes('espera') ||
                               errorMessage.includes('aprobar') ||
                               errorMessage.includes('administrador') ||
                               errorMessage.toLowerCase().includes('pending') ||
                               errorMessage.includes('revisar') ||
                               errorMessage.includes('activar');

      if (isPendingMessage) {
        // Tratar como registro exitoso pendiente
        await Swal.fire({
          title: '¡Registro Recibido!',
          text: 'Tu solicitud de registro ha sido enviada correctamente. Debes esperar la aprobación de un administrador para poder acceder al sistema.',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false
        });

        // Redirigir al login con mensaje informativo
        router.push('/login?registered=pending');
        return;
      }

      // Si es un error real
      setError(errorMessage);

      await Swal.fire({
        title: 'Error en el Registro',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#E10600',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">

        {/* Logo institucional */}
        <div className="flex justify-center mb-6">
          <Image
            src="/nuevologo.png"
            alt="Logo ABG"
            width={400}
            height={100}
            priority
          />
        </div>

        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-[#6e328a] mb-4 tracking-tight">
            Registro de Usuario
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula de Identidad</label>
            <input
              type="text"
              value={form.ci}
              onChange={(e) => handleNumericChange('ci', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                fieldErrors.ci
                  ? 'border-red-500 focus:ring-red-500/60'
                  : 'border-gray-300 focus:ring-[#6e328a]/60'
              }`}
              placeholder="1234567890"
              required
              maxLength="10"
            />
            {fieldErrors.ci && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.ci.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
              placeholder="usuario@abg.gob.ec"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => handleNumericChange('telefono', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                fieldErrors.telefono
                  ? 'border-red-500 focus:ring-red-500/60'
                  : 'border-gray-300 focus:ring-[#6e328a]/60'
              }`}
              placeholder="0987654321"
              maxLength="15"
              title="Solo números, entre 7 y 15 dígitos"
            />
            {fieldErrors.telefono && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.telefono.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
              required
            >
              <option value="tecnico">Técnico</option>
              <option value="faenador">Faenador</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#6e328a] hover:bg-[#58266f] text-white font-semibold py-2 rounded-lg transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? 'Registrando...' : `Registrarse como ${form.rol.charAt(0).toUpperCase() + form.rol.slice(1)}`}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#6e328a] hover:underline font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>

  );
}