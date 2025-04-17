## React Flow Components - React Flow

URL: https://reactflow.dev/components

This is a collection of useful components that you can easily integrate into your React Flow application. It utilizes the new [shadcn CLI](https://ui.shadcn.com/docs/cli) , which builds on top of [Tailwind CSS](https://tailwindcss.com/)  and [shadcn/ui](https://ui.shadcn.com/)  components.

###### Prerequisites[](#prerequisites)


You need to have `shadcn` and `tailwind` configured in your project. If you haven’t installed it, you can follow the steps explained in the [shadcn installation guide](https://ui.shadcn.com/docs/installation) . If `shadcn` and `tailwind` are part of your project, you can initialize shadcn-ui by running:

If you want to learn more about the motivation behind this project, you can find a detailed blog post [here](https://xyflow.com/blog/react-flow-components) . For a more in-depth tutorial, we also recently published a new guide on [getting started with React Flow Components](https://reactflow.dev/learn/tutorials/getting-started-with-react-flow-components) .

###### Usage[](#usage)


Find a component you like and run the command to add it to your project.

```typescript
npx shadcn@latest add https://ui.reactflow.dev/component-name
```

* This command copies the component code inside your components folder. You can change this folder by adding an alias inside your `components.json`.
* It automatically installs all necessary dependencies
* It utilizes previously added and even modified components or asks you if you’d like to overwrite them.
* It uses your existing tailwind configuration.
* The components are **not black-boxes** and can be **modified and extended** to fit your needs.

For more information visit the [shadcn documentation](https://ui.shadcn.com/docs) .

Last updated on

April 12, 2025

---

## Tooltip Node - React Flow

URL: https://reactflow.dev/components/nodes/tooltip-node

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import React, { memo } from "react";
import { NodeProps, Position } from "@xyflow/react";
 
import {
  TooltipNode,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tooltip-node";
 
const TooltipNodeDemo = memo(({ selected }: NodeProps) => {
  return (
    <TooltipNode selected={selected}>
      <TooltipContent position={Position.Top}>Hidden Content</TooltipContent>
      <TooltipTrigger>Hover</TooltipTrigger>
    </TooltipNode>
  );
});
 
export default TooltipNodeDemo;
```

```typescript
import { Background, ReactFlow } from "@xyflow/react";
import TooltipNodeDemo from "./component-example";
 
const nodeTypes = {
  tooltipNode: TooltipNodeDemo,
};
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: {},
    type: "tooltipNode",
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Placeholder Node - React Flow

URL: https://reactflow.dev/components/nodes/placeholder-node

```typescript
import { Background, ReactFlow } from "@xyflow/react";
import PlaceholderNodeDemo from "./component-example";
 
const nodeTypes = {
  placeholderNode: PlaceholderNodeDemo,
};
 
const defaultNodes = [
  {
    id: "1",
    data: { label: "Original Node" },
    position: { x: 0, y: 0 },
    type: "default",
  },
  {
    id: "2",
    data: {},
    position: { x: 0, y: 150 },
    type: "placeholderNode",
  },
];
 
const defaultEdges = [
  {
    id: "1=>2",
    source: "1",
    target: "2",
    type: "default",
    animated: true,
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        nodeTypes={nodeTypes}
        nodeClickDistance={5}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Database Schema Node - React Flow

URL: https://reactflow.dev/components/nodes/database-schema-node

```typescript
import { Background, Edge, ReactFlow } from "@xyflow/react";
import DatabaseSchemaDemo from "./component-example";
 
const nodeTypes = {
  databaseSchema: DatabaseSchemaDemo,
};
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "databaseSchema",
    data: {
      label: "Products",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "description", type: "varchar" },
        { title: "warehouse_id", type: "uuid" },
        { title: "supplier_id", type: "uuid" },
        { title: "price", type: "money" },
        { title: "quantity", type: "int4" },
      ],
    },
  },
  {
    id: "2",
    position: { x: 350, y: -100 },
    type: "databaseSchema",
    data: {
      label: "Warehouses",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "address", type: "varchar" },
        { title: "capacity", type: "int4" },
      ],
    },
  },
  {
    id: "3",
    position: { x: 350, y: 200 },
    type: "databaseSchema",
    data: {
      label: "Suppliers",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "description", type: "varchar" },
        { title: "country", type: "varchar" },
      ],
    },
  },
];
 
