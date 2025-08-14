// src/components/DataStructureVisualizer.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type {
  IDataStructureAdapter,
  VisualizerNode,
  VisualizerLink,
  AnimationStep,
} from '../data-structures/IDataStructureAdapter';
import Node from './Node';
import Edge from './Edge';
import Visitor from './Visitor';

const ANIMATION_SPEED = 500; // ms
const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const BACKGROUND_COLOR = '#ffffff'; // Assuming a white background
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

const DataStructureVisualizer: React.FC<{ adapter: IDataStructureAdapter }> = ({ adapter }) => {
  const [nodes, setNodes] = useState<VisualizerNode[]>([]);
  const [links, setLinks] = useState<VisualizerLink[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [visitorPosition, setVisitorPosition] = useState({ x: 0, y: 0 });
  const [isVisitorVisible, setIsVisitorVisible] = useState(false);

  const adapterRef = useRef(adapter);

  useEffect(() => {
    adapterRef.current = adapter;
    const initialState = adapter.getInitialState();
    const { nodes: laidOutNodes, links: laidOutLinks } = calculateLayout(initialState.nodes, initialState.links);
    setNodes(laidOutNodes);
    setLinks(laidOutLinks);
  }, [adapter]);

  const calculateLayout = (currentNodes: VisualizerNode[], currentLinks: VisualizerLink[]) => {
    if (currentNodes.length === 0) return { nodes: [], links: [] };
    const hierarchy = d3.stratify<VisualizerNode>().id(d => d.id).parentId(d => currentLinks.find(link => link.target === d.id)?.source)(currentNodes);
    const treeLayout = d3.tree<VisualizerNode>().size([SVG_WIDTH - margin.left - margin.right, SVG_HEIGHT - margin.top - margin.bottom]);
    const root = treeLayout(hierarchy);
    const laidOutNodes = root.descendants().map(d3Node => ({ ...d3Node.data, x: d3Node.x + margin.left, y: d3Node.y + margin.top }));
    const laidOutLinks = root.links().map(d3Link => ({
      source: (d3Link.source as d3.HierarchyPointNode<VisualizerNode>).data.id,
      target: (d3Link.target as d3.HierarchyPointNode<VisualizerNode>).data.id,
    }));
    return { nodes: laidOutNodes, links: laidOutLinks };
  };

  const executeAnimationPlan = (plan: AnimationStep[]) => {
    if (plan.length === 0) return;
    setIsAnimating(true);
    let stepIndex = 0;

    const processStep = () => {
      const step = plan[stepIndex];
      if (!step) {
        setIsAnimating(false);
        setIsVisitorVisible(false);
        setNodes(currentNodes => currentNodes.map(n => ({ ...n, fill: undefined, stroke: undefined })));
        return;
      }

      let delay = ANIMATION_SPEED;

      if (step.type === 'VISIT') {
        const targetNode = nodes.find(n => n.id === step.nodeId);
        if (targetNode) {
          setIsVisitorVisible(true);
          setVisitorPosition({ x: targetNode.x, y: targetNode.y });
        }
      } else if (step.type === 'HIGHLIGHT') {
        const color = step.color || '#ffA500';
        setNodes(currentNodes => currentNodes.map(n => step.nodeIds.includes(n.id) ? { ...n, fill: color } : { ...n, fill: undefined }));
      } else if (step.type === 'FADE_OUT') {
        // Camouflage fade-out
        setNodes(currentNodes => currentNodes.map(n => step.elementIds.includes(n.id) ? { ...n, fill: BACKGROUND_COLOR, stroke: BACKGROUND_COLOR } : n));
        setLinks(currentLinks => currentLinks.map(l => step.elementIds.includes(`${l.source}->${l.target}`) ? { ...l, opacity: 0 } : l));
        delay += ANIMATION_SPEED; // Add extra delay for the fade to complete
      } else if (step.type === 'HIDE_VISITOR') {
        setIsVisitorVisible(false);
      } else if (step.type === 'MOVE_NODE') {
        const nodeToMove = nodes.find(n => n.id === step.nodeId);
        const targetNode = nodes.find(n => n.id === step.toNodeId);
        if (nodeToMove && targetNode) {
          setNodes(currentNodes =>
            currentNodes.map(n =>
              n.id === step.nodeId ? { ...n, x: targetNode.x, y: targetNode.y } : n
            )
          );
        }
        delay += ANIMATION_SPEED; // Add extra delay for the move to complete
      } else if (step.type === 'FINALIZE') {
        const { nodes: finalNodes, links: finalLinks } = calculateLayout(step.nodes, step.links);
        // Remove nodes that faded out
        const nodesToRender = finalNodes.filter(n => n.opacity !== 0);
        setNodes(nodesToRender);
        setLinks(finalLinks);
      } else if (step.type === 'FINALIZE_INSERT') {
        // FINALIZE_INSERT is a self-contained, multi-stage animation
        delay = 0; // It manages its own timing
        setIsVisitorVisible(false);
        const { nodes: finalNodes, links: finalLinks } = calculateLayout(step.nodes, step.links);
        const finalNodeMap = new Map(finalNodes.map(n => [n.id, n]));
        setNodes(currentNodes => currentNodes.map(oldNode => finalNodeMap.get(oldNode.id) ? { ...oldNode, ...finalNodeMap.get(oldNode.id) } : oldNode));
        setTimeout(() => {
          setNodes(finalNodes.map(n => n.id === step.newNodeId ? { ...n, opacity: 0 } : n));
          setLinks(finalLinks.map(l => l.target === step.newNodeId ? { ...l, opacity: 0 } : l));
          setTimeout(() => {
            setNodes(currentNodes => currentNodes.map(n => n.id === step.newNodeId ? { ...n, opacity: 1 } : n));
          }, 100);
          setTimeout(() => {
            setLinks(currentLinks => currentLinks.map(l => l.target === step.newNodeId ? { ...l, opacity: 1 } : l));
            setIsAnimating(false);
          }, ANIMATION_SPEED);
        }, ANIMATION_SPEED);
      }
      
      stepIndex++;
      if (delay > 0) {
        setTimeout(processStep, delay);
      }
    };

    processStep();
  };

  const handleInsert = () => {
    if (isAnimating || inputValue.trim() === '' || inputValue.includes('.')) return;
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;
    executeAnimationPlan(adapterRef.current.insert(value));
    setInputValue('');
  };

  const handleDelete = () => {
    if (isAnimating || inputValue.trim() === '' || inputValue.includes('.')) return;
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;
    executeAnimationPlan(adapterRef.current.delete(value));
    setInputValue('');
  };

  const renderedLinks = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    return links.map(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      if (!sourceNode || !targetNode) return null;
      return <Edge key={`${link.source}->${link.target}`} sourceX={sourceNode.x} sourceY={sourceNode.y} targetX={targetNode.x} targetY={targetNode.y} opacity={link.opacity} />;
    });
  }, [nodes, links]);

  return (
    <div>
      <div className="controls">
        <input type="number" step="1" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter an integer" disabled={isAnimating} />
        <button onClick={handleInsert} disabled={isAnimating}>Insert</button>
        <button onClick={handleDelete} disabled={isAnimating}>Delete</button>
      </div>
      <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ backgroundColor: BACKGROUND_COLOR }}>
        <g>
          {renderedLinks}
          {nodes.map((node) => (
            <Node key={node.id} cx={node.x} cy={node.y} r={20} value={node.value} opacity={node.opacity} fill={node.fill} />
          ))}
          <Visitor cx={visitorPosition.x} cy={visitorPosition.y} isVisible={isVisitorVisible} />
        </g>
      </svg>
    </div>
  );
};

export default DataStructureVisualizer;
