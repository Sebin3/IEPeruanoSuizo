import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, CheckCircle, XCircle, ScanLine } from 'lucide-react';
import api from '../api/client';

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    alumno: string;
    codigo: string;
    grado: string;
    curso: string;
    estado: string;
    hora_registro: string;
  };
}

interface QRScannerProps {
  onAsistenciaRegistrada: () => void;
}

const QRScanner = ({ onAsistenciaRegistrada }: QRScannerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastTokenRef = useRef('');
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data && code.data !== lastTokenRef.current) {
      lastTokenRef.current = code.data;
      setScanning(true);

      try {
        const res = await api.post('/asistencia/escanear-qr/', { qr_token: code.data });
        setResult(res.data);
        if (res.data.success) onAsistenciaRegistrada();
      } catch {
        setResult({ success: false, message: 'Error al conectar con el servidor' });
      } finally {
        setScanning(false);
        if (cooldownRef.current) clearTimeout(cooldownRef.current);
        cooldownRef.current = setTimeout(() => { lastTokenRef.current = ''; }, 3000);
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [onAsistenciaRegistrada]);

  const startCamera = async () => {
    setResult(null);
    lastTokenRef.current = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      rafRef.current = requestAnimationFrame(processFrame);
    } catch {
      setResult({ success: false, message: 'No se pudo acceder a la cámara' });
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Escáner QR</h2>
        {scanning && <span className="text-xs text-blue-500 animate-pulse">Procesando...</span>}
      </div>

      {/* Área de cámara */}
      <div className="relative flex-1 overflow-hidden rounded-xl bg-gray-900 min-h-[300px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${isActive ? 'block' : 'hidden'}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay con guía de escaneo */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-52 h-52">
              {/* Esquinas del visor */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Línea animada */}
              <ScanLine size={200} className="absolute inset-0 text-green-400 opacity-60 animate-pulse" />
            </div>
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
            <CameraOff size={40} />
            <span className="text-sm">Cámara apagada</span>
          </div>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div className={`rounded-lg p-3 text-sm ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 font-medium mb-1">
            {result.success
              ? <CheckCircle size={15} className="text-green-600 shrink-0" />
              : <XCircle size={15} className="text-red-500 shrink-0" />
            }
            <span className={result.success ? 'text-green-700' : 'text-red-600'}>{result.message}</span>
          </div>
          {result.data && (
            <div className="text-gray-600 space-y-0.5 ml-5 text-xs">
              <p><span className="font-medium">Alumno:</span> {result.data.alumno}</p>
              <p><span className="font-medium">Grado:</span> {result.data.grado}</p>
              <p><span className="font-medium">Hora:</span> {result.data.hora_registro}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={isActive ? stopCamera : startCamera}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition
          ${isActive ? 'bg-red-400 hover:bg-red-500' : 'bg-gray-800 hover:bg-gray-700'}`}
      >
        {isActive ? <><CameraOff size={15} /> Detener</> : <><Camera size={15} /> Iniciar escáner</>}
      </button>
    </div>
  );
};

export default QRScanner;