const defaultEdges: Edge[] = [
  {
    id: "products-warehouses",
    source: "1",
    target: "2",
    sourceHandle: "warehouse_id",
    targetHandle: "id",
  },
  {
    id: "products-suppliers",
    source: "1",
    target: "3",
    sourceHandle: "supplier_id",
    targetHandle: "id",
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Workflow Editor - React Flow

URL: https://reactflow.dev/components/templates/workflow-editor

The Workflow Editor template is a Next.js-based application designed to help you quickly create, manage, and visualize workflows. Built with [React Flow Components](https://reactflow.dev/components)  and styled using [Tailwind CSS](https://tailwindcss.com/)  and [shadcn/ui](https://ui.shadcn.com/) , this project provides a highly customizable foundation for building and extending workflow editors.

###### Tech Stack[](#tech-stack)


* **React Flow Components**: The project uses [React Flow Components](https://reactflow.dev/components)  to build nodes. These components are designed to help you quickly get up to speed on projects.
* **shadcn CLI**: The project uses the [shadcn CLI](https://ui.shadcn.com/docs/cli)  to manage UI components. This tool builds on top of [Tailwind CSS](https://tailwindcss.com/)  and [shadcn/ui](https://ui.shadcn.com/)  components, making it easy to add and customize UI elements.
* **State Management with Zustand**: The application uses Zustand for state management, providing a simple and efficient way to manage the state of nodes, edges, and other workflow-related data.

###### Features[](#features)


* **Automatic Layouting**: Utilizes the [ELKjs](https://github.com/kieler/elkjs)  layout engine to automatically arrange nodes and edges.
* **Drag-and-Drop Sidebar**: Add and arrange nodes using a drag-and-drop mechanism.
* **Customizable Components**: Uses React Flow Components and the shadcn library to create highly-customizable nodes and edges.
* **Dark Mode**: Toggles between light and dark themes, managed through the Zustand store.
* **Runner Functionality**: Executes and monitors nodes sequentially with a workflow runner.

Last updated on

April 12, 2025

---

## Annotation Node - React Flow

URL: https://reactflow.dev/components/nodes/annotation-node

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import { ArrowDownRight } from "lucide-react";
 
import {
  AnnotationNode,
  AnnotationNodeContent,
  AnnotationNodeIcon,
  AnnotationNodeNumber,
} from "@/components/annotation-node";
 
const AnnotationNodeDemo = () => {
  return (
    <AnnotationNode>
      <AnnotationNodeNumber>1.</AnnotationNodeNumber>
      <AnnotationNodeContent>
        Annotate your flows any way you'd like.
      </AnnotationNodeContent>
      <AnnotationNodeIcon className="bottom-0 right-2">
        <ArrowDownRight />
      </AnnotationNodeIcon>
    </AnnotationNode>
  );
};
 
export default AnnotationNodeDemo;
```

```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import AnnotationNode from "./component-example";
 
const nodeTypes = {
  annotationNode: AnnotationNode,
};
 
const defaultNodes = [
  {
    id: "1a",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 0, y: 0 },
  },
  {
    id: "1b",
    position: { x: -150, y: -55 },
    parentId: "1a",
    data: { label: "Annotation 1" },
    type: "annotationNode",
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow nodeTypes={nodeTypes} defaultNodes={defaultNodes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Labeled Group Node - React Flow

URL: https://reactflow.dev/components/nodes/labeled-group-node

```typescript
import { Background, ReactFlow, Node } from "@xyflow/react";
import LabeledGroupNodeDemo from "./component-example";
 
const nodeTypes = {
  labeledGroupNode: LabeledGroupNodeDemo,
};
 
const defaultNodes: Node[] = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Group Node" },
    width: 380,
    height: 200,
    type: "labeledGroupNode",
  },
  {
    id: "2",
    position: { x: 50, y: 100 },
    data: { label: "Node" },
    type: "default",
    parentId: "1",
    extent: "parent",
  },
  {
    id: "3",
    position: { x: 200, y: 50 },
    data: { label: "Node" },
    type: "default",
    parentId: "1",
    extent: "parent",
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Node Header - React Flow

URL: https://reactflow.dev/components/nodes/node-header

A header designed to work with the [`<BaseNode />`](https://reactflow.dev/components/nodes/base-node) component. It can contain a title, icon, and list of actions.

###### Installation[](#installation)


Make sure to follow the [prerequisites](https://reactflow.dev/components#prerequisites) before installing the component.

```typescript
npx shadcn@latest add https://ui.reactflow.dev/node-header
```

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import { memo } from "react";
 
import { NodeProps } from "@xyflow/react";
 
import { BaseNode } from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderIcon,
  NodeHeaderDeleteAction,
} from "@/components/node-header";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Rocket } from "lucide-react";
 
const NodeHeaderDemo = memo(({ selected }: NodeProps) => {
  return (
    <BaseNode selected={selected} className="px-3 py-2">
      <NodeHeader className="-mx-3 -mt-2 border-b">
        <NodeHeaderIcon>
          <Rocket />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Node Title</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderMenuAction label="Expand account options">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </NodeHeaderMenuAction>
          <NodeHeaderDeleteAction />
        </NodeHeaderActions>
      </NodeHeader>
      <div className="mt-2">Node Content</div>
    </BaseNode>
  );
});
 
export default NodeHeaderDemo;
```

###### 2\. Connect the component with your React Flow application.


```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import NodeHeaderDemoNode from "./component-example";
 
const nodeTypes = {
  nodeHeaderNode: NodeHeaderDemoNode,
};
 
const defaultNodes = [
  {
    id: "1",
    type: "nodeHeaderNode",
    position: { x: 200, y: 200 },
    data: {},
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

###### Custom node actions[](#custom-node-actions)


Many node header actions will be useful across multiple custom nodes. Below are some examples of custom node actions that you might define.

##### Custom Delete action[](#custom-delete-action)


```typescript
export type NodeHeaderCustomDeleteActionProps = Omit<
  NodeHeaderActionProps,
  'onClick'
>;
 
/**
 * A custom delete action button that removes the node from the graph when clicked.
 */
export const NodeHeaderCustomDeleteAction = React.forwardRef<
  HTMLButtonElement,
  NodeHeaderCustomDeleteActionProps
>((props, ref) => {
  const id = useNodeId();
  const { setNodes } = useReactFlow();
 
  const handleClick = useCallback(() => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  }, []);
 
  return (
    <NodeHeaderAction
      ref={ref}
      onClick={handleClick}
      variant="ghost"
      {...props}
    >
      <Trash />
    </NodeHeaderAction>
  );
});
 
NodeHeaderCustomDeleteAction.displayName = 'NodeHeaderCustomDeleteAction';
```

##### Copy action[](#copy-action)


```typescript
export interface NodeHeaderCopyActionProps
  extends Omit<NodeHeaderActionProps, 'onClick'> {
  onClick?: (nodeId: string, event: React.MouseEvent) => void;
}
 
/**
 * A copy action button that passes the node's id to the `onClick` handler when
 * clicked.
 */
export const NodeHeaderCopyAction = React.forwardRef<
  HTMLButtonElement,
  NodeHeaderCopyActionProps
>(({ onClick, ...props }, ref) => {
  const id = useNodeId();
 
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!onClick || !id) return;
 
      onClick(id, event);
    },
    [onClick],
  );
 
  return (
    <NodeHeaderAction
      ref={ref}
      onClick={handleClick}
      variant="ghost"
      {...props}
    >
      <Copy />
    </NodeHeaderAction>
  );
});
 
NodeHeaderCopyAction.displayName = 'NodeHeaderCopyAction';
```

Last updated on

April 12, 2025

---

## Base Node - React Flow

URL: https://reactflow.dev/components/nodes/base-node

```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import BaseNode from "./component-example";
 
const nodeTypes = {
  baseNode: BaseNode,
};
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: {},
    type: "baseNode",
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Node Status Indicator - React Flow

URL: https://reactflow.dev/components/nodes/node-status-indicator

```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import NodeStatusIndicatorDemo from "./component-example";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Node" },
    type: "nodeStatusIndicatorDemo",
  },
];
 
const nodeTypes = {
  nodeStatusIndicatorDemo: NodeStatusIndicatorDemo,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Button Edge - React Flow

URL: https://reactflow.dev/components/edges/button-edge

```typescript
import { Background, ReactFlow } from "@xyflow/react";
import ButtonEdgeDemo from "./component-example";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Node" },
  },
  {
    id: "2",
    position: { x: 500, y: 500 },
    data: { label: "Node" },
  },
];
 
const defaultEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "buttonedge",
  },
];
 
