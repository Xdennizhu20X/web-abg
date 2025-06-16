'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function AccesoDenegado() {
  const router = useRouter();

  useEffect(() => {
    Swal.fire({
      title: 'Acceso denegado',
      text: 'No tienes permisos para acceder a esta plataforma.',
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#E10600',
    }).then(() => {
      router.push('/login');
    });
  }, [router]);

  return null;
}