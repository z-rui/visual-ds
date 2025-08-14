// src/data-structures/IDataStructureAdapter.ts

/**
 * The generic structure for a node that the visualizer understands.
 */
export interface VisualizerNode {
  id: string;
  value: number | string;
  x: number;
  y: number;
  opacity?: number; // Optional: for fade-in/out animations
  fill?: string; // Optional: for highlighting
}

/**
 * The generic structure for a link (edge) that the visualizer understands.
 */
export interface VisualizerLink {
  source: string;
  target: string;
  opacity?: number; // Optional: for fade-in/out animations
}

/**
 * Defines the different kinds of steps that can be part of an animation plan.
 */
export type AnimationStep =
  // Represents visiting a node during a traversal.
  | { type: 'VISIT'; nodeId: string }
  // Represents highlighting one or more nodes.
  | { type: 'HIGHLIGHT'; nodeIds: string[]; color?: string }
  // Represents fading out an element (node or link).
  | { type: 'FADE_OUT'; elementIds: string[] }
  // Represents changing the display value of a node.
  | { type: 'UPDATE_VALUE'; nodeId: string; newValue: number | string }
  // Represents moving a node to the current position of another node.
  | { type: 'MOVE_NODE'; nodeId: string; toNodeId: string }
  // Represents hiding the visitor circle.
  | { type: 'HIDE_VISITOR' }
  // A simple final state for operations without complex animations.
  | { type: 'FINALIZE'; nodes: VisualizerNode[]; links: VisualizerLink[] }
  // A detailed final state for the insert operation.
  | {
      type: 'FINALIZE_INSERT';
      nodes: VisualizerNode[];
      links: VisualizerLink[];
      newNodeId: string;
      newLinkId: string;
    };

/**
 * Any data structure that wants to be visualized must provide an adapter
 * that implements this interface.
 */
export interface IDataStructureAdapter {
  /**
   * Provides the initial state (nodes and links) to be rendered.
   */
  getInitialState(): { nodes: VisualizerNode[]; links: VisualizerLink[] };

  /**
   * Inserts a value and returns a plan for how to animate the operation.
   */
  insert(value: number | string): AnimationStep[];

  /**
   * Deletes a value and returns a plan for how to animate the operation.
   */
  delete(value: number | string): AnimationStep[];

  /**
   * Finds a value and returns a plan for how to animate the traversal.
   */
  find(value: number | string): AnimationStep[];
}