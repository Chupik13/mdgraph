import { useMemo } from 'react';
import { graphDataService } from '../../graph/services/GraphDataService';
import { useGraphStatus } from '../../graph/hooks/useGraphStatus';
import { CameraService } from '../services/CameraService';
import { useCameraStore } from '../store/cameraStore';

/**
 * Hook for camera operations.
 *
 * Provides CameraService instance and camera state. Uses reactive subscription
 * to graph status to ensure CameraService is recreated when network becomes available.
 *
 * @returns Object with cameraService instance and camera state (scale, position, isAnimating)
 *
 * @remarks
 * CameraService is created only when graph status is 'ready', ensuring
 * the vis-network instance is fully initialized before camera operations.
 */
export const useCamera = () => {
  const { status } = useGraphStatus();
  const scale = useCameraStore(state => state.scale);
  const position = useCameraStore(state => state.position);
  const isAnimating = useCameraStore(state => state.isAnimating);

  const cameraService = useMemo(() => {
    if (status !== 'ready') return null;
    return new CameraService(() => graphDataService.getNetwork());
  }, [status]);

  return {
    cameraService,
    scale,
    position,
    isAnimating,
  };
};
