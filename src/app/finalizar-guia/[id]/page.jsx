'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext'; // Importa el contexto de autenticación

const FinalizarGuiaPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth(); // Obtiene el token del contexto
  const [animals, setAnimals] = useState([]);
  const [checkedAnimals, setCheckedAnimals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://51.178.31.63:3000/api/movilizaciones/${id}/animales`,
          {
            headers: {
              Authorization: `Bearer ${token}` // Incluye el token en el encabezado
            }
          }
        );
    
        const animalList = response.data.animales;
        setAnimals(animalList);
    
        const initialCheckedState = {};
        animalList.forEach(animal => {
          initialCheckedState[animal.id] = false;
        });
        setCheckedAnimals(initialCheckedState);
      } catch (err) {
        setError(err);
        console.error('Error fetching animals:', err);
        // Manejo de error 401 (no autorizado)
        if (err.response?.status === 401) {
          router.push('/login'); // Redirige al login si no está autorizado
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && token) { // Solo ejecutar si hay ID y token
      fetchAnimals();
    }
  }, [id, token, router]);

  const handleCheckboxChange = (animalId) => {
    setCheckedAnimals(prevState => ({
      ...prevState,
      [animalId]: !prevState[animalId],
    }));
  };

const handleAlertABG = async () => {
  try {
    const response = await axios.put(
      `http://51.178.31.63:3000/api/movilizaciones/${id}/estado`,
      { 
        id: Number(id), // Asegúrate de enviar el ID como número
        nuevoEstado: 'alerta' 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      alert('Movilización marcada como alerta');
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Detalles del error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    alert(`Error al alertar ABG: ${error.response?.data?.message || error.message}`);
  }
};

const handleFinalizar = async () => {
  try {
    const response = await axios.put(
      `http://51.178.31.63:3000/api/movilizaciones/${id}/estado`,
      { 
        id: Number(id), // Asegúrate de enviar el ID como número
        nuevoEstado: 'finalizado' 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      alert('Movilización finalizada correctamente');
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Detalles del error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    alert(`Error al finalizar: ${error.response?.data?.message || error.message}`);
  }
};

  const allChecked = animals.length > 0 && Object.values(checkedAnimals).every(isChecked => isChecked);

  if (loading) {
    return <div className="text-center py-4 text-[#6e328a] font-semibold">Cargando animales...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error al cargar animales: {error.message}</div>;
  }

  if (!animals || animals.length === 0) {
    return <div className="text-center py-4 text-gray-500">No se encontraron animales para esta guía.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
      >
        Volver al Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4 text-[#6e328a]">Verificar Animales de la Guía {id}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <ul>
          {animals.map(animal => (
            <li key={animal.id} className="flex items-center justify-between border-b border-gray-200 last:border-b-0 py-3 px-2 hover:bg-gray-50 transition-colors duration-200">
              <span>{`${animal.especie}-(ID: ${animal.identificador})`}</span>
              <input
                type="checkbox"
                checked={checkedAnimals[animal.id] || false}
                onChange={() => handleCheckboxChange(animal.id)}
                className="form-checkbox h-5 w-5 text-[#6e328a] rounded"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleAlertABG}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
        >
          Alertar a la ABG
        </button>
        <button
          onClick={handleFinalizar}
          disabled={!allChecked}
          className={`px-4 py-2 rounded-md transition ${
            allChecked
              ? 'bg-[#6e328a] text-white hover:bg-[#5a2a71]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default FinalizarGuiaPage;

