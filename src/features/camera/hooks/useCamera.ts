import { useMemo } from 'react';
import { useGraphStore } from '../../graph/store/graphStore';
import { CameraService } from '../services/CameraService';
import { useCameraStore } from '../store/cameraStore';

/**
 * Hook for camera operations
 * Provides CameraService instance and camera state
 */
export const useCamera = () => {
  const networkInstance = useGraphStore(state => state.networkInstance);
  const scale = useCameraStore(state => state.scale);
  const position = useCameraStore(state => state.position);
  const isAnimating = useCameraStore(state => state.isAnimating);

  const cameraService = useMemo(() => {
    return networkInstance ? new CameraService(networkInstance) : null;
  }, [networkInstance]);

  return {
    cameraService,
    scale,
    position,
    isAnimating,
  };
};
