import React from "react";
import { cn } from "../utils.ts";
import { Text } from "./text.tsx";

export interface ILabeledNodeProps {
  label?: string;
  node: React.ReactNode;
  direction?: "horizontal" | "vertical";
  nodeIsText?: boolean;
  className?: string;
  style?: React.CSSProperties;
  colon?: boolean;
  textAlign?: "left" | "center" | "right";
  copyable?: boolean;
  code?: boolean;
}

const LabeledNode: React.FC<ILabeledNodeProps> = (props) => {
  const {
    label,
    node,
    code,
    nodeIsText,
    className,
    style,
    colon,
    textAlign,
    copyable,
    direction = "horizontal",
  } = props;
  let internalNodeContent = null;

  if (node) {
    internalNodeContent = nodeIsText ? (
      <Text code={code} copyable={copyable} className="break-words">
        {node}
      </Text>
    ) : (
      node
    );
  }

  const internalLabel = label && colon ? `${label}: ` : label;
  const labelNode = label && (
    <div className="font-medium line-clamp-1">{internalLabel}</div>
  );

  if (direction === "horizontal") {
    return (
      <div style={style} className={cn(className, "space-x-2 break-words")}>
        {label && <div>{labelNode}</div>}
        <div style={{ textAlign }}>{internalNodeContent}</div>
      </div>
    );
  } else {
    return (
      <div style={style} className={cn(className, "space-y-1 break-words")}>
        {label && <div>{labelNode}</div>}
        <div>{internalNodeContent}</div>
      </div>
    );
  }
};

export default LabeledNode;