const edgeTypes = {
  buttonedge: ButtonEdgeDemo,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Data Edge - React Flow

URL: https://reactflow.dev/components/edges/data-edge

An edge that displays one field from the source node’s `data` object.

###### Installation[](#installation)


Make sure to follow the [prerequisites](https://reactflow.dev/components#prerequisites) before installing the component.

```typescript
npx shadcn@latest add https://ui.reactflow.dev/data-edge
```

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import { Handle, NodeProps, Position, useReactFlow, Node } from "@xyflow/react";
 
import { memo } from "react";
import { BaseNode } from "@/components/base-node";
import { Slider } from "@/components/ui/slider";
 
export type CounterNodeType = Node<{ value: number }>;
 
export const CounterNode = memo(({ id, data }: NodeProps<CounterNodeType>) => {
  const { updateNodeData } = useReactFlow();
 
  return (
    <BaseNode>
      <Slider
        value={[data.value]}
        min={0}
        max={100}
        step={1}
        className="nopan nodrag w-24"
        onValueChange={([value]) => {
          updateNodeData(id, (node) => ({
            ...node.data,
            value,
          }));
        }}
      />
      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});
```

###### 2\. Connect the component with your React Flow application.


```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import { CounterNode, type CounterNodeType } from "./component-example";
import { DataEdge } from "@/registry/components/data-edge/";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    type: "counterNode",
    data: { value: 10 },
  },
  {
    id: "2",
    position: { x: 300, y: 300 },
    data: { label: "Output" },
  },
];
 
const nodeTypes = {
  counterNode: CounterNode,
};
 
const defaultEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    type: "dataEdge",
    data: { key: "value" },
  } satisfies DataEdge<CounterNodeType>,
];
 
