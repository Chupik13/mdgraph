import type { ICommandRegistry } from '../core/interfaces';

export function registerGraphCommands(registry: ICommandRegistry): void {
  registry.register(
    { id: 'graph.toggleSelect', description: 'Select/Unselect the focused node', category: 'graph' },
    (ctx) => {
      const focusedId = ctx.services.graphState.getFocusedNodeId();
      const selectedId = ctx.services.graphState.getSelectedNodeId();

      if(focusedId === null) {
        return;
      }

      if(!selectedId) {
        ctx.services.graphState.selectNode(focusedId);
      }

      if (focusedId == selectedId) {
        ctx.services.graphState.unselectNode();
      }

      if(focusedId !== selectedId) {
        ctx.services.graphState.unselectNode();
        ctx.services.graphState.selectNode(focusedId);
      }
    }
  );

  registry.register(
    { id: 'graph.fitAll', description: 'Fit all nodes in view', category: 'graph' },
    (ctx) => ctx.services.cameraMan.fitAll()
  );

  registry.register(
    { id: 'graph.centerOnFocused', description: 'Center view on focused node', category: 'graph' },
    (ctx) => {
      const focusedId = ctx.services.graphState.getFocusedNodeId();
      if (focusedId) {
        ctx.services.cameraMan.focusOnNode(focusedId);
      }
    }
  );

  registry.register(
    { id: 'graph.centerOnSelected', description: 'Center view on selected node', category: 'graph' },
    (ctx) => {
      const selectedId = ctx.services.graphState.getSelectedNodeId();
      if (selectedId) {
        ctx.services.cameraMan.focusOnNode(selectedId);
      }
    }
  );

  registry.register(
    { id: 'graph.zoomIn', description: 'Zoom in', category: 'graph' },
    (ctx) => ctx.services.cameraMan.zoomIn()
  );

  registry.register(
    { id: 'graph.zoomOut', description: 'Zoom out', category: 'graph' },
    (ctx) => ctx.services.cameraMan.zoomOut()
  );
}
