import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff } from 'lucide-react';

const CameraPrueba = () => {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="relative flex-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <video
          ref={videoRef}
          autoPlay
          playsInline={true}
          muted
          className={`h-full w-full object-cover ${isActive ? 'block' : 'hidden'}`}
        />
        {!isActive && (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <CameraOff size={48} />
          </div>
        )}
      </div>

      <button
        onClick={isActive ? stopCamera : startCamera}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${isActive ? 'bg-red-300' : 'bg-gray-400'}`}
      >
        {isActive ? <CameraOff size={18} /> : <Camera size={18} />}
        {isActive ? 'Apagar Cámara' : 'Prender ámara'}
      </button>
    </div>
  );
};

export default CameraPrueba;
