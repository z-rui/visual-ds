// src/App.tsx
import DataStructureVisualizer from './components/DataStructureVisualizer';
import { BSTAdapter } from './data-structures/BSTAdapter';
import './App.css';

function App() {
  // 1. Create an instance of the adapter for the desired data structure.
  const bstAdapter = new BSTAdapter([10, 5, 15, 3, 7, 12, 18]);

  // 2. Pass the adapter to the generic visualizer component.
  // To visualize a different data structure (e.g., a Heap),
  // you would simply instantiate a different adapter (e.g., new HeapAdapter([...]))
  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Structure Visualization</h1>
      </header>
      <main>
        <DataStructureVisualizer adapter={bstAdapter} />
      </main>
    </div>
  );
}

export default App;
