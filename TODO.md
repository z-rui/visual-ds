# Visual-DS Project Roadmap & TODO

This document outlines the strategic direction and concrete tasks for the Visual-DS project.

---

## 🌟 Priority 1: Core Refactoring - The Animation Engine

The previous refactoring attempt failed due to a fundamental architectural flaw. This section outlines the correct, more robust approach.

- **Core Problem:** The animation state for nodes and links was managed by separate, un-synchronized systems (a central `useSprings` for nodes, individual `useSpring` hooks within each `Edge` component). This made it impossible to reliably sequence animations between nodes and links (e.g., "fade in node, *then* fade in edge").

- **The Solution (The "Grand Unification" Plan):** A more fundamental refactoring is required to create a single, unified animation engine. All animated properties for all visual elements must be controlled by one central authority.

- **Key Implementation Steps:**
  1.  **Unify State Management:** In `DataStructureVisualizer.tsx`, use a single `useSprings` hook to manage the state of **all** animatable elements, both nodes and links.
  2.  **"Dumb" Presentation Components:** Refactor `Edge.tsx` to remove its internal `useSpring` hook. It must become a pure presentation component that simply receives animated props, just like `Node.tsx`.
  3.  **Guarantee Strong Coupling:** Within the central `useSprings` configuration, the animated properties for an edge's endpoints (e.g., `x1`, `y1`) must be **declaratively derived** from the animated properties of the nodes they connect (`x`, `y`). This is the most critical step to ensure edges and nodes never de-synchronize during animations.
  4.  **Semantic Storyboard:** The `BSTAdapter.ts` will emit storyboards using high-level, semantic commands (`FINALIZE`, `FADE_IN`, `FADE_OUT`). The robust central engine will then execute these commands sequentially, with `onRest` callbacks ensuring proper timing.

---

## 🚀 Priority 2: Future Features & UI/UX Enhancements

Once the core engine is stable, the following features will provide the most value.

- **Animation Controls:**
  - [ ] **Speed Control:** Implement a slider to adjust the speed of all animations.
  - [ ] **Playback Controls:** Add buttons for "Pause/Resume" and "Step Forward" to allow for detailed inspection of the animation sequence.

- **Canvas Interaction:**
  - [ ] **Zoom & Pan:** Allow users to zoom and pan the SVG canvas to navigate large data structures (e.g., using `d3-zoom`).

- **User Feedback:**
  - [ ] **Operation Status:** Provide clear visual feedback (e.g., toasts, messages) for the result of operations, especially for errors like "value already exists" or "value not found".

---

## 🛠️ Priority 3: Code Quality & Long-term Architecture

These tasks are crucial for the long-term health and maintainability of the codebase.

- **Unit Testing:**
  - [ ] **Implement a Test Framework:** Add Vitest or Jest to the project.
  - [ ] **Test the Director:** Write comprehensive unit tests for `BSTAdapter.ts`. The tests should verify that for a given operation (e.g., `insert(5)`), the generated `AnimationStep[]` storyboard is 100% correct. This is the most critical testing task.

- **State Management:**
  - [ ] **Centralize Global State:** As more UI controls are added, introduce a lightweight state management library (Zustand is a good candidate) or React Context to manage global state like animation speed, the current data structure type, etc.

- **Component Structure:**
  - [ ] **Refactor Controls:** Extract the input and buttons from `DataStructureVisualizer.tsx` into a separate `Controls.tsx` component.

- **Extensibility:**
  - [ ] **Data Structure Switching:** Add a UI element (e.g., a dropdown menu) to allow users to select and switch between different data structure visualizations (once new adapters like for Graphs or Heaps are added).