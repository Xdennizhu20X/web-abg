'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
const PDFDownloadButton = dynamic(() => import('../../components/PDFDownloadButton'), { ssr: false });

export default function CertificadoZoosanitario() {
  const { id } = useParams();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef();

  useEffect(() => {
    if (!id) return;
    const fetchSolicitud = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/movilizaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitud(res.data);
      } catch (error) {
        console.error('Error al cargar la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitud();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (!solicitud) return <p>No se encontró la solicitud.</p>;

  const animales = solicitud.Animals || [];
  const aves = solicitud.Aves || [];
  const transporte = solicitud.Transporte || {};
  const predioOrigen = solicitud.predio_origen || {};
  const predioDestino = solicitud.predio_destino || {};
  const usuario = solicitud.Usuario || {};
  const validacion = solicitud.Validacion || {};

  return (
    <div className="p-4 bg-gray-100">
     <style jsx global>{`
  @media print {
    button, .no-print { display: none !important; }
    @page {
      margin: 0;
      size: A4;
    }
    body {
      margin: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bg-gray-300 {
      background-color: #d1d5db !important;
    }
  }
  
  .table-cell {
    border: 1px solid black;
    vertical-align: top;
  }
`}</style>

<div className="flex justify-between mb-4">
  <Link 
    href="/dashboard"
    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 no-print flex items-center gap-2 w-fit"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
    Volver al Dashboard
  </Link>

  {solicitud.estado !== 'aprobado' && (
    <Link
      href={`/validar/${solicitud.id}`}
      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 no-print"
    >
      Validar y Firmar
    </Link>
  )}
  
  <button
    onClick={() => window.print()}
    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 no-print"
  >
    Imprimir / Guardar como PDF
  </button>
</div>

      <div
        ref={pdfRef}
        className="certificate-container font w-[210mm] min-h-[290mm] pt-[2mm] px-[10mm] bg-white text-black text-[9px] leading-tight mx-auto shadow-lg"
      >
        {/* Header */}
        <div className="flex items-start mb-4">
          <div className="w-20 h-20  flex items-center justify-center mr-4">
        <Image
            src="/imagen.png"
            alt="Logo ABG"
            width={200}
            height={200}
            priority
          />
          </div>
          
          <div className="flex-1 text-center">
            <div className="text-[10px] font-bold mb-1">REPÚBLICA DEL ECUADOR</div>
            <div className="text-[9px] mb-1">Agencia de Regulación y Control de la</div>
            <div className="text-[9px] mb-2">Bioseguridad y Cuarentena para Galápagos</div>
            <div className="border border-black p-1 mb-2">
              <div className="font-bold text-[10px]">CERTIFICADO ZOOSANITARIO PARA LA MOVILIZACIÓN DE ANIMALES EN LAS ISLAS</div>
            </div>
            <div className="font-bold text-[14px]">SANTA CRUZ</div>
          </div>
          
          <div className="ml-4">
            <div className="border border-black p-2 text-[8px] text-center mb-2">
              No. {solicitud.id.toString().padStart(6, '0')}
            </div>
          </div>
        </div>

        {/* Texto principal */}
        <p className="text-[9px] mb-3 text-justify">
          La Agencia de Regulación y Control de la Bioseguridad y Cuarentena para Galápagos, con 
          fecha: <span className="font-bold">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</span> autoriza al señor(a) 
          <span className="font-bold"> {usuario.nombre || '_________________'} </span> 
           con C.I. No. <span className="font-bold">{usuario.ci || '_________________'}</span>, y teléfono No. 
          <span className="font-bold"> {usuario.telefono || '_________________'}</span>, residente de la Provincia de Galápagos.
        </p>

        {/* Sección I - Animales */}
        <div className="bg-[#d8d4cc] font-bold p-1 text-[9px] mb-1">
          I LA MOVILIZACIÓN DE LOS SIGUIENTES ANIMALES DE LA ESPECIE
        </div>
        
        <table className="w-full border-collapse text-[8px] mb-3">
          <thead>
            <tr>
              <th className="table-cell p-1 w-8">Ord.</th>
              <th className="table-cell p-1">Identificación</th>
              <th className="table-cell p-1">Categoría</th>
              <th className="table-cell p-1">Raza</th>
              <th className="table-cell p-1">Sexo</th>
              <th className="table-cell p-1">Color</th>
              <th className="table-cell p-1">Edad</th>
              <th className="table-cell p-1">Comerciante</th>
              <th className="table-cell p-1">Observaciones</th>
            </tr>
          </thead>
<tbody>
  {animales.map((animal, idx) => (
    <tr key={animal.id} className="h-6">
      <td className="table-cell p-1 text-center">{idx + 1}</td>
      <td className="table-cell p-1">{animal.identificador}</td>
      <td className="table-cell p-1">{animal.categoria}</td>
      <td className="table-cell p-1">{animal.raza}</td>
      <td className="table-cell p-1">{animal.sexo}</td>
      <td className="table-cell p-1">{animal.color}</td>
      <td className="table-cell p-1">{animal.edad} meses</td>
      <td className="table-cell p-1">{animal.comerciante}</td>
      <td className="table-cell p-1">{animal.observaciones}</td>
    </tr>
  ))}
  {/* Rellenar filas vacías si hay menos de 7 animales */}
  {[...Array(Math.max(0, 7 - animales.length))].map((_, idx) => (
    <tr key={`empty-${idx}`} className="h-6">
      <td className="table-cell p-1 text-center">{animales.length + idx + 1}</td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      {/* ... otras celdas vacías ... */}
    </tr>
  ))}
</tbody>
        </table>

        {/* Sección Aves */}
        <div className="bg-gray-300 font-bold p-1 text-[9px] mb-1">
          Para el uso exclusivo de aves
        </div>
        
        <table className="w-full border-collapse text-[8px] mb-3">
          <thead>
            <tr>
              <th className="table-cell p-1 w-8">Ord.</th>
              <th className="table-cell p-1">No. galpón</th>
              <th className="table-cell p-1">Categoría<br/>Engorde | Postura</th>
              <th className="table-cell p-1">Edad</th>
              <th className="table-cell p-1">Total de<br/>aves</th>
              <th className="table-cell p-1">Observaciones</th>
            </tr>
          </thead>
          <tbody>
  {aves.map((ave, idx) => (
    <tr key={ave.id} className="h-6">
      <td className="table-cell p-1 text-center">{idx + 1}</td>
      <td className="table-cell p-1">{ave.numero_galpon || '-'}</td>
      <td className="table-cell p-1">{ave.categoria}</td>
      <td className="table-cell p-1">{ave.edad} semanas</td>
      <td className="table-cell p-1">{ave.total_aves || '-'}</td>
      <td className="table-cell p-1">{ave.observaciones}</td>
    </tr>
  ))}
  {/* Rellenar filas vacías si hay menos de 3 aves */}
  {[...Array(Math.max(0, 3 - aves.length))].map((_, idx) => (
    <tr key={`empty-ave-${idx}`} className="h-6">
      <td className="table-cell p-1 text-center">{aves.length + idx + 1}</td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      <td className="table-cell p-1"></td>
      {/* ... otras celdas vacías ... */}
    </tr>
  ))}
</tbody>
        </table>

        {/* Desde y Destino */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="bg-gray-300 font-bold p-1 text-[9px] mb-1">Desde:</div>
            <div className="text-[8px] mb-1">
              <span>Predio / granja: </span>
              <span className="border-b border-black inline-block w-32">
                {predioOrigen.nombre}
              </span>
            </div>
            <div className="text-[8px] mb-1">
              <span>Parroquia: </span>
              <span className="border-b border-black inline-block w-40">
                {predioOrigen.parroquia}
              </span>
            </div>
            <div className="text-[8px] mb-2">
              <span>Localidad / sitio / km: </span>
              <span className="border-b border-black inline-block w-28">
                {predioOrigen.ubicacion}
              </span>
            </div>
            
            <div className="text-[8px] mb-2">
              <span className="font-bold">Datos adicionales:</span>
              <div className="mt-1">
                {['Propio', 'Arrendado', 'Prestado'].map((tipo) => (
                  <label key={tipo} className="flex items-center mb-1 last:mb-0">
                    <span className="w-3 h-3 border border-black mr-2 inline-flex items-center justify-center">
                      {predioDestino?.condicion_tenencia === tipo && (
                        <svg
                          className="w-2 h-2 text-black"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {tipo}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-300 font-bold p-1 text-[9px] mb-1">Destino:</div>
              <div className="text-[8px] mb-1">
                <span>Centro de faenamiento: </span>
                <span className="w-3 h-3 border border-black mr-1 inline-flex items-center justify-center">
                  {predioDestino?.nombre?.includes('Centro Faenamiento') && (
                    <svg
                      className="w-2 h-2 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="border-b border-black inline-block w-24">
                  {predioDestino?.nombre?.includes('Centro Faenamiento') ? predioDestino.nombre : ''}
                </span>
              </div>
                <div className="text-[8px] mb-1">
                  <span>Predio: </span>
                  <span className="w-3 h-3 border border-black mr-1 inline-flex items-center justify-center">
                    {!predioDestino?.nombre?.includes('Centro Faenamiento') && (
                      <svg
                        className="w-2 h-2 text-black"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="border-b border-black inline-block w-12"></span>
                  <span> Nombre del predio: </span>
                  <span className="border-b border-black inline-block w-20">
                    {!predioDestino?.nombre?.includes('Centro Faenamiento') ? predioDestino.nombre : ''}
                  </span>
                </div>

            <div className="text-[8px] mb-1">
              <span>Ubicación: </span>
              <span className="border-b border-black inline-block w-16"></span>
              <span> Dirección o referencia: </span>
              <span className="border-b border-black inline-block w-20">
                {predioDestino.ubicacion}
              </span>
            </div>
            <div className="text-[8px]">
              <span>Parroquia: </span>
              <span className="border-b border-black inline-block w-24">
                {predioDestino.parroquia}
              </span>
            </div>
          </div>
        </div>

        {/* Sección II - Transporte */}
<div className="bg-gray-300 font-bold p-1 text-[9px] mb-1">
  II VÍA DE TRANSPORTE
</div>

<div className="mb-2">
  <div className="text-[8px] mb-1">
    <label className="flex items-center">
      <span className="w-3 h-3 border border-black mr-2 inline-flex items-center justify-center">
        {transporte?.es_terrestre && (
          <svg
            className="w-2 h-2 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="font-bold">Terrestre</span>
    </label>
  </div>

          
          <div className="grid grid-cols-2 gap-4 text-[8px] mb-2">
            <div>
              <span>Tipo de transporte: </span>
              <span className="border-b border-black inline-block w-20">
                {transporte.tipo_transporte}
              </span>
            </div>
            <div>
              <span>Nombre del transportista: </span>
              <span className="border-b border-black inline-block w-24">
                {transporte.nombre_transportista}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-[8px] mb-2">
            <div>
              <span>No. matrícula / placa: </span>
              <span className="border-b border-black inline-block w-16">
                {transporte.placa}
              </span>
            </div>
            <div>
              <span>Cédula de identidad: </span>
              <span className="border-b border-black inline-block w-16">
                {transporte.cedula_transportista}
              </span>
            </div>
            <div>
              <span>Teléfono: </span>
              <span className="border-b border-black inline-block w-16">
                {transporte.telefono_transportista}
              </span>
            </div>
          </div>
          
          <div className="text-[8px] mb-1">
            <label className="flex items-center">
              <span className={`w-3 h-3 border border-black mr-2 inline-block ${!transporte.es_terrestre ? 'bg-black' : ''}`}></span>
              <span className="font-bold">Otros</span>
            </label>
          </div>
          
          <div className="text-[8px]">
            <span>Detalle de otro: </span>
            <span className="border-b border-black inline-block w-80">
              {transporte.detalle_otro || 'N/A'}
            </span>
          </div>
        </div>

        {/* Sección III - Validez y Firmas */}
        <div className="bg-gray-300 font-bold p-1 text-[9px] mb-1">
  III VALIDEZ Y FIRMAS DE RESPONSABILIDAD
</div>

<div className="text-[8px] mb-2">
  <p className="mb-1">
    ESTA GUÍA ES VÁLIDA POR EL TIEMPO DE 
    <span className="border-b border-black inline-block w-20 mx-1">
      {solicitud?.Validacion?.tiempo_validez || '___'}
    </span> 
    A PARTIR DE LAS 
    <span className="border-b border-black inline-block w-8 mx-1">
      {solicitud?.Validacion?.hora_inicio?.split(':')[0] || '00'}
    </span>:
    <span className="border-b border-black inline-block w-8">
      {solicitud?.Validacion?.hora_inicio?.split(':')[1] || '00'}
    </span> HASTA 
    <span className="border-b border-black inline-block w-8 mx-1">
      {solicitud?.Validacion?.hora_fin?.split(':')[0] || '00'}
    </span>:
    <span className="border-b border-black inline-block w-8">
      {solicitud?.Validacion?.hora_fin?.split(':')[1] || '00'}
    </span>
  </p>
  <p className="mb-3">
    FECHA DE EMISIÓN: 
    <span className="border-b border-black inline-block w-24 mx-1">
      {solicitud?.Validacion?.fecha_emision 
        ? new Date(solicitud.Validacion.fecha_emision).toLocaleDateString()
        : '________'}
    </span>
  </p>
</div>

{/* Firmas */}
<div className="grid grid-cols-2 gap-8 mb-4">
  <div className="text-center">
    {solicitud?.Validacion?.firma_tecnico && (
      <img
        src={solicitud.Validacion.firma_tecnico}
        alt="Firma Técnico"
        className="mx-auto h-12 object-contain"
      />
    )}
    <div className="border-b border-black h-0 mb-1"></div>
    <div className="text-[8px] font-bold">
      {solicitud?.Validacion?.nombre_tecnico || 'NOMBRE TÉCNICO'}
    </div>
    <div className="text-[8px] font-bold">NOMBRE Y FIRMA DEL MÉDICO(A) VETERINARIO(A) / TÉCNICO</div>
  </div>
  <div className="text-center">
    <div className="border-b border-black h-12 mb-1"></div>
    <div className="text-[8px] font-bold">
      {solicitud?.Usuario?.nombre || 'NOMBRE USUARIO'}
    </div>
    <div className="text-[8px] font-bold">NOMBRE Y FIRMA DEL INTERESADO</div>
  </div>
</div>


        <div className="text-[7px] text-left">
          <p>Original usuario, copia 1 centro de faenamiento, copia 2 área técnica.</p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-4">
          <div className="text-[7px]">
            <p className="font-bold">Dirección: Av. Baltra, diagonal a la gruta del Divino Niño</p>
            <p>Código postal: EC200350/ Puerto Ayora-Ecuador</p>
            <p>Teléfono: +593-5 252 7414</p>
            <p>www.bioseguridadgalapagos.gob.ec</p>
          </div>
          <div className="text-right">
            <Image
              src="/nuevoec.png"
              alt="Logo ABG"
              width={200}
              height={200}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}