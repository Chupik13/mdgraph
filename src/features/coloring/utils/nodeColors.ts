/**
 * Centralized node color configuration and styling utilities.
 *
 * This module defines the complete color palette for graph nodes and provides
 * utility functions for generating node styles based on state and type. All colors
 * are defined in one place for easy theme customization.
 *
 * @module features/coloring/utils/nodeColors
 */

/**
 * Node type classifications for visual distinction.
 *
 * Priority order from highest to lowest:
 * 1. Selected - The currently selected/focused node
 * 2. Outgoing - Nodes with outgoing connections from selected
 * 3. Incoming - Nodes with incoming connections to selected
 * 4. Phantom - Non-existent files (broken wiki-links)
 * 5. Regular - Default node appearance (base case)
 */
export type NodeType = 'selected' | 'outgoing' | 'incoming' | 'phantom' | 'regular';

/**
 * Color scheme for a node type.
 *
 * Defines the border and background colors used to render nodes of a specific type.
 */
export interface NodeColorScheme {
  /**
   * Border color (hex format).
   */
  border: string;

  /**
   * Background/fill color (hex format).
   */
  background: string;
}

/**
 * Complete color palette for all node types.
 *
 * This object defines the color scheme for each node type. Modify these values
 * to change the application's color theme globally.
 *
 * @remarks
 * Colors are defined in hex format (#RRGGBB) for consistency and easy editing.
 * The palette uses:
 * - **Selected**: Bright cyan/teal for high visibility
 * - **Outgoing**: Red to indicate forward connections
 * - **Incoming**: Yellow-green for backward connections
 * - **Phantom**: Dark purple for broken/missing links
 * - **Regular**: Dark blue-gray for standard nodes
 */
export const NODE_COLORS: Record<NodeType, NodeColorScheme> = {
  selected: {
    border: '#72f0c2',
    background: '#45b592',
  },
  outgoing: {
    border: '#ab1125',
    background: '#db172f',
  },
  incoming: {
    border: '#adb088',
    background: '#dbdfac',
  },
  phantom: {
    border: '#3b1f2b',
    background: '#3b1f2b',
  },
  regular: {
    border: '#2e2e4f',
    background: '#383961',
  },
};

/**
 * Increases the brightness of a hex color by a specified percentage.
 *
 * Used for generating hover and focused states by brightening the base color.
 * The algorithm moves each RGB channel closer to white (255) by the given percentage.
 *
 * @param hex - Hex color string (with or without # prefix)
 * @param percent - Percentage to brighten (0-100, where 100 = full white)
 * @returns Brightened hex color string with # prefix
 *
 * @remarks
 * The brightening algorithm:
 * 1. Extracts RGB values from hex
 * 2. For each channel: `new = current + (255 - current) * (percent / 100)`
 * 3. Clamps to 255 maximum
 * 4. Converts back to hex format
 *
 * This preserves color hue while increasing luminosity.
 *
 * @example
 * brightenColor('#45b592', 50); // Returns '#a2dac9' (50% brighter)
 * brightenColor('#000000', 100); // Returns '#ffffff' (fully white)
 */
