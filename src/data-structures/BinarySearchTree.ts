// src/data-structures/BinarySearchTree.ts

// Defines the structure of a single node in the tree
export class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(value: number) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export interface DeletionResult {
  nodeToDelete: TreeNode;
  parentOfNodeToDelete: TreeNode | null;
  successor?: TreeNode;
  parentOfSuccessor?: TreeNode;
}

// The main class for the Binary Search Tree
export class BinarySearchTree {
  root: TreeNode | null;

  constructor() {
    this.root = null;
  }

  // Inserts a new value into the tree and returns the new node.
  insert(value: number): TreeNode {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return newNode;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          return newNode;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          return newNode;
        }
        current = current.right;
      }
    }
  }

  // Finds a node and its parent
  findNodeWithParent(value: number): { node: TreeNode | null; parent: TreeNode | null } {
    let node = this.root;
    let parent = null;
    while (node !== null && node.value !== value) {
      parent = node;
      if (value < node.value) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return { node, parent };
  }

  // Deletes a value from the tree.
  // This implementation is now focused on pointer manipulation for the animation.
  delete(value: number): DeletionResult | null {
    const { node: nodeToDelete, parent: parentOfNodeToDelete } = this.findNodeWithParent(value);

    if (!nodeToDelete) {
      return null; // Node not found
    }

    // Case 1 & 2: Node has 0 or 1 child
    if (nodeToDelete.left === null || nodeToDelete.right === null) {
      const child = nodeToDelete.left || nodeToDelete.right;
      if (parentOfNodeToDelete === null) {
        this.root = child;
      } else if (parentOfNodeToDelete.left === nodeToDelete) {
        parentOfNodeToDelete.left = child;
      } else {
        parentOfNodeToDelete.right = child;
      }
      return { nodeToDelete, parentOfNodeToDelete };
    }
    
    // Case 3: Node has two children
    else {
      let parentOfSuccessor = nodeToDelete;
      let successor = nodeToDelete.right;
      while (successor.left !== null) {
        parentOfSuccessor = successor;
        successor = successor.left;
      }

      // First, handle the successor's own right child
      if (parentOfSuccessor.left === successor) {
        parentOfSuccessor.left = successor.right;
      } else {
        parentOfSuccessor.right = successor.right;
      }

      // Now, have the successor take the place of the deleted node
      successor.left = nodeToDelete.left;
      successor.right = nodeToDelete.right;

      if (parentOfNodeToDelete === null) {
        this.root = successor;
      } else if (parentOfNodeToDelete.left === nodeToDelete) {
        parentOfNodeToDelete.left = successor;
      } else {
        parentOfNodeToDelete.right = successor;
      }
      
      return { nodeToDelete, parentOfNodeToDelete, successor, parentOfSuccessor };
    }
  }

  findMin(node: TreeNode): TreeNode {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  // Finds the path to a value
  findPath(value: number): number[] | null {
    if (!this.root) return null;

    const path: number[] = [];
    let current: TreeNode | null = this.root;
    while (current) {
      path.push(current.value);
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        return path; // Found it
      }
    }
    return null; // Not found
  }
}
