import { useEffect, useState, useCallback, useMemo } from 'react';
import { Table, EmptyState } from '@heroui/react';
import { Inbox, RefreshCw, QrCode, X, Download } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import api from '../api/client';

interface Alumno {
  id: number;
  codigo: string;
  nombre_completo: string;
  seccion_nombre: string;
  seccion: number;
  qr_token: string;
  qr_image: string;
}

interface Asistencia {
  alumno: number;
  estado: 'presente' | 'tardanza' | 'ausente' | 'justificado';
  hora_registro: string | null;
}

interface Seccion {
  id: number;
  nombre: string;
  grado_nombre: string;
}

interface FilaAlumno extends Alumno {
  estado: string;
  hora_registro: string | null;
}

const ESTADO_BADGE: Record<string, string> = {
  presente:    'bg-green-100 text-green-700',
  tardanza:    'bg-yellow-100 text-yellow-700',
  ausente:     'bg-red-100 text-red-600',
  justificado: 'bg-blue-100 text-blue-700',
};

const VENTANA_MS = 8 * 60 * 60 * 1000; // 8 horas en ms

// Si la asistencia fue registrada hace más de 8 horas, se muestra como ausente visualmente
const estadoVisible = (estado: string, hora_registro: string | null): string => {
  if (!hora_registro) return estado;
  const hace8h = Date.now() - VENTANA_MS;
  if (new Date(hora_registro).getTime() < hace8h) return 'ausente';
  return estado;
};

const Home = () => {
  const [todasFilas, setTodasFilas] = useState<FilaAlumno[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<number | 'todas'>('todas');
  const [loading, setLoading] = useState(false);
  const [alumnoQR, setAlumnoQR] = useState<FilaAlumno | null>(null);

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];

      const [alumnosRes, seccionesRes, sesionesRes] = await Promise.all([
        api.get('/asistencia/alumnos/'),
        api.get('/asistencia/secciones/'),
        api.get(`/asistencia/sesiones/?fecha=${hoy}`),
      ]);

      const alumnos: Alumno[] = alumnosRes.data.results ?? alumnosRes.data;
      const seccionesData: Seccion[] = seccionesRes.data.results ?? seccionesRes.data;
      const sesiones: { id: number }[] = sesionesRes.data.results ?? sesionesRes.data;

      setSecciones(seccionesData);

      const asistenciasPromises = sesiones.map(s =>
        api.get(`/asistencia/sesiones/${s.id}/asistencias/`).then(r => r.data.data ?? [])
      );
      const todasAsistencias: Asistencia[] = (await Promise.all(asistenciasPromises)).flat();

      const mapaAsistencia = new Map<number, Asistencia>();
      for (const a of todasAsistencias) mapaAsistencia.set(a.alumno, a);

      setTodasFilas(alumnos.map(alumno => ({
        ...alumno,
        estado: mapaAsistencia.get(alumno.id)?.estado ?? 'ausente',
        hora_registro: mapaAsistencia.get(alumno.id)?.hora_registro ?? null,
      })));
    } catch (err) {
      console.error('Error cargando datos', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const filas = useMemo(() => {
    const base = seccionSeleccionada === 'todas'
      ? todasFilas
      : todasFilas.filter(f => f.seccion === seccionSeleccionada);
    // Aplicar lógica de 8 horas visualmente
    return base.map(f => ({ ...f, estado: estadoVisible(f.estado, f.hora_registro) }));
  }, [todasFilas, seccionSeleccionada]);

  const formatHora = (hora: string | null) => {
    if (!hora) return '—';
    return new Date(hora).toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  };

  const presentes = filas.filter(f => f.estado === 'presente' || f.estado === 'tardanza').length;

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 lg:p-8">
      {/* Modal QR */}
      {alumnoQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-between">
              <h3 className="font-semibold text-gray-800">QR del alumno</h3>
              <button onClick={() => setAlumnoQR(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <img src={alumnoQR.qr_image} alt="QR" className="w-64 h-auto" />
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${ESTADO_BADGE[estadoVisible(alumnoQR.estado, alumnoQR.hora_registro)]}`}>
              {estadoVisible(alumnoQR.estado, alumnoQR.hora_registro)}
              {alumnoQR.hora_registro ? ` · ${formatHora(alumnoQR.hora_registro)}` : ''}
            </span>
            <a
              href={alumnoQR.qr_image}
              download={`QR_${alumnoQR.codigo}_${alumnoQR.nombre_completo}.png`}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
            >
              <Download size={15} /> Descargar QR
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Asistencia</h1>
          <p className="text-sm text-gray-500 capitalize">{fechaHoy}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{presentes}/{filas.length} presentes</span>
          <button onClick={cargarDatos} disabled={loading}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtro por salón */}
      <div className="mb-4">
        <select
          value={seccionSeleccionada}
          onChange={e => setSeccionSeleccionada(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="todas">Todos los salones</option>
          {secciones.map(s => (
            <option key={s.id} value={s.id}>
              {s.grado_nombre} — {s.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1 min-h-0">
        <div className="flex flex-col min-h-0 overflow-hidden">
          <Table className="h-full">
            <Table.ScrollContainer>
              <Table.Content aria-label="Asistencia" className="h-full">
                <Table.Header>
                  <Table.Column isRowHeader>Alumno</Table.Column>
                  <Table.Column>Salón</Table.Column>
                  <Table.Column>Estado</Table.Column>
                  <Table.Column>Hora</Table.Column>
                  <Table.Column>QR</Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() => (
                    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                      <Inbox className="text-sm text-muted" />
                      <span className="text-sm text-gray-400">
                        {loading ? 'Cargando...' : 'Sin alumnos'}
                      </span>
                    </EmptyState>
                  )}
                >
                  {filas.map((f) => (
                    <Table.Row key={f.id}>
                      <Table.Cell>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{f.nombre_completo}</p>
                          <p className="text-xs text-gray-400">{f.codigo}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-gray-500">{f.seccion_nombre}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ESTADO_BADGE[f.estado] ?? ''}`}>
                          {f.estado}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-600">{formatHora(f.hora_registro)}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <button onClick={() => setAlumnoQR(f)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition">
                          <QrCode size={16} />
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>

        <div className="flex flex-col min-h-0 overflow-hidden">
          <QRScanner onAsistenciaRegistrada={cargarDatos} />
        </div>
      </div>
    </div>
  );
};

export default Home;
