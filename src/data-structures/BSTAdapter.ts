// src/data-structures/BSTAdapter.ts
import { BinarySearchTree, TreeNode } from './BinarySearchTree';
import type {
  IDataStructureAdapter,
  VisualizerNode,
  VisualizerLink,
  AnimationStep,
} from './IDataStructureAdapter';

export class BSTAdapter implements IDataStructureAdapter {
  private bst: BinarySearchTree;
  private nodeIdMap: Map<TreeNode, string>;
  private nextId: number;

  constructor(initialValues: number[] = []) {
    this.bst = new BinarySearchTree();
    this.nodeIdMap = new Map();
    this.nextId = 0;
    initialValues.forEach(v => this.bst.insert(v));
  }

  /**
   * Generates a unique ID for a tree node and stores the mapping.
   */
  private getUniqueId(node: TreeNode): string {
    if (!this.nodeIdMap.has(node)) {
      this.nodeIdMap.set(node, `node-${this.nextId++}`);
    }
    return this.nodeIdMap.get(node)!;
  }

  /**
   * Traverses the BST and converts it into flat lists of nodes and links
   * that the visualizer can understand.
   */
  private transformBstToVisualizerState(): {
    nodes: VisualizerNode[];
    links: VisualizerLink[];
  } {
    const nodes: VisualizerNode[] = [];
    const links: VisualizerLink[] = [];
    if (!this.bst.root) {
      return { nodes, links };
    }

    const queue: TreeNode[] = [this.bst.root];
    this.getUniqueId(this.bst.root); // Ensure root has an ID

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentId = this.getUniqueId(current);

      nodes.push({ id: currentId, value: current.value, x: 0, y: 0 });

      if (current.left) {
        links.push({ source: currentId, target: this.getUniqueId(current.left) });
        queue.push(current.left);
      }
      if (current.right) {
        links.push({ source: currentId, target: this.getUniqueId(current.right) });
        queue.push(current.right);
      }
    }
    return { nodes, links };
  }

  getInitialState(): { nodes: VisualizerNode[]; links: VisualizerLink[] } {
    return this.transformBstToVisualizerState();
  }

  insert(value: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    let parent: TreeNode | null = null;
    let current = this.bst.root;
    const path: TreeNode[] = [];

    while (current) {
      path.push(current);
      parent = current;
      current = value < current.value ? current.left : current.right;
    }

    for (const node of path) {
      steps.push({ type: 'VISIT', nodeId: this.getUniqueId(node) });
    }

    const newNode = this.bst.insert(value);
    const newNodeId = this.getUniqueId(newNode);
    let newLinkId = parent ? `${this.getUniqueId(parent)}->${newNodeId}` : 'no-link';

    const { nodes, links } = this.transformBstToVisualizerState();
    steps.push({ type: 'FINALIZE_INSERT', nodes, links, newNodeId, newLinkId });
    return steps;
  }

  delete(value: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const path: TreeNode[] = [];
    let current = this.bst.root;

    // Stage 1: Find the node to delete (x)
    while (current) {
      path.push(current);
      if (value === current.value) break;
      current = value < current.value ? current.left : current.right;
    }

    for (const node of path) {
      steps.push({ type: 'VISIT', nodeId: this.getUniqueId(node) });
    }

    const nodeToDelete = current;
    if (!nodeToDelete) return steps;

    const nodeToDeleteId = this.getUniqueId(nodeToDelete);
    steps.push({ type: 'HIGHLIGHT', nodeIds: [nodeToDeleteId], color: '#e74c3c' });

    // Case 3: Two children - the complex animation
    if (nodeToDelete.left && nodeToDelete.right) {
      let successorParent = nodeToDelete;
      let successor = nodeToDelete.right;
      const successorPath: TreeNode[] = [];
      while (successor.left) {
        successorPath.push(successor);
        successorParent = successor;
        successor = successor.left;
      }
      successorPath.push(successor);

      for (const node of successorPath) {
        steps.push({ type: 'VISIT', nodeId: this.getUniqueId(node) });
      }
      
      const successorId = this.getUniqueId(successor);
      const successorParentId = this.getUniqueId(successorParent);
      steps.push({ type: 'HIGHLIGHT', nodeIds: [nodeToDeleteId, successorId], color: '#e74c3c' });
      
      // The final, detailed animation sequence
      const edgeToFadeId = `${successorParentId}->${successorId}`;
      steps.push({ type: 'FADE_OUT', elementIds: [edgeToFadeId] });
      steps.push({ type: 'HIDE_VISITOR' });
      steps.push({ type: 'FADE_OUT', elementIds: [nodeToDeleteId] });
      steps.push({ type: 'MOVE_NODE', nodeId: successorId, toNodeId: nodeToDeleteId });
    }

    // Now, perform the actual deletion
    this.bst.delete(value);

    // FINALIZE for all cases
    steps.push({ type: 'FINALIZE', ...this.transformBstToVisualizerState() });
    
    return steps;
  }

  find(value: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    let current = this.bst.root;
    
    while (current) {
      steps.push({ type: 'VISIT', nodeId: this.getUniqueId(current) });
      if (value === current.value) break;
      current = value < current.value ? current.left : current.right;
    }
    return steps;
  }
}