const edgeTypes = {
  dataEdge: DataEdge,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        nodeTypes={nodeTypes}
        defaultEdges={defaultEdges}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

###### Additional type safety[](#additional-type-safety)


When creating new edges of this type, you can use TypeScript’s `satisfies` predicate along with the specific type of a node in your application to ensure the `key` property of the edge’s data is a valid key of the node’s data.

```typescript
type CounterNode = Node<{ count: number }>;
 
const initialEdges = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    type: 'dataEdge',
    data: {
      key: 'count',
    } satisfies DataEdge<CounterNode>,
  },
];
```

If you try to use a key that is not present in the node’s data, TypeScript will show an error message like:

> ts: Type ‘“value”’ is not assignable to type ‘“count”’.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Animated SVG Edge - React Flow

URL: https://reactflow.dev/components/edges/animated-svg-edge

An edge that animates a custom SVG element along the edge’s path. This component is based on the [animating SVG elements example](https://reactflow.dev/examples/edges/animating-edges).

###### Installation[](#installation)


Make sure to follow the [prerequisites](https://reactflow.dev/components#prerequisites) before installing the component.

```typescript
npx shadcn@latest add https://ui.reactflow.dev/animated-svg-edge
```

###### Usage[](#usage)


###### 1\. Connect the component with your React Flow application.


```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import { AnimatedSvgEdge } from "@/registry/components/animated-svg-edge";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "A" },
  },
  {
    id: "2",
    position: { x: 400, y: 400 },
    data: { label: "B" },
  },
];
 
const defaultEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    type: "animatedSvgEdge",
    data: {
      duration: 2,
      shape: "package",
      path: "smoothstep",
    },
  } satisfies AnimatedSvgEdge,
];
 
const edgeTypes = {
  animatedSvgEdge: AnimatedSvgEdge,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        edgeTypes={edgeTypes}
        defaultEdges={defaultEdges}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

###### Custom shapes[](#custom-shapes)


It is intended that you add your own SVG shapes to the module. Each shape should be a React component that takes one prop, `animateMotionProps`, and returns some SVG.

You can define these shapes in a separate file or in the same file as the edge component. In order to use them, you need to add them to the `shapes` record like so:

```typescript
const shapes = {
  box: ({ animateMotionProps }) => (
    <rect width="5" height="5" fill="#ff0073">
      <animateMotion {...animateMotionProps} />
    </rect>
  ),
} satisfies Record<string, AnimatedSvg>;
```

The keys of the `shapes` record are valid values for the `shape` field of the edge’s data:

```typescript
const initialEdges = [
  {
    // ...
    type: "animatedSvgEdge",
    data: {
      duration: 2,
      shape: "box",
    },
  } satisfies AnimatedSvgEdge,
];
```

If you want to render regular HTML elements, be sure to wrap them in an SVG `<foreignObject />` element. Make sure to give the `<foreignObject />` an `id` attribute and use that as the `href` attribute when rendering the `<animateMotion />` element.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Zoom Select - React Flow

URL: https://reactflow.dev/components/controls/zoom-select

```typescript
import { Background, ReactFlow } from "@xyflow/react";
import { ZoomSelect } from "@/registry/components/zoom-select/";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Node" },
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} fitView>
        <Background />
        <ZoomSelect position="top-left" />
      </ReactFlow>
    </div>
  );
}
```

---

## Zoom Slider - React Flow

URL: https://reactflow.dev/components/controls/zoom-slider

```typescript
import { Background, ReactFlow } from "@xyflow/react";
import { ZoomSlider } from "@/registry/components/zoom-slider/";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Node" },
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} fitView>
        <Background />
        <ZoomSlider position="top-left" />
      </ReactFlow>
    </div>
  );
}
```

---

## Labeled Handle - React Flow

URL: https://reactflow.dev/components/handles/labeled-handle

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import React, { memo } from "react";
import { NodeProps, Position } from "@xyflow/react";
 
import { LabeledHandle } from "@/components/labeled-handle";
import { BaseNode } from "@/components/base-node";
 
const LabeledHandleDemo = memo(({ selected }: NodeProps) => {
  return (
    <BaseNode className="flex px-0 py-5" selected={selected}>
      <LabeledHandle
        id="target-1"
        title="Some Input"
        type="target"
        position={Position.Left}
      />
      <LabeledHandle
        id="source-1"
        title="Some Output"
        type="source"
        position={Position.Right}
      />
    </BaseNode>
  );
});
 
export default LabeledHandleDemo;
```

