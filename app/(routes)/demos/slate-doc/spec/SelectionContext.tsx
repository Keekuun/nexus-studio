"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { BaseNode } from "./registry";

interface SelectionContextType {
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  handleNodeClick: (node: BaseNode) => void;
  selectedNodeData: BaseNode | null;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<BaseNode | null>(
    null
  );

  const handleNodeClick = (node: BaseNode) => {
    setSelectedNodeId(node.id);
    setSelectedNodeData(node);
  };

  return (
    <SelectionContext.Provider
      value={{
        hoveredNodeId,
        selectedNodeId,
        setHoveredNodeId,
        setSelectedNodeId,
        handleNodeClick,
        selectedNodeData,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context)
    throw new Error("useSelection must be used within SelectionProvider");
  return context;
};
