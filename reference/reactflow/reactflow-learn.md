## Quickstart - React Flow

URL: https://reactflow.dev/learn

If you want to get up-and-running as soon as possible you’re in the right place! This page will take you from zero to a working React Flow app in a few minutes. From there, you can take a deeper look at what React Flow is all about, check out the examples, or dive into the API docs.

###### React Flow in 60 seconds[](#react-flow-in-60-seconds)


###### Play online[](#play-online)


You can try React Flow without setting anything up locally by checking out the starter projects we have on [CodeSandbox](https://codesandbox.io/) :

###### Vite template[](#vite-template)


If you want to get started right away, you can use our [vite template](https://github.com/xyflow/vite-react-flow-template) :

```typescript
npx degit xyflow/vite-react-flow-template app-name
```

###### Installation[](#installation)


To get started locally you should have a few things:

* [Node.js](https://nodejs.org/en/)  installed.
* Either npm or another package manager like [yarn](https://yarnpkg.com/)  or [pnpm](https://pnpm.io/) .
* A working knowledge of [React](https://reactjs.org/) . You don’t need to be an expert, but you should be comfortable with the basics.

First, spin up a new [React](https://reactjs.org/)  project however you like; we recommend using [Vite](https://vitejs.dev/)  but the choice is yours.

```typescript
npm init vite my-react-flow-app -- --template react
```

React Flow is published on npm as [`@xyflow/react`](https://npmjs.com/package/@xyflow/react), so go ahead and add it next.

```typescript
npm install @xyflow/react
```

Lastly, spin up the dev server and we’re good to go!

###### Creating your first flow[](#creating-your-first-flow)


The `reactflow` package exports the `<ReactFlow />` component as the default export. That and a handful of nodes and edges are all we need to get something going! Get rid of everything inside `App.jsx` and add the following:

```typescript
import React from 'react';
import { ReactFlow } from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} />
    </div>
  );
}
```

There are a few things to pay attention to here:

* You must import the React Flow stylesheet.
* The `<ReactFlow />` component must be wrapped in an element with a width and height.

###### Adding interactivity[](#adding-interactivity)


Graphs created with React Flow are fully interactive. We can move nodes around, connect them together, delete them, … To get the basic functionality we need to add three things:

* A callback for what to do when [nodes change](https://reactflow.dev/api-reference/react-flow#on-nodes-change).
* A callback for what to do when [edges change](https://reactflow.dev/api-reference/react-flow#on-edges-change).
* A callback for what to do when nodes are [connected](https://reactflow.dev/api-reference/react-flow#on-connect).

Fortunately for you, we provide some hooks to make this easy!

```typescript
import React, { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </div>
  );
}
```

###### Some extra goodies[](#some-extra-goodies)


Finally, React Flow ships with some plugins out of the box for things like a [`<Minimap />`](https://reactflow.dev/api-reference/components/minimap) or viewport [`<Controls />`](https://reactflow.dev/api-reference/components/controls).

```typescript
import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
```

Et voila. You’ve already created your first interactive flow! Check out the links below on where to head next.

###### Next Steps[](#next-steps)


---

## Terms and Definitions - React Flow

URL: https://reactflow.dev/learn/concepts/terms-and-definitions

In this part of the docs, we explain some basic React Flow terms and definitions. Three things you’ll be using a lot in React Flow are nodes, edges, and handles.

###### Nodes[](#nodes)


A node in React Flow is a React component. That means it can render anything you like. Each node has an x- and y-coordinate, which tells it where it is placed in the viewport. By default, a node looks like in the example above. You can find all the options for customizing your nodes in the [Node options](https://reactflow.dev/api-reference/types/node) documentation.

##### Custom Nodes[](#custom-nodes)


This is where the magic of React Flow happens. You can customize nodes to look and act however you would like. Much of the functionality you might create is not built-in to React Flow. Some of the things you might do with a custom node are:

* Render form elements
* Visualize data
* Support multiple handles

Please refer to the [custom node docs](https://reactflow.dev/learn/customization/custom-nodes) for further information.

###### Handles[](#handles)


A handle (also called “port” in other libraries) is the place where an edge attaches to a node. The handle can be placed anywhere, and styled as you like. It’s just a div element. By default, it appears as a grey circle on the top, bottom, left, or right of the node. When creating a custom node, you can have as many handles as you need in your node. More information can be found in the [handle docs](https://reactflow.dev/api-reference/components/handle).

###### Edges[](#edges)


An edge connects two nodes. Every edge needs a target and a source node. React Flow comes with four built-in [edges types](https://reactflow.dev/examples/edges/edge-types): default (bezier), smoothstep, step and straight. An edge is SVG path that can be styled with CSS and is completely customizable. If you are using multiple handles, you can reference them individually to create multiple connections for a node.

##### Custom Edges[](#custom-edges)


Like custom nodes, you can also customize edges. Things that people do with custom edges are:

* Add a button to remove an edge
* Custom routing behavior
* Complex styling or interactions that cannot be solved with just one SVG path

You can find more information on the [custom edges api](https://reactflow.dev/api-reference/types/edge-props) site.

###### Connection Line[](#connection-line)


React Flow has built-in functionality to click-and-drag from one handle to another in order to create a new edge. While dragging, the placeholder edge is called a connection line. The connection line also comes with four types built-in and is customizable. You can find the props for configuring the connection line in the [props section](https://reactflow.dev/api-reference/react-flow#connection-line).

###### Viewport[](#viewport)


All of React Flow exists inside of the viewport. The viewport has x, y and zoom values. When you drag the pane, you change the x and y coordinates and when you zoom in or out you alter the zoom level.

---

## Introduction - React Flow

URL: https://reactflow.dev/learn/concepts/introduction

[Learn](https://reactflow.dev/learn)

Concepts

Introduction

React Flow is a library for building node-based applications. These can be anything from simple static diagrams to data visualizations to complex visual editors. You can implement custom node types and edges and it comes with components like a minimap and viewport controls out of the box.

If you’re looking to get started quickly check out the [quickstart guide](https://reactflow.dev/learn), otherwise, let’s take a look at React Flow’s key features.

###### Key Features[](#key-features)


**Easy to use**: React Flow already comes with many of the features you want out of the box. Dragging nodes around, zooming and panning, selecting multiple nodes and edges, and adding/removing edges are all built-in.

**Customizable**: React Flow supports custom node types and edge types. Because custom nodes are just React components, you can implement anything you need: you’re not locked into the built-in node types. Custom edges let you add labels, controls, and bespoke logic to node edges.

**Fast rendering**: React Flow only renders nodes that have changed, and makes sure only those that are in the viewport are displayed at all.

**Built-in plugins**: We ship React Flow with a few plugins out of the box:

* The [`<Background />`](https://reactflow.dev/api-reference/components/background) plugin implements some basic customizable background patterns.
* The [`<MiniMap />`](https://reactflow.dev/api-reference/components/minimap) plugin displays a small version of the graph in the corner of the screen.
* The [`<Controls />`](https://reactflow.dev/api-reference/components/controls) plugin adds controls to zoom, center, and lock the viewport.
* The [`<Panel />`](https://reactflow.dev/api-reference/components/panel) plugin makes it easy to position content on top of the viewport.
* The [`<NodeToolbar />`](https://reactflow.dev/api-reference/components/node-toolbar) plugin lets you render a toolbar attached to a node.
* The [`<NodeResizer />`](https://reactflow.dev/api-reference/components/node-resizer) plugin makes it easy to add resize functionality to your nodes.

**Reliable:** React Flow is entirely written in TypeScript to catch bugs early and make fixes easy. For everything else, we have a robust cypress test suite so you can depend on React Flow with confidence.

###### Moving on[](#moving-on)


Now that you have a better idea of what React Flow is all about, the next page will walk through some common terminology that you will see repeated throughout the documentation: nodes, edges, and handles.

Last updated on

April 12, 2025

[Quickstart](https://reactflow.dev/learn)[Terms and Definitions](https://reactflow.dev/learn/concepts/terms-and-definitions)

---

## Core Concepts - React Flow

URL: https://reactflow.dev/learn/concepts/core-concepts

In the following part we will introduce you to the core concepts of React Flow and explain how to create an interactive flow. A flow consists of nodes and edges (or just nodes). You can pass arrays of `nodes` and `edges` as props to the ReactFlow component. Hereby all node and edge ids need to be unique. A node needs a position and a label (this could be different if you are using [custom nodes](https://reactflow.dev/learn/customization/custom-nodes)) and an edge needs a source (node id) and a target (node id). You can read more about the options in the [Node options](https://reactflow.dev/api-reference/types/node) and [Edge options](https://reactflow.dev/api-reference/types/edge) sections.

###### Controlled or Uncontrolled[](#controlled-or-uncontrolled)


With React Flow you have two ways to setup a flow. You can either create a controlled or an [uncontrolled one](https://reactflow.dev/learn/advanced-use/uncontrolled-flow). We recommend to use a controlled one but for simpler use cases you can also setup an uncontrolled flow. **In the following part we will setup a controlled flow.** Let’s start by adding some nodes and edges to the ReactFlow component:

The dimensions of your React Flow component depend on the parent dimensions. That means that the parent needs a width and height to render React Flow properly.

###### Basic Functionality[](#basic-functionality)


By default React Flow doesn’t do any internal state updates besides handling the viewport when you setup a controlled flow. As with an `<input />` component you need to pass handlers to apply the changes that are triggered by React Flow to your nodes and edges. In order to **select**, **drag** and **remove** nodes and edges you need to implement an `onNodesChange` and an `onEdgesChange` handler:

What is happening here? Whenever React Flow triggers a change (node init, node drag, edge select, etc.), the `onNodesChange` handler gets called. We export an `applyNodeChanges` handler so that you don’t need to handle the changes by yourself. The `applyNodeChanges` handler returns an updated array of nodes that is your new nodes array. You now have an interactive flow with the following kinds of interactions:

* selectable nodes and edges
* draggable nodes
* removable nodes and edges - (press Backspace to remove a selected node or edge, can be adjusted with the `deleteKeyCode` prop)
* multi-selection area by pressing Shift (that’s the default `selectionKeyCode`)
* multi-selection by pressing command (that’s the default `multiSelectionKeyCode`)

For convenience we export the helper hooks `useNodesState` and `useEdgesState` that you can use to create the nodes and edges state:

```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

###### Connecting Nodes[](#connecting-nodes)


The last piece that is missing to get the full interactivity is the `onConnect` handler. You need to implement it, in order to handle new connections.

In this example we are using the `addEdge` handler that returns an array of edges with the newly created one. If you want to set a certain edge option whenever an edge gets created you pass your options like this:

```typescript
const onConnect = useCallback(
  (connection) =>
    setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
  [setEdges],
);
```

or use the `defaultEdgeOptions` prop:

```typescript
const defaultEdgeOptions = { animated: true };
...
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  defaultEdgeOptions={defaultEdgeOptions}
/>;
```

Last updated on

April 12, 2025

[Terms and Definitions](https://reactflow.dev/learn/concepts/terms-and-definitions)[The Viewport](https://reactflow.dev/learn/concepts/the-viewport)

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Panning and Zooming - React Flow

URL: https://reactflow.dev/learn/concepts/the-viewport

```typescript
import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  SelectionMode,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
import { initialNodes } from './nodes';
import { initialEdges } from './edges';
 
const panOnDrag = [1, 2];
 
function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      panOnScroll
      selectionOnDrag
      panOnDrag={panOnDrag}
      selectionMode={SelectionMode.Partial}
    />
  );
}
 
export default Flow;
```

---

## Built-In Components - React Flow

URL: https://reactflow.dev/learn/concepts/built-in-components

React Flow comes with several additional components. In this guide we show you how to use them. We are using our [previous example code](https://reactflow.dev/learn/concepts/core-concepts) here.

###### MiniMap[](#minimap)


If your flow gets bigger, you might want to get an overview quickly. For this we have built the [`MiniMap` component](https://reactflow.dev/api-reference/components/minimap). You can easily add it to your flow by adding it as a children:

###### Controls[](#controls)


React Flow comes with a customizable controls bar, that you can use by importing the [`Controls` component](https://reactflow.dev/api-reference/components/controls)

###### Background[](#background)


If you want to display the pattern background, you can use the [`Background` component](https://reactflow.dev/api-reference/components/background)

###### Panel[](#panel)


A helper component to display content on top of the React Flow viewport. [`Panel` component](https://reactflow.dev/api-reference/components/panel)

Last updated on

April 12, 2025

[The Viewport](https://reactflow.dev/learn/concepts/the-viewport)[Installation](https://reactflow.dev/learn/getting-started/installation-and-requirements)

---

## Installation and Requirements - React Flow

URL: https://reactflow.dev/learn/getting-started/installation-and-requirements

[Learn](https://reactflow.dev/learn)

Getting Started

Installation

For this set-up we assume you already have node.js and npm, yarn or pnpm already installed. The React Flow package is published under [`@xyflow/react`](https://www.npmjs.com/package/@xyflow/react) on npm and installable via:

```typescript
npm install @xyflow/react
```

Now you can import the React Flow component and the styles in your application:

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
```

###### Hit the ground running[](#hit-the-ground-running)


To get folks building quickly, we have a template repository on GitHub that uses Vite and TypeScript – we use this set up for all our own React Flow work! You can find the template [here](https://github.com/xyflow/vite-react-flow-template) .

To use it, you can either create a new repository from the template, or use `degit` to grab the template’s files without the git history:

```typescript
npx degit xyflow/vite-react-flow-template your-app-name
```

###### Prior Experience Needed[](#prior-experience-needed)


React Flow is a React library. That means React developers will feel comfortable using it. If basic React terms and concepts like states, props, components, and hooks are unfamiliar to you, you might need to learn more about React before being able to use React Flow fully. If you’ve never used React before, we recommend first getting to start on React through tutorials like [Codecademy](https://www.codecademy.com/)  or [Reactjs.org](https://reactjs.org/tutorial/tutorial.html) .

Last updated on

April 12, 2025

[Built-In Components](https://reactflow.dev/learn/concepts/built-in-components)[Building a Flow](https://reactflow.dev/learn/getting-started/building-a-flow)

---

## Building a Flow - React Flow

URL: https://reactflow.dev/learn/getting-started/building-a-flow

In this section we are explaining how to create a controlled flow component. Now that you’ve installed React Flow into your React project, all files are in place to start using React Flow.

###### Getting Started[](#getting-started)


Let’s create an empty flow with a controls panel and a background. For this we need to import the components from the `reactflow` package:

```typescript
import { ReactFlow, Background, Controls } from '@xyflow/react';
```

We can now use the components to render an empty flow:

There are three important things to keep in mind here:

* You need to **import the styles**. Otherwise React Flow won’t work.
* The **parent container needs a width and a height**, because React Flow uses its parent dimensions.
* If you have **multiple flows on one page**, you need to pass a unique `id` prop to each component to make React Flow work properly.

###### Adding Nodes[](#adding-nodes)


Now that the flow is set up, let’s add some nodes. To do this, you need to create an array with [node objects](https://reactflow.dev/api-reference/types/node) like this:

```typescript
const nodes = [
  {
    id: '1', // required
    position: { x: 0, y: 0 }, // required
    data: { label: 'Hello' }, // required
  },
];
```

These nodes can now be added to the flow:

Let’s add another node, configure labels and use the node type `input` for the first node.

```typescript
const nodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Hello' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'World' },
  },
];
```

There are plenty of ways to configure nodes. You can see the full list of options on the [node option site](https://reactflow.dev/api-reference/types/node).

This looks good. Let’s attach these two nodes.

###### Adding an Edge[](#adding-an-edge)


Now that we have two nodes, let’s connect them with an edge.

To make an edge, we need to specify two attributes: the source node (where the edge begins) and the target node (where the edge ends). We use the `id` of the two nodes to specify this (in our example, our two nodes have ids of “1” and “2”):

```typescript
const edges = [{ id: '1-2', source: '1', target: '2' }];
```

Let’s give this edge two properties that are built into React Flow, a `label` and a different `type`.

You made your first edge, nice work! You might have realized that you can’t drag or select nodes. In the next part you’ll learn how to make the flow interactive.

---

## Adding Interactivity - React Flow

URL: https://reactflow.dev/learn/getting-started/adding-interactivity

Let’s make it so we can select, drag, and remove nodes and edges.

In this Getting Started tutorial, we are going to use a [“controlled component”](https://reactjs.org/docs/forms.html#controlled-components) , which is typically the best and most flexible way to use React Flow in your own applications. You can also use React Flow in an [uncontrolled way](https://reactflow.dev/docs/guides/uncontrolled-flow).

###### Handle Change Events[](#handle-change-events)


First let’s import a few things. To manage the changes in React Flow, we’ll be using `useState` and the two helper function `applyEdgeChanges` and `applyNodeChanges` from React Flow.

```typescript
import { useState, useCallback } from 'react';
import { ReactFlow, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
```

We’re going to set up states for both the nodes and edges:

```typescript
const [nodes, setNodes] = useState(initialNodes);
const [edges, setEdges] = useState(initialEdges);
```

Directly beneath that, we’ll add these two functions:

```typescript
const onNodesChange = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  [],
);
const onEdgesChange = useCallback(
  (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  [],
);
```

When you drag or select a node, the `onNodesChange` handler gets called. With help of the `applyNodeChanges` function you can then apply those changes to your current node state. Putting everything together, it should look like this:

Now if you run your application, you’ll be able to click and drag the components, and the UI will update based on those movements.

###### Handle Connections[](#handle-connections)


One last piece is missing: connecting nodes manually. For this we need to implement an `onConnect` handler and pass it to the `<ReactFlow />` component as well:

Try to connect the two nodes by dragging from on handle to another one. That’s it. You’ve built a fully interactive flow.

That’s it for now :) You made it! If you want to move on, we recommend to check out the [“Custom Nodes” guide](https://reactflow.dev/learn/customization/custom-nodes).

Last updated on

April 12, 2025

[Building a Flow](https://reactflow.dev/learn/getting-started/building-a-flow)[Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes)

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Custom Nodes - React Flow

URL: https://reactflow.dev/learn/customization/custom-nodes

A powerful feature of React Flow is the ability to create custom nodes. This gives you the flexibility to render anything you want within your nodes. We generally recommend creating your own custom nodes rather than relying on built-in ones. With custom nodes, you can add as many source and target handles as you like—or even embed form inputs, charts, and other interactive elements.

In this section, we’ll walk through creating a custom node featuring an input field that updates text elsewhere in your application. For further examples, we recommend checking out our [Custom Node Example](https://reactflow.dev/examples/nodes/custom-node).

###### Implementing a Custom Node[](#implementing-a-custom-node)


To create a custom node, all you need to do is create a React component. React Flow will automatically wrap it in an interactive container that injects essential props like the node’s id, position, and data, and provides functionality for selection, dragging, and connecting handles. For a full reference on all available custom node props, see the [Custom Node Props](https://reactflow.dev/api-reference/types/node-props).

Let’s dive into an example by creating a custom node called `TextUpdaterNode`. For this, we’ve added a simple input field with a change handler. React Flow has a few handy [pre-built components](https://reactflow.dev/api-reference/components) to simplify the process of creating custom nodes. We will use the [`Handle` component](https://reactflow.dev/api-reference/components/handle) to allow our custom node to connect with other nodes.

```typescript
import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
 
const handleStyle = { left: 10 };
 
function TextUpdaterNode({ data }) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);
 
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
    </>
  );
}
```

###### Adding the Node Type[](#adding-the-node-type)


You can add a new node type to React Flow by adding it to the `nodeTypes` prop like below. We define the `nodeTypes` outside of the component to prevent re-renderings.

```typescript
const nodeTypes = {
  textUpdater: TextUpdaterNode
};
 
function Flow() {
  ...
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      style={rfStyle}
    />
  );
}
```

If **`nodeTypes` are defined inside a component, they must be memoized.** Otherwise, React creates a new object on every render, which leads to performance issues and bugs. Here’s how you can memoize the `nodeTypes` object inside a component using the `useMemo` hook:

```typescript
const nodeTypes = useMemo(() => ({ textUpdater: TextUpdaterNode }), []);
 
return <ReactFlow nodeTypes={nodeTypes} />;
```

After defining your new node type, you can use it by using the `type` node option:

```typescript
const nodes = [
  {
    id: 'node-1',
    type: 'textUpdater',
    position: { x: 0, y: 0 },
    data: { value: 123 },
  },
];
```

After putting all together and adding some basic styles we get a custom node that prints text to the console:

###### Utility Classes[](#utility-classes)


React Flow provides several built-in utility CSS classes to help you fine-tune how interactions work within your custom nodes.

##### `nodrag`[](#nodrag)


In the example above, we added the class `nodrag` to the input. This ensures that interacting with the input field doesn’t trigger a drag, allowing you to select the text within the field.

Nodes have a `drag` class name in place by default. However, this class name can affect the behaviour of the event listeners inside your custom nodes. To prevent unexpected behaviours, add a `nodrag` class name to elements with an event listener. This prevents the default drag behavior as well as the default node selection behavior when elements with this class are clicked.

```typescript
export default function CustomNode(props: NodeProps) {
  return (
    <div>
      <input className="nodrag" type="range" min={0} max={100} />
    </div>
  );
}
```

##### `nowheel`[](#nowheel)


If your custom node contains scrollable content, you can apply the `nowheel` class. This disables the canvas’ default pan behavior when you scroll inside your custom node, ensuring that only the content scrolls instead of moving the entire canvas.

```typescript
export default function CustomNode(props: NodeProps) {
  return (
    <div className="nowheel" style={{ overflow: 'auto' }}>
      <p>Scrollable content...</p>
    </div>
  );
}
```

Applying these utility classes helps you control interaction on a granular level. You can custimize these class names inside React Flow’s [style props](https://reactflow.dev/api-reference/react-flow#style-props).

When creating your own custom nodes, you will also need to remember to style them! Unlike the built-in nodes, custom nodes have no default styles, so feel free to use any styling method you prefer, such as [styled components](https://reactflow.dev/examples/styling/styled-components) or [Tailwind CSS](https://reactflow.dev/examples/styling/tailwind).

###### Using Multiple Handles[](#using-multiple-handles)


When defining edge connections to other nodes using these handles, simply using the node `id` isn’t enough. You will also need to specify a handle `id`. In this case, we assign an id `a` to one source handle and an id `b` to the other source handle.

In React Flow, edges can be connected to specific handles within a node using the properties `sourceHandle` (for the edge’s starting point) and `targetHandle` (for the edge’s ending point). When you have multiple handles on a node—for example, two source handles labeled “`a`” and “`b`”, simply specifying the node’s `id` isn’t enough for React Flow to know which connection point to use. By defining `sourceHandle` or `targetHandle` with the appropriate handle `id`, you instruct React Flow to attach the edge to that specific handle, ensuring that connections are made where you intend.

```typescript
const initialEdges = [
  { id: 'edge-1', source: 'node-1', sourceHandle: 'a', target: 'node-2' },
  { id: 'edge-2', source: 'node-1', sourceHandle: 'b', target: 'node-3' },
];
```

In this case, the source node is `node-1` for both handles but the handle `id`s are different. One comes from handle id `"a"` and the other one from `"b"`. Both edges also have different target nodes:

If you are programmatically changing the position or number of handles in your custom node, you will need to use the [`useUpdateNodeInternals`](https://reactflow.dev/api-reference/hooks/use-update-node-internals) hook to properly notify React Flow of changes.

---

## Custom Edges - React Flow

URL: https://reactflow.dev/learn/customization/custom-edges

Like [custom nodes](https://reactflow.dev/learn/customization/custom-nodes), parts of a custom edge in React Flow are just React components: that means you can render anything you want along an edge! This guide shows you how to implement a custom edge with some additional controls. For a comprehensive reference of props available for custom edges, see the [Custom Edge Props documentation](https://reactflow.dev/api-reference/types/edge-props).

###### A basic custom edge[](#a-basic-custom-edge)


An edge isn’t much use to us if it doesn’t render a path between two connected nodes. These paths are always SVG-based and are typically rendered using the [`<BaseEdge />`](https://reactflow.dev/api-reference/components/base-edge) component. To calculate the actual SVG path to render, React Flow comes with some handy utility functions:

* [`getBezierPath`](https://reactflow.dev/api-reference/utils/get-bezier-path)
* [`getSimpleBezierPath`](https://reactflow.dev/api-reference/utils/get-simple-bezier-path)
* [`getSmoothStepPath`](https://reactflow.dev/api-reference/utils/get-smooth-step-path)
* [`getStraightPath`](https://reactflow.dev/api-reference/utils/get-straight-path)

To kick start our custom edge, we’ll just render a straight path between the source and target.

```typescript
import { BaseEdge, getStraightPath } from '@xyflow/react';
 
export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
    </>
  );
}
```

All the props passed to your custom edge component can be found in the API reference under the [`EdgeProps`](https://reactflow.dev/api-reference/types/edge-props) type.

This gives us a straight edge that behaves the same as the default `"straight"` [edge type](https://reactflow.dev/api-reference/types/edge#default-edge-types). To use it, we also need to update the [`edgeTypes`](https://reactflow.dev/api-reference/react-flow#edge-types) prop on the `<ReactFlow />` component.

It’s important to define the `edgeTypes` object *outside of the component* or to use React’s `useMemo` hook to prevent unnecessary re-renders. React Flow will show a warning in the console if you forget to do this.

```typescript
import ReactFlow from '@xyflow/react'
import CustomEdge from './CustomEdge'
 
 
const edgeTypes = {
  'custom-edge': CustomEdge
}
 
export function Flow() {
  return <ReactFlow edgeTypes={edgeTypes} ... />
}
```

After defining the `edgeTypes` object, we can use our new custom edge by setting the `type` field of an edge to `"custom-edge"`.

###### Adding an edge label[](#adding-an-edge-label)


One of the more common uses for custom edges is rendering some controls or info along an edge’s path. In React Flow we call that an *edge label* and unlike the edge path, edge labels can be any React component!

To render a custom edge label we must wrap it in the [`<EdgeLabelRenderer />`](https://reactflow.dev/api-reference/components/edge-label-renderer) component. This is necessary for performance reasons: the edge label renderer is a portal to a single container that *all* edge labels are rendered into.

Let’s add a button to our custom edge that can be used to delete the edge it’s attached to:

```typescript
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useReactFlow,
} from '@xyflow/react';
 
export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const { setEdges } = useReactFlow();
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <button
          onClick={() => setEdges((edges) => edges.filter((e) => e.id !== id))}
        >
          delete
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
```

If we try to use this edge now, we’ll see that the button is rendered in the centre of the flow (it might be hidden behind “Node A”). Because of the edge label portal, we’ll need to do some extra work to position the button ourselves.

![A screen shot of a simple flow. The edge label renderer is highlighted in the DOM inspector and the button is rendered in the centre of the flow.](https://reactflow.dev/_next/image?url=%2Fimg%2Flearn%2Fedge-label-renderer-position.png&w=3840&q=75)

Fortunately, the path utils we’ve already seen can help us with this! Along with the SVG path to render, these functions also return the `x` and `y` coordinates of the path’s midpoint. We can then use these coordinates to translate our custom edge label’s into the right position!

```typescript
export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({ ... });
 
  return (
    ...
        <button
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== id));
          }}
        >
    ...
  );
}
```

To make sure our edge labels are interactive and not just for presentation, it is important to add `pointer-events: all` to the label’s style. This will ensure that the label is clickable.

And just like with interactive controls in custom nodes, we need to remember to add the `nodrag` and `nopan` classes to the label to stop mouse events from controlling the canvas.

Here’s an interactive example with our updated custom edge. Clicking the delete button will remove that edge from the flow. Creating a new edge will use the custom node.

###### Making Custom SVG Edge Paths[](#making-custom-svg-edge-paths)


As discussed previously, if you want to make a custom edge in React Flow, you have to use either of the four path creation functions discussed above (e.g [`getBezierPath`](https://reactflow.dev/api-reference/utils/get-bezier-path)). However if you want to make some other path shape like a Sinusoidal edge or some other edge type then you will have to make the edge path yourself.

The edge path we get from functions like [`getBezierPath`](https://reactflow.dev/api-reference/utils/get-bezier-path) is just a path string which we pass into the `path` prop of the `<BaseEdge />` component. It contains the necessary information needed in order to draw that path, like where it should start from, where it should curve, where it should end, etc. A simple straight path string between two points `(x1, y1)` to `(x2, y2)` would look like:

An SVG path is a concatenated list of commands like `M`, `L`, `Q`, etc, along with their values. Some of these commands are listed below, along with their supported values.

* `M x1 y1` is the Move To command which moves the current point to the x1, y1 coordinate.
* `L x1 y1` is the Line To command which draws a line from the current point to x1, y1 coordinate.
* `Q x1 y1 x2 y2` is the Quadratic Bezier Curve command which draws a bezier curve from the current point to the x2, y2 coordinate. x1, y1 is the control point of the curve which determines the curviness of the curve.

Whenever we want to start a path for our custom edge, we use the `M` command to move our current point to `sourceX, sourceY` which we get as props in the custom edge component. Then based on the shape we want, we will use other commands like `L`(to make lines), `Q`(to make curves) and then finally end our path at `targetX, targetY` which we get as props in the custom edge component.

If you want to learn more about SVG paths, you can check out [SVG-Path-Editor](https://yqnn.github.io/svg-path-editor/) . You can paste any SVG path there and analyze individual path commands via an intuitive UI.

Here is an example with two types of custom edge paths, a Step edge and a Sinusoidal edge. You should look at the Step edge first to get your hands dirty with custom SVG paths since it’s simple, and then look at how the Sinusoidal edge is made. After going through this example, you will have the necessary knowledge to make custom SVG paths for your custom edges.

---

## Theming - React Flow

URL: https://reactflow.dev/learn/customization/theming

React Flow has been built with deep customization in mind. Many of our users fully transform the look and feel of React Flow to match their own brand or design system. This guide will introduce you to the different ways you can customize React Flow’s appearance.

###### Default styles[](#default-styles)


React Flow’s default styles are enough to get going with the built-in nodes. They provide some sensible defaults for styles like padding, border radius, and animated edges. You can see what they look like below:

You’ll typically load these default styles by importing them in you `App.jsx` file or other entry point:

```typescript
import '@xyflow/react/dist/style.css';
```

Without dipping into [custom nodes](https://reactflow.dev/examples/nodes/custom-node) and [edges](https://reactflow.dev/examples/edges/custom-edges), there are three ways you can style React Flow’s basic look:

* Passing inline styles through `style` props
* Overriding the built-in classes with custom CSS
* Overriding the CSS variables React Flow uses

##### Built in dark and light mode[](#built-in-dark-and-light-mode)


You can choose one of the built-in color modes by using the `colorMode` prop (‘dark’, ‘light’ or ‘system’) as seen in the [dark mode example](https://reactflow.dev/examples/styling/dark-mode).

```typescript
import ReactFlow from '@xyflow/react';
 
export default function Flow() {
  return <ReactFlow colorMode="dark" nodes={[...]} edges={[...]} />
}
```

When you use the `colorMode` prop, React Flow adds a class to the root element (`.react-flow`) that you can use to style your flow based on the color mode:

```typescript
.dark .react-flow__node {
  background: #777;
  color: white;
}
 
.light .react-flow__node {
  background: white;
  color: #111;
}
```

##### Customizing with `style` props[](#customizing-with-style-props)


The easiest way to start customizing the look and feel of your flows is to use the `style` prop found on many of React Flow’s components to inline your own CSS.

```typescript
import ReactFlow from '@xyflow/react'
 
const styles = {
  background: 'red',
  width: '100%',
  height: 300,
};
 
export default function Flow() {
  return <ReactFlow style={styles} nodes={[...]} edges={[...]} />
}
```

##### CSS variables[](#css-variables)


If you don’t want to replace the default styles entirely but just want to tweak the overall look and feel, you can override some of the CSS variables we use throughout the library. For an example of how to use these CSS variables, check out our [Feature Overview](https://reactflow.dev/examples/overview) example.

These variables are mostly self-explanatory. Below is a table of all the variables you might want to tweak and their default values for reference:

| Variable name | Default |
| --- | --- |
| `--xy-edge-stroke-default` | `#b1b1b7` |
| `--xy-edge-stroke-width-default` | `1` |
| `--xy-edge-stroke-selected-default` | `#555` |
| `--xy-connectionline-stroke-default` | `#b1b1b7` |
| `--xy-connectionline-stroke-width-default` | `1` |
| `--xy-attribution-background-color-default` | `rgba(255, 255, 255, 0.5)` |
| `--xy-minimap-background-color-default` | `#fff` |
| `--xy-background-pattern-dots-color-default` | `#91919a` |
| `--xy-background-pattern-line-color-default` | `#eee` |
| `--xy-background-pattern-cross-color-default` | `#e2e2e2` |
| `--xy-node-color-default` | `inherit` |
| `--xy-node-border-default` | `1px solid #1a192b` |
| `--xy-node-background-color-default` | `#fff` |
| `--xy-node-group-background-color-default` | `rgba(240, 240, 240, 0.25)` |
| `--xy-node-boxshadow-hover-default` | `0 1px 4px 1px rgba(0, 0, 0, 0.08)` |
| `--xy-node-boxshadow-selected-default` | `0 0 0 0.5px #1a192b` |
| `--xy-handle-background-color-default` | `#1a192b` |
| `--xy-handle-border-color-default` | `#fff` |
| `--xy-selection-background-color-default` | `rgba(0, 89, 220, 0.08)` |
| `--xy-selection-border-default` | `1px dotted rgba(0, 89, 220, 0.8)` |
| `--xy-controls-button-background-color-default` | `#fefefe` |
| `--xy-controls-button-background-color-hover-default` | `#f4f4f4` |
| `--xy-controls-button-color-default` | `inherit` |
| `--xy-controls-button-color-hover-default` | `inherit` |
| `--xy-controls-button-border-color-default` | `#eee` |
| `--xy-controls-box-shadow-default` | `0 0 2px 1px rgba(0, 0, 0, 0.08)` |
| `--xy-resize-background-color-default` | `#3367d9` |

These variables are used to define the *defaults* for the various elements of React Flow. This means they can still be overridden by inline styles or custom classes on a per-element basis. If you want to override these variables, you can do so by adding:

```typescript
.react-flow {
  --xy-node-background-color-default: #ff5050;
}
```

Be aware that these variables are defined under `.react-flow` and under `:root`.

##### Overriding built-in classes[](#overriding-built-in-classes)


Some consider heavy use of inline styles to be an anti-pattern. In that case, you can override the built-in classes that React Flow uses with your own CSS. There are many classes attached to all sorts of elements in React Flow, but the ones you’ll likely want to override are listed below:

| Class name | Description |
| --- | --- |
| `.react-flow` | The outermost container |
| `.react-flow__renderer` | The inner container |
| `.react-flow__zoompane` | Zoom & pan pane |
| `.react-flow__selectionpane` | Selection pane |
| `.react-flow__selection` | User selection |
| `.react-flow__edges` | The element containing all edges in the flow |
| `.react-flow__edge` | Applied to each [`Edge`](https://reactflow.dev/api-reference/types/edge) in the flow |
| `.react-flow__edge.selected` | Added to an [`Edge`](https://reactflow.dev/api-reference/types/edge) when selected |
| `.react-flow__edge.animated` | Added to an [`Edge`](https://reactflow.dev/api-reference/types/edge) when its `animated` prop is `true` |
| `.react-flow__edge.updating` | Added to an [`Edge`](https://reactflow.dev/api-reference/types/edge) while it gets updated via `onReconnect` |
| `.react-flow__edge-path` | The SVG `<path />` element of an [`Edge`](https://reactflow.dev/api-reference/types/edge) |
| `.react-flow__edge-text` | The SVG `<text />` element of an [`Edge`](https://reactflow.dev/api-reference/types/edge) label |
| `.react-flow__edge-textbg` | The SVG `<text />` element behind an [`Edge`](https://reactflow.dev/api-reference/types/edge) label |
| `.react-flow__connection` | Applied to the current connection line |
| `.react-flow__connection-path` | The SVG `<path />` of a connection line |
| `.react-flow__nodes` | The element containing all nodes in the flow |
| `.react-flow__node` | Applied to each [`Node`](https://reactflow.dev/api-reference/types/node) in the flow |
| `.react-flow__node.selected` | Added to a [`Node`](https://reactflow.dev/api-reference/types/node) when selected. |
| `.react-flow__node-default` | Added when [`Node`](https://reactflow.dev/api-reference/types/node) type is `"default"` |
| `.react-flow__node-input` | Added when [`Node`](https://reactflow.dev/api-reference/types/node) type is `"input"` |
| `.react-flow__node-output` | Added when [`Node`](https://reactflow.dev/api-reference/types/node) type is `"output"` |
| `.react-flow__nodesselection` | Nodes selection |
| `.react-flow__nodesselection-rect` | Nodes selection rect |
| `.react-flow__handle` | Applied to each [`<Handle />`](https://reactflow.dev/api-reference/components/handle) component |
| `.react-flow__handle-top` | Applied when a handle’s [`Position`](https://reactflow.dev/api-reference/types/position) is set to `"top"` |
| `.react-flow__handle-right` | Applied when a handle’s [`Position`](https://reactflow.dev/api-reference/types/position) is set to `"right"` |
| `.react-flow__handle-bottom` | Applied when a handle’s [`Position`](https://reactflow.dev/api-reference/types/position) is set to `"bottom"` |
| `.react-flow__handle-left` | Applied when a handle’s [`Position`](https://reactflow.dev/api-reference/types/position) is set to `"left"` |
| `.connectingfrom` | Added to a Handle when a connection line is above a handle. |
| `.connectingto` | Added to a Handle when a connection line is above a handle. |
| `.valid` | Added to a Handle when a connection line is above **and** the connection is valid |
| `.react-flow__background` | Applied to the [`<Background />`](https://reactflow.dev/api-reference/components/background) component |
| `.react-flow__minimap` | Applied to the [`<MiniMap />`](https://reactflow.dev/api-reference/components/minimap) component |
| `.react-flow__controls` | Applied to the [`<Controls />`](https://reactflow.dev/api-reference/components/controls) component |

Be careful if you go poking around the source code looking for other classes to override. Some classes are used internally and are required in order for the library to be functional. If you replace them you may end up with unexpected bugs or errors!

###### Third-party solutions[](#third-party-solutions)


You can choose to opt-out of React Flow’s default styling altogether and use a third-party styling solution instead. If you want to do this, you must make sure you still import the base styles.

```typescript
import '@xyflow/react/dist/base.css';
```

These base styles are **required** for React Flow to function correctly. If you don’t import them or you override them with your own styles, some things might not work as expected!

##### Styled Components[](#styled-components)


Many of the components you render directly, such as the [`<MiniMap />`](https://reactflow.dev/api-reference/components/minimap), accept both `className` and `style` props. This means you can use any styling solution you like, such as [Styled Components](https://styled-components.com/) :

```typescript
import { MiniMap } from '@xyflow/react';
 
const StyledMiniMap = styled(MiniMap)`
  background-color: ${(props) => props.theme.bg};
 
  .react-flow__minimap-mask {
    fill: ${(props) => props.theme.minimapMaskBg};
  }
 
  .react-flow__minimap-node {
    fill: ${(props) => props.theme.nodeBg};
    stroke: none;
  }
`;
```

For a complete example of using Styled Components with React Flow, check out [the example](https://reactflow.dev/examples/styling/styled-components)!

##### TailwindCSS[](#tailwindcss)


Custom nodes and edges are just React components, and you can use any styling solution you’d like to style them. For example, you might want to use [Tailwind](https://tailwindcss.com/)  to style your nodes:

```typescript
function CustomNode({ data }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
          {data.emoji}
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">{data.job}</div>
        </div>
      </div>
 
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}
```

If you want to overwrite default styles, make sure to import Tailwinds entry point after React Flows base styles.

```typescript
import '@xyflow/react/dist/style.css';
import 'tailwind.css';
```

For a complete example of using Tailwind with React Flow, check out [the example](https://reactflow.dev/examples/styling/tailwind)!

---

## Accessibility - React Flow

URL: https://reactflow.dev/learn/advanced-use/accessibility

[Learn](https://reactflow.dev/learn)

Advanced Use

Accessibility

A flow is accessible with a keyboard and readable by a screen reader. Nodes and edges are focusable, selectable, moveable and deletable with the keyboard.

If you have an idea how we can improve the accessibility of React Flow, please feel free to [contact us](https://xyflow.com/contact) .

###### Built-in Features[](#built-in-features)


##### Keyboard Controls[](#keyboard-controls)


* Nodes and edges are focusable by using the `Tab` key (`tabIndex={0}` + `role="button"`)
* Nodes and edges are selectable by using `Enter` or `Space`, un-selectable by using `Escape`
* Nodes are moveable with arrow keys (press Shift for increasing velocity)
* Nodes and Edges get a `aria-describedby` attribute to describe keyboard controls

You can configure the keyboard controls with the props: `nodesFocusable`, `edgesFocusable` and `disableKeyboardA11y`. `nodesFocusable` and `edgesFocusable` (both true by default) need to be true if you want to be able to focus elements with Tab and then select or deselect them with Enter and Escape. If you are setting `disableKeyboardA11y={true}`, the nodes are not moveable with arrow keys anymore.

Nodes are only moveable with arrow keys when `nodesDraggable` and `nodesFocusable` are true (default behavior).

##### WAI-ARIA[](#wai-aria)


* Edges: Default `aria-label` - overwritable with new `Edge` option `ariaLabel`
* Nodes: `ariaLabel` option (no default here, because we assume that there might be text inside the node)
* Minimap component: `aria-describedby` + title
* Attribution component: `aria-label`
* Controls component: `aria-label` for controls container and buttons

###### Better accessible node-based UIs[](#better-accessible-node-based-uis)


* When your nodes don’t have textual content, you should provide an aria-label via the node options.
* You can improve the default `aria-label` (‘from source.id to target.id’) of an edge, when your nodes have names that you could use by passing specific aria-labels to the edges.
* follow best [practice WAI-ARIA guides](https://w3c.github.io/aria-practices/)  in your application

Last updated on

April 12, 2025

[Sub Flows](https://reactflow.dev/learn/layouting/sub-flows)[Testing](https://reactflow.dev/learn/advanced-use/testing)

---

## Sub Flows - React Flow

URL: https://reactflow.dev/learn/layouting/sub-flows

**Deprecation of `parentNode` property!** We have renamed the `parentNode` option to `parentId` in version 11.11.0. The old property is still supported but will be removed in version 12.

A sub flow is a flow inside a node. It can be a separate flow or a flow that is connected with other nodes outside of its parent. This feature can also be used for grouping nodes. In this part of the docs we are going to build a flow with sub flows and show you the child node specific options.

**Order of Nodes** It’s important that your parent nodes appear before their children in the `nodes`/ `defaultNodes` array to get processed correctly.

##### Adding Child Nodes[](#adding-child-nodes)


If you want to add a node as a child of another node you need to use the `parentId` (this was called `parentNode` in previous versions) option (you can find a list of all options in the [node options section](https://reactflow.dev/api-reference/types/node)). Once we do that, the child node is positioned relative to its parent. A position of `{ x: 0, y: 0 }` is the top left corner of the parent.

In this example we are setting a fixed width and height of the parent node by passing the style option. Additionally, we set the child extent to `'parent'` so that we can’t move the child nodes out of the parent node.

##### Using Child Specific Options[](#using-child-specific-options)


When you move the parent node you can see that the child nodes move, too. Adding a node to another node with the `parentId` option, just does one thing: It positions it relatively to its parent. The child node is not really a child markup-wise. You can drag or position the child outside of its parent (when the `extent: 'parent'` option is not set) but when you move the parent, the child moves with it.

In the example above we are using the `group` type for the parent node but you can use any other type as well. The `group` type is just a convenience node type that has no handles attached.

Now we are going to add some more nodes and edges. As you can see, we can connect nodes within a group and create connections that go from a sub flow to an outer node:

##### Using a Default Node Type as a Parent[](#using-a-default-node-type-as-a-parent)


Let’s remove the label of node B and add some child nodes. In this example you can see that you can use one of the default node types as parents, too. We also set the child nodes to `draggable: false` so that they are not draggable anymore.

Last updated on

April 12, 2025

[Layouting Libraries](https://reactflow.dev/learn/layouting/layouting)[Accessibility](https://reactflow.dev/learn/advanced-use/accessibility)

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Layouting - React Flow

URL: https://reactflow.dev/learn/layouting/layouting

We regularly get asked how to handle layouting in React Flow. While we could build some basic layouting into React Flow, we believe that **you know your app’s requirements best** and with so many options out there we think it’s better you choose the best right tool for the job (not to mention it’d be a whole bunch of work for us).

That doesn’t help very much if you don’t know what the options *are*, so this guide is here to help! We’ll split things up into resources for layouting nodes and resources for routing edges.

To start let’s put together a simple example flow that we can use as a base for testing out the different layouting options.

Each of the examples that follow will be built on this empty flow. Where possible we’ve tried to keep the examples confined to just one `index.js` file so it’s easy for you to compare how they’re set up.

###### Layouting Nodes[](#layouting-nodes)


For layouting nodes, there are a few third-party libraries that we think are worth checking out:

| Library | Dynamic node sizes | Sub-flow layouting | Edge routing | Bundle size |
| --- | --- | --- | --- | --- |
| [Dagre](https://github.com/dagrejs/dagre) | Yes | Yes¹ | No | [![](https://pkg-size.dev/badge/bundle/39882 "Bundle size for @dagrejs/dagre")](https://pkg-size.dev/@dagrejs/dagre) |
| [D3-Hierarchy](https://github.com/d3/d3-hierarchy) | No | No | No | [![](https://pkg-size.dev/badge/bundle/14697 "Bundle size for d3-hierarchy")](https://pkg-size.dev/d3-hierarchy) |
| [D3-Force](https://github.com/d3/d3-force) | Yes | No | No | [![](https://pkg-size.dev/badge/bundle/15623 "Bundle size for d3-force")](https://pkg-size.dev/d3-force) |
| [ELK](https://github.com/kieler/elkjs) | Yes | Yes | Yes | [![](https://pkg-size.dev/badge/bundle/1455420 "Bundle size for elkjs")](https://pkg-size.dev/elkjs) |

¹ Dagre currently has an [open issue](https://github.com/dagrejs/dagre/issues/238)  that prevents it from laying out sub-flows correctly if any nodes in the sub-flow are connected to nodes outside the sub-flow.

We’ve loosely ordered these options from simplest to most complex, where dagre is largely a drop-in solution and elkjs is a full-blown highly configurable layouting engine. Below, we’ll take a look at a brief example of how each of these libraries can be used with React Flow. For dagre and elkjs specifically, we have some separate examples you can refer back to [here](https://reactflow.dev/examples/layout/dagre) and [here](https://reactflow.dev/examples/layout/elkjs).

##### Dagre[](#dagre)


* Repo: [https://github.com/dagrejs/dagre](https://github.com/dagrejs/dagre)
* Docs: [https://github.com/dagrejs/dagre/wiki#configuring-the-layout](https://github.com/dagrejs/dagre/wiki#configuring-the-layout)

Dagre is a simple library for layouting directed graphs. It has minimal configuration options and a focus on speed over choosing the most optimal layout. If you need to organize your flows into a tree, *we highly recommend dagre*.

With no effort at all we get a well-organized tree layout! Whenever `getLayoutedElements` is called, we’ll reset the dagre graph and set the graph’s direction (either left-to-right or top-to-bottom) based on the `direction` prop. Dagre needs to know the dimensions of each node in order to lay them out, so we iterate over our list of nodes and add them to dagre’s internal graph.

After laying out the graph, we’ll return an object with the layouted nodes and edges. We do this by mapping over the original list of nodes and updating each node’s position according to node stored in the dagre graph.

Documentation for dagre’s configuration options can be found [here](https://github.com/dagrejs/dagre/wiki#configuring-the-layout) , including properties to set for spacing and alignment.

##### D3-Hierarchy[](#d3-hierarchy)


* Repo: [https://github.com/d3/d3-hierarchy](https://github.com/d3/d3-hierarchy)
* Docs: [https://d3js.org/d3-hierarchy](https://d3js.org/d3-hierarchy)

When you know your graph is a tree with a single root node, d3-hierarchy can provide a handful of interesting layouting options. While the library can layout a simple tree just fine, it also has layouting algorithms for tree maps, partition layouts, and enclosure diagrams.

D3-hierarchy expects your graphs to have a single root node, so it won’t work in all cases. It’s also important to note that d3-hierarchy assigns the same width and height to *all* nodes when calculating the layout, so it’s not the best choice if you’re displaying lots of different node types.

##### D3-Force[](#d3-force)


* Repo: [https://github.com/d3/d3-force](https://github.com/d3/d3-force)
* Docs: [https://d3js.org/d3-force](https://d3js.org/d3-force)

For something more interesting than a tree, a force-directed layout might be the way to go. D3-Force is a physics-based layouting library that can be used to position nodes by applying different forces to them.

As a consequence, it’s a little more complicated to configure and use compared to dagre and d3-hierarchy. Importantly, d3-force’s layouting algorithm is iterative, so we need a way to keep computing the layout across multiple renders.

First, let’s see what it does:

We’ve changed our `getLayoutedElements` to a hook called `useLayoutedElements` instead. Additionally, instead of passing in the nodes and edges explicitly, we’ll use get `getNodes` and `getEdges` functions from the `useReactFlow` hook. This is important when combined with the store selector in `initialized` because it will prevent us from reconfiguring the simulation any time the nodes update.

The simulation is configured with a number of different forces applied so you can see how they interact: play around in your own code to see how you want to configure those forces. You can find the documentation and some different examples of d3-force [here](https://d3js.org/d3-force) .

**Rectangular collisions** D3-Force has a built-in collision force, but it assumes nodes are circles. We’ve thrown together a custom force in `collision.js` that uses a similar algorithm but accounts for our rectangular nodes instead. Feel free to steal it or let us know if you have any suggestions for improvements!

The tick function progresses the simulation by one step and then updates React Flow with the new node positions. We’ve also included a demonstration on how to handle node dragging while the simulation is running: if your flow isn’t interactive you can ignore that part!

For larger graphs, computing the force layout every render forever is going to incur a big performance hit. In this example we have a simple toggle to turn the layouting on and off, but you might want to come up with some other approach to only compute the layout when necessary.

##### Elkjs[](#elkjs)


* Repo: [https://github.com/kieler/elkjs](https://github.com/kieler/elkjs)
* Docs: [https://eclipse.dev/elk/reference.html](https://eclipse.dev/elk/reference.html)  (good luck!)

Elkjs is certainly the most configurable option available, but it’s also the most complicated. Elkjs is a Java library that’s been ported to JavaScript, and it provides a huge number of options for configuring the layout of your graph.

At it’s most basic we can compute layouts similar to dagre, but because the layouting algorithm runs asynchronously we need to create a `useLayoutedElements` hook similar to the one we created for d3-force.

**The ELK reference is your new best friend** We don’t often recommend elkjs because it’s complexity makes it difficult for us to support folks when they need it. If you do decide to use it, you’ll want to keep the original [Java API reference](https://eclipse.dev/elk/reference.html)  handy.

We’ve also included a few examples of some of the other layouting algorithms available, including a non-interactive force layout.

##### Honourable Mentions[](#honourable-mentions)


Of course, we can’t go through every layouting library out there: we’d never work on anything else! Here are some other libraries we’ve come across that might be worth taking a look at:

* If you want to use dagre or d3-hierarchy but need to support nodes with different dimensions, both [d3-flextree](https://github.com/klortho/d3-flextree)  and [entitree-flex](https://github.com/codeledge/entitree-flex)  look promising.
    
    You can find an example of how to use entitree-flex with React Flow [here](https://reactflow.dev/examples/layout/entitree-flex).
* [Cola.js](https://github.com/tgdwyer/WebCola)  looks like a promising option for so-called “constraint-based” layouts. We haven’t had time to properly investigate it yet, but it looks like you can achieve results similar to d3-force but with a lot more control.

###### Routing Edges[](#routing-edges)


If you don’t have any requirements for edge routing, you can use one of the layouting libraries above to position nodes and let the edges fall wherever they may. Otherwise, you’ll want to look into some libraries and techniques for edge routing.

Your options here are more limited than for node layouting, but here are some resources we thought looked promising:

* [react-flow-smart-edge](https://github.com/tisoap/react-flow-smart-edge)
* [Routing Orthogonal Diagram Connectors in JavaScript](https://medium.com/swlh/routing-orthogonal-diagram-connectors-in-javascript-191dc2c5ff70)

If you do explore some custom edge routing options, consider contributing back to the community by writing a blog post or creating a library!

Our [editable edge Pro Example](https://reactflow.dev/examples/edges/editable-edge) could also be used as a starting point for implementing a custom edge that can be routed along a specific path.

---

## Testing - React Flow

URL: https://reactflow.dev/learn/advanced-use/testing

There are plenty of options to test a React application. If you want to test a React Flow application, we recommend to use [Cypress](https://www.cypress.io/)  or [Playwright](https://playwright.dev/) . React Flow needs to measure nodes in order to render edges and for that relies on rendering DOM elements.

###### Using Cypress or Playwright[](#using-cypress-or-playwright)


If you are using Cypress or Playwright no additional setup is needed. You can refer to the getting started guide for [Cypress here](https://docs.cypress.io/guides/getting-started/installing-cypress)  and for [Playwright here](https://playwright.dev/docs/intro) .

###### Using Jest[](#using-jest)


If you are using [Jest](https://jestjs.io/) , you need to mock some features in order to be able to run your tests. You can do that by adding this file to your project. Calling `mockReactFlow()` in a `setupTests` file (or inside a `beforeEach`) will trigger the necessary overrides.

```typescript
// To make sure that the tests are working, it's important that you are using
// this implementation of ResizeObserver and DOMMatrixReadOnly
class ResizeObserver {
  callback: globalThis.ResizeObserverCallback;
 
  constructor(callback: globalThis.ResizeObserverCallback) {
    this.callback = callback;
  }
 
  observe(target: Element) {
    this.callback([{ target } as globalThis.ResizeObserverEntry], this);
  }
 
  unobserve() {}
 
  disconnect() {}
}
 
class DOMMatrixReadOnly {
  m22: number;
  constructor(transform: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale !== undefined ? +scale : 1;
  }
}
 
// Only run the shim once when requested
let init = false;
 
export const mockReactFlow = () => {
  if (init) return;
  init = true;
 
  global.ResizeObserver = ResizeObserver;
 
  // @ts-ignore
  global.DOMMatrixReadOnly = DOMMatrixReadOnly;
 
  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });
 
  (global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
};
```

If you want to test mouse events with jest (for example inside your custom nodes), you need to disable `d3-drag` as it does not work outside of the browser:

```typescript
<ReactFlow nodesDraggable={false} {...rest} />
```

Last updated on

April 12, 2025

[Accessibility](https://reactflow.dev/learn/advanced-use/accessibility)[TypeScript](https://reactflow.dev/learn/advanced-use/typescript)

---

## Usage with TypeScript - React Flow

URL: https://reactflow.dev/learn/advanced-use/typescript

React Flow is written in TypeScript because we value the additional safety barrier it provides. We export all the types you need for correctly typing data structures and functions you pass to the React Flow component. We also provide a way to extend the types of nodes and edges.

###### Basic usage[](#basic-usage)


Let’s start with the most basic types you need for a simple starting point. Typescript might already infer some of these types, but we will define them explicitly nonetheless.

```typescript
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from '@xyflow/react';
 
const initialNodes: Node[] = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 5, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 5, y: 100 } },
];
 
const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
 
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 
const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node.data);
};
 
function Flow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
 
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDrag={onNodeDrag}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    />
  );
}
```

##### Custom nodes[](#custom-nodes)


When working with [custom nodes](https://reactflow.dev/learn/customization/custom-nodes) you have the possibility to pass a custom `Node` type (or your `Node` union) to the `NodeProps` type. There are basically two ways to work with custom nodes:

* If you have **multiple custom nodes**, you want to pass a specific `Node` type as a generic to the `NodeProps` type:

```typescript
import type { Node, NodeProps } from '@xyflow/react';
 
type NumberNode = Node<{ number: number }, 'number'>;
 
export default function NumberNode({ data }: NodeProps<NumberNode>) {
  return <div>A special number: {data.number}</div>;
}
```

⚠️ If you specify the node data separately, you need to use `type` (an `interface` would not work here):

```typescript
type NumberNodeData = { number: number };
type NumberNode = Node<NumberNodeData, 'number'>;
```

* If you have **one custom node** that renders different content based on the node type, you want to pass your `Node` union type as a generic to `NodeProps`:

```typescript
import type { Node, NodeProps } from '@xyflow/react';
 
type NumberNode = Node<{ number: number }, 'number'>;
type TextNode = Node<{ text: string }, 'text'>;
 
type AppNode = NumberNode | TextNode;
 
export default function CustomNode({ data }: NodeProps<AppNode>) {
  if (data.type === 'number') {
    return <div>A special number: {data.number}</div>;
  }
 
  return <div>A special text: {data.text}</div>;
}
```

##### Custom edges[](#custom-edges)


For [custom edges](https://reactflow.dev/learn/customization/custom-nodes) you have the same possibility as for custom nodes.

```typescript
import { getStraightPath, BaseEdge, type EdgeProps, type Edge } from '@xyflow/react';
 
type CustomEdge = Edge<{ value: number }, 'custom'>;
 
export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<CustomEdge>) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
 
  return <BaseEdge id={id} path={edgePath} />;
}
```

###### Advanced usage[](#advanced-usage)


When creating complex applications with React Flow, you will have a number of custom nodes & edges, each with different kinds of data attached to them. When we operate on these nodes & edges through built in functions and hooks, we have to make sure that we [narrow down](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  the types of nodes & edges to prevent runtime errors.

##### `Node` and `Edge` type unions[](#node-and-edge-type-unions)


You will see many functions, callbacks and hooks (even the ReactFlow component itself) that expect a `NodeType` or `EdgeType` generic. These generics are simply [unions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)  of all the different types of nodes & edges you have in your application. As long as you have typed the data objects correctly (see previous section), you can use their exported type.

If you use any of the built-in nodes (‘input’, ‘output’, ‘default’) or edges (‘straight’, ‘step’, ‘smoothstep’, ‘bezier’), you can add the `BuiltInNode` and `BuiltInEdge` types exported from `@xyflow/react` to your union type.

```typescript
import type { BuiltInNode, BuiltInEdge } from '@xyflow/react';
 
// Custom nodes
import NumberNode from './NumberNode';
import TextNode from './TextNode';
 
// Custom edge
import EditableEdge from './EditableEdge';
 
export type CustomNodeType = BuiltInNode | NumberNode | TextNode;
export type CustomEdgeType = BuiltInEdge | EditableEdge;
```

##### Functions passed to `<ReactFlow />`[](#functions-passed-to-reactflow-)


To receive correct types for callback functions, you can pass your union types to the `ReactFlow` component. By doing that you will have to type your callback functions explicitly.

```typescript
import { type OnNodeDrag } from '@xyflow/react';
 
// ...
 
// Pass your union type here ...
const onNodeDrag: OnNodeDrag<CustomNodeType> = useCallback((_, node) => {
  if (node.type === 'number') {
    // From here on, Typescript knows that node.data
    // is of type { num: number }
    console.log('drag event', node.data.number);
  }
}, []);
 
const onNodesChange: OnNodesChange<CustomNodeType> = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  [setNodes],
);
```

##### Hooks[](#hooks)


The type unions can also be used to type the return values of many hooks.

```typescript
import { useReactFlow, useNodeConnections, useNodesData, useStore } from '@xyflow/react';
 
export default function FlowComponent() {
  // returned nodes and edges are correctly typed now
  const { getNodes, getEdges } = useReactFlow<CustomNodeType, CustomEdgeType>();
 
  // You can type useStore by typing the selector function
  const nodes = useStore((s: ReactFlowState<CustomNodeType>) => ({
    nodes: s.nodes,
  }));
 
  const connections = useNodeConnections({
    handleType: 'target',
  });
 
  const nodesData = useNodesData<CustomNodeType>(connections?.[0].source);
 
  nodeData.forEach(({ type, data }) => {
    if (type === 'number') {
      // This is type safe because we have narrowed down the type
      console.log(data.number);
    }
  });
  // ...
}
```

##### Type guards[](#type-guards)


There are multiple ways you can define [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#typeof-type-guards)  in Typescript. One way is to define type guard functions like `isNumberNode` or `isTextNode` to filter out specific nodes from a list of nodes.

```typescript
function isNumberNode(node: CustomNodeType): node is NumberNode {
  return node.type === 'number';
}
 
// numberNodes is of type NumberNode[]
const numberNodes = nodes.filter(isNumberNode);
```

---

## Uncontrolled Flow - React Flow

URL: https://reactflow.dev/learn/advanced-use/uncontrolled-flow

There are two ways to use React Flow - controlled or uncontrolled. Controlled means, that you are in control of the state of the nodes and edges. In an uncontrolled flow the state of the nodes and edges is handled by React Flow internally. In this part we will show you how to work with an uncontrolled flow.

An implementation of an uncontrolled flow is simpler, because you don’t need to pass any handlers:

As you can see, we are passing `defaultEdgeOptions` to define that edges are animated. This is helpful, because you can’t use the `onConnect` handler anymore to pass custom options to a newly created edge. Try to connect “Node B” with “Node C” and you see that the new edge is animated.

###### Updating Nodes and Edges[](#updating-nodes-and-edges)


Since you don’t have nodes and edges in your local state, you can’t update them directly. To do so, you need to use the [React Flow instance](https://reactflow.dev/api-reference/types/react-flow-instance) that comes with functions for updating the internal state. You can receive the instance via the `onInit` callback or better by using the [`useReactFlow` hook](https://reactflow.dev/api-reference/hooks/use-react-flow). Let’s create a button that adds a new node at a random position. For this, we are wrapping our flow with the [`ReactFlowProvider`](https://reactflow.dev/api-reference/react-flow-provider) and use the [`addNodes` function](https://reactflow.dev/api-reference/types/react-flow-instance#nodes-and-edges).

The `Flow` component in this example is wrapped with the `ReactFlowProvider` to use the `useReactFlow` hook.

Last updated on

April 12, 2025

[TypeScript](https://reactflow.dev/learn/advanced-use/typescript)[State Management](https://reactflow.dev/learn/advanced-use/state-management)

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Using a State Management Library - React Flow

URL: https://reactflow.dev/learn/advanced-use/state-management

For this guide we assume that you already know about the [core concepts](https://reactflow.dev/learn/concepts/core-concepts) of React Flow and how to implement [custom nodes](https://reactflow.dev/learn/customization/custom-nodes). You should also be familiar with the concepts of state management libraries and how to use them.

In this guide, we explain how to use React Flow with the state management library [Zustand](https://github.com/pmndrs/zustand) . We will build a small app where each node features a color chooser that updates its background color. We chose Zustand for this guide because React Flow already uses it internally, but you can easily use other state management libraries such as [Redux](https://redux.js.org/) , [Recoil](https://recoiljs.org/)  or [Jotai](https://jotai.org/) 

As demonstrated in previous guides and examples, React Flow can easily be used with a local component state to manage nodes and edges in your diagram. However, as your application grows and you need to update the state from within individual nodes, managing this state can become more complex. Instead of passing functions through the node’s data field, you can use a [React context](https://reactjs.org/docs/context.html)  or integrate a state management library like Zustand, as outlined in this guide.

###### Install Zustand[](#install-zustand)


As mentioned above we are using Zustand in this example. Zustand is a bit like Redux: you have a central store with actions to alter your state and hooks to access your state. You can install Zustand via:

```typescript
npm install --save zustand
```

###### Create a Store[](#create-a-store)


Zustand lets you create a hook for accessing the values and functions of your store. We put the `nodes` and `edges` and the `onNodesChange`, `onEdgesChange`, `onConnect`, `setNodes` and `setEdges` functions in the store to get the basic interactivity for our graph:

That’s the basic setup. We now have a store with nodes and edges that can handle the changes (dragging, selecting or removing a node or edge) triggered by React Flow. When you take a look at the `App.tsx` file, you can see that it’s kept nice and clean. All the data and actions are now part of the store and can be accessed with the `useStore` hook.

###### Implement a Color Change Action[](#implement-a-color-change-action)


We add a new `updateNodeColor` action to update the `data.color` field of a specific node. For this we pass the node id and the new color to the action, iterate over the nodes and update the matching one with the new color:

```typescript
updateNodeColor: (nodeId: string, color: string) => {
  set({
    nodes: get().nodes.map((node) => {
      if (node.id === nodeId) {
        // it's important to create a new object here, to inform React Flow about the changes
        return { ...node, data: { ...node.data, color } };
      }
 
      return node;
    }),
  });
};
```

This new action can now be used in a React component like this:

```typescript
const updateNodeColor = useStore((s) => s.updateNodeColor);
...
<button onClick={() => updateNodeColor(nodeId, color)} />;
```

###### Add a Color Chooser Node[](#add-a-color-chooser-node)


In this step we implement the `ColorChooserNode` component and call the `updateNodeColor` when the user changes the color. The custom part of the color chooser node is the color input.

```typescript
<input
  type="color"
  defaultValue={data.color}
  onChange={(evt) => updateNodeColor(id, evt.target.value)}
  className="nodrag"
/>
```

We add the `nodrag` class name so that the user doesn’t drag the node by mistake when changing the color and call the `updateNodeColor` in the `onChange` event handler.

You can now click on a color chooser and change the background of a node.

---

## Server Side Rendering - React Flow

URL: https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration

Server side rendering is supported since React Flow 12

This is an advanced use case and assumes you are already familiar with React Flow. If you’re new to React Flow, check out our [getting started guide](https://reactflow.dev/learn/getting-started/installation-and-requirements).

In this guide you will learn how to configure React Flow to render a flow on the server, which will allow you to

* Display static HTML diagrams in documentation
* Render React Flow diagrams in non-js environments
* Dynamically generate open graph images that appear as embeds when sharing a link to your flow

(If you want to download an image of your flow, there’s an easier way to do that on the client-side in our [download image example](https://reactflow.dev/examples/misc/download-image).)

##### Node dimensions[](#node-dimensions)


You need to configure a few things to make React Flow work on the server, the most important being the node dimensions. React Flow only renders nodes if they have a width and height. Usually you pass nodes without a specific `width` and `height`, they are then measured and the dimensions get written to `measured.width` and `measured.height`. Since we can’t measure the dimensions on the server, we need to pass them explicitly. This can be done with the `width` and `height` or the `initialWidth` and `initialHeight` node properties.

```typescript
const nodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    width: 100,
    height: 50,
  },
];
```

React Flow now knows the dimensions of the node and can render it on the server. The `width` and `height` properties are used as an inline style for the node. If you expect nodes to have different dimensions on the client or if the dimensions should by dynamic based on the content, you can use the `initialWidth` and `initialHeight` properties. They are only used for the first render (on the server or on the client) as long as the nodes are not measured and `measured.width` and `measured.height` are not set.

**There are two ways to specify node dimensions for server side rendering:**

* `width` and `height` for static dimensions that are known in advance and don’t change.

* `initialWidth` and `initialHeight` for dynamic dimensions that are not known in advance or change.

##### Handle positions[](#handle-positions)


You probably also want to render the edges on the server. On the client, React Flow checks the positions of the handles and stores that information to draw the edges. Since we can’t measure the handle positions on the server, we need to pass this information, too. This can be done with the `handles` property of a node.

```typescript
const nodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    width: 100,
    height: 50,
    handles: [
      {
        type: 'target',
        position: Position.Top,
        x: 100 / 2,
        y: 0,
      },
      {
        type: 'source',
        position: Position.Bottom,
        x: 100 / 2,
        y: 50,
      },
    ],
  },
];
```

With this additional information, React Flow knows enough about the handles to render the edges on the server. If you are fine with just rendering the nodes, you can skip this step.

##### Using `fitView` on the server[](#using-fitview-on-the-server)


If you know the dimensions of the React Flow container itself, you can even use `fitView` on the server. For this, you need to pass the `width` and `height` of the container to the `ReactFlow` component.

```typescript
<ReactFlow nodes={nodes} edges={edges} fitView width={1000} height={500} />
```

This will calculate the viewport and set the `transform` on the server in order to include all nodes in the viewport.

##### Usage with the `<ReactFlowProvider>`[](#usage-with-the-reactflowprovider)


If you are using the `ReactFlowProvider`, you can pass `initialNodes`, `initialEdges` and optional wrapper dimensions (`initialWidth` and `initialHeight`) and `fitView` to the provider.

```typescript
<ReactFlowProvider
  initialNodes={nodes}
  initialEdges={edges}
  initialWidth={1000}
  initialHeight={500}
  fitView
>
  <App />
</ReactFlowProvider>
```

The `initial-` prefix means that these values are only used for the first render. After that, the provider will use the `nodes` and `edges` from the context.

##### Creating static HTML[](#creating-static-html)


If you want to create static HTML, you can use the `renderToStaticMarkup` function from React. This will render the React Flow component to a string of HTML. You can then use this string to create a static HTML file or send it as a response to an HTTP request.

```typescript
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlow, Background } from '@xyflow/react';
 
function toHTML({ nodes, edges, width, height }) {
  const html = renderToStaticMarkup(
    React.createElement(
      ReactFlow,
      {
        nodes,
        edges,
        width,
        height,
        minZoom: 0.2,
        fitView: true,
      },
      React.createElement(Background, null),
    ),
  );
 
  return html;
}
```

---

## Computing Flows - React Flow

URL: https://reactflow.dev/learn/advanced-use/computing-flows

For this guide we assume that you already know about the [core concepts](https://reactflow.dev/learn/concepts/core-concepts) of React Flow and how to implement [custom nodes](https://reactflow.dev/learn/customization/custom-nodes).

Usually with React Flow, developers handle their data outside of React Flow by sending it somewhere else, like on a server or a database. Instead, in this guide we’ll show you how to compute data flows directly inside of React Flow. You can use this for updating a node based on connected data, or for building an app that runs entirely inside the browser.

###### What are we going to build?[](#what-are-we-going-to-build)


By the end of this guide, you will build an interactive flow graph that generates a color out of three separate number input fields (red, green and blue), and determines whether white or black text would be more readable on that background color.

###### Creating custom nodes[](#creating-custom-nodes)


Let’s start by creating a custom input node (`NumberInput.js`) and add three instances of it. We will be using a controlled `<input type="number" />` and limit it to integer numbers between 0 - 255 inside the `onChange` event handler.

```typescript
import { useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
 
function NumberInput({ id, data }) {
  const [number, setNumber] = useState(0);
 
  const onChange = useCallback((evt) => {
    const cappedNumber = Math.round(
      Math.min(255, Math.max(0, evt.target.value)),
    );
    setNumber(cappedNumber);
  }, []);
 
  return (
    <div className="number-input">
      <div>{data.label}</div>
      <input
        id={`number-${id}`}
        name="number"
        type="number"
        min="0"
        max="255"
        onChange={onChange}
        className="nodrag"
        value={number}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
 
export default NumberInput;
```

Next, we’ll add a new custom node (`ColorPreview.js`) with one target handle for each color channel and a background that displays the resulting color. We can use `mix-blend-mode: 'difference';` to make the text color always readable.

Whenever you have multiple handles of the same kind on a single node, don’t forget to give each one a separate id!

Let’s also add edges going from the input nodes to the color node to our `initialEdges` array while we are at it.

###### Computing data[](#computing-data)


How do we get the data from the input nodes to the color node? This is a two step process that involves two hooks created for this exact purpose:

* Store each number input value inside the node’s `data` object with help of the [`updateNodeData`](https://reactflow.dev/api-reference/types/react-flow-instance#update-node-data) callback.
* Find out which nodes are connected by using [`useNodeConnections`](https://reactflow.dev/api-reference/hooks/use-node-connections) and then use [`useNodesData`](https://reactflow.dev/api-reference/hooks/use-nodes-data) for receiving the data from the connected nodes.

##### Step 1: Writing values to the data object[](#step-1-writing-values-to-the-data-object)


First let’s add some initial values for the input nodes inside the `data` object in our `initialNodes` array and use them as an initial state for the input nodes. Then we’ll grab the function [`updateNodeData`](https://reactflow.dev/api-reference/types/react-flow-instance#update-node-data) from the [`useReactFlow`](https://reactflow.dev/api-reference/hooks/use-react-flow) hook and use it to update the `data` object of the node with a new value whenever the input changes.

By default, the data you pass to [`updateNodeData`](https://reactflow.dev/api-reference/types/react-flow-instance#update-node-data) will be merged with the old data object. This makes it easier to do partial updates and saves you in case you forget to add `{...data}`. You can pass `{ replace: true }` as an option to replace the object instead.

**When dealing with input fields you don’t want to use a nodes `data` object as UI state directly.**

There is a delay in updating the data object and the cursor might jump around erratically and lead to unwanted inputs.

##### Step 2: Getting data from connected nodes[](#step-2-getting-data-from-connected-nodes)


We start by determining all connections for each node with the [`useNodeConnections`](https://reactflow.dev/api-reference/hooks/use-node-connections) hook and then fetching the data for the first connected node with [`updateNodeData`](https://reactflow.dev/api-reference/types/react-flow-instance#update-node-data).

Note that each handle can have multiple nodes connected to it and you might want to restrict the number of connections to a single handle inside your application. Check out the [connection limit example](https://reactflow.dev/examples/nodes/connection-limit) to see how to do that.

**And there you go!** Try changing the input values and see the color change in real time.

##### Improving the code[](#improving-the-code)


It might seem awkward to get the connections first, and then the data separately for each handle. For nodes with multiple handles like these, you should consider creating a custom handle component that isolates connection states and node data binding. We can create one inline.

```typescript
// {...}
function CustomHandle({ id, label, onChange }) {
  const connections = useNodeConnections({
    handleType: 'target',
    handleId: id,
  });
 
  const nodeData = useNodesData(connections?.[0].source);
 
  useEffect(() => {
    onChange(nodeData?.data ? nodeData.data.value : 0);
  }, [nodeData]);
 
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        id={id}
        className="handle"
      />
      <label htmlFor="red" className="label">
        {label}
      </label>
    </div>
  );
}
```

We can promote color to local state and declare each handle like this:

```typescript
// {...}
function ColorPreview() {
  const [color, setColor] = useState({ r: 0, g: 0, b: 0 });
 
  return (
    <div
      className="node"
      style={{
        background: `rgb(${color.r}, ${color.g}, ${color.b})`,
      }}
    >
      <CustomHandle
        id="red"
        label="R"
        onChange={(value) => setColor((c) => ({ ...c, r: value }))}
      />
      <CustomHandle
        id="green"
        label="G"
        onChange={(value) => setColor((c) => ({ ...c, g: value }))}
      />
      <CustomHandle
        id="blue"
        label="B"
        onChange={(value) => setColor((c) => ({ ...c, b: value }))}
      />
    </div>
  );
}
 
export default ColorPreview;
```

###### Getting more complex[](#getting-more-complex)


Now we have a simple example of how to pipe data through React Flow. What if we want to do something more complex, like transforming the data along the way? Or even take different paths? We can do that too!

##### Continuing the flow[](#continuing-the-flow)


Let’s extend our flow. Start by adding an output `<Handle type="source" position={Position.Right} />` to the color node and remove the local component state.

Because there are no inputs fields on this node, we don’t need to keep a local state at all. We can just read and update the node’s `data` object directly.

Next, we add a new node (`Lightness.js`) that takes in a color object and determines if it is either a light or dark color. We can use the [relative luminance formula](https://en.wikipedia.org/wiki/Relative_luminance#Relative_luminance_and_%22gamma_encoded%22_colorspaces)  `luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b` to calculate the perceived brightness of a color (0 being the darkest and 255 being the brightest). We can assume everything >= 128 is a light color.

##### Conditional branching[](#conditional-branching)


What if we would like to take a different path in our flow based on the perceived lightness? Let’s give our lightness node two source handles `light` and `dark` and separate the node `data` object by source handle IDs. This is needed if you have multiple source handles to distinguish between each source handle’s data.

But what does it mean to “take a different route”? One solution would be to assume that `null` or `undefined` data hooked up to a target handle is considered a “stop”. In our case we can write the incoming color into `data.values.light` if it’s a light color and into `data.values.dark` if it’s a dark color and set the respective other value to `null`.

Don’t forget to add `flex-direction: column;` and `align-items: end;` to reposition the handle labels.

Cool! Now we only need a last node to see if it actually works… We can create a custom debugging node (`Log.js`) that displays the hooked up data, and we’re done!

###### Summary[](#summary)


You have learned how to move data through the flow and transform it along the way. All you need to do is

* store data inside the node’s `data` object with help of [`updateNodeData`](https://reactflow.dev/api-reference/types/react-flow-instance#update-node-data) callback.
* find out which nodes are connected by using [`useNodeConnections`](https://reactflow.dev/api-reference/hooks/use-node-connections) and then use [`useNodesData`](https://reactflow.dev/api-reference/hooks/use-nodes-data) for receiving the data from the connected nodes.

You can implement branching for example by interpreting incoming data that is undefined as a “stop”. As a side note, most flow graphs that also have a branching usually separate the triggering of nodes from the actual data hooked up to the nodes. Unreal Engines Blueprints are a good example for this.

One last note before you go: you should find a consistent way of structuring all your node data, instead of mixing ideas like we did just now. This means for example, if you start working with splitting data by handle ID you should do it for all nodes, regardless whether they have multiple handles or not. Being able to make assumptions about the structure of your data throughout your flow will make life a lot easier.

---

## Devtools and Debugging - React Flow

URL: https://reactflow.dev/learn/advanced-use/devtools-and-debugging

This is an ongoing experiment on implementing our own React Flow devtools. While we are working on the actual package, we’d love to hear about your feedback and ideas on [Discord](https://discord.gg/Bqt6xrs)  or via mail at [info@xyflow.com](mailto:info@xyflow.com).

React Flow can often seem like a magic black box, but in reality you can reveal quite a lot about its internal state if you know where to look. In this guide we will show you three different ways to reveal the internal state of your flow:

* A `<ViewportLogger />` component that shows the current position and zoom level of the viewport.
* A `<NodeInspector />` component that reveals the state of each node.
* A `<ChangeLogger />` that wraps your flow’s `onNodesChange` handler and logs each change as it is dispatched.

While we find these tools useful for making sure React Flow is working properly, you might also find them useful for debugging your applications as your flows and their interactions become more complex.

We encourage you to copy any or all of the components from this example into your own projects and modify them to suit your needs: each component works independently!

###### Node Inspector[](#node-inspector)


The `<NodeInspector />` component makes use of our [`useNodes`](https://reactflow.dev/api-reference/hooks/use-nodes) hook to access all the nodes in the flow. Typically we discourage using this hook because it will trigger a re-render any time *any* of your nodes change, but that’s exactly what makes it so useful for debugging!

The `width` and `height` properties are added to each node by React Flow after it has measured the node’s dimensions. We pass those dimensions, as well as other information like the node’s id and type, to a custom `<NodeInfo />` component.

We make use of the [`<ViewportPortal />`](https://reactflow.dev/api-reference/components/viewport-portal) component to let us render the inspector into React Flow’s viewport. That means it’s content will be positioned and transformed along with the rest of the flow as the user pans and zooms.

###### Change Logger[](#change-logger)


Any change to your nodes and edges that originates from React Flow itself is communicated to you through the `onNodesChange` and `onEdgesChange` callbacks. If you are working with a controlled flow (that means you’re managing the nodes and edges yourself), you need to apply those changes to your state in order to keep everything in sync.

The `<ChangeLogger />` component wraps your user-provided `onNodesChange` handler with a custom function that intercepts and logs each change as it is dispatched. We can do this by using the [`useStore`](https://reactflow.dev/api-reference/hooks/use-store) and [`useStoreApi`](https://reactflow.dev/api-reference/hooks/use-store-api) hooks to access the store and and then update React Flow’s internal state accordingly. These two hooks give you powerful access to React Flow’s internal state and methods.

Beyond debugging, using the `<ChangeLogger />` can be a great way to learn more about how React Flow works and get you thinking about the different functionality you can build on top of each change.

You can find documentation on the [`NodeChange`](https://reactflow.dev/api-reference/types/node-change) and [`EdgeChange`](https://reactflow.dev/api-reference/types/edge-change) types in the API reference.

###### Viewport Logger[](#viewport-logger)


The `<ViewportLogger />` is the simplest example of what state you can pull out of React Flow’s store if you know what to look for. The state of the viewport is stored internally under the `transform` key (a name we inherited from [d3-zoom](https://d3js.org/d3-zoom#zoomTransform) ). This component extracts the `x`, `y`, and `zoom` components of the transform and renders them into a [`<Panel />`](https://reactflow.dev/api-reference/components/panel) component.

###### Let us know what you think[](#let-us-know-what-you-think)


As mentioned above, if you have any feedback or ideas on how to improve the devtools, please let us know on [Discord](https://discord.gg/Bqt6xrs)  or via mail at [info@xyflow.com](mailto:info@xyflow.com). If you build your own devtools using these ideas, we’d love to hear about it!

---

## Create a slide show presentation with React Flow - React Flow

URL: https://reactflow.dev/learn/tutorials/slide-shows-with-react-flow

We recently published the findings from our React Flow 2023 end-of-year survey with an [interactive presentation](https://reactflow.dev/developer-survey-2023) of the key findings, using React Flow itself. There were lots of useful bits built into this slideshow app, so we wanted to share how we built it!

![Screenshot of slides laid out on an infinite canvas, each with information pulled from a survey of React Flow users](https://reactflow.dev/_next/image?url=%2Fimg%2Ftutorials%2Fpresentation%2Fsurvey.png&w=3840&q=75)

Our 2023 end of year survey app was made up of many static nodes and buttons to navigate between them.

By the end of this tutorial, you will have built a presentation app with

* Support for markdown slides
* Keyboard navigation around the viewport
* Automatic layouting
* Click-drag panning navigation (à la Prezi)

Along the way, you’ll learn a bit about the basics of layouting algorithms, creating static flows, and custom nodes.

Once you’re done, the app will look like this!

To follow along with this tutorial we’ll assume you have a basic understanding of [React](https://reactjs.org/docs/getting-started.html)  and [React Flow](https://reactflow.dev/learn/concepts/terms-and-definitions), but if you get stuck on the way feel free to reach out to us on [Discord](https://discord.com/invite/RVmnytFmGW) !

Here’s the [repo with the final code](https://github.com/xyflow/react-flow-slide-show)  if you’d like to skip ahead or refer to it as we go.

Let’s get started!

###### Setting up the project[](#setting-up-the-project)


We like to recommend using [Vite](https://vitejs.dev/)  when starting new React Flow projects, and this time we’ll use TypeScript too. You can scaffold a new project with the following command:

```typescript
npm create vite@latest -- --template react-ts
```

If you’d prefer to follow along with JavaScript feel free to use the `react` template instead. You can also follow along in your browser by using our Codesandbox templates:

Besides React Flow we only need to pull in one dependency, [`react-remark`](https://www.npmjs.com/package/react-remark), to help us render markdown in our slides.

```typescript
npm install @xyflow/react react-remark
```

We’ll modify the generated `main.tsx` to include React Flow’s styles, as well as wrap the app in a `<ReactFlowProvider />` to make sure we can access the React Flow instance inside our components;

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
 
import App from './App';
 
import '@xyflow/react/dist/style.css';
import './index.css';
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactFlowProvider>
      {/* The parent element of the React Flow component needs a width and a height
          to work properly. If you're styling your app as you follow along, you
          can remove this div and apply styles to the #root element in your CSS.
       */}
      <div style={{ width: '100vw', height: '100vh' }}>
        <App />
      </div>
    </ReactFlowProvider>
  </React.StrictMode>,
);
```

This tutorial is going to gloss over the styling of the app, so feel free to use any CSS framework or styling solution you’re familiar with. If you’re going to style your app differently from just writing CSS, for example with [Styled Components](https://reactflow.dev/examples/styling/styled-components) or [Tailwind CSS](https://reactflow.dev/examples/styling/tailwind), you can skip the import to `index.css`.

How you style your app is up to you, but you must **always** include React Flow’s styles! If you don’t need the default styles, at a minimum you should include the base styles from `@xyflow/react/dist/base.css`.

Each slide of our presentation will be a node on the canvas, so let’s create a new file `Slide.tsx` that will be our custom node used to render each slide.

```typescript
import { type Node, type NodeProps } from '@xyflow/react';
 
export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;
 
export type SlideNode = Node<SlideData, 'slide'>;
 
export type SlideData = {};
 
const style = {
  width: `${SLIDE_WIDTH}px`,
  height: `${SLIDE_HEIGHT}px`,
} satisfies React.CSSProperties;
 
export function Slide({ data }: NodeProps<SlideNode>) {
  return (
    <article className="slide nodrag" style={style}>
      <div>Hello, React Flow!</div>
    </article>
  );
}
```

We’re setting the slide width and height as constants here (rather than styling the node in CSS) because we’ll want access to those dimensions later on. We’ve also stubbed out the `SlideData` type so we can properly type the component’s props.

The last thing to do is to register our new custom node and show something on the screen.

```typescript
import { ReactFlow } from '@xyflow/react';
import { Slide } from './Slide.tsx';
 
const nodeTypes = {
  slide: Slide,
};
 
export default function App() {
  const nodes = [{ id: '0', type: 'slide', position: { x: 0, y: 0 }, data: {} }];
 
  return <ReactFlow nodes={nodes} nodeTypes={nodeTypes} fitView />;
}
```

It’s important to remember to define your `nodeTypes` object *outside* of the component (or to use React’s `useMemo` hook)! When the `nodeTypes` object changes, the entire flow is re-rendered.

With the basics put together, you can start the development server by running `npm run dev` and see the following:

Not super exciting yet, but let’s add markdown rendering and create a few slides side by side!

###### Rendering markdown[](#rendering-markdown)


We want to make it easy to add content to our slides, so we’d like the ability to write [Markdown](https://www.markdownguide.org/basic-syntax/)  in our slides. If you’re not familiar, Markdown is a simple markup language for creating formatted text documents. If you’ve ever written a README on GitHub, you’ve used Markdown!

Thanks to the `react-remark` package we installed earlier, this step is a simple one. We can use the `<Remark />` component to render a string of markdown content into our slides.

```typescript
import { type Node, type NodeProps } from '@xyflow/react';
import { Remark } from 'react-remark';
 
export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;
 
export type SlideNode = Node<SlideData, 'slide'>;
 
export type SlideData = {
  source: string;
};
 
const style = {
  width: `${SLIDE_WIDTH}px`,
  height: `${SLIDE_HEIGHT}px`,
} satisfies React.CSSProperties;
 
export function Slide({ data }: NodeProps<SlideNode>) {
  return (
    <article className="slide nodrag" style={style}>
      <Remark>{data.source}</Remark>
    </article>
  );
}
```

In React Flow, nodes can have data stored on them that can be used during rendering. In this case we’re storing the markdown content to display by adding a `source` property to the `SlideData` type and passing that to the `<Remark />` component. We can update our hardcoded nodes with some markdown content to see it in action:

```typescript
import { ReactFlow } from '@xyflow/react';
import { Slide, SLIDE_WIDTH } from './Slide';
 
const nodeTypes = {
  slide: Slide,
};
 
export default function App() {
  const nodes = [
    {
      id: '0',
      type: 'slide',
      position: { x: 0, y: 0 },
      data: { source: '# Hello, React Flow!' },
    },
    {
      id: '1',
      type: 'slide',
      position: { x: SLIDE_WIDTH, y: 0 },
      data: { source: '...' },
    },
    {
      id: '2',
      type: 'slide',
      position: { x: SLIDE_WIDTH * 2, y: 0 },
      data: { source: '...' },
    },
  ];
 
  return <ReactFlow nodes={nodes} nodeTypes={nodeTypes} fitView minZoom={0.1} />;
}
```

Note that we’ve added the `minZoom` prop to the `<ReactFlow />` component. Our slides are quite large, and the default minimum zoom level is not enough to zoom out and see multiple slides at once.

In the nodes array above, we’ve made sure to space the slides out by doing some manual math with the `SLIDE_WIDTH` constant. In the next section we’ll come up with an algorithm to automatically lay out the slides in a grid.

###### Laying out the nodes[](#laying-out-the-nodes)


We often get asked how to automatically lay out nodes in a flow, and we have some documentation on how to use common layouting libraries like dagre and d3-hierarchy in our [layouting guide](https://reactflow.dev/learn/layouting/layouting). Here you’ll be writing your own super-simple layouting algorithm, which gets a bit nerdy, but stick with us!

For our presentation app we’ll construct a simple grid layout by starting from 0,0 and updating the x or y coordinates any time we have a new slide to the left, right, up, or down.

First, we need to update our `SlideData` type to include optional ids for the slides to the left, right, up, and down of the current slide.

```typescript
export type SlideData = {
  source: string;
  left?: string;
  up?: string;
  down?: string;
  right?: string;
};
```

Storing this information on the node data directly gives us some useful benefits:

* We can write fully declarative slides without worrying about the concept of nodes and edges
* We can compute the layout of the presentation by visiting connecting slides
* We can add navigation buttons to each slide to navigate between them automatically. We’ll handle that in a later step.

The magic happens in a function we’re going to define called `slidesToElements`. This function will take an object containing all our slides addressed by their id, and an id for the slide to start at. Then it will work through each connecting slide to build an array of nodes and edges that we can pass to the `<ReactFlow />` component.

The algorithm will go something like this:

* Push the initial slide’s id and the position `{ x: 0, y: 0 }` onto a stack.
* While that stack is not empty…
    
    * Pop the current position and slide id off the stack.
    * Look up the slide data by id.
    * Push a new node onto the nodes array with the current id, position, and slide data.
    * Add the slide’s id to a set of visited slides.
    * For every direction (left, right, up, down)…
        
        * Make sure the slide has not already been visited.
        * Take the current position and update the x or y coordinate by adding or subtracting `SLIDE_WIDTH` or `SLIDE_HEIGHT` depending on the direction.
        * Push the new position and the new slide’s id onto a stack.
        * Push a new edge onto the edges array connecting the current slide to the new slide.
        * Repeat for the remaining directions…

If all goes to plan, we should be able to take a stack of slides shown below and turn them into a neatly laid out grid!

![](https://reactflow.dev/_next/image?url=%2Fimg%2Ftutorials%2Fpresentation%2Fideal-layout.png&w=3840&q=75)

Let’s see the code. In a file called `slides.ts` add the following:

```typescript
import { SlideData, SLIDE_WIDTH, SLIDE_HEIGHT } from './Slide';
 
export const slidesToElements = (initial: string, slides: Record<string, SlideData>) => {
  // Push the initial slide's id and the position `{ x: 0, y: 0 }` onto a stack.
  const stack = [{ id: initial, position: { x: 0, y: 0 } }];
  const visited = new Set();
  const nodes = [];
  const edges = [];
 
  // While that stack is not empty...
  while (stack.length) {
    // Pop the current position and slide id off the stack.
    const { id, position } = stack.pop();
    // Look up the slide data by id.
    const data = slides[id];
    const node = { id, type: 'slide', position, data };
 
    // Push a new node onto the nodes array with the current id, position, and slide
    // data.
    nodes.push(node);
    // add the slide's id to a set of visited slides.
    visited.add(id);
 
    // For every direction (left, right, up, down)...
    // Make sure the slide has not already been visited.
    if (data.left && !visited.has(data.left)) {
      // Take the current position and update the x or y coordinate by adding or
      // subtracting `SLIDE_WIDTH` or `SLIDE_HEIGHT` depending on the direction.
      const nextPosition = {
        x: position.x - SLIDE_WIDTH,
        y: position.y,
      };
 
      // Push the new position and the new slide's id onto a stack.
      stack.push({ id: data.left, position: nextPosition });
      // Push a new edge onto the edges array connecting the current slide to the
      // new slide.
      edges.push({ id: `${id}->${data.left}`, source: id, target: data.left });
    }
 
    // Repeat for the remaining directions...
  }
 
  return { nodes, edges };
};
```

We’ve left out the code for the right, up, and down directions for brevity, but the logic is the same for each direction. We’ve also included the same breakdown of the algorithm as comments, to help you navigate the code.

Below is a demo app of the layouting algorithm, you can edit the `slides` object to see how adding slides to different directions affects the layout. For example, try extending 4’s data to include `down: '5'` and see how the layout updates.

If you spend a little time playing with this demo, you’ll likely run across two limitations of this algorithm:

* It is possible to construct a layout that overlaps two slides in the same position.
* The algorithm will ignore nodes that cannot be reached from the initial slide.

Addressing these shortcomings is totally possible, but a bit beyond the scope of this tutorial. If you give a shot, be sure to share your solution with us on the [discord server](https://discord.com/invite/RVmnytFmGW) !

With our layouting algorithm written, we can hop back to `App.tsx` and remove the hardcoded nodes array in favor of the new `slidesToElements` function.

```typescript
import { ReactFlow } from '@xyflow/react';
import { slidesToElements } from './slides';
import { Slide, SlideData, SLIDE_WIDTH } from './Slide';
 
const slides: Record<string, SlideData> = {
  '0': { source: '# Hello, React Flow!', right: '1' },
  '1': { source: '...', left: '0', right: '2' },
  '2': { source: '...', left: '1' },
};
 
const nodeTypes = {
  slide: Slide,
};
 
const initialSlide = '0';
const { nodes, edges } = slidesToElements(initialSlide, slides);
 
export default function App() {
  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ nodes: [{ id: initialSlide }] }}
      minZoom={0.1}
    />
  );
}
```

The slides in our flow are static, so we can move the `slidesToElements` call *outside* the component to make sure we’re not recalculating the layout if the component re-renders. Alternatively, you could use React’s `useMemo` hook to define things inside the component but only calculate them once.

Because we have the idea of an “initial” slide now, we’re also using the `fitViewOptions` to ensure the initial slide is the one that is focused when the canvas is first loaded.

###### Navigating between slides[](#navigating-between-slides)


So far we have our presentation laid out in a grid but we have to manually pan the canvas to see each slide, which isn’t very practical for a presentation! We’re going to add three different ways to navigate between slides:

* Click-to-focus on nodes for jumping to different slides by clicking on them.
* Navigation buttons on each slide for moving sequentially between slides in any valid direction.
* Keyboard navigation using the arrow keys for moving around the presentation without using the mouse or interacting with a slide directly.

##### Focus on click[](#focus-on-click)


The `<ReactFlow />` element can receive an [`onNodeClick`](https://reactflow.dev/api-reference/react-flow#on-node-click) callback that fires when *any* node is clicked. Along with the mouse event itself, we also receive a reference to the node that was clicked on, and we can use that to pan the canvas thanks to the `fitView` method.

[`fitView`](https://reactflow.dev/api-reference/types/react-flow-instance#fit-view) is a method on the React Flow instance, and we can get access to it by using the [`useReactFlow`](https://reactflow.dev/api-reference/types/react-flow-instance#use-react-flow) hook.

```typescript
import { useCallback } from 'react';
import { ReactFlow, useReactFlow, type NodeMouseHandler } from '@xyflow/react';
import { Slide, SlideData, SLIDE_WIDTH } from './Slide';
 
const slides: Record<string, SlideData> = {
  ...
}
 
const nodeTypes = {
  slide: Slide,
};
 
const initialSlide = '0';
const { nodes, edges } = slidesToElements(initialSlide, slides);
 
export default function App() {
  const { fitView } = useReactFlow();
  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      fitView({ nodes: [node], duration: 150 });
    },
    [fitView],
  );
 
  return (
    <ReactFlow
      ...
      fitViewOptions={{ nodes: [{ id: initialSlide }] }}
      onNodeClick={handleNodeClick}
    />
  );
}
```

It’s important to remember to include `fitView` as in the dependency array of our `handleNodeClick` callback. That’s because the `fitView` function is replaced once React Flow has initialized the viewport. If you forget this step you’ll likely find out that `handleNodeClick` does nothing at all (and yes, we also forget this ourselves sometimes too ).

Calling `fitView` with no arguments would attempt to fit every node in the graph into view, but we only want to focus on the node that was clicked! The [`FitViewOptions`](https://reactflow.dev/api-reference/types/fit-view-options) object lets us provide an array of just the nodes we want to focus on: in this case, that’s just the node that was clicked.

##### Slide controls[](#slide-controls)


Clicking to focus a node is handy for zooming out to see the big picture before focusing back in on a specific slide, but it’s not a very practical way for navigating around a presentation. In this step we’ll add some controls to each slide that allow us to move to a connected slide in any direction.

Let’s add a `<footer>` to each slide that conditionally renders a button in any direction with a connected slide. We’ll also preemptively create a `moveToNextSlide` callback that we’ll use in a moment.

```typescript
import { type NodeProps, fitView } from '@xyflow/react';
import { Remark } from 'react-remark';
import { useCallback } from 'react';
 
...
 
export function Slide({ data }: NodeProps<SlideNide>) {
  const moveToNextSlide = useCallback((id: string) => {}, []);
 
  return (
    <article className="slide nodrag" style={style}>
      <Remark>{data.source}</Remark>
      <footer className="slide__controls nopan">
        {data.left && (<button onClick={() => moveToNextSlide(data.left)}>←</button>)}
        {data.up && (<button onClick={() => moveToNextSlide(data.up)}>↑</button>)}
        {data.down && (<button onClick={() => moveToNextSlide(data.down)}>↓</button>)}
        {data.right && (<button onClick={() => moveToNextSlide(data.right)}>→</button>)}
      </footer>
    </article>
  );
}
```

You can style the footer however you like, but it’s important to add the `"nopan"` class to prevent prevent the canvas from panning as you interact with any of the buttons.

To implement `moveToSlide`, we’ll make use of `fitView` again. Previously we had a reference to the actual node that was clicked on to pass to `fitView`, but this time we only have a node’s id. You might be tempted to look up the target node by its id, but actually that’s not necessary! If we look at the type of [`FitViewOptions`](https://reactflow.dev/api-reference/types/fit-view-options) we can see that the array of nodes we pass in only *needs* to have an `id` property:

https://reactflow.dev/api-reference/types/fit-view-options

```typescript
export type FitViewOptions = {
  padding?: number;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  duration?: number;
  nodes?: (Partial<Node> & { id: Node['id'] })[];
};
```

`Partial<Node>` means that all of the fields of the `Node` object type get marked as optional, and then we intersect that with `{ id: Node['id'] }` to ensure that the `id` field is always required. This means we can just pass in an object with an `id` property and nothing else, and `fitView` will know what to do with it!

```typescript
import { type NodeProps, useReactFlow } from '@xyflow/react';
 
export function Slide({ data }: NodeProps<SlideNide>) {
  const { fitView } = useReactFlow();
 
  const moveToNextSlide = useCallback(
    (id: string) => fitView({ nodes: [{ id }] }),
    [fitView],
  );
 
  return (
    <article className="slide" style={style}>
      ...
    </article>
  );
}
```

##### Keyboard navigation[](#keyboard-navigation)


The final piece of the puzzle is to add keyboard navigation to our presentation. It’s not very convenient to have to *always* click on a slide to move to the next one, so we’ll add some keyboard shortcuts to make it easier. React Flow lets us listen to keyboard events on the `<ReactFlow />` component through handlers like [`onKeyDown`](https://reactflow.dev/api-reference/react-flow#on-key-down).

Up until now the slide currently focused is implied by the position of the canvas, but if we want to handle key presses on the entire canvas we need to *explicitly* track the current slide. We need to this because we need to know which slide to navigate to when an arrow key is pressed!

```typescript
import { useState, useCallback } from 'react';
import { ReactFlow, useReactFlow } from '@xyflow/react';
import { Slide, SlideData, SLIDE_WIDTH } from './Slide';
 
const slides: Record<string, SlideData> = {
  ...
}
 
const nodeTypes = {
  slide: Slide,
};
 
const initialSlide = '0';
const { nodes, edges } = slidesToElements(initialSlide, slides)
 
export default function App() {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const { fitView } = useReactFlow();
 
  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      fitView({ nodes: [node] });
      setCurrentSlide(node.id);
    },
    [fitView],
  );
 
  return (
    <ReactFlow
      ...
      onNodeClick={handleNodeClick}
    />
  );
}
```

Here we’ve added a bit of state, `currentSlide`, to our flow component and we’re making sure to update it whenever a node is clicked. Next, we’ll write a callback to handle keyboard events on the canvas:

```typescript
export default function App() {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const { fitView } = useReactFlow();
 
  ...
 
  const handleKeyPress = useCallback<KeyboardEventHandler>(
    (event) => {
      const slide = slides[currentSlide];
 
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowRight':
          const direction = event.key.slice(5).toLowerCase();
          const target = slide[direction];
 
          if (target) {
            event.preventDefault();
            setCurrentSlide(target);
            fitView({ nodes: [{ id: target }] });
          }
      }
    },
    [currentSlide, fitView],
  );
 
  return (
    <ReactFlow
      ...
      onKeyPress={handleKeyPress}
    />
  );
}
```

To save some typing we’re extracting the direction from the key pressed - if the user pressed `'ArrowLeft'` we’ll get `'left'` and so on. Then, if there is actually a slide connected in that direction we’ll update the current slide and call `fitView` to navigate to it!

We’re also preventing the default behavior of the arrow keys to prevent the window from scrolling up and down. This is necessary for this tutorial because the canvas is only one part of the page, but for an app where the canvas is the entire viewport you might not need to do this.

And that’s everything! To recap let’s look at the final result and talk about what we’ve learned.

###### Final thoughts[](#final-thoughts)


Even if you’re not planning on making the next [Prezi](https://prezi.com/) , we’ve still looked at a few useful features of React Flow in this tutorial:

* The [`useReactFlow`](https://reactflow.dev/api-reference/hooks/use-react-flow) hook to access the `fitView` method.
* The [`onNodeClick`](https://reactflow.dev/api-reference/react-flow#on-node-click) event handler to listen to clicks on every node in a flow.
* The [`onKeyPress`](https://reactflow.dev/api-reference/react-flow#on-key-press) event handler to listen to keyboard events on the entire canvas.

We’ve also looked at how to implement a simple layouting algorithm ourselves. Layouting is a *really* common question we get asked about, but if your needs aren’t that complex you can get quite far rolling your own solution!

If you’re looking for ideas on how to extend this project, you could try addressing the issues we pointed out with the layouting algorithm, coming up with a more sophisticated `Slide` component with different layouts, or something else entirely.

You can use the completed [source code](https://github.com/xyflow/react-flow-slide-show)  as a starting point, or you can just keep building on top of what we’ve made today. We’d love to see what you build so please share it with us over on our [Discord server](https://discord.com/invite/RVmnytFmGW)  or [Twitter](https://twitter.com/reactflowdev) .

---

## Build a Mind Map App with React Flow - React Flow

URL: https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow

In this tutorial, you will learn to create a simple mind map tool with React Flow that can be used for brainstorming, organizing an idea, or mapping your thoughts in a visual way. To build this app, we’ll be using state management, custom nodes and edges, and more.

###### It’s Demo Time![](#-its-demo-time)


Before we get our hands dirty, I want to show you the mind-mapping tool we’ll have by the end of this tutorial:

If you’d like to live dangerously and dive right into the code, you can find the source code on [Github](https://github.com/xyflow/react-flow-mindmap-app) .

###### Getting started[](#-getting-started)


To do this tutorial you will need some knowledge of [React](https://reactjs.org/docs/getting-started.html)  and [React Flow](https://reactflow.dev/learn/concepts/terms-and-definitions) (hi, that’s us! it’s an open source library for building node-based UIs like workflow tools, ETL pipelines, and [more](https://reactflow.dev/showcase/) .)

We’ll be using [Vite](https://vitejs.dev/)  to develop our app, but you can also use [Create React App](https://create-react-app.dev/)  or any other tool you like. To scaffold a new React app with Vite you need to do:

```typescript
npm create vite@latest reactflow-mind-map -- --template react
```

if you would like to use Typescript:

```typescript
npm create vite@latest reactflow-mind-map -- --template react-ts
```

After the initial setup, you need to install some packages:

```typescript
npm install reactflow zustand classcat nanoid
```

We are using [Zustand](https://github.com/pmndrs/zustand)  for managing the state of our application. It’s a bit like Redux but way smaller and there’s less boilerplate code to write. React Flow also uses Zustand, so the installation comes with no additional cost. (For this tutorial we are using Typescript but you can also use plain Javascript.)

To keep it simple we are putting all of our code in the `src/App` folder. For this you need to create the `src/App` folder and add an index file with the following content:

###### src/App/index.tsx[](#srcappindextsx)


```typescript
import { ReactFlow, Controls, Panel } from '@xyflow/react';
 
// we have to import the React Flow styles for it to work
import '@xyflow/react/dist/style.css';
 
function Flow() {
  return (
    <ReactFlow>
      <Controls showInteractive={false} />
      <Panel position="top-left">React Flow Mind Map</Panel>
    </ReactFlow>
  );
}
 
export default Flow;
```

This will be our main component for rendering the mind map. There are no nodes or edges yet, but we added the React Flow [`Controls`](https://reactflow.dev/api-reference/components/controls) component and a [`Panel`](https://reactflow.dev/api-reference/components/panel) to display the title of our app.

To be able to use React Flow hooks, we need to wrap the application with the [`ReactFlowProvider`](https://reactflow.dev/api-reference/react-flow-provider) component in our main.tsx (entry file for vite). We are also importing the newly created `App/index.tsx` and render it inside the `ReactFlowProvider.` Your main file should look like this:

###### src/main.tsx[](#srcmaintsx)


```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
 
import App from './App';
 
import './index.css';
 
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>,
);
```

The parent container of the React Flow component needs a width and a height to work properly. Our app is a fullscreen app, so we add these rules to the `index.css` file:

###### src/index.css[](#srcindexcss)


```typescript
body {
  margin: 0;
}
 
html,
body,
#root {
  height: 100%;
}
```

We are adding all styles of our app to the `index.css` file (you could also use a CSS-in-JS library like [Styled Components](https://reactflow.dev/examples/styling/styled-components) or [Tailwind](https://reactflow.dev/examples/styling/tailwind)). Now you can start the development server with `npm run dev` and you should see the following:

###### A store for nodes and edges[](#-a-store-for-nodes-and-edges)


As mentioned above, we are using Zustand for state management. For this, we create a new file in our `src/App` folder called `store.ts`:

###### src/App/store.ts[](#srcappstorets)


```typescript
import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { createWithEqualityFn } from 'zustand/traditional';
 
export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
};
 
const useStore = createWithEqualityFn<RFState>((set, get) => ({
  nodes: [
    {
      id: 'root',
      type: 'mindmap',
      data: { label: 'React Flow Mind Map' },
      position: { x: 0, y: 0 },
    },
  ],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
}));
 
export default useStore;
```

It seems like a lot of code, but it’s mostly types The store keeps track of the nodes and edges and handles the change events. When a user drags a node, React Flow fires a change event, the store then applies the changes and the updated nodes get rendered. (You can read more about this in our [state management library guide](https://reactflow.dev/api-reference/hooks/use-store).)

As you can see we start with one initial node placed at `{ x: 0, y: 0 }` of type ‘mindmap’. To connect the store with our app, we use the `useStore` hook:

###### src/App/index.tsx[](#srcappindextsx-1)


```typescript
import { ReactFlow, Controls, Panel, NodeOrigin } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
 
import useStore, { RFState } from './store';
 
// we have to import the React Flow styles for it to work
import '@xyflow/react/dist/style.css';
 
const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});
 
// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0.5];
 
function Flow() {
  // whenever you use multiple values, you should use shallow to make sure the component only re-renders when one of the values changes
  const { nodes, edges, onNodesChange, onEdgesChange } = useStore(selector, shallow);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeOrigin={nodeOrigin}
      fitView
    >
      <Controls showInteractive={false} />
      <Panel position="top-left">React Flow Mind Map</Panel>
    </ReactFlow>
  );
}
 
export default Flow;
```

We access the nodes, edges and change handlers from the store and pass them to the React Flow component. We also use the `fitView` prop to make sure that the initial node is centered in the view and set the node origin to `[0.5, 0.5]` to set the origin to the center of a node. After this, your app should look like this:

You can move the node around and zoom in and out, we are getting somewhere Now let’s add some more functionality.

###### Custom nodes and edges[](#-custom-nodes-and-edges)


We want to use a custom type called ‘mindmap’ for our nodes. We need to add a new component for this. Let’s create a new folder called `MindMapNode` with an index file under `src/App` with the following content:

###### src/App/MindMapNode/index.tsx[](#srcappmindmapnodeindextsx)


```typescript
import { Handle, NodeProps, Position } from '@xyflow/react';
 
export type NodeData = {
  label: string;
};
 
function MindMapNode({ id, data }: NodeProps<NodeData>) {
  return (
    <>
      <input defaultValue={data.label} />
 
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
 
export default MindMapNode;
```

We are using an input for displaying and editing the labels of our mind map nodes, and two handles for connecting them. This is necessary for React Flow to work; the handles are used as the start and end position of the edges.

We also add some CSS to the `index.css` file to make the nodes look a bit prettier:

###### src/index.css[](#srcindexcss-1)


```typescript
.react-flow__node-mindmap {
  background: white;
  border-radius: 2px;
  border: 1px solid transparent;
  padding: 2px 5px;
  font-weight: 700;
}
```

(For more on this, you can read the [guide to custom nodes](https://reactflow.dev/learn/customization/custom-nodes) in our docs.)

Let’s do the same for the custom edge. Create a new folder called `MindMapEdge` with an index file under `src/App`:

###### src/App/MindMapEdge/index.tsx[](#srcappmindmapedgeindextsx)


```typescript
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';
 
function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;
 
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  return <BaseEdge path={edgePath} {...props} />;
}
 
export default MindMapEdge;
```

I will get into more detail about the custom nodes and edges in the next section. For now it’s important that we can use the new types in our app, by adding the following to our `Flow` component:

```typescript
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';
 
const nodeTypes = {
  mindmap: MindMapNode,
};
 
const edgeTypes = {
  mindmap: MindMapEdge,
};
```

and then pass the newly created types to the React Flow component.

Nice! We can already change the labels of our nodes by clicking in the input field and typing something.

###### New nodes[](#-new-nodes)


We want to make it super quick for a user to create a new node. The user should be able to add a new node by clicking on a node and drag to the position where a new node should be placed. This functionality is not built into React Flow, but we can implement it by using the [`onConnectStart` and `onConnectEnd`](https://reactflow.dev/api-reference/react-flow#onconnectstart) handlers.

We are using the start handler to remember the node that was clicked and the end handler to create the new node:

###### Add to src/App/index.tsx[](#add-to-srcappindextsx)


```typescript
const connectingNodeId = useRef<string | null>(null);
 
const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
  connectingNodeId.current = nodeId;
}, []);
 
const onConnectEnd: OnConnectEnd = useCallback((event) => {
  // we only want to create a new node if the connection ends on the pane
  const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
 
  if (targetIsPane && connectingNodeId.current) {
    console.log(`add new node with parent node ${connectingNodeId.current}`);
  }
}, []);
```

Since our nodes are managed by the store, we create an action to add a new node and its edge. This is how our `addChildNode` action looks:

###### New action in src/store.ts[](#new-action-in-srcstorets)


```typescript
addChildNode: (parentNode: Node, position: XYPosition) => {
  const newNode = {
    id: nanoid(),
    type: 'mindmap',
    data: { label: 'New Node' },
    position,
    parentNode: parentNode.id,
  };
 
  const newEdge = {
    id: nanoid(),
    source: parentNode.id,
    target: newNode.id,
  };
 
  set({
    nodes: [...get().nodes, newNode],
    edges: [...get().edges, newEdge],
  });
};
```

We are using the passed node as a parent. Normally this feature is used to implement [grouping](https://reactflow.dev/examples/nodes/dynamic-grouping) or [sub flows](https://reactflow.dev/examples/layout/sub-flows). Here we are using it to move all child nodes when their parent is moved. It enables us to clean up and re-order the mind map so that we don’t have to move all child nodes manually. Let’s use the new action in our `onConnectEnd` handler:

###### Adjustments in src/App/index.tsx[](#adjustments-in-srcappindextsx)


```typescript
const store = useStoreApi();
 
const onConnectEnd: OnConnectEnd = useCallback(
  (event) => {
    const { nodeLookup } = store.getState();
    const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
 
    if (targetIsPane && connectingNodeId.current) {
      const parentNode = nodeLookup.get(connectingNodeId.current);
      const childNodePosition = getChildNodePosition(event, parentNode);
 
      if (parentNode && childNodePosition) {
        addChildNode(parentNode, childNodePosition);
      }
    }
  },
  [getChildNodePosition],
);
```

First we are getting the `nodeLookup` from the React Flow store via `store.getState()`. `nodeLookup` is a map that contains all nodes and their current state. We need it to get the position and dimensions of the clicked node. Then we check if the target of the onConnectEnd event is the React Flow pane. If it is, we want to add a new node. For this we are using our `addChildNode` and the newly created `getChildNodePosition` helper function.

###### Helper function in src/App/index.tsx[](#helper-function-in-srcappindextsx)


```typescript
const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
  const { domNode } = store.getState();
 
  if (
    !domNode ||
    // we need to check if these properties exist, because when a node is not initialized yet,
    // it doesn't have a positionAbsolute nor a width or height
    !parentNode?.computed?.positionAbsolute ||
    !parentNode?.computed?.width ||
    !parentNode?.computed?.height
  ) {
    return;
  }
 
  const panePosition = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });
 
  // we are calculating with positionAbsolute here because child nodes are positioned relative to their parent
  return {
    x:
      panePosition.x -
      parentNode.computed?.positionAbsolute.x +
      parentNode.computed?.width / 2,
    y:
      panePosition.y -
      parentNode.computed?.positionAbsolute.y +
      parentNode.computed?.height / 2,
  };
};
```

This function returns the position of the new node we want to add to our store. We are using the [`project` function](https://reactflow.dev/api-reference/types/react-flow-instance#project) to convert screen coordinates into React Flow coordinates. As mentioned earlier, child nodes are positioned relative to their parents. That’s why we need to subtract the parent position from the child node position. That was a lot to take in, let’s see it in action:

To test the new functionality you can start a connection from a handle and then end it on the pane. You should see a new node being added to the mind map.

###### Keep data in sync[](#-keep-data-in-sync)


We can already update the labels but we are not updating the nodes data object. This is important to keep our app in sync and if we want to save our nodes on the server for example. To achieve this we add a new action called `updateNodeLabel` to the store. This action takes a node id and a label. The implementation is pretty straight forward: we iterate over the existing nodes and update the matching one with the passed label:

###### src/store.ts[](#srcstorets)


```typescript
updateNodeLabel: (nodeId: string, label: string) => {
  set({
    nodes: get().nodes.map((node) => {
      if (node.id === nodeId) {
        // it's important to create a new object here, to inform React Flow about the changes
        node.data = { ...node.data, label };
      }
 
      return node;
    }),
  });
},
```

Let’s use the new action in our `MindmapNode` component:

###### src/App/MindmapNode/index.tsx[](#srcappmindmapnodeindextsx-1)


```typescript
import { Handle, NodeProps, Position } from '@xyflow/react';
 
import useStore from '../store';
 
export type NodeData = {
  label: string;
};
 
function MindMapNode({ id, data }: NodeProps<NodeData>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
 
  return (
    <>
      <input
        // from now on we can use value instead of defaultValue
        // this makes sure that the input always shows the current label of the node
        value={data.label}
        onChange={(evt) => updateNodeLabel(id, evt.target.value)}
        className="input"
      />
 
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Top} />
    </>
  );
}
 
export default MindMapNode;
```

That was quick! The input fields of the custom nodes now display the current label of the nodes. You could take your nodes data, save it on the server and then load it again.

###### Simpler UX and nicer styling[](#-simpler-ux-and-nicer-styling)


Functionality-wise we are finished with our mind map app! We can add new nodes, update their labels and move them around. But the UX and styling could use some improvements. Let’s make it easier to drag the nodes and to create new nodes!

##### 1\. A node as handle[](#1-a-node-as-handle)


Let’s use the whole node as a handle, rather than displaying the default handles. This makes it easier to create nodes, because the area where you can start a new connection gets bigger. We need to style the source handle to be the size of the node and hide the target handle visually. React Flow still needs it to connect the nodes but we don’t need to display it since we are creating new nodes by dropping an edge on the pane. We use plain old CSS to hide the target handle and position it in the center of the node:

###### src/index.css[](#srcindexcss-2)


```typescript
.react-flow__handle.target {
  top: 50%;
  pointer-events: none;
  opacity: 0;
}
```

In order to make the whole node a handle, we also update the style of the source:

###### src/index.css[](#srcindexcss-3)


```typescript
.react-flow__handle.source {
  top: 0;
  left: 0;
  transform: none;
  background: #f6ad55;
  height: 100%;
  width: 100%;
  border-radius: 2px;
  border: none;
}
```

This works but we can’t move the nodes anymore because the source handle is now the whole node and covers the input field. We fix that by using the [`dragHandle` node option](https://reactflow.dev/api-reference/types/node#drag-handle). It allows us to specify a selector for a DOM element that should be used as a drag handle. For this we adjust the custom node a bit:

###### src/App/MindmapNode/index.tsx[](#srcappmindmapnodeindextsx-2)


```typescript
import { Handle, NodeProps, Position } from '@xyflow/react';
 
import useStore from '../store';
 
export type NodeData = {
  label: string;
};
 
function MindMapNode({ id, data }: NodeProps<NodeData>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
 
  return (
    <>
      <div className="inputWrapper">
        <div className="dragHandle">
          {/* icon taken from grommet https://icons.grommet.io */}
          <svg viewBox="0 0 24 24">
            <path
              fill="#333"
              stroke="#333"
              strokeWidth="1"
              d="M15 5h2V3h-2v2zM7 5h2V3H7v2zm8 8h2v-2h-2v2zm-8 0h2v-2H7v2zm8 8h2v-2h-2v2zm-8 0h2v-2H7v2z"
            />
          </svg>
        </div>
        <input
          value={data.label}
          onChange={(evt) => updateNodeLabel(id, evt.target.value)}
          className="input"
        />
      </div>
 
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Top} />
    </>
  );
}
 
export default MindMapNode;
```

We add a wrapper div with the class name `inputWrapper` and a div with the class name `dragHandle` that acts as the drag handle (surprise!). Now we can style the new elements:

###### src/index.css[](#srcindexcss-4)


```typescript
.inputWrapper {
  display: flex;
  height: 20px;
  z-index: 1;
  position: relative;
}
 
.dragHandle {
  background: transparent;
  width: 14px;
  height: 100%;
  margin-right: 4px;
  display: flex;
  align-items: center;
}
 
.input {
  border: none;
  padding: 0 2px;
  border-radius: 1px;
  font-weight: 700;
  background: transparent;
  height: 100%;
  color: #222;
}
```

##### 2\. Activate input on focus[](#2-activate-input-on-focus)


We are almost there but we need to adjust some more details. We want to start our new connection from the center of the node. For this we set the pointer events of the input to “none” and check if the user releases the button on top of the node. Only then we want to activate the input field. We can use our `onConnectEnd` function to achieve this:

###### src/App/index.tsx[](#srcappindextsx-2)


```typescript
const onConnectEnd: OnConnectEnd = useCallback(
  (event) => {
    const { nodeLookup } = store.getState();
    const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
    const node = (event.target as Element).closest('.react-flow__node');
 
    if (node) {
      node.querySelector('input')?.focus({ preventScroll: true });
    } else if (targetIsPane && connectingNodeId.current) {
      const parentNode = nodeLookup.get(connectingNodeId.current);
      const childNodePosition = getChildNodePosition(event, parentNode);
 
      if (parentNode && childNodePosition) {
        addChildNode(parentNode, childNodePosition);
      }
    }
  },
  [getChildNodePosition],
);
```

As you see we are focusing the input field if the user releases the mouse button on top of a node. We can now add some styling so that the input field is activated (pointerEvents: all) only when it’s focused:

```typescript
/* we want the connection line to be below the node */
.react-flow .react-flow__connectionline {
  z-index: 0;
}
 
/* pointer-events: none so that the click for the connection goes through */
.inputWrapper {
  display: flex;
  height: 20px;
  position: relative;
  z-index: 1;
  pointer-events: none;
}
 
/* pointer-events: all so that we can use the drag handle (here the user cant start a new connection) */
.dragHandle {
  background: transparent;
  width: 14px;
  height: 100%;
  margin-right: 4px;
  display: flex;
  align-items: center;
  pointer-events: all;
}
 
/* pointer-events: none by default */
.input {
  border: none;
  padding: 0 2px;
  border-radius: 1px;
  font-weight: 700;
  background: transparent;
  height: 100%;
  color: #222;
  pointer-events: none;
}
 
/* pointer-events: all when it's focused so that we can type in it */
.input:focus {
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.25);
  pointer-events: all;
}
```

##### 3\. Dynamic width and auto focus[](#3-dynamic-width-and-auto-focus)


Almost done! We want to have a dynamic width for the nodes based on the length of the text. To keep it simple we do a calculation based on the length of text for this:

###### Added effect in src/app/MindMapNode.tsx[](#added-effect-in-srcappmindmapnodetsx)


```typescript
useLayoutEffect(() => {
  if (inputRef.current) {
    inputRef.current.style.width = `${data.label.length * 8}px`;
  }
}, [data.label.length]);
```

We also want to focus / activate a node right after it gets created:

###### Added effect in src/app/MindMapNode.tsx[](#added-effect-in-srcappmindmapnodetsx-1)


```typescript
useEffect(() => {
  setTimeout(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, 1);
}, []);
```

Now when you adjust a node label, the width of the node will adjust accordingly. You can also create a new node and it will be focused right away.

##### 4\. Centered edges and styling details[](#4-centered-edges-and-styling-details)


You may have noticed that the edges are not centered. We created a custom edge at the beginning for this, and now we can adjust it a bit so that the edge starts in the center of the node and not at the top of the handle (the default behavior):

###### src/App/MindMapEdge.tsx[](#srcappmindmapedgetsx)


```typescript
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';
 
function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;
 
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY: sourceY + 20,
    targetX,
    targetY,
  });
 
  return <BaseEdge path={edgePath} {...props} />;
}
 
export default MindMapEdge;
```

We are passing all props to the [`getStraightPath`](https://reactflow.dev/api-reference/utils/get-straight-path) helper function but adjust the sourceY so that it is in the center of the node.

More over we want the title to be a bit more subtle and choose a color for our background. We can do this by adjusting the color of the panel (we added the class name `"header"`) and the background color of the body element:

```typescript
body {
  margin: 0;
  background-color: #f8f8f8;
  height: 100%;
}
 
.header {
  color: #cdcdcd;
}
```

Nicely done! You can find the final code here:

###### Final thoughts[](#-final-thoughts)


What a trip! We started with an empty pane and ended with a fully functional mind map app. If you want to move on you could work on some of the following features:

* Add new nodes by clicking on the pane
* Save and restore button to store current state to local storage
* Export and import UI
* Collaborative editing

I hope you enjoyed this tutorial and learned something new! If you have any questions or feedback, feel free to reach out to me on [Twitter](https://twitter.com/moklick)  or join our [Discord server](https://discord.com/invite/RVmnytFmGW) . React Flow is an independent company financed by its users. If you want to support us you can [sponsor us on Github](https://github.com/sponsors/xyflow)  or [subscribe to one of our Pro plans](https://reactflow.dev/pro/) .

---

## Integrating React Flow and the Web Audio API - React Flow

URL: https://reactflow.dev/learn/tutorials/react-flow-and-the-web-audio-api

Today we’ll be looking at how to create an interactive audio playground using React Flow and the Web Audio API. We’ll start from scratch, first learning about the Web Audio API before looking at how to handle many common scenarios in React Flow: state management, implementing custom nodes, and adding interactivity.

![A screenshot of bleep.cafe, a visual audio programming environment. In it, there are four nodes connected together: an xy pad, an oscillator node, a volume node, and a master output.](https://reactflow.dev/_next/image?url=%2Fimg%2Ftutorials%2Fwebaudio%2Fbleep-cafe.png&w=3840&q=75)

This is bleep.cafe. We're going to learn everything we need to know to build something just like it!

A while back I shared a project I was working on to the React Flow [discord server](https://discord.com/invite/RVmnytFmGW) . It’s called [bleep.cafe](https://bleep.cafe/)  and it’s a little web app for learning digital synthesis all inside the browser. A lot of folks were interested to see how something like that was put together: most people don’t even know **their browser has a whole synth engine built in!**

This tutorial will take us step-by-step to build something similar. We may skip over some bits here and there, but for the most part if you’re new to React Flow *or* the Web Audio API you should be able to follow along and have something working by the end.

If you’re already a React Flow wizard you might want to read the first section covering the Web Audio API and then jump to the third to see how things are tied together!

But first…

###### A demo![](#a-demo)


This and other examples in this tutorial *make sound*. To avoid creating an avant-garde masterpiece, remember to mute each example before moving on!

###### The Web Audio API[](#the-web-audio-api)


Before we get stuck in to React Flow and interactive node editor goodness, we need to take a crash course on the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) . Here are the highlights you need to know:

* The Web Audio API provides a variety of different audio nodes, including sources (e.g. [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) , [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) ), effects (e.g. [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) , [DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode) , [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) ), and outputs (e.g. [AudioDestinationNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode) ).
* Audio nodes can be connected together to form a (potentially cyclic) graph. We tend to call this the audio-processing graph, signal graph, or signal chain.
* Audio processing is handled in a separate thread by native code. This means we can keep generating sounds even when the main UI thread is busy or blocked.
* An [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)  acts as the brain of an audio-processing graph. We can use it to create new audio nodes and suspend or resume audio processing entirely.

##### Hello, sound![](#hello-sound)


Let’s see some of this stuff in action and build our first Web Audio app! We won’t be doing anything too wild: we’ll make a simple mouse [theremin](http://www.thereminworld.com/Article/14232/what-s-a-theremin-) . We’ll use React for these examples and everything else moving forward (we’re called React Flow after all!) and [`vite`](https://vitejs.dev/) to handle bundling and hot reloading.

If you prefer another bundler like parcel or Create React App that’s cool too, they all do largely the same thing. You could also choose to use TypeScript instead of JavaScript. To keep things simple we won’t use it today, but React Flow is fully typed (and written entirely in TypeScript) so it’s a breeze to use!

```typescript
npm create vite@latest -- --template react
```

Vite will scaffold out a simple React application for us, but can delete the assets and jump right into `App.jsx`. Remove the demo component generated for us and start by creating a new AudioContext and putting together the nodes we need. We want an OscillatorNode to generate some tones and a GainNode to control the volume.

```typescript
// Create the brain of our audio-processing graph
const context = new AudioContext();
 
// Create an oscillator node to generate tones
const osc = context.createOscillator();
 
// Create a gain node to control the volume
const amp = context.createGain();
 
// Pass the oscillator's output through the gain node and to our speakers
osc.connect(amp);
amp.connect(context.destination);
 
// Start generating those tones!
osc.start();
```

Oscillator nodes need to be started.

Don’t forget that call to `osc.start`. The oscillator won’t start generating tones without it!

For our app, we’ll track the mouse’s position on the screen and use that to set the pitch of the oscillator node and the volume of the gain node.

```typescript
import React from 'react';
 
const context = new AudioContext();
const osc = context.createOscillator();
const amp = context.createGain();
 
osc.connect(amp);
amp.connect(context.destination);
 
osc.start();
 
const updateValues = (e) => {
  const freq = (e.clientX / window.innerWidth) * 1000;
  const gain = e.clientY / window.innerHeight;
 
  osc.frequency.value = freq;
  amp.gain.value = gain;
};
 
export default function App() {
  return <div style={{ width: '100vw', height: '100vh' }} onMouseMove={updateValues} />;
}
```

`osc.frequency.value`, `amp.gain.value`…

The Web Audio API makes a distinction between simple object properties and audio node *parameters*. That distinction appears in the form of an `AudioParam`. You can read up on them in the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam)  but for now it’s enough to know that you need to use `.value` to set the value of an `AudioParam` rather than just assigning a value to the property directly.

If you try this example as it is, you’ll probably find that nothing happens. An AudioContext often starts in a suspended state in an attempt to avoid ads hijacking our speakers. We can fix that easily by adding a click handler on the `<div />` to resume the context if it’s suspended.

```typescript
const toggleAudio = () => {
  if (context.state === 'suspended') {
    context.resume();
  } else {
    context.suspend();
  }
};
 
export default function App() {
  return (
    <div ...
      onClick={toggleAudio}
    />
  );
};
```

And that’s everything we need to start making some sounds with the Web Audio API! Here’s what we put together, in case you weren’t following along at home:

Now let’s put this knowledge to one side and take a look at how to build a React Flow project from scratch.

Already a React Flow pro? If you’re already familiar with React Flow, you can comfortably skip over the next section and head straight on over to [making some sounds](#do-sound-to-it). For everyone else, let’s take a look at how to build a React Flow project from scratch.

###### Scaffolding a React Flow project[](#scaffolding-a-react-flow-project)


Later on we’ll take what we’ve learned about the Web Audio API, oscillators, and gain nodes and use React Flow to interactively build audio-processing graphs. For now though, we need to put together an empty React Flow app.

We already have a React app set up with Vite, so we’ll keep using that. If you skipped over the last section, we ran `npm create vite@latest -- --template react` to get started. You can use whatever bundler and/or dev server you like, though. Nothing here is vite specific.

We only need three additional dependencies for this project: `@xyflow/react` for our UI (obviously!), `zustand` as our simple state management library (that’s what we use under the hood at React Flow) and `nanoid` as a lightweight id generator.

```typescript
npm install @xyflow/react zustand nanoid
```

We’re going to remove everything from our Web Audio crash course and start from scratch. Start by modifying `main.jsx` to match the following:

```typescript
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
 
// 👇 Don't forget to import the styles!
import '@xyflow/react/dist/style.css';
import './index.css';
 
const root = document.querySelector('#root');
 
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {/* React flow needs to be inside an element with a known height and width to work */}
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </div>
  </React.StrictMode>,
);
```

There are three important things to pay attention to here:

* You need to remember to **import the React Flow CSS styles** to make sure everything works correctly.
* The React Flow renderer needs to be inside an element with a known height and width, so we’ve set the containing `<div />` to take up the entire screen.
* To use some of the hooks React Flow provides, your components need to be inside a `<ReactFlowProvider />` or inside the `<ReactFlow />` component itself, so we’ve wrapped the entire app in the provider to be sure.

Next, hop into `App.jsx` and create an empty flow:

```typescript
import React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
 
export default function App() {
  return (
    <ReactFlow>
      <Background />
    </ReactFlow>
  );
}
```

We’ll expand and add on to this component over time. For now, we’ve added one of React Flow’s plugins - [`<Background />`](https://reactflow.dev/api-reference/components/background) - to check if everything is setup correctly. Go ahead and run `npm run dev` (or whatever you need to do to spin up a dev server if you didn’t choose vite) and check out your browser. You should see an empty flow:

![Screenshot of an empty React Flow graph](https://reactflow.dev/_next/image?url=%2Fimg%2Ftutorials%2Fwebaudio%2Fempty-flow.png&w=3840&q=75)

Leave the dev server running. We can keep checking back on our progress as we add new bits and bobs.

##### 1\. State management with Zustand[](#1-state-management-with-zustand)


A Zustand store will hold all the UI state for our application. In practical terms that means it’ll hold the nodes and edges of our React Flow graph, a few other pieces of state, and a handful of *actions* to update that state.

To get a basic interactive React Flow graph going we need three actions:

* `onNodesChange` to handle nodes being moved around or deleted.
* `onEdgesChange` to handle *edges* being moved around or deleted.
* `addEdge` to connect two nodes in the graph.

Go ahead and create a new file, `store.js`, and add the following:

```typescript
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { createWithEqualityFn } from 'zustand/traditional';
 
export const useStore = createWithEqualityFn((set, get) => ({
  nodes: [],
  edges: [],
 
  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
 
  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
 
  addEdge(data) {
    const id = nanoid(6);
    const edge = { id, ...data };
 
    set({ edges: [edge, ...get().edges] });
  },
}));
```

Zustand is dead simple to use. We create a function that receives both a `set` and a `get` function and returns an object with our initial state along with the actions we can use to update that state. Updates happen immutably and we can use the `set` function for that. The `get` function is how we read the current state. And… that’s it for zustand.

The `changes` argument in both `onNodesChange` and `onEdgesChange` represents events like a node or edge being moved or deleted. Fortunately, React Flow provides some [helper](https://reactflow.dev/api-reference/utils/apply-node-changes) [functions](https://reactflow.dev/api-reference/utils/apply-edge-changes) to apply those changes for us. We just need to update the store with the new array of nodes.

`addEdge` will be called whenever two nodes get connected. The `data` argument is *almost* a valid edge, it’s just missing an id. Here we’re getting nanoid to generate a 6 character random id and then adding the edge to our graph, nothing exciting.

If we hop back over to our `<App />` component we can hook React Flow up to our actions and get something working.

```typescript
import React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
 
import { useStore } from './store';
 
const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
});
 
export default function App() {
  const store = useStore(selector, shallow);
 
  return (
    <ReactFlow
      nodes={store.nodes}
      edges={store.edges}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={store.addEdge}
    >
      <Background />
    </ReactFlow>
  );
}
```

So what’s this `selector` thing all about? Zustand let’s us supply a selector function to pluck out the exact bits of state we need from the store. Combined with the `shallow` equality function, this means we typically don’t have re-renders when state we don’t care about changes.

Right now, our store is small and we actually want everything from it to help render our React Flow graph, but as we expand on it this selector will make sure we’re not re-rendering *everything* all the time.

This is everything we need to have an interactive graph: we can move nodes around, connect them together, and remove them. To demonstrate, *temporarily* add some dummy nodes to your store:

```typescript
const useStore = createWithEqualityFn((set, get) => ({
  nodes: [
    { id: 'a', data: { label: 'oscillator' }, position: { x: 0, y: 0 } },
    { id: 'b', data: { label: 'gain' }, position: { x: 50, y: 50 } },
    { id: 'c', data: { label: 'output' }, position: { x: -50, y: 100 } }
  ],
  ...
}));
```

##### 2\. Custom nodes[](#2-custom-nodes)


OK great, we have an interactive React Flow instance we can start playing with. We added some dummy nodes but they’re just the default unstyled ones right now. In this step we’ll add three custom nodes with interactive controls:

* An oscillator node and controls for the pitch and waveform type.
* A gain node and a control for the volume
* An output node and a button to toggle audio processing on and off.

Let’s create a new folder, `nodes/`, and create a file for each custom node we want to create. Starting with the oscillator we need two controls and a source handle to connect the output of the oscillator to other nodes.

```typescript
import React from 'react';
import { Handle } from '@xyflow/react';
 
import { useStore } from '../store';
 
export default function Osc({ id, data }) {
  return (
    <div>
      <div>
        <p>Oscillator Node</p>
 
        <label>
          <span>Frequency</span>
          <input
            className="nodrag"
            type="range"
            min="10"
            max="1000"
            value={data.frequency} />
          <span>{data.frequency}Hz</span>
        </label>
 
        <label>
          <span>Waveform</span>
          <select className="nodrag" value={data.type}>
            <option value="sine">sine</option>
            <option value="triangle">triangle</option>
            <option value="sawtooth">sawtooth</option>
            <option value="square">square</option>
          </select>
      </div>
 
      <Handle type="source" position="bottom" />
    </div>
  );
};
```

“nodrag” is important.

Pay attention to the `"nodrag"` class being added to both the `<input />` and `<select />` elements. It’s *super important* that you remember to add this class otherwise you’ll find that React Flow intercepts the mouse events and you’ll be stuck dragging the node around forever!

If we try rendering this custom node we’ll find that the inputs don’t do anything. That’s because the input values are fixed by `data.frequency` and `data.type` but we have no event handlers listening to changes and no mechanism to update a node’s data!

To fix the situation we need to jump back to our store and add an `updateNode` action:

```typescript
export const useStore = createWithEqualityFn((set, get) => ({
  ...
 
  updateNode(id, data) {
    set({
      nodes: get().nodes.map(node =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    });
  },
 
  ...
}));
```

This action will handle partial data updates, such that if we only want to update a node’s `frequency`, for example, we could just call `updateNode(id, { frequency: 220 }`. Now we just need to bring the action into our `<Osc />` component and call it whenever an input changes.

```typescript
import React from 'react';
import { Handle } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
 
import { useStore } from '../store';
 
const selector = (id) => (store) => ({
  setFrequency: (e) => store.updateNode(id, { frequency: +e.target.value }),
  setType: (e) => store.updateNode(id, { type: e.target.value }),
});
 
export default function Osc({ id, data }) {
  const { setFrequency, setType } = useStore(selector(id), shallow);
 
  return (
    <div>
      <div>
        <p>Oscillator Node</p>
 
        <label>
          <span>Frequency:</span>
          <input
            className="nodrag"
            type="range"
            min="10"
            max="1000"
            value={data.frequency}
            onChange={setFrequency}
          />
          <span>{data.frequency}Hz</span>
        </label>
 
        <label>
          <span>Waveform:</span>
          <select className="nodrag" value={data.type} onChange={setType}>
            <option value="sine">sine</option>
            <option value="triangle">triangle</option>
            <option value="sawtooth">sawtooth</option>
            <option value="square">square</option>
          </select>
        </label>
      </div>
 
      <Handle type="source" position="bottom" />
    </div>
  );
}
```

Hey, that `selector` is back! Notice how this time we’re using it to derive two event handlers, `setFrequency` and `setType`, from the general `updateNode` action.

The last piece of the puzzle is to tell React Flow how to render our custom node. For that we need to create a `nodeTypes` object: the keys should correspond to a node’s `type` and the value will be the React component to render.

```typescript
import React from 'react';
import { ReactFlow } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
 
import { useStore } from './store';
import Osc from './nodes/Osc';
 
const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
});
 
const nodeTypes = {
  osc: Osc,
};
 
export default function App() {
  const store = useStore(selector, shallow);
 
  return (
    <ReactFlow
      nodes={store.nodes}
      nodeTypes={nodeTypes}
      edges={store.edges}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={store.addEdge}
    >
      <Background />
    </ReactFlow>
  );
}
```

Avoid unnecessary renders.

It’s important to define `nodeTypes` outside of the `<App />` component (or use React’s [`useMemo`](https://react.dev/reference/react/useMemo)) to avoid recomputing it every render.

If you’ve got the dev server running, don’t panic if things haven’t changed yet! None of our temporary nodes have been given the right type yet, so React Flow just falls back to rendering the default node. If we change one of those nodes to be an `osc` with some initial values for `frequency` and `type` we should see our custom node being rendered.

```typescript
const useStore = createWithEqualityFn((set, get) => ({
  nodes: [
    { type: 'osc',
      id: 'a',
      data: { frequency: 220, type: 'square' },
      position: { x: 0, y: 0 }
    },
    ...
  ],
  ...
}));
```

Stuck on styling?

If you’re just implementing the code from this post as you go along, you’ll see that your custom node doesn’t look like the one in the preview above. To keep things easy to digest, we’ve left out styling in the code snippets.

To learn how to style your custom nodes, check out our docs on [theming](https://reactflow.dev/learn/customization/theming) or our example using [Tailwind](https://reactflow.dev/examples/styling/tailwind).

Implementing a gain node is pretty much the same process, so we’ll leave that one to you. Instead, we’ll turn our attention to the output node. This node will have no parameters control, but we do want to toggle signal processing on and off. That’s a bit difficult right now when we haven’t implemented any audio code yet, so in the meantime we’ll add just a flag to our store and an action to toggle it.

```typescript
const useStore = createWithEqualityFn((set, get) => ({
  ...
 
  isRunning: false,
 
  toggleAudio() {
    set({ isRunning: !get().isRunning });
  },
 
  ...
}));
```

The custom node itself is then pretty simple:

```typescript
import React from 'react';
import { Handle } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
 
const selector = (store) => ({
  isRunning: store.isRunning,
  toggleAudio: store.toggleAudio,
});
 
export default function Out({ id, data }) {
  const { isRunning, toggleAudio } = useStore(selector, shallow);
 
  return (
    <div>
      <Handle type="target" position="top" />
 
      <div>
        <p>Output Node</p>
 
        <button onClick={toggleAudio}>
          {isRunning ? (
            <span role="img" aria-label="mute">
              🔇
            </span>
          ) : (
            <span role="img" aria-label="unmute">
              🔈
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
```

Things are starting to shape up quite nicely!

The next step, then, is to…

###### Do sound to it[](#do-sound-to-it)


We have an interactive graph and we’re able to update node data, now let’s add in what we know about the Web Audio API. Start by creating a new file, `audio.js`, and create a new audio context and an empty `Map`.

```typescript
const context = new AudioContext();
const nodes = new Map();
```

The way we’ll manage our audio graph is by hooking into the different actions in our store. So we might connect two audio nodes when the `addEdge` action is called, or update an audio node’s properties when `updateNode` is called, and so on.

Hardcoded nodes

We hardcoded a couple of nodes in our store earlier on in this post but our audio graph doesn’t know anything about them! For the finished project we can do away with all these hardcoded bits, but for now it’s **really important** that we also hardcode some audio nodes.

Here’s how we did it:

```typescript
const context = new AudioContext();
const nodes = new Map();
 
const osc = context.createOscillator();
osc.frequency.value = 220;
osc.type = 'square';
osc.start();
 
const amp = context.createGain();
amp.gain.value = 0.5;
 
const out = context.destination;
 
nodes.set('a', osc);
nodes.set('b', amp);
nodes.set('c', out);
```

##### 1\. Node changes[](#1-node-changes)


Right now, there are two types of node changes that can happen in our graph and that we need to respond to: updating a node’s `data`, and removing a node from the graph. We already have an action for the former, so let’s handle that first.

In `audio.js` we’ll define a function, `updateAudioNode`, that we’ll call with a node’s id and a partial `data` object and use it to update an existing node in the `Map`:

```typescript
export function updateAudioNode(id, data) {
  const node = nodes.get(id);
 
  for (const [key, val] of Object.entries(data)) {
    if (node[key] instanceof AudioParam) {
      node[key].value = val;
    } else {
      node[key] = val;
    }
  }
}
```

Remember that properties on an audio node may be special `AudioParams` that must be updated differently to regular object properties.

Now we’ll want to update our `updateNode` action in the store to call this function as part of the update:

```typescript
import { updateAudioNode } from './audio';
 
export const useStore = createWithEqualityFn((set, get) => ({
  ...
 
  updateNode(id, data) {
    updateAudioNode(id, data);
    set({ nodes: ... });
  },
 
  ...
}));
 
```

The next change we need to handle is removing a node from the graph. If you select a node in the graph and hit backspace, React Flow will remove it. This is implicitly handled for us by the `onNodesChange` action we hooked up, but now we want some additional handling we’ll need to wire up a new action to React Flow’s `onNodesDelete` event.

This is actually pretty simple, so I’ll save you some reading and present the next three snippets of code without comment.

```typescript
export function removeAudioNode(id) {
  const node = nodes.get(id);
 
  node.disconnect();
  node.stop?.();
 
  nodes.delete(id);
}
```

The only thing to note is that `onNodesDelete` calls the provided callback with an *array* of deleted nodes, because it is possible to delete more than one node at once!

##### 2\. Edge changes[](#2-edge-changes)


We’re getting super close to actually making some sounds! All that’s left is to handle changes to our graph’s edges. Like with node changes, we already have an action to handle creating new edges and we’re also implicitly handling removed edges in `onEdgesChange`.

To handle new connections, we just need the `source` and `target` ids from the edge created in our `addEdge` action. Then we can just look up the two nodes in our `Map` and connect them up.

```typescript
export function connect(sourceId, targetId) {
  const source = nodes.get(sourceId);
  const target = nodes.get(targetId);
 
  source.connect(target);
}
```

We saw React Flow accepted an `onNodesDelete` handler and wouldn’t you know it, there’s an `onEdgesDelete` handler too! The approach we’d take to implement `disconnect` and hook it up to our store and React Flow instance is pretty much the same as before, so we’ll leave that one down to you as well!

##### 3\. Switching the speakers on[](#3-switching-the-speakers-on)


You’ll remember that our `AudioContext` probably begins in a suspended state to prevent potentially annoying autoplay issues. We already faked the data and actions we need for our `<Out />` component in the store, now we just need to replace them with the real context’s state and resume/suspend methods.

```typescript
export function isRunning() {
  return context.state === 'running';
}
 
export function toggleAudio() {
  return isRunning() ? context.suspend() : context.resume();
}
```

Although we haven’t been returning anything from our audio functions up until now, we need to return from `toggleAudio` because those methods are asynchronous and we don’t want to update the store prematurely!

```typescript
import { ..., isRunning, toggleAudio } from './audio'
 
export const useStore = createWithEqualityFn((set, get) => ({
  ...
 
  isRunning: isRunning(),
 
  toggleAudio() {
    toggleAudio().then(() => {
      set({ isRunning: isRunning() });
    });
  }
}));
```

Et voilà, we did it! We’ve now put enough together to actually *make sounds*! Let’s see what we have in action.

##### 4\. Creating new nodes[](#4-creating-new-nodes)


Up until now we have been dealing with a hard-coded set of nodes in our graph. This has been fine for prototyping but for it to actually be useful we’ll want a way to add new nodes to the graph dynamically. Our final task will be adding this functionality: we’ll work backwards starting with the audio code and ending by creating a basic toolbar.

Implementing a `createAudioNode` function will be simple enough. All we need is an id for the new node, the type of node to create, and its initial data:

```typescript
export function createAudioNode(id, type, data) {
  switch (type) {
    case 'osc': {
      const node = context.createOscillator();
      node.frequency.value = data.frequency;
      node.type = data.type;
      node.start();
 
      nodes.set(id, node);
      break;
    }
 
    case 'amp': {
      const node = context.createGain();
      node.gain.value = data.gain;
 
      nodes.set(id, node);
      break;
    }
  }
}
```

Next we’ll need a `createNode` function in our store. The node id will be generated by nanoid and we’ll hardcode some initial data for each of the node types, so the only thing we need to pass in is the type of node to create:

```typescript
import { ..., createAudioNode } from './audio';
 
export const useStore = createWithEqualityFn((set, get) => ({
  ...
 
  createNode(type) {
    const id = nanoid();
 
    switch(type) {
      case 'osc': {
        const data = { frequency: 440, type: 'sine' };
        const position = { x: 0, y: 0 };
 
        createAudioNode(id, type, data);
        set({ nodes: [...get().nodes, { id, type, data, position }] });
 
        break;
      }
 
      case 'amp': {
        const data = { gain: 0.5 };
        const position = { x: 0, y: 0 };
 
        createAudioNode(id, type, data);
        set({ nodes: [...get().nodes, { id, type, data, position }] });
 
        break;
      }
    }
  }
}));
```

We could be a bit smarter about calculating the position of the new node, but to keep things simple we’ll just hardcode it to `{ x: 0, y: 0 }` for now.

The final piece of the puzzle is to create a toolbar component that can trigger the new `createNode` action. To do that we’ll jump back to `App.jsx` and make use of the [`<Panel />`](https://reactflow.dev/docs//api-reference/components/panel/) plugin component.

```typescript
...
import { ReactFlow,  Panel } from '@xyflow/react';
...
 
const selector = (store) => ({
  ...,
  createNode: store.createNode,
});
 
export default function App() {
  const store = useStore(selector, shallow);
 
  return (
    <ReactFlow>
      <Panel position="top-right">
        ...
      </Panel>
      <Background />
    </ReactFlow>
  );
};
```

We don’t need anything fancy here, just a couple of buttons that trigger the `createNode` action with the appropriate type:

```typescript
<Panel position="top-right">
  <button onClick={() => store.createNode('osc')}>osc</button>
  <button onClick={() => store.createNode('amp')}>amp</button>
</Panel>
```

And that’s… everything! We’ve now got a fully functional audio graph editor that can:

* Create new audio nodes
* Update node data with some UI controls
* Connect nodes together
* Delete nodes and connections
* Start and stop audio processing

Here’s the demo from the beginning, but this time you can see the source code to make sure you haven’t missed anything.

###### Final thoughts[](#final-thoughts)


Whew that was a long one, but we made it! For our efforts we’ve come out the other side with a fun little interactive audio playground, learned a little bit about the Web Audio API along the way, and have a better idea of one approach to “running” a React Flow graph.

If you’ve made it this far and are thinking “Hayleigh, I’m never going to write a Web Audio app. Did I learn *anything* useful?” Then you’re in luck, because you did! You could take our approach to connecting to the Web Audio API and apply it to some other graph-based computation engine like [behave-graph](https://github.com/bhouston/behave-graph) . In fact, some has done just that and created [behave-flow](https://github.com/beeglebug/behave-flow) !

There are still plenty of ways to expand on this project. If you’d like to keep working on it, here are some ideas:

* Add more node types.
* Allow nodes to connect to `AudioParams` on other nodes.
* Use the [`AnalyserNode`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) to visualize the output of a node or signal.
* Anything else you can think of!

And if you’re looking for inspiration, there are quite a few projects out in the wild that are using node-based UIs for audio things. Some of my favorites are [Max/MSP](https://cycling74.com/products/max/) , [Reaktor](https://www.native-instruments.com/en/products/komplete/synths/reaktor-6/) , and [Pure Data](https://puredata.info/) . Max and Reaktor are closed-source commercial software, but you can still steal some ideas from them .

You can use the completed [source code](https://github.com/xyflow/react-flow-web-audio)  as a starting point, or you can just keep building on top of what we’ve made today. We’d love to see what you build so please share it with us over on our [Discord server](https://discord.com/invite/RVmnytFmGW)  or [Twitter](https://twitter.com/xyflowdev) .

React Flow is an independent company financed by its users. If you want to support us you can [sponsor us on Github](https://github.com/sponsors/xyflow)  or [subscribe to one of our Pro plans](https://reactflow.dev/pro/) .

---

## Migrate to React Flow 12 - React Flow

URL: https://reactflow.dev/learn/troubleshooting/migrate-to-v12

You can find the docs for old versions of React Flow here: [v11](https://v11.reactflow.dev/) , [v10](https://v10.reactflow.dev/) , [v9](https://v9.reactflow.dev/) 

Before you can use the **[new features](#new-features)** that come with React Flow 12 like server side rendering, computing flows, and dark mode, here are the breaking changes you’ll have to address first. We tried to keep the breaking changes to a minimum, but some of them were necessary to implement the new features.

###### Migration guide[](#migration-guide)


Before you start to migrate, you need to install the new package.

```typescript
npm install @xyflow/react
```

##### 1\. A new npm package name[](#1-a-new-npm-package-name)


The package `reactflow` has been renamed to `@xyflow/react` and it’s not a default import anymore. You also need to adjust the style import. Before v12, React Flow was divided into multiple packages. That’s not the case anymore. If you just used the core, you now need to install the `@xyflow/react` package.

**Old API**

```typescript
// npm install reactflow
import ReactFlow from 'reactflow';
```

**New API**

```typescript
// npm install @xyflow/react
import { ReactFlow } from '@xyflow/react';
 
// you also need to adjust the style import
import '@xyflow/react/dist/style.css';
 
// or if you just want basic styles
import '@xyflow/react/dist/base.css';
```

##### 2\. Node `measured` attribute for measured `width` and `height`[](#2-node-measured-attribute-for-measured-width-and-height)


All measured node values are now stored in `node.measured`. Besides the new package name, this is the biggest change. After React Flow measures your nodes, it writes the dimensions to `node.measured.width` and `node.measured.height`. If you are using any layouting library like dagre or elk, you now need to take the dimensions from `node.measured` instead of `node`. If you are using `width` and `height`, those values will now be used as inline styles to specify the node dimensions.

**Old API**

```typescript
// getting the measured width and height
const nodeWidth = node.width;
const nodeHeight = node.height;
```

**New API**

```typescript
// getting the measured width and height
const nodeWidth = node.measured?.width;
const nodeHeight = node.measured?.height;
```

##### 3\. New dimension handling `node.width` / `node.height` vs `node.measured.width` / `node.measured.height`[](#3-new-dimension-handling-nodewidth--nodeheight-vs-nodemeasuredwidth--nodemeasuredheight)


In order to support server side rendering we had to restructure the API a bit, so that users can pass node dimensions more easily. For this we changed the behavior of the `node.width` and `node.height` attributes. In React Flow 11, those attributes were measured values and only used as a reference. In React Flow 12 those attributes are used as inline styles to specify the node dimensions. If you load nodes from a database, you probably want to remove the `width` and `height` attributes from your nodes, because the behavior is slightly different now. Using `width` and `height` now means that the dimensions are not dynamic based on the content but fixed.

**Old API**

```typescript
// in React Flow 11 you might have used node.style to set the dimensions
const nodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
    style: { width: 180, height: 40 },
  },
];
```

**New API**

```typescript
// in React Flow 12 you can used node.width and node.height to set the dimensions
const nodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
    width: 180,
    height: 40,
  },
];
```

If you want to read more about how to configure React Flow for server side rendering, you can read about it in the [server side rendering guide](https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration).

##### 4\. Updating nodes and edges[](#4-updating-nodes-and-edges)


We are not supporting node and edge updates with object mutations anymore. If you want to update a certain attribute, you need to create a new node / edge.

**Old API**

```typescript
setNodes((currentNodes) =>
  currentNodes.map((node) => {
    node.hidden = true;
    return node;
  }),
);
```

**New API**

```typescript
setNodes((currentNodes) =>
  currentNodes.map((node) => ({
    ...node,
    hidden: true,
  })),
);
```

##### 5\. Rename `onEdgeUpdate` (and related APIs) to `onReconnect`[](#5-rename-onedgeupdate-and-related-apis-to-onreconnect)


We renamed the `onEdgeUpdate` function to `onReconnect` and all related APIs (mentioned below). The new name is more descriptive and makes it clear that the function is used to reconnect edges.

* `updateEdge` renamed to `reconnectEdge`
* `onEdgeUpdateStart` renamed to `onReconnectStart`
* `onEdgeUpdate` renamed to `onReconnect`
* `onEdgeUpdateEnd` renamed to `onReconnectEnd`
* `edgeUpdaterRadius` renamed to `reconnectRadius`
* `edge.updatable` renamed to `edge.reconnectable`
* `edgesUpdatable` renamed to `edgesReconnectable`

**Old API**

```typescript
<ReactFlow
  onEdgeUpdate={onEdgeUpdate}
  onEdgeUpdateStart={onEdgeUpdateStart}
  onEdgeUpdateEnd={onEdgeUpdateEnd}
/>
```

**New API**

```typescript
<ReactFlow
  onReconnect={onReconnect}
  onReconnectStart={onReconnectStart}
  onReconnectEnd={onReconnectEnd}
/>
```

##### 6\. Rename `parentNode` to `parentId`[](#6-rename-parentnode-to-parentid)


If you are working with subflows, you need to rename `node.parentNode` to `node.parentId`. The `parentNode` attribute was a bit misleading, because it was not a reference to the parent node, but the `id` of the parent node.

**Old API**

```typescript
const nodes = [
  // some nodes ...
  {
    id: 'xyz-id',
    position: { x: 0, y: 0 },
    type: 'default',
    data: {},
    parentNode: 'abc-id',
  },
];
```

**New API**

```typescript
const nodes = [
  // some nodes ...
  {
    id: 'xyz-id',
    position: { x: 0, y: 0 },
    type: 'default',
    data: {},
    parentId: 'abc-id',
  },
];
```

##### 7\. Custom node props[](#7-custom-node-props)


We renamed the `xPos` and `yPos` props to `positionAbsoluteX` and `positionAbsoluteY`

**Old API**

```typescript
function CustomNode({ xPos, yPos }) {
  ...
}
```

**New API**

```typescript
function CustomNode({ positionAbsoluteX, positionAbsoluteY }) {
  ...
}
```

##### 8\. Handle component class names[](#8-handle-component-class-names)


We renamed some of the classes used to define the current state of a handle.

* `react-flow__handle-connecting` renamed to `connectingto` / `connectingfrom`
* `react-flow__handle-valid` renamed to `valid`

##### 9\. `getNodesBounds` options[](#9-getnodesbounds-options)


The type of the second param changed from `nodeOrigin` to `options.nodeOrigin`

**Old API**

```typescript
const bounds = getNodesBounds(nodes: Node[], nodeOrigin)
```

**New API**

```typescript
const bounds = getNodesBounds(nodes: Node[], { nodeOrigin })
```

##### 10\. Typescript changes for defining nodes and edges[](#10-typescript-changes-for-defining-nodes-and-edges)


We simplified types and fixed issues about functions where users could pass a NodeData generic. The new way is to define your own node type with a union of all your nodes. With this change, you can now have multiple node types with different data structures and always be able to distinguish by checking the `node.type` attribute.

**New API**

```typescript
type NumberNode = Node<{ value: number }, 'number'>;
type TextNode = Node<{ text: string }, 'text'>;
type AppNode = NumberNode | TextNode;
```

You can then use the `AppNode` type as the following:

```typescript
const nodes: AppNode[] = [
  { id: '1', type: 'number', data: { value: 1 }, position: { x: 100, y: 100 } },
  { id: '2', type: 'text', data: { text: 'Hello' }, position: { x: 200, y: 200 } },
];
```

```typescript
const onNodesChange: onNodesChange<AppNode> = useCallback((changes) => setNodes(nds => applyChanges(changes, nds)), []);
```

You can read more about this in the [Typescript guide](https://reactflow.dev/learn/advanced-use/typescript).

##### 11\. Rename `nodeInternals`[](#11-rename-nodeinternals)


If you are using `nodeInternals` you need to rename it to `nodeLookup`.

**Old API**

```typescript
const node = useStore((s) => s.nodeInternals.get(id));
```

**New API**

```typescript
const node = useStore((s) => s.nodeLookup.get(id));
```

##### 12\. Removal of deprecated functions[](#12-removal-of-deprecated-functions)


We removed the following deprecated functions:

* `getTransformForBounds` (replaced by `getViewportForBounds`)
* `getRectOfNodes` (replaced by `getNodesBounds`)
* `project` (replaced by `screenToFlowPosition`)
* `getMarkerEndId`
* `updateEdge` (replaced by `reconnectEdge`)

##### 13\. Custom `applyNodeChanges` and `applyEdgeChanges`[](#13-custom-applynodechanges-and-applyedgechanges)


If you wrote your own function for applying changes, you need to handle the new “replace” event. We removed the “reset” event and added a “replace” event that replaces specific nodes or edges.

###### New features[](#new-features)


Now that you successfully migrated to v12, you can use all the fancy features. As mentioned above, the biggest updates for v12 are:

##### 1\. Server side rendering[](#1-server-side-rendering)


You can define `width`, `height` and `handles` for the nodes. This makes it possible to render a flow on the server and hydrate on the client: [server side rendering guide](https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration).

* **Details:** In v11, `width` and `height` were set by the library as soon as the nodes got measured. This still happens, but we are now using `measured.width` and `measured.height` to store this information. In the previous versions there was always a lot of confusion about `width` and `height`. It’s hard to understand, that you can’t use it for passing an actual width or height. It’s also not obvious that those attributes get added by the library. We think that the new implementation solves both of the problems: `width` and `height` are optional attributes that can be used to define dimensions and everything that is set by the library, is stored in `measured`.

##### 2\. Computing flows[](#2-computing-flows)


The new hooks [`useHandleConnections`](https://reactflow.dev/api-reference/hooks/use-handle-connections) and [`useNodesData`](https://reactflow.dev/api-reference/hooks/use-nodes-data) and the new [`updateNode`](https://reactflow.dev/api-reference/hooks/use-react-flow#update-node) and [`updateNodeData`](https://reactflow.dev/api-reference/hooks/use-react-flow#update-node-data) functions (both are part of `useReactFlow`) can be used to manage the data flow between your nodes: [computing flows guide](https://reactflow.dev/learn/advanced-use/computing-flows). We also added those helpers for edges (`updateEdge` and `updateEdgeData`)!

* **Details:** Working with flows where one node data relies on another node is super common. You update node A and want to react on those changes in the connected node B. Until now everyone had to come up with a custom solution. With this version we want to change this and give you performant helpers to handle use cases like this.

##### 3\. Dark mode and CSS variables[](#3-dark-mode-and-css-variables)


React Flow now comes with a built-in dark mode, that can be toggled by using the new [`colorMode`](https://reactflow.dev/api-reference/react-flow#color-mode) prop (”light”, “dark” or “system”): [dark mode example](https://reactflow.dev/examples/styling/dark-mode)

* **Details:** With this version we want to make it easier to switch between dark and light modes and give you a better starting point for dark flows. If you pass `colorMode="dark"`, we add the class name “dark” to the wrapper and use it to adjust the styling. To make the implementation for this new feature easier on our ends, we switched to CSS variables for most of the styles. These variables can also be used in user land to customize a flow.

##### 4\. A better DX with TSDoc[](#4-a-better-dx-with-tsdoc)


We started to use TSDoc for a better DX. While developing your IDE will now show you the documentation for the props and hooks. This is a big step for us to make the library more accessible and easier to use. We will also use TSDoc in the near future to generate the documentation.

##### More features and updates[](#more-features-and-updates)


There is more! Besides the new main features, we added some minor things that were on our list for a long time:

* **[`useConnection` hook](https://reactflow.dev/api-reference/hooks/use-connection):** With this hook you can access the ongoing connection. For example, you can use it for colorizing handles styling a custom connection line based on the current start / end handles.
* **Controlled `viewport`:** This is an advanced feature. Possible use cases are to animate the viewport or round the transform for lower res screens for example. This features brings two new props: [`viewport`](https://reactflow.dev/api-reference/react-flow#viewport) and [`onViewportChange`](https://reactflow.dev/api-reference/react-flow#on-viewport-change).
* **[`ViewportPortal`](https://reactflow.dev/api-reference/components/viewport-portal) component:** This makes it possible to render elements in the viewport without the need to implement a custom node.
* **[`onDelete`](https://reactflow.dev/api-reference/react-flow#on-delete) handler**: We added a combined handler for `onDeleteNodes` and `onDeleteEdges` to make it easier to react to deletions.
* **[`onBeforeDelete`](https://reactflow.dev/api-reference/react-flow#on-before-delete) handler**: With this handler you can prevent/ manage deletions.
* **[`isValidConnection`](https://reactflow.dev/api-reference/react-flow#is-valid-connection) prop:** This makes it possible to implement one validation function for all connections. It also gets called for programmatically added edges.
* **[`autoPanSpeed`](https://reactflow.dev/api-reference/react-flow#autoPanSpeed) prop:** For controlling the speed while auto panning.
* **[`paneClickDistance`](https://reactflow.dev/api-reference/react-flow#paneClickDistance) prop:** max distance between mousedown/up that will trigger a click.
* **Background component**: add [`patternClassName`](https://reactflow.dev/api-reference/components/background#pattern-class-name) prop to be able to style the background pattern by using a class name. This is useful if you want to style the background pattern with Tailwind for example.
* **`onMove` callback** gets triggered for library-invoked viewport updates (like fitView or zoom-in)
* **`deleteElements`** now returns deleted nodes and deleted edges
* add **`origin` attribute** for nodes
* add **`selectable` attribute** for edges
* **Node Resizer updates**: child nodes don’t move when the group is resized, extent and expand is recognized correctly
* Correct types for `BezierEdge`, `StepEdge`, `SmoothStepEdge` and `StraightEdge` components
* New edges created by the library only have `sourceHandle` and `targetHandle` attributes when those attributes are set. (We used to pass `sourceHandle: null` and `targetHandle: null`)
* Edges do not mount/unmount when their z-index change
* connection line knows about the target handle position so that the path is drawn correctly
* `nodeDragThreshold` is 1 by default instead of 0
* a better selection box usability (capture while dragging out of the flow)
* add `selectable`, `deletable`, `draggable` and `parentId` to `NodeProps`
* add a warning when styles not loaded

##### Internal changes[](#internal-changes)


These changes are not really user-facing, but it could be important for folks who are working with the internal React Flow store:

* The biggest internal change is that we created a new package **@xyflow/system with framework agnostic helpers** that can be used by React Flow and Svelte Flow
    
    * **XYDrag** for handling dragging node(s) and selection
    * **XYPanZoom** for controlling the viewport panning and zooming
    * **XYHandle** for managing new connections
* We renamed `nodeInternals` to `nodeLookup`. That map serves as a lookup, but we are not creating a new map object on any change so it’s really only useful as a lookup.
* We removed the internal “reset” event and added a “replace” event to be able to update specific nodes.
* We removed `connectionNodeId`, `connectionHandleId`, `connectionHandleType` from the store and added `connection.fromHandle.nodeId`, `connection.fromHandle.id`, …
* add `data-id` to edges
* `onNodeDragStart`, `onNodeDrag` and `onNodeDragStop` also get called when user drags a selection (in addition to `onSelectionDragStart`, `onSelectionDrag`, `onSelectionDragStop`)

---

## Troubleshooting - React Flow

URL: https://reactflow.dev/learn/troubleshooting

This guide contains warnings and errors that can occur when using React Flow. We are also adding common questions and pitfalls that we collect from our [Discord Server](https://discord.gg/RVmnytFmGW) , [Github Issues](https://github.com/xyflow/xyflow/issues)  and [Github Discussions](https://github.com/xyflow/xyflow/discussions) .

##### Warning: Seems like you have not used zustand provider as an ancestor.[](#warning-seems-like-you-have-not-used-zustand-provider-as-an-ancestor)


This usually happens when:

**A:** You have two different versions of @reactflow/core installed.  
**B:** You are trying to access the internal React Flow state outside of the React Flow context.

###### Solution for A[](#solution-for-a)


Update reactflow and @reactflow/node-resizer (in case you are using it), remove node\_modules and package-lock.json and reinstall the dependencies.

###### Solution for B[](#solution-for-b)


A possible solution is to wrap your component with a [`<ReactFlowProvider />`](https://reactflow.dev/api-reference/react-flow-provider) or move the code that is accessing the state inside a child of your React Flow instance.

This will cause an error:

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
function FlowWithoutProvider(props) {
  // cannot access the state here
  const reactFlowInstance = useReactFlow();
 
  return <ReactFlow {...props} />;
}
 
export default FlowWithoutProvider;
```

This will cause an error, too:

```typescript
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
function Flow(props) {
  // still cannot access the state here
  // only child components of this component can access the state
  const reactFlowInstance = useReactFlow();
 
  return (
    <ReactFlowProvider>
      <ReactFlow {...props} />
    </ReactFlowProvider>
  );
}
 
export default FlowWithProvider;
```

As soon as you want to access the internal state of React Flow (for example by using the `useReactFlow` hook), you need to wrap your component with a `<ReactFlowProvider />`. Here the wrapping is done outside of the component:

```typescript
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
function Flow(props) {
  // you can access the internal state here
  const reactFlowInstance = useReactFlow();
 
  return <ReactFlow {...props} />;
}
 
// wrapping with ReactFlowProvider is done outside of the component
function FlowWithProvider(props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
 
export default FlowWithProvider;
```

##### It looks like you have created a new nodeTypes or edgeTypes object.[](#it-looks-like-you-have-created-a-new-nodetypes-or-edgetypes-object-)


If this wasn’t on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.

This warning appears when the `nodeTypes` or `edgeTypes` properties change after the initial render. The `nodeTypes` or `edgeTypes` should only be changed dynamically in very rare cases. Usually, they are defined once, along with all the types you use in your application. It can happen easily that you are defining the nodeTypes or edgeTypes object inside of your component render function, which will cause React Flow to re-render every time your component re-renders.

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
import MyCustomNode from './MyCustomNode';
 
function Flow(props) {
  // new object being created on every render
  // causing unnecessary re-renders
  const nodeTypes = {
    myCustomNode: MyCustomNode,
  };
 
  return <ReactFlow nodeTypes={nodeTypes} />;
}
 
export default Flow;
```

Recommended implementation:

```typescript
import { ReactFlow } from '@xyflow/react';
import MyCustomNode from './MyCustomNode';
 
// defined outside of the component
const nodeTypes = {
  myCustomNode: MyCustomNode,
};
 
function Flow(props) {
  return <ReactFlow nodeTypes={nodeTypes} />;
}
 
export default Flow;
```

Alternative implementation:

You can use this if you want to change your nodeTypes dynamically without causing unnecessary re-renders.

```typescript
import { useMemo } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
import MyCustomNode from './MyCustomNode';
 
function Flow(props) {
  const nodeTypes = useMemo(
    () => ({
      myCustomNode: MyCustomNode,
    }),
    [],
  );
 
  return <ReactFlow nodeTypes={nodeTypes} />;
}
 
export default Flow;
```

##### Node type not found. Using fallback type “default”.[](#node-type-not-found-using-fallback-type-default)


This usually happens when you specify a custom node type for one of your nodes but do not pass the correct nodeTypes property to React Flow. The string for the type option of your custom node needs to be exactly the same as the key of the nodeTypes object.

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
import MyCustomNode from './MyCustomNode';
 
const nodes = [
  {
    id: 'mycustomnode',
    type: 'custom',
    // ...
  },
];
 
function Flow(props) {
  // nodeTypes property is missing, so React Flow cannot find the custom node component to render
  return <ReactFlow nodes={nodes} />;
}
```

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
import MyCustomNode from './MyCustomNode';
 
const nodes = [
  {
    id: 'mycustomnode',
    type: 'custom',
    // ...
  },
];
 
const nodeTypes = {
  Custom: MyCustomNode,
};
 
function Flow(props) {
  // node.type and key in nodeTypes object are not exactly the same (capitalized)
  return <ReactFlow nodes={nodes} nodeTypes={nodeTypes} />;
}
```

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
import MyCustomNode from './MyCustomNode';
 
const nodes = [
  {
    id: 'mycustomnode',
    type: 'custom',
    // ...
  },
];
 
const nodeTypes = {
  custom: MyCustomNode,
};
 
function Flow(props) {
  return <ReactFlow nodes={nodes} nodeTypes={nodeTypes} />;
}
```

##### The React Flow parent container needs a width and a height to render the graph.[](#the-react-flow-parent-container-needs-a-width-and-a-height-to-render-the-graph)


Under the hood, React Flow measures the parent DOM element to adjust the renderer. If you try to render React Flow in a regular div without a height, we cannot display the graph. If you encounter this warning, you need to make sure that your wrapper component has some CSS attached to it so that it gets a fixed height or inherits the height of its parent.

This will cause the warning:

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
function Flow(props) {
  return (
    <div>
      <ReactFlow {...props} />
    </div>
  );
}
```

```typescript
import { ReactFlow } from '@xyflow/react';
 
function Flow(props) {
  return (
    <div style={{ height: 800 }}>
      <ReactFlow {...props} />
    </div>
  );
}
```

##### Only child nodes can use a parent extent.[](#only-child-nodes-can-use-a-parent-extent)


This warning appears when you are trying to add the `extent` option to a node that does not have a parent node. Depending on what you are trying to do, you can remove the `extent` option or specify a `parentNode`.

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
const nodes = [
  {
    id: 'mycustomnode',
    extent: 'parent',
    // ...
  },
];
 
function Flow(props) {
  return <ReactFlow nodes={nodes} />;
}
```

```typescript
const nodes = [
  {
    id: 'mycustomnode',
    parentNode: 'someothernode',
    extent: 'parent',
    // ...
  },
];
 
function Flow(props) {
  return <ReactFlow nodes={nodes} />;
}
```

##### Can’t create edge. An edge needs a source and a target.[](#cant-create-edge-an-edge-needs-a-source-and-a-target)


This happens when you do not pass a `source` and a `target` option to the edge object. Without the source and target, the edge cannot be rendered.

```typescript
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
const nodes = [
  /* ... */
];
 
const edges = [
  {
    nosource: '1',
    notarget: '2',
  },
];
 
function Flow(props) {
  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

```typescript
import { ReactFlow } from '@xyflow/react';
 
const nodes = [
  /* ... */
];
 
const edges = [
  {
    source: '1',
    target: '2',
  },
];
 
function Flow(props) {
  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

##### The old edge with id=“some-id” does not exist.[](#the-old-edge-with-idsome-id-does-not-exist)


This can happen when you are trying to [reconnect an edge](https://reactflow.dev/examples/edges/reconnect-edge) but the edge you want to update is already removed from the state. This is a very rare case. Please see the [Reconnect Edge example](https://reactflow.dev/examples/edges/reconnect-edge) for implementation details.

##### Couldn’t create edge for source/target handle id: “some-id”; edge id: “some-id”.[](#couldnt-create-edge-for-sourcetarget-handle-id-some-id-edge-id-some-id)


This can happen if you are working with multiple handles and a handle is not found by its `id` property or if you haven’t [updated the node internals after adding or removing handles](https://reactflow.dev/api-reference/hooks/use-update-node-internals) programmatically. Please see the [Custom Node Example](https://reactflow.dev/examples/nodes/custom-node) for an example of working with multiple handles.

##### Marker type doesn’t exist.[](#marker-type-doesnt-exist)


This warning occurs when you are trying to specify a marker type that is not built into React Flow. The existing marker types are documented [here](https://reactflow.dev/api-reference/types/edge#edgemarker).

##### Handle: No node id found.[](#handle-no-node-id-found)


This warning occurs when you try to use a `<Handle />` component outside of a custom node component.

##### I get an error when building my app with webpack 4.[](#i-get-an-error-when-building-my-app-with-webpack-4)


If you’re using webpack 4, you’ll likely run into an error like this:

```typescript
ERROR in /node_modules/@reactflow/core/dist/esm/index.js 16:19
Module parse failed: Unexpected token (16:19)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```

React Flow is a modern JavaScript code base and makes use of lots of newer JavaScript features. By default, webpack 4 does not transpile your code and it doesn’t know how to handle React Flow.

You need to add a number of babel plugins to your webpack config to make it work:

```typescript
npm i --save-dev babel-loader@8.2.5 @babel/preset-env @babel/preset-react @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-nullish-coalescing-operator
```

and configure the loader like this:

```typescript
{
  test: /node_modules[\/\\]@?reactflow[\/\\].*.js$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', "@babel/preset-react"],
      plugins: [
        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-nullish-coalescing-operator",
      ]
    }
  }
}
```

If you’re using webpack 5, you don’t need to do anything! React Flow will work out of the box.

##### Mouse events aren’t working consistently when my nodes contain a `<canvas />` element.[](#mouse-events-arent-working-consistently-when-my-nodes-contain-a-canvas--element)


If you’re using a `<canvas />` element inside your custom node, you might run into problems with seemingly incorrect coordinates in mouse events from the canvas.

React Flow uses CSS transforms to scale nodes as you zoom in and out. However, from the DOM’s perspective, the element is still the same size. This can cause problems if you have event listeners that want to calculate the mouse position relative to the canvas element.

To remedy this in event handlers you control, you can scale your computed relative position by `1 / zoom` where `zoom` is the current zoom level of the flow. To get the current zoom level, you can use the `getZoom` method from the [`useReactFlow`](https://reactflow.dev/api-reference/hooks/use-react-flow) hook.

##### Edges are not displaying.[](#edges-are-not-displaying)


If your edges are not displaying in React Flow, this might be due to one of the following reasons:

* You have not imported the React Flow stylesheet. If you haven’t imported it, you can import it like `import '@xyflow/react/dist/style.css';`.
* If you have replaced your default nodes with a custom node, check if that custom node has appropriate `source/target` handles in the custom node component. An edge cannot be made without a handle.
* If you use an external styling library like Tailwind or Bulma, ensure it doesn’t override the edge styles. For example, sometimes styling libraries override the `.react-flow__edges` SVG selector with `overflow: hidden`, which hides the edges.
* If you are using an async operation like a request to the backend, make sure to call the `updateNodeInternals` function returned by the [`useUpdateNodeInternal`](https://reactflow.dev/api-reference/hooks/use-update-node-internals) hook after the async operation so React Flow updates the handle position internally.

##### Edges are not displaying correctly.[](#edges-are-not-displaying-correctly)


If your edges are not rendering as they should, this could be due to one of the following reasons:

* If you want to hide your handles, do not use `display: none` to hide them. Use either `opacity: 0` or `visibility: hidden`.
* If edges are not connected to the correct handle, check if you have added more than one handle of the same type(`source` or `target`) in your custom node component. If that is the case, assign IDs to them. Multiple handles of the same kind on a node need to have distinguishable IDs so that React Flow knows which handle an edge corresponds to.
* If you are changing the position of the handles (via reordering, etc.), make sure to call the `updateNodeInternals` function returned by the [`useUpdateNodeInternals`](https://reactflow.dev/api-reference/hooks/use-update-node-internals) hook after so React Flow knows to update the handle position internally.
* If you are using a custom edge and want your edge to go from the source handle to a target handle, make sure to correctly pass the `sourceX, sourceY, targetX, and targetY` props you get from the custom edge component in the edge path creation function(e.g., [`getBezierPath`](https://reactflow.dev/api-reference/utils/get-bezier-path), etc.). `sourceX, sourceY`, and `targetX, targetY` represent the `x,y` coordinates for the source and target handle, respectively.
* If the custom edge from the source or target side is not going towards the handle as expected (entering or exiting from a handle at a weird angle), make sure to pass the `sourcePosition` and `targetPosition` props you get from the custom edge component in the edge path creation function(e.g., [`getBezierPath`](https://reactflow.dev/api-reference/utils/get-bezier-path)). Passing the source/target handle position in the path creation function is necessary for the edge to start or end properly at a handle.

---

## Remove Attribution - React Flow

URL: https://reactflow.dev/learn/troubleshooting/remove-attribution

This example demonstrates how you can remove the React Flow attribution from the renderer.

If you’re considering removing the attribution, we’d first like to mention:

**If you’re using React Flow at your organization and making money from it**, we rely on your support to keep React Flow developed and maintained under an MIT License. Before you remove the attribution, [see the ways you can support React Flow to keep it running](https://reactflow.dev/pro) .

**Are you using React Flow for a personal project?** Great! Go ahead and remove the attribution. You can support us by reporting any bugs you find, sending us screenshots of your projects, and starring us on [Github](https://github.com/xyflow/xyflow) . If you start making money using React Flow or use it in an organization in the future, we would ask that you re-add the attribution or sign up for one of our subscriptions.

Thank you for supporting us ✌🏻

* [the xyflow team](https://xyflow.com/about)

---

## Getting started with React Flow Components - React Flow

URL: https://reactflow.dev/learn/tutorials/getting-started-with-react-flow-components

Recently, we launched an exciting new addition to our open-source roster: React Flow Components. These are pre-built nodes, edges, and other ui elements that you can quickly add to your React Flow applications to get up and running. The catch is these components are built on top of [shadcn/ui](https://ui.shadcn.com/)  and the shadcn CLI.

We’ve previously written about our experience and what led us to choosing shadcn over on the [xyflow blog](https://xyflow.com/blog/react-flow-components) , but in this tutorial we’re going to focus on how to get started from scratch with shadcn, Tailwind CSS, and React Flow Components.

**Wait, what’s shadcn?**

No what, **who**! Shadcn is the author of a collection of pre-designed components known as `shadcn/ui`. Notice how we didn’t say *library* there? Shadcn takes a different approach where components are added to your project’s source code and are “owned” by you: once you add a component you’re free to modify it to suit your needs!

###### Getting started[](#getting-started)


To begin with, we’ll set up a new [`vite`](https://vitejs.dev/) project along with all the dependencies and config we’ll need. Start by running the following command:

Vite is able to scaffold projects for many popular frameworks, but we only care about React! Additionally, make sure to set up a **TypeScript** project. React Flow’s documentation is a mix of JavaScript and TypeScript, but for shadcn components TypeScript is *required*!

All shadcn and React Flow components are styled with [Tailwind CSS](https://tailwindcss.com/docs/utility-first) , so we’ll need to install that and a few other dependencies next:

```typescript
npm install -D tailwindcss postcss autoprefixer
```

Tailwind is a heavily customizable utility-first CSS framework and much of that customization is done in a `tailwind.config.js` file. Fortunately, the package can generate a default config for us:

Tailwind works by scanning your project’s source code and building a CSS file that contains only the utilities you’re using. To make sure that happens we need to change two things:

* Update the `content` field in `tailwind.config.js` to include any source files that might contain Tailwind classes.

```typescript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

* Replace the generated `src/index.css` file with the Tailwind directives:

```typescript
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Finally, we can go ahead and delete the generated `src/App.css` file and update `src/App.jsx` to just render an empty `div`:

```typescript
function App() {
  return <div className="w-screen h-screen p-8"></div>;
}
 
export default App;
```

The classes `w-screen` and `h-screen` are two examples of Tailwind’s utility classes. If you’re used to styling React apps using a different approach, you might find this a bit strange at first. You can think of Tailwind classes as supercharged inline styles: they’re constrained to a set design system and you have access to responsive media queries or pseudo-classes like `hover` and `focus`.

##### Setting up shadcn/ui[](#setting-up-shadcnui)


Vite scaffolds some `tsconfig` files for us when generating a TypeScript project and we’ll need to make some changes to these so the shadcn components can work correctly. The shadcn CLI is pretty clever (we’ll get to that in a second) but it can’t account for every project structure so instead shadcn components that depend on one another make use of TypeScript’s import paths.

In both `tsconfig.json` and `tsconfig.app.json` add the following to the `compilerOptions` object:

```typescript
{
  ...
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And then we need to teach Vite how to resolve these paths:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

At this point feel free to pat yourself on the back and take a tea break. There’s a lot of up-front configuration to get through but once we have the shadcn CLI set up we’ll be able to add new components to our project with a single command - even if they have dependencies or need to modify existing files!

We can now run the following command to set up shadcn/ui in our project:

The CLI will ask you a few questions about your project and then it will generate a `components.json` file in the root of your project, and update your `tailwind.config.js` with some extensions to your theme. We can take all the default options for now:

```typescript
✔ Which style would you like to use? › New York
✔ Which color would you like to use as the base color? › Neutral
✔ Would you like to use CSS variables for theming? yes
```

###### Adding your first components[](#adding-your-first-components)


To demonstrate how powerful shadcn can be, let’s dive right into making a new **React Flow** app! Now everything is set up, we can add the [`<BaseNode />`](https://reactflow.dev/components/nodes/base-node) component with a single command:

```typescript
npx shadcn@latest add https://ui.reactflow.dev/base-node
```

This command will generate a new file `src/components/base-node.tsx` as well as update our dependencies to include `@xyflow/react`!

That `<BaseNode />` component is not a React Flow node directly. Instead, as the name implies, it’s a base that many of our other nodes build upon. You can use it to have a unified style for all of your nodes as well. Let’s see what it looks like by updating our `App.jsx` file:

```typescript
import '@xyflow/react/dist/style.css';
 
import { BaseNode } from '@/components/base-node';
 
function App() {
  return (
    <div className="w-screen h-screen p-8">
      <BaseNode selected={false}>Hi! 👋</BaseNode>
    </div>
  );
}
 
export default App;
```

Ok, not super exciting…

![A screenshot of a simple React application. It renders one element, a rounded container with a blue border and the text 'Hi! 👋' inside.](https://reactflow.dev/_next/image?url=%2Fimg%2Ftutorials%2Fcomponents%2Fbase-node.png&w=3840&q=75)

Remember that the `<BaseNode />` component is used by any *other* React Flow components we add using the shadcn CLI, so what happens if we change it? Let’s update the `<BaseNode />` component to render any text as bold monospace instead:

src/components/base-node.tsx

```typescript
import React from "react";
import { cn } from "@/lib/utils";
 
export const BaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-card p-5 text-card-foreground font-mono font-bold",
      className,
      selected ? "border-muted-foreground shadow-lg" : "",
      "hover:ring-1",
    )}
    {...props}
  />
));
BaseNode.displayName = "BaseNode";
```

Now we’ll add an actual node from the React Flow Components registry and see what happens:

```typescript
npx shadcn@latest add https://ui.reactflow.dev/tooltip-node
```

And we’ll update our `App.tsx` file to render a proper flow. We’ll use the same basic setup as most of our examples so we won’t break down the individual pieces here. If you’re still new to React Flow and want to learn a bit more about how to set up a basic flow from scratch, check out our [quickstart guide](https://reactflow.dev/learn).

```typescript
import '@xyflow/react/dist/style.css';
 
import { ReactFlow, Position, useNodesState, Node } from '@xyflow/react';
 
import { TooltipNode, TooltipContent, TooltipTrigger } from '@/components/tooltip-node';
 
function Tooltip() {
  return (
    <TooltipNode>
      <TooltipContent position={Position.Top}>Hidden Content</TooltipContent>
      <TooltipTrigger>Hover</TooltipTrigger>
    </TooltipNode>
  );
}
 
const nodeTypes = {
  tooltip: Tooltip,
};
 
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: {},
    type: 'tooltip',
  },
];
 
function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
 
  return (
    <div className="h-screen w-screen p-8">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
}
 
export default App;
```

And would you look at that, the tooltip node we added automatically uses the `<BaseNode />` component we customized!

###### Moving fast and making things[](#moving-fast-and-making-things)


Now we’ve got a basic understanding of how shadcn/ui and the CLI works, we can begin to see how easy it is to add new components and build out a flow. To see everything React Flow Components has to offer let’s build out a simple calculator flow.

First let’s remove the `<TooltipNode />` and undo our changes to `<BaseNode />`. In addition to pre-made nodes, React Flow Components also contains building blocks for creating your own custom nodes. To see them, we’ll add the `node-header` and `labeled-handle` components:

```typescript
npx shadcn@latest add \
  https://ui.reactflow.dev/node-header \
  https://ui.reactflow.dev/labeled-handle
```

Notice how adding the `node-header` component also brought with it some standard shadcn/ui components! This lets us at React Flow build richer components for you to use without re-inventing the wheel for things like dropdowns and popovers.

The first node we’ll create is a simple number node with some buttons to increment and decrement the value and a handle to connect it to other nodes. Create a folder `src/components/nodes` and then add a new file `src/components/nodes/num-node.tsx`.

Paste the following into the new file:

src/components/nodes/num-node.tsx

```typescript
import React, { useCallback } from 'react';
import { type Node, type NodeProps, Position, useReactFlow } from '@xyflow/react';
 
import { BaseNode } from '@/components/base-node';
import { LabeledHandle } from '@/components/labeled-handle';
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
} from '@/components/node-header';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
 
export type NumNode = Node<{
  value: number;
}>;
 
export function NumNode({ id, data }: NodeProps<NumNode>) {
  const { updateNodeData, setNodes } = useReactFlow();
 
  const handleReset = useCallback(() => {
    updateNodeData(id, { value: 0 });
  }, [id, updateNodeData]);
 
  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);
 
  const handleIncr = useCallback(() => {
    updateNodeData(id, { value: data.value + 1 });
  }, [id, data.value, updateNodeData]);
 
  const handleDecr = useCallback(() => {
    updateNodeData(id, { value: data.value - 1 });
  }, [id, data.value, updateNodeData]);
 
  return (
    <BaseNode>
      <NodeHeader>
        <NodeHeaderTitle>Num</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderMenuAction label="Open node menu">
            <DropdownMenuItem onSelect={handleReset}>Reset</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
          </NodeHeaderMenuAction>
        </NodeHeaderActions>
      </NodeHeader>
 
      <div className="flex gap-2 items-center mb-10">
        <Button onClick={handleDecr}>-</Button>
        <pre>{String(data.value).padStart(3, ' ')}</pre>
        <Button onClick={handleIncr}>+</Button>
      </div>
 
      <footer className="bg-gray-100 -m-5">
        <LabeledHandle title="out" type="source" position={Position.Right} />
      </footer>
    </BaseNode>
  );
}
```

This isn’t a tutorial for basic React Flow concepts like flows and custom nodes so we’re **skipping over some of the basics**. If you’re new to React Flow and want to learn how to add custom nodes and edges to a flow, check out the [guide on custom nodes](https://reactflow.dev/learn/customization/custom-nodes).

In the snippet above we’ve highlighted the imports and components that come from shadcn/ui and React Flow Components. In just a few lines of code we already have quite a capable node:

Our `<NumNode />` component…

* Has a header with a title and functional dropdown menu.
* Contains some simple controls to increment and decrement a value.
* Has a labelled handle to connect it to other nodes.

Next we’ll create a second node that will compute the sum of two input values. We don’t need to add any additional components for this node, so go ahead and create a new file `src/components/nodes/sum-node.tsx` and paste in the following:

src/components/nodes/sum-node.tsx

```typescript
import React, { useEffect } from 'react';
import {
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
  useStore,
} from '@xyflow/react';
 
import { BaseNode } from '../base-node';
import { LabeledHandle } from '../labeled-handle';
import { NodeHeader, NodeHeaderTitle } from '../node-header';
 
export type SumNode = Node<{
  value: number;
}>;
 
export function SumNode({ id }: NodeProps<SumNode>) {
  const { updateNodeData, getHandleConnections } = useReactFlow();
  const { x, y } = useStore((state) => ({
    x: getHandleValue(
      getHandleConnections({ nodeId: id, id: 'x', type: 'target' }),
      state.nodeLookup,
    ),
    y: getHandleValue(
      getHandleConnections({ nodeId: id, id: 'y', type: 'target' }),
      state.nodeLookup,
    ),
  }));
 
  useEffect(() => {
    updateNodeData(id, { value: x + y });
  }, [x, y]);
 
  return (
    <BaseNode className="w-32">
      <NodeHeader>
        <NodeHeaderTitle>Sum</NodeHeaderTitle>
      </NodeHeader>
 
      <footer className="bg-gray-100 -m-5">
        <LabeledHandle title="x" id="x" type="target" position={Position.Left} />
        <LabeledHandle title="y" id="y" type="target" position={Position.Left} />
        <LabeledHandle title="out" type="source" position={Position.Right} />
      </footer>
    </BaseNode>
  );
}
 
function getHandleValue(
  connections: Array<{ source: string }>,
  lookup: Map<string, Node<any>>,
) {
  return connections.reduce((acc, { source }) => {
    const node = lookup.get(source)!;
    const value = node.data.value;
 
    return typeof value === 'number' ? acc + value : acc;
  }, 0);
}
```

React Flow Components doesn’t just provide components for building nodes. We also provide pre-built edges and other UI elements you can drop into your flows for quick building.

To better visualize data in our calculator flow, let’s pull in the `data-edge` component. This edge renders a field from the source node’s data object as a label on the edge itself. Add the `data-edge` component to your project:

```typescript
npx shadcn@latest add https://ui.reactflow.dev/data-edge
```

The `<DataEdge />` component works by looking up a field from its source node’s `data` object. We’ve been storing the value of each node in our calculator field in a `"value"` property so we’ll update our `edgeType` object to include the new `data-edge` and we’ll update the `onConnect` handler to create a new edge of this type, making sure to set the edge’s `data` object correctly:

```typescript
import '@xyflow/react/dist/style.css';
 
import {
  ReactFlow,
  OnConnect,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Node,
} from '@xyflow/react';
 
import { NumNode } from '@/components/nodes/num-node';
import { SumNode } from '@/components/nodes/sum-node';
 
import { DataEdge } from '@/components/data-edge';
 
const nodeTypes = {
  num: NumNode,
  sum: SumNode,
};
 
const initialNodes: Node[] = [
  { id: 'a', type: 'num', data: { value: 0 }, position: { x: 0, y: 0 } },
  { id: 'b', type: 'num', data: { value: 0 }, position: { x: 0, y: 200 } },
  { id: 'c', type: 'sum', data: { value: 0 }, position: { x: 300, y: 100 } },
  { id: 'd', type: 'num', data: { value: 0 }, position: { x: 0, y: 400 } },
  { id: 'e', type: 'sum', data: { value: 0 }, position: { x: 600, y: 400 } },
];
 
const edgeTypes = {
  data: DataEdge,
};
 
const initialEdges: Edge[] = [
  {
    id: 'a->c',
    type: 'data',
    data: { key: 'value' },
    source: 'a',
    target: 'c',
    targetHandle: 'x',
  },
  {
    id: 'b->c',
    type: 'data',
    data: { key: 'value' },
    source: 'b',
    target: 'c',
    targetHandle: 'y',
  },
  {
    id: 'c->e',
    type: 'data',
    data: { key: 'value' },
    source: 'c',
    target: 'e',
    targetHandle: 'x',
  },
  {
    id: 'd->e',
    type: 'data',
    data: { key: 'value' },
    source: 'd',
    target: 'e',
    targetHandle: 'y',
  },
];
 
function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((edges) =>
        addEdge({ type: 'data', data: { key: 'value' }, ...params }, edges),
      );
    },
    [setEdges],
  );
 
  return (
    <div className="h-screen w-screen p-8">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      />
    </div>
  );
}
 
export default App;
```

Putting everything together we end up with quite a capable little calculator!

You could continue to improve this flow by adding nodes to perform other operations or to take user input using additional components from the [shadcn/ui registry](https://ui.shadcn.com/docs/components/slider) . In fact, keep your eyes peeled soon for a follow-up to this guide where we’ll show a complete application built using React Flow Components .

###### Wrapping up[](#wrapping-up)


In just a short amount of time we’ve managed to build out a fairly complete flow using the components and building blocks provided by shadcn React Flow Components. We’ve learned:

* How editing the [`<BaseNode />`](https://reactflow.dev/components/nodes/base-node) component will affect other nodes pulled from the React Flow Components registry.
* How to use building blocks like the [`<NodeHeader />`](https://reactflow.dev/components/node-blocks/node-header) and [`<LabeledHandle />`](https://reactflow.dev/learn/tutorials/components/handles/labeled-handle) components to build our own custom nodes without starting from scratch.
* That React Flow Components also provides custom edges like the [`<DataEdge />`](https://reactflow.dev/components/edges/data-edge) to drop into our applications.

And thanks to the power of Tailwind, tweaking the visual style of these components is as simple as editing `tailwind.config.js` and editing the variables in your CSS file.

That’s all for now! You can see all the components we currently have available over on the [components docs page](https://reactflow.dev/components). The React Flow Components project is still in its infancy: if you have any suggestions or requests for new components we’d love to hear about them. Or perhaps you’re already starting to build something with shadcn and React Flow Components. Either way make sure you let us know on our [Discord server](https://discord.com/invite/RVmnytFmGW)  or on [Twitter](https://twitter.com/xyflowdev) !

---

## Migrate to React Flow v11 - React Flow

URL: https://reactflow.dev/learn/troubleshooting/migrate-to-v11

You can find the docs for old versions of React Flow here: [v11](https://v11.reactflow.dev/) , [v10](https://v10.reactflow.dev/) , [v9](https://v9.reactflow.dev/) 

A lot changed in v11 but this time we’ve tried to keep the breaking changes small. The biggest change is the new package name `reactflow` and the new repo structure. React Flow is now managed as a monorepo and separated into multiple packages that can be installed separately. In addition to that, there are some API changes and new APIs introduced in v11. This guide explains the changes in detail and helps you to migrate from v10 to v11.

React Flow 11 only works with **React 17** or greater

###### New Features[](#new-features)


* **Better [Accessibility](https://reactflow.dev/learn/advanced-use/accessibility)**
    
    * Nodes and edges are focusable, selectable, moveable and deletable with the keyboard.
    * `aria-` default attributes for all elements and controllable via `ariaLabel` options
    * Keyboard controls can be disabled with the new `disableKeyboardA11y` prop
* **Better selectable edges** via new edge option: `interactionWidth` - renders invisible edge that makes it easier to interact
* **Better routing for smoothstep and step edges**: [https://twitter.com/reactflowdev/status/1567535405284614145](https://twitter.com/reactflowdev/status/1567535405284614145)
* **Nicer edge updating behavior**: [https://twitter.com/reactflowdev/status/1564966917517021184](https://twitter.com/reactflowdev/status/1564966917517021184)
* **Node origin**: The new `nodeOrigin` prop lets you control the origin of a node. Useful for layouting.
* **New background pattern**: `BackgroundVariant.Cross` variant
* **[`useOnViewportChange`](https://reactflow.dev/api-reference/hooks/use-on-viewport-change) hook** - handle viewport changes within a component
* **[`use-on-selection-change`](https://reactflow.dev/api-reference/hooks/use-on-selection-change) hook** - handle selection changes within a component
* **[`useNodesInitialized`](https://reactflow.dev/api-reference/hooks/use-nodes-initialized) hook** - returns true if all nodes are initialized and if there is more than one node
* **Deletable option** for Nodes and edges
* **New Event handlers**: `onPaneMouseEnter`, `onPaneMouseMove` and `onPaneMouseLeave`
* **Edge `pathOptions`** for `smoothstep` and `default` edges
* **Nicer cursor defaults**: Cursor is grabbing, while dragging a node or panning
* **Pane moveable** with middle mouse button
* **Pan over nodes** when they are not draggable (`draggable=false` or `nodesDraggable` false)
    
    * you can disable this behavior by adding the class name `nopan` to a wrapper of a custom node
* **[`<BaseEdge />`](https://reactflow.dev/api-reference/components/base-edge) component** that makes it easier to build custom edges
* **[Separately installable packages](https://reactflow.dev/learn/concepts/built-in-components)**
    
    * @reactflow/core
    * @reactflow/background
    * @reactflow/controls
    * @reactflow/minimap

###### Breaking Changes[](#breaking-changes)


##### 1\. New npm package name[](#1-new-npm-package-name)


The package `react-flow-renderer` has been renamed to `reactflow`.

###### Old API[](#old-api)


```typescript
// npm install react-flow-renderer
import ReactFlow from 'react-flow-renderer';
```

###### New API[](#new-api)


```typescript
// npm install reactflow
import { ReactFlow } from '@xyflow/react';
```

##### 2\. Importing CSS is mandatory[](#2-importing-css-is-mandatory)


We are not injecting CSS anymore. **React Flow won’t work if you are not loading the styles!**

```typescript
// default styling
import '@xyflow/react/dist/style.css';
 
// or if you just want basic styles
import '@xyflow/react/dist/base.css';
```

###### 2.1. Removal of the nocss entrypoint[](#21-removal-of-the-nocss-entrypoint)


This change also means that there is no `react-flow-renderer/nocss` entry point anymore. If you used that, you need to adjust the CSS entry points as mentioned above.

##### 3\. `defaultPosition` and `defaultZoom` have been merged to `defaultViewport`[](#3-defaultposition-and-defaultzoom-have-been-merged-to-defaultviewport)


###### Old API[](#old-api-1)


```typescript
import ReactFlow from 'react-flow-renderer';
 
const Flow = () => {
  return <ReactFlow defaultPosition={[10, 15]} defaultZoom={5} />;
};
 
export default Flow;
```

###### New API[](#new-api-1)


```typescript
import { ReactFlow } from '@xyflow/react';
 
const defaultViewport: Viewport = { x: 10, y: 15, zoom: 5 };
 
const Flow = () => {
  return <ReactFlow defaultViewport={defaultViewport} />;
};
 
export default Flow;
```

##### 4\. Removal of `getBezierEdgeCenter`, `getSimpleBezierEdgeCenter` and `getEdgeCenter`[](#4-removal-of-getbezieredgecenter-getsimplebezieredgecenter-and-getedgecenter)


In v10 we had `getBezierEdgeCenter`, `getSimpleBezierEdgeCenter` and `getEdgeCenter` for getting the center of a certain edge type. In v11 we changed the helper function for creating the path, so that it also returns the center / label position of an edge.

Let’s say you want to get the path and the center / label position of a bezier edge:

###### Old API[](#old-api-2)


```typescript
import { getBezierEdgeCenter, getBezierPath } from 'react-flow-renderer';
 
const path = getBezierPath(edgeParams);
const [centerX, centerY] = getBezierEdgeCenter(params);
```

###### New API[](#new-api-2)


```typescript
import { getBezierPath } from '@xyflow/react';
 
const [path, labelX, labelY] = getBezierPath(edgeParams);
```

We avoid to call it `centerX` and `centerY` anymore, because it’s actually the label position and not always the center for every edge type.

##### 5\. Removal of `onClickConnectStop` and `onConnectStop`[](#5-removal-of-onclickconnectstop-and-onconnectstop)


###### Old API[](#old-api-3)


```typescript
import ReactFlow from 'react-flow-renderer';
 
const Flow = () => {
  const onConnectStop = () => console.log('on connect stop');
 
  return (
    <ReactFlow
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      onConnectStop={onConnectStop}
      onClickConnectStop={onConnectStop}
    />
  );
};
 
export default Flow;
```

###### New API[](#new-api-3)


```typescript
import { ReactFlow } from '@xyflow/react';
 
const Flow = () => {
  const onConnectEnd = () => console.log('on connect stop');
 
  return (
    <ReactFlow
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      onConnectEnd={onConnectEnd}
      onClickConnectEnd={onConnectEnd}
    />
  );
};
 
export default Flow;
```

##### 6\. Pan over nodes[](#6-pan-over-nodes)


In the previous versions you couldn’t pan over nodes even if they were not draggable. In v11, you can pan over nodes when `nodesDraggable=false` or node option `draggable=false`. If you want the old behavior back, you can add the class name `nopan` to the wrappers of your custom nodes.

---

## Migrate to React Flow v10 - React Flow

URL: https://reactflow.dev/learn/troubleshooting/migrate-to-v10

You can find the docs for old versions of React Flow here: [v11](https://v11.reactflow.dev/) , [v10](https://v10.reactflow.dev/) , [v9](https://v9.reactflow.dev/) 

Welcome to React Flow v10! With the major version update, there are coming many new features but also some breaking changes.

###### New Features[](#new-features)


* [**Sub Flows**](https://reactflow.dev/learn/layouting/sub-flows): You can now add nodes to a parent node and create groups and nested flows
* **Node Type ‘group’**: A new node type without handles that can be used as a group node
* **Touch Device Support**: It is now possible to connect nodes on touch devices
* **Fit View on Init**: You can use the new `fitView` prop to fit the initial view
* **Key Handling**: Not only single keys but also multiple keys and key combinations are possible now
* [**useKeyPress hook**](https://reactflow.dev/api-reference/hooks/use-key-press): A util hook for handling keyboard events
* [**useReactFlow hook**](https://reactflow.dev/api-reference/hooks/use-react-flow): Returns a React Flow instance that exposes functions to manipulate the flow
* **[useNodes](https://reactflow.dev/api-reference/hooks/use-nodes), [useEdges](https://reactflow.dev/api-reference/hooks/use-edges) and [useViewport](https://reactflow.dev/api-reference/hooks/use-viewport) hooks**: Hooks for receiving nodes, edges and the viewport
* **Edge Marker**: More options to configure the start and end markers of an edge

###### Breaking Changes[](#breaking-changes)


TLDR:

* Split the `elements` array into `nodes` and `edges` arrays and implement `onNodesChange` and `onEdgesChange` handlers (detailed guide in the [core concepts section](https://reactflow.dev/learn/concepts/core-concepts))
* Memoize your custom `nodeTypes` and `edgeTypes`
* Rename `onLoad` to `onInit`
* Rename `paneMoveable` to `panOnDrag`
* Rename `useZoomPanHelper` to `useReactFlow` (and `setTransform` to `setViewport`)
* Rename node and edge option `isHidden` to `hidden`

Detailed explanation of breaking changes:

##### 1\. Elements - Nodes and Edges[](#1-elements---nodes-and-edges)


We saw that a lot of people struggle with the semi controlled `elements` prop. It was always a bit messy to sync the local user state with the internal state of React Flow. Some of you used the internal store that was never documented and always a kind of hacky solution. For the new version we offer two ways to use React Flow - uncontrolled and controlled.

##### 1.1. Controlled `nodes` and `edges`[](#11-controlled-nodes-and-edges)


If you want to have the full control and use nodes and edges from your local state or your store, you can use the `nodes`, `edges` props in combination with the `onNodesChange` and `onEdgesChange` handlers. You need to implement these handlers for an interactive flow (if you are fine with just pan and zoom you don’t need them). You’ll receive a change when a node(s) gets initialized, dragged, selected or removed. This means that you always know the exact position and dimensions of a node or if it’s selected for example. We export the helper functions `applyNodeChanges` and `applyEdgeChanges` that you should use to apply the changes.

###### Old API[](#old-api)


```typescript
import { useState, useCallback } from 'react';
import { ReactFlow, removeElements, addEdge } from 'react-flow-renderer';
 
const initialElements = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 0 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 150, y: 100 } },
  { id: 'e1-2', source: '1', target: '2' },
];
 
const BasicFlow = () => {
  const [elements, setElements] = useState(initialElements);
  const onElementsRemove = useCallback(
    (elementsToRemove) =>
      setElements((els) => removeElements(elementsToRemove, els)),
    [],
  );
  const onConnect = useCallback((connection) =>
    setElements((es) => addEdge(connection, es)),
  );
 
  return (
    <ReactFlow
      elements={elements}
      onElementsRemove={onElementsRemove}
      onConnect={onConnect}
    />
  );
};
 
export default BasicFlow;
```

###### New API[](#new-api)


```typescript
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'react-flow-renderer';
 
const initialNodes = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 0 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 150, y: 100 } },
];
 
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
const BasicFlow = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
 
  const onNodesChange = useCallback(
    (changes) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );
  const onConnect = useCallback((connection) =>
    setEdges((eds) => addEdge(connection, eds)),
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  );
};
 
export default BasicFlow;
```

You can also use the new hooks `useNodesState` and `useEdgesState` for a quick start:

```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

related changes:

* `onElementsClick` ->`onNodeClick` and `onEdgeClick`
* `onElementsRemove` -> replaced by the `onNodesChange` and `onEdgesChange` handler

##### 1.2 Uncontrolled `defaultNodes` and `defaultEdges`[](#12-uncontrolled-defaultnodes-and-defaultedges)


The easiest way to get started is to use the `defaultNodes` and `defaultEdges` props. When you set these props, all actions are handled internally. You don’t need to add any other handlers to get a fully interactive flow with the ability to drag nodes, connect nodes and remove nodes and edges:

###### New API[](#new-api-1)


```typescript
import ReactFlow from 'react-flow-renderer';
 
const defaultNodes = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 0 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 150, y: 100 } },
];
 
const defaultEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
const BasicFlow = () => {
  return <ReactFlow defaultNodes={defaultNodes} defaultEdges={defaultEdges} />;
};
 
export default BasicFlow;
```

If you want to add, remove or update a node or edge you can only do this by using the [ReactFlow instance](https://reactflow.dev/api-reference/types/react-flow-instance) that you can receive either with the new `useReactFlow` hook or by using the `onInit` handler that gets the instance as a function param.

##### 2\. Memoize your custom `nodeTypes` and `edgeTypes`[](#2-memoize-your-custom-nodetypes-and-edgetypes)


Whenever you pass new node or edge types, we create wrapped node or edge component types in the background. This means that you should not create a new `nodeType` or `edgeType` object on every render. **Memoize your nodeTypes and edgeTypes or define them outside of the component when they don’t change**.

**Don’t do this:**

This creates a new object on every render and leads to bugs and performance issues:

```typescript
// this is bad! Don't do it.
<ReactFlow
  nodes={[]}
  nodeTypes={{
    specialType: SpecialNode, // bad!
  }}
/>
```

**Do this:**

```typescript
function Flow() {
  const nodeTypes = useMemo(() => ({ specialType: SpecialNode }), []);
 
  return <ReactFlow nodes={[]} nodeTypes={nodeTypes} />;
}
```

or create the types outside of the component when they don’t change:

```typescript
const nodeTypes = { specialType: SpecialNode };
 
function Flow() {
  return <ReactFlow nodes={[]} nodeTypes={nodeTypes} />;
}
```

##### 3\. Redux - Zustand[](#3-redux--zustand)


We switched our state management library from Redux to [Zustand](https://github.com/pmndrs/zustand) . With this change we could remove about 300LOC from our state related code. If you need to access the internal store, you can use the [`useStore` hook](https://reactflow.dev/api-reference/hooks/use-store):

###### Old API[](#old-api-1)


```typescript
import { useStoreState, useStoreActions } from 'react-flow-renderer';
 
...
 
const transform = useStoreState((store) => store.transform);
```

###### New API[](#new-api-2)


```typescript
import { useStore } from 'react-flow-renderer';
 
...
const transform = useStore((store) => store.transform);
```

You still need to wrap your component with the `<ReactFlowProvider />` if you want to access the internal store.

We are also exporting `useStoreApi` if you need to get the store in an event handler for example without triggering re-renders.

```typescript
import { useStoreApi } from 'react-flow-renderer';
 
...
 
const store = useStoreApi();
 
...
// in an event handler
const [x, y, zoom] = store.getState().transform;
```

##### 4\. onLoad - onInit[](#4-onload---oninit)


The `onLoad` callback has been renamed to `onInit` and now fires when the nodes are initialized.

###### Old API[](#old-api-2)


```typescript
const onLoad = (reactFlowInstance: OnLoadParams) => reactFlowInstance.zoomTo(2);
...
<ReactFlow
   ...
  onLoad={onLoad}
/>
```

###### New API[](#new-api-3)


```typescript
const onInit = (reactFlowInstance: ReactFlowInstance) => reactFlowInstance.zoomTo(2);
...
<ReactFlow
   ...
  onInit={onInit}
/>
```

##### 5\. paneMoveable - panOnDrag[](#5-panemoveable---panondrag)


This is more consistent with the rest of the API (`panOnScroll`, `zoomOnScroll`, etc.)

###### Old API[](#old-api-3)


```typescript
<ReactFlow
   ...
  paneMoveable={false}
/>
```

###### New API[](#new-api-4)


```typescript
<ReactFlow
   ...
  panOnDrag={false}
/>
```

##### 6\. useZoomPanHelper transform - unified in `useReactFlow`[](#6-usezoompanhelper-transform---unified-in-usereactflow)


As “transform” is also the variable name of the transform in the store and it’s not clear that `transform` is a setter we renamed it to `setViewport`. This is also more consistent with the other functions. Also, all `useZoomPanHelper` functions have been moved to the [React Flow instance](https://reactflow.dev/api-reference/types/react-flow-instance) that you get from the [`useReactFlow` hook](https://reactflow.dev/api-reference/hooks/use-react-flow) or the `onInit` handler.

###### Old API[](#old-api-4)


```typescript
const { transform, setCenter, setZoom  } = useZoomPanHelper();
...
transform({ x: 100, y: 100, zoom: 2 });
```

###### New API[](#new-api-5)


```typescript
const { setViewport, setCenter, setZoom } = useReactFlow();
...
setViewport({ x: 100, y: 100, zoom: 2 });
```

New viewport functions:

* `getZoom`
* `getViewport`

##### 7\. isHidden - hidden[](#7-ishidden---hidden)


We mixed prefixed (`is...`) and non-prefixed boolean option names. All node and edge options are not prefixed anymore. So it’s `hidden`, `animated`, `selected`, `draggable`, `selectable` and `connectable`.

###### Old API[](#old-api-5)


```typescript
const hiddenNode = { id: '1', isHidden: true, position: { x: 50, y: 50 } };
```

###### New API[](#new-api-6)


```typescript
const hiddenNode = { id: '1', hidden: true, position: { x: 50, y: 50 } };
```

##### 8\. arrowHeadType markerEndId - markerStart / markerEnd[](#8-arrowheadtype-markerendid---markerstart--markerend)


We improved the API for customizing the markers for an edge. With the new API you are able to set individual markers at the start and the end of an edge as well as customizing them with colors, strokeWidth etc. You still have the ability to set a markerEndId but instead of using different properties, the `markerStart` and `markerEnd` property accepts either a string (id for the svg marker that you need to define yourself) or a configuration object for using the built in arrowClosed or arrow markers.

###### Old API[](#old-api-6)


```typescript
const markerEdge = { source: '1', target: '2', arrowHeadType: 'arrow' };
```

###### New API[](#new-api-7)


```typescript
const markerEdge = {
  source: '1',
  target: '2',
  markerStart: 'myCustomSvgMarker',
  markerEnd: { type: 'arrow', color: '#f00' },
};
```

##### 9\. ArrowHeadType - MarkerType[](#9-arrowheadtype---markertype)


This is just a wording change for making the marker API more consistent. As we are now able to set markers for the start of the edge, the name type ArrowHeadType has been renamed to MarkerType. In the future, this can also not only contain arrow shapes but others like circles, diamonds etc.

##### 10\. Attribution[](#10-attribution)


This is not really a breaking change to the API but a little change in the general appearance of React Flow. We added a tiny “React Flow” attribution to the bottom right (the position is configurable via the `attributionPosition` prop). This change comes with the new “React Flow Pro” subscription model. If you want to remove the attribution in a commercial application, please subscribe to [“React Flow Pro”](https://reactflow.dev/pro) .

---

