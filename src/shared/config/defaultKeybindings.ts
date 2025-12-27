import type { KeybindingConfig } from '../../core/interfaces';

export const DEFAULT_KEYBINDING_CONFIG: KeybindingConfig = {
  leader: ' ',
  timeout: 500,
  bindings: {

    k: 'navigation.up',
    j: 'navigation.down',
    h: 'navigation.left',
    l: 'navigation.right',

    w: 'navigation.clockwiseConnected',
    b: 'navigation.counterClockwiseConnected',

    n: 'navigation.clockwiseActive',
    N: 'navigation.counterClockwiseActive',

    ' ': 'graph.toggleSelect',

    '+': 'graph.zoomIn',
    '-': 'graph.zoomOut',
  },
};
