# Gemini Development Guide

This document outlines the project's architecture. It serves as a guide for understanding the design patterns and for future development by an AI assistant.

## Core Architecture: The "Director-Engine" Model

The project's architecture is a highly decoupled "Director-Engine" model, designed to produce pedagogically sound, complex, and precisely timed animations.

- **The "Director" (`BSTAdapter.ts`):** Translates a single data structure operation (e.g., "delete 50") into a detailed "storyboard".
- **The "Storyboard" (`AnimationStep[]`):** A script composed of simple, atomic, visual commands.
- **The "Engine" (`DataStructureVisualizer.tsx`):** A stateful component that reads the storyboard and executes the visual commands, knowing nothing about the underlying data structure logic.

### Key Architectural Concepts

1.  **Atomized Animation Steps:** We evolved from monolithic steps (e.g., `FINALIZE_DELETE`) to a vocabulary of simple, reusable, atomic commands defined in `IDataStructureAdapter.ts`. The primary commands are:
    - `VISIT`: Move the visitor circle to a node.
    - `HIGHLIGHT`: Change the color of one or more nodes.
    - `FADE_OUT`: Make an element (node or link) disappear.
    - `MOVE_NODE`: Move one node to the current position of another.
    - `HIDE_VISITOR`: Hide the visitor circle.
    - `FINALIZE`: Trigger a final, smooth layout transition to a new state.

2.  **Complete Decoupling:** The Animation Engine (`DataStructureVisualizer`) is entirely agnostic of the data structure's logic. It does not know what a "binary search tree" or a "deletion" is. It only knows how to `VISIT`, `HIGHLIGHT`, `MOVE`, etc. This makes the engine extremely reusable and the overall system easy to reason about.

3.  **`react-spring` as the Foundation:** The choice of `react-spring` was critical. It allows us to smoothly animate SVG attributes like a line's `x1, y1, x2, y2` coordinates or a circle's `fill` and `stroke` colors. This solved the "jumping edges" problem that CSS transitions cannot handle and enabled the "dissolve in background" effect.

4.  **Precise Asynchronous Timing:** The Animation Engine uses a recursive `setTimeout` chain to process the animation storyboard. Crucially, for long-running visual effects like `FADE_OUT` and `MOVE_NODE`, it **waits for the animation to complete** by adding an extra `ANIMATION_SPEED` delay before processing the next step. This ensures that animations that should be sequential (e.g., "move Y, *then* reflow the layout") are executed in the correct order, not concurrently.

5.  **"Camouflage" Fade-Out:** To solve the problem of nodes revealing underlying edges when their `opacity` is lowered, we implemented a "camouflage" or "dissolve" technique. The `FADE_OUT` command for a node works by animating its `fill` and `stroke` colors to match the SVG's background color. This makes the node visually disappear while still correctly occupying its space, preventing any premature layout shifts and perfectly masking the elements behind it.

### Workflow: Deleting a Node with Two Children

This process perfectly illustrates the power of the Director-Engine model:

1.  **User Interaction:** User clicks "Delete" for a node `x` with two children.
2.  **Storyboard Generation (The Director):** The `BSTAdapter.delete()` method is called. It does **not** immediately alter the tree. Instead, it generates the following storyboard:
    1.  `VISIT` steps to find `x`.
    2.  `HIGHLIGHT` `x`.
    3.  `VISIT` steps to find `x`'s successor, `y`.
    4.  `HIGHLIGHT` both `x` and `y`.
    5.  `FADE_OUT` the edge connecting `y` to its original parent.
    6.  `HIDE_VISITOR` to clear the stage.
    7.  `FADE_OUT` node `x` (using the camouflage technique).
    8.  `MOVE_NODE` to move `y` to `x`'s current position.
    9.  **(Now, the adapter finally calls the real `this.bst.delete()` method).**
    10. `FINALIZE` with the new, final state of the tree.
3.  **Storyboard Execution (The Engine):** The `DataStructureVisualizer` receives this 10-step plan and executes it one step at a time, respecting the built-in delays, resulting in a clear, step-by-step, pedagogically sound animation.

---

### Instructions to AI coder

- **Adhere to the Director-Engine Model:** All new animations must be implemented by adding new atomic steps or composing existing ones in an adapter. The visualizer should remain agnostic of data structure logic.
- **Prefer Atomic Steps:** Do not create complex, monolithic animation steps. Break down animations into the smallest logical visual changes.
- **Ensure Correct Timing:** When adding new visual effects that take time, ensure the `executeAnimationPlan` function waits for them to complete before proceeding.
- **Maintain Cleanliness:** Keep code readable, well-documented, and prefer clean solutions over quick fixes.
- **Use Correct Working Directory:** Always ensure commands are executed in the `/home/zrui1/VisualDS/visual-ds` directory.
- **Do Not Run Dev Server:** The user will run `npm run dev` in the background. Do not start the development server.