```typescript
import { Background, ReactFlow } from "@xyflow/react";
import LabeledHandleDemo from "./component-example";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: {},
    type: "labeledHandle",
  },
];
 
const nodeTypes = {
  labeledHandle: LabeledHandleDemo,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Base Handle - React Flow

URL: https://reactflow.dev/components/handles/base-handle

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import React, { memo } from "react";
import { NodeProps, Position } from "@xyflow/react";
 
import { BaseHandle } from "@/components/base-handle";
import { BaseNode } from "@/components/base-node";
 
const BaseHandleDemo = memo(({ selected }: NodeProps) => {
  return (
    <BaseNode selected={selected}>
      <BaseHandle id="target-1" type="target" position={Position.Left} />
      <div>A node with two handles</div>
      <BaseHandle id="source-1" type="source" position={Position.Right} />
    </BaseNode>
  );
});
 
export default BaseHandleDemo;
```

```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import BaseHandle from "./component-example";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: {},
    type: "baseHandle",
  },
];
 
const nodeTypes = {
  baseHandle: BaseHandle,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## Button Handle - React Flow

URL: https://reactflow.dev/components/handles/button-handle

###### Usage[](#usage)


###### 1\. Copy the component into your app


```typescript
import { Plus } from "lucide-react";
import { ConnectionState, Position, useConnection } from "@xyflow/react";
 