export function brightenColor(hex: string, percent: number): string {
  const color = hex.replace('#', '');

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const brighten = (value: number) => {
    const increased = value + (255 - value) * (percent / 100);
    return Math.min(255, Math.round(increased));
  };

  const newR = brighten(r);
  const newG = brighten(g);
  const newB = brighten(b);

  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Generates complete vis-network style object for a node.
 *
 * Creates a style configuration object with colors, borders, and fonts based on
 * the node type and interaction state. Includes hover and highlight variants.
 *
 * @param type - The type of node (selected, outgoing, incoming, phantom, regular)
 * @param isHoveredOrFocused - Whether the node is currently hovered or focused
 * @returns vis-network style object ready to be spread onto node data
 *
 * @remarks
 * The returned object includes:
 * - Base border and background colors
 * - Brightened colors for hover state (100% brighter)
 * - Highlight colors for selection state
 * - Border width configuration
 * - Font color (always white for contrast)
 *
 * Hover and highlight states use the same brightened border color for consistency.
 *
 * @example
 * const node = {
 *   id: 'note1',
 *   label: 'Note 1',
 *   ...getNodeStyle('selected', false)
 * };
 */
export function getNodeStyle(type: NodeType, isHoveredOrFocused: boolean = false) {
  const baseColors = NODE_COLORS[type];

  return {
    color: {
      border: isHoveredOrFocused ? brightenColor(baseColors.border, 100) : baseColors.border,
      background: baseColors.background,
      highlight: {
        border: brightenColor(baseColors.border, 100),
        background: baseColors.background,
      },
      hover: {
        border: brightenColor(baseColors.border, 100),
        background: baseColors.background,
      },
    },
    borderWidth: 2,
    borderWidthSelected: 3,
    font: {
      color: '#FFFFFF',
    },
  };
}

/**
 * Returns style for a selected node.
 *
 * @param isHoveredOrFocused - Whether the node is hovered or focused
 * @returns Style object for selected nodes
 */
export const getSelectedNodeStyle = (isHoveredOrFocused = false) =>
  getNodeStyle('selected', isHoveredOrFocused);

/**
 * Returns style for an outgoing connection node.
 *
 * @param isHoveredOrFocused - Whether the node is hovered or focused
 * @returns Style object for outgoing nodes
 */
export const getOutgoingNodeStyle = (isHoveredOrFocused = false) =>
  getNodeStyle('outgoing', isHoveredOrFocused);

/**
 * Returns style for an incoming connection node.
 *
 * @param isHoveredOrFocused - Whether the node is hovered or focused
 * @returns Style object for incoming nodes
 */
export const getIncomingNodeStyle = (isHoveredOrFocused = false) =>
  getNodeStyle('incoming', isHoveredOrFocused);

/**
 * Returns style for a phantom node (broken wiki-link).
 *
 * Phantom nodes have an additional visual indicator: a dashed border to clearly
 * indicate that the referenced file does not exist.
 *
 * @param isHoveredOrFocused - Whether the node is hovered or focused
 * @returns Style object for phantom nodes with dashed border
 *
 * @remarks
 * The dashed border pattern is [5, 5] (5px dash, 5px gap) for a subtle but
 * noticeable distinction from regular nodes.
 */
export const getPhantomNodeStyle = (isHoveredOrFocused = false) => ({
  ...getNodeStyle('phantom', isHoveredOrFocused),
  shapeProperties: {
    borderDashes: [5, 5],
  },
});

/**
 * Returns style for a regular node (default appearance).
 *
 * @param isHoveredOrFocused - Whether the node is hovered or focused
 * @returns Style object for regular nodes
 */
export const getRegularNodeStyle = (isHoveredOrFocused = false) =>
  getNodeStyle('regular', isHoveredOrFocused);

/**
 * Returns style for inactive nodes during search or filtering.
 *
 * Inactive nodes are rendered completely transparent (invisible) to focus user
 * attention on the active/matching nodes. This is used during search operations
 * to fade out non-matching nodes.
 *
 * @returns Style object with fully transparent colors
 *
 * @remarks
 * All visual properties are set to transparent RGBA:
 * - Border: Transparent
 * - Background: Transparent
 * - Font: Transparent
 * - Border width: 0 (optimization to avoid rendering transparent borders)
 *
 * The nodes remain in the DOM and graph data structure but are visually hidden.
 */
export const getInactiveNodeStyle = () => ({
  color: {
    border: 'rgba(0, 0, 0, 0)',
    background: 'rgba(0, 0, 0, 0)',
    highlight: {
      border: 'rgba(0, 0, 0, 0)',
      background: 'rgba(0, 0, 0, 0)',
    },
    hover: {
      border: 'rgba(0, 0, 0, 0)',
      background: 'rgba(0, 0, 0, 0)',
    },
  },
  borderWidth: 0,
  font: {
    color: 'rgba(0, 0, 0, 0)',
  },
});
