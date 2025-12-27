import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CameraMan } from '../services/CameraMan';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { IEventBus } from '../interfaces';

const createMockAdapter = () => ({
  focusOnNode: vi.fn(),
  fitToNodes: vi.fn(),
  moveTo: vi.fn(),
  getScale: vi.fn(() => 1.0),
  getViewPosition: vi.fn(() => ({ x: 100, y: 200 })),
  getPositions: vi.fn(),
});

const createMockEventBus = (): IEventBus => ({
  emit: vi.fn(),
  on: vi.fn(() => vi.fn()), // returns unsubscribe function
  off: vi.fn(),
});

describe('CameraMan', () => {
  let cameraMan: CameraMan;
  let mockAdapter: ReturnType<typeof createMockAdapter>;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockEventBus = createMockEventBus();
    cameraMan = new CameraMan(mockEventBus);
  });

  describe('before initialization', () => {
    it('focusOnNode does not throw', () => {
      expect(() => cameraMan.focusOnNode('a')).not.toThrow();
    });

    it('fitAll does not throw', () => {
      expect(() => cameraMan.fitAll()).not.toThrow();
    });

    it('fitToNodes does not throw', () => {
      expect(() => cameraMan.fitToNodes(['a', 'b'])).not.toThrow();
    });

    it('moveTo does not throw', () => {
      expect(() => cameraMan.moveTo({ x: 0, y: 0 })).not.toThrow();
    });

    it('zoomIn does not throw', () => {
      expect(() => cameraMan.zoomIn()).not.toThrow();
    });

    it('zoomOut does not throw', () => {
      expect(() => cameraMan.zoomOut()).not.toThrow();
    });

    it('getScale returns default 1', () => {
      expect(cameraMan.getScale()).toBe(1);
    });

    it('getViewPosition returns default { x: 0, y: 0 }', () => {
      expect(cameraMan.getViewPosition()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('after initialization', () => {
    beforeEach(() => {
      cameraMan.initialize(mockAdapter as unknown as NetworkAdapter);
    });

    describe('focusOnNode', () => {
      it('delegates to adapter', () => {
        cameraMan.focusOnNode('node1');
        expect(mockAdapter.focusOnNode).toHaveBeenCalledWith('node1', undefined, undefined);
      });

      it('passes scale option', () => {
        cameraMan.focusOnNode('node1', { scale: 2.0 });
        expect(mockAdapter.focusOnNode).toHaveBeenCalledWith('node1', 2.0, undefined);
      });

      it('passes animation option', () => {
        const animation = { duration: 500, easingFunction: 'easeInOutQuad' as const };
        cameraMan.focusOnNode('node1', { animation });
        expect(mockAdapter.focusOnNode).toHaveBeenCalledWith('node1', undefined, animation);
      });

      it('passes both options', () => {
        const animation = { duration: 200 };
        cameraMan.focusOnNode('node1', { scale: 1.5, animation });
        expect(mockAdapter.focusOnNode).toHaveBeenCalledWith('node1', 1.5, animation);
      });
    });

    describe('fitAll', () => {
      it('calls adapter.fitToNodes without nodeIds', () => {
        cameraMan.fitAll();
        expect(mockAdapter.fitToNodes).toHaveBeenCalledWith(undefined, undefined);
      });

      it('passes animation options', () => {
        const animation = { duration: 400 };
        cameraMan.fitAll(animation);
        expect(mockAdapter.fitToNodes).toHaveBeenCalledWith(undefined, animation);
      });
    });

    describe('fitToNodes', () => {
      it('calls adapter.fitToNodes with nodeIds', () => {
        cameraMan.fitToNodes(['a', 'b', 'c']);
        expect(mockAdapter.fitToNodes).toHaveBeenCalledWith(['a', 'b', 'c'], undefined);
      });

      it('passes animation options', () => {
        const animation = { duration: 300, easingFunction: 'linear' as const };
        cameraMan.fitToNodes(['x'], animation);
        expect(mockAdapter.fitToNodes).toHaveBeenCalledWith(['x'], animation);
      });
    });

    describe('moveTo', () => {
      it('delegates to adapter', () => {
        cameraMan.moveTo({ x: 50, y: 75 });
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 50, y: 75 }, undefined, undefined);
      });

      it('passes scale', () => {
        cameraMan.moveTo({ x: 0, y: 0 }, 2.0);
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 0, y: 0 }, 2.0, undefined);
      });

      it('passes animation', () => {
        const animation = { duration: 100 };
        cameraMan.moveTo({ x: 10, y: 20 }, 1.0, animation);
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 10, y: 20 }, 1.0, animation);
      });
    });

    describe('zoomIn', () => {
      it('increases scale by default step (0.2)', () => {
        cameraMan.zoomIn();
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 100, y: 200 }, 1.2);
      });

      it('increases scale by custom step', () => {
        cameraMan.zoomIn(0.5);
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 100, y: 200 }, 1.5);
      });

      it('uses current position from adapter', () => {
        mockAdapter.getViewPosition.mockReturnValue({ x: 300, y: 400 });
        cameraMan.zoomIn();
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 300, y: 400 }, 1.2);
      });
    });

    describe('zoomOut', () => {
      it('decreases scale by default step (0.2)', () => {
        cameraMan.zoomOut();
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 100, y: 200 }, 0.8);
      });

      it('decreases scale by custom step', () => {
        cameraMan.zoomOut(0.3);
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 100, y: 200 }, 0.7);
      });

      it('does not go below 0.1', () => {
        mockAdapter.getScale.mockReturnValue(0.2);
        cameraMan.zoomOut(0.5);
        expect(mockAdapter.moveTo).toHaveBeenCalledWith({ x: 100, y: 200 }, 0.1);
      });
    });

    describe('getScale', () => {
      it('delegates to adapter', () => {
        mockAdapter.getScale.mockReturnValue(2.5);
        expect(cameraMan.getScale()).toBe(2.5);
      });
    });

    describe('getViewPosition', () => {
      it('delegates to adapter', () => {
        mockAdapter.getViewPosition.mockReturnValue({ x: 999, y: 888 });
        expect(cameraMan.getViewPosition()).toEqual({ x: 999, y: 888 });
      });
    });
  });

  describe('destroy', () => {
    it('nullifies adapter reference', () => {
      cameraMan.initialize(mockAdapter as unknown as NetworkAdapter);
      cameraMan.destroy();

      // After destroy, should return defaults
      expect(cameraMan.getScale()).toBe(1);
      expect(cameraMan.getViewPosition()).toEqual({ x: 0, y: 0 });
    });

    it('methods do not throw after destroy', () => {
      cameraMan.initialize(mockAdapter as unknown as NetworkAdapter);
      cameraMan.destroy();

      expect(() => cameraMan.focusOnNode('a')).not.toThrow();
      expect(() => cameraMan.zoomIn()).not.toThrow();
    });
  });
});