import { ButtonHandle } from "@/components/button-handle";
import { BaseNode } from "@/components/base-node";
 
import { Button } from "@/components/ui/button";
 
const onClick = () => {
  window.alert(`Handle button has been clicked!`);
};
 
const selector = (connection: ConnectionState) => {
  return connection.inProgress;
};
 
const ButtonHandleDemo = () => {
  const connectionInProgress = useConnection(selector);
 
  return (
    <BaseNode>
      Node with a handle button
      <ButtonHandle
        type="target"
        position={Position.Bottom}
        showButton={!connectionInProgress}
      >
        <Button
          onClick={onClick}
          size="sm"
          variant="secondary"
          className="rounded-full"
        >
          <Plus size={10} />
        </Button>
      </ButtonHandle>
    </BaseNode>
  );
};
 
export default ButtonHandleDemo;
```

```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import SourceHandleDemo from "./component-example";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "Node" },
    type: "sourceHandleDemo",
  },
];
 
const nodeTypes = {
  sourceHandleDemo: SourceHandleDemo,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} nodeTypes={nodeTypes} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

---

## DevTools - React Flow

URL: https://reactflow.dev/components/misc/devtools

A debugging tool that provides data on the viewport, the state of each node, and logs change events. This component is based on [DevTools and Debugging](https://reactflow.dev/learn/advanced-use/devtools-and-debugging) under Advanced Use.

You can import the entire `<DevTools />` component, or optionally, import individual components for greater flexibility. These components include:

* A `<ViewportLogger />` component that shows the current position and zoom level of the viewport.
* A `<NodeInspector />` component that reveals the state of each node.
* A `<ChangeLogger />` that wraps your flow’s onNodesChange handler and logs each change as it is dispatched.

You can read more about the individual components at [DevTools and Debugging](https://reactflow.dev/learn/advanced-use/devtools-and-debugging). While we find these tools useful for making sure React Flow is working properly, you might also find them useful for debugging your applications as your flows and their interactions become more complex.

###### Installation[](#installation)


Make sure to follow the [prerequisites](https://reactflow.dev/components#prerequisites) before installing the component.

```typescript
npx shadcn@latest add https://ui.reactflow.dev/devtools
```

###### Usage[](#usage)


###### 1\. Connect the component with your React Flow application.


```typescript
import { Background, ReactFlow } from "@xyflow/react";
 
import { DevTools } from "@/registry/components/devtools/";
 
const defaultNodes = [
  {
    id: "1a",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 },
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} fitView>
        <Background />
        <DevTools position="top-left" />
      </ReactFlow>
    </div>
  );
}
```

Last updated on

April 12, 2025

---

