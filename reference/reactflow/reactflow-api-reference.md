## API Reference - React Flow

URL: https://reactflow.dev/api-reference

This reference attempts to document every function, hook, component, and type exported by React Flow. If you are looking for guides and tutorials, please refer to our [learn section](https://reactflow.dev/learn).

###### How to use this reference[](#how-to-use-this-reference)


We think that documentation should answer two broad questions: “what is this thing?” and “how do I use it?”

To that end, our API reference aims to **concisely** answer that first question and learn section goes into more detail on the second. If you find yourself clicking around the reference wondering what the heck any of this means, maybe we have a guide that can help you out!

###### A note for our long-term users[](#a-note-for-our-long-term-users)


If you’re coming here from our old API pages things might look a bit different! We’ve reorganized our documentation to make it easier to look things up if you know what you’re looking for. All our types, components, hooks, and util functions get their own page now to help you find exactly what you need.

If you’re new to React Flow or you’re not sure where to look for something, take a look at the section below.

###### A note for JavaScript users[](#a-note-for-javascript-users)


React Flow is written in TypeScript, but we know that not everyone uses it. We encourage developers to use the technology that works best for them, and throughout our documentation there is a blend of TypeScript and JavaScript examples.

For our API reference, however, we use TypeScript’s syntax to document the types of props and functions. Here’s a quick crash course on how to read it:

• `?` means that the field or argument is optional.

• `<T>` in a type definition represents a generic type parameter. Like a function argument but for types! The definition `type Array<T> = ...` means a type called `Array` that takes a generic type parameter `T`.

• `<T>` when referring to a type is like “filling in” a generic type parameter. It’s like calling a function but for types! The type `Array<number>` is the type `Array` with the generic type parameter `T` filled in with the type `number`.

• `T | U` means that the type is either `T` or `U`: this is often called a *union*.

• `T & U` means that the type is both `T` and `U`: this is often called an *intersection*.

The TypeScript folks have their own [handy guide for reading types](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)  that you might find useful. If you’re still stuck on something, feel free to drop by our [Discord](https://discord.com/invite/RVmnytFmGW)  and ask for help!

---

## The ReactFlow component - React Flow

URL: https://reactflow.dev/api-reference/react-flow

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/container/ReactFlow/index.tsx/#L47) 

The `<ReactFlow />` component is the heart of your React Flow application. It renders your nodes and edges, handles user interaction, and can manage its own state if used as an [uncontrolled flow](https://reactflow.dev/learn/advanced-use/uncontrolled-flow).

```typescript
import { ReactFlow } from '@xyflow/react'
 
export default function Flow() {
  return <ReactFlow
    nodes={...}
    edges={...}
    onNodesChange={...}
    ...
  />
}
```

This component takes a lot of different props, most of which are optional. We’ve tried to document them in groups that make sense to help you find your way.

###### Common props[](#common-props)


These are the props you will most commonly use when working with React Flow. If you are working with a controlled flow with custom nodes, you will likely use almost all of these!

| Name | Type | Default |
| --- | --- | --- |
| [](#width)`width` | `number` Sets a fixed width for the flow. |  |
| [](#height)`height` | `number` Sets a fixed height for the flow. |  |
| [](#nodes)`nodes` | `[Node](https://reactflow.dev/api-reference/types/node)[]` An array of nodes to render in a controlled flow. | `[]` |
| [](#edges)`edges` | `[Edge](https://reactflow.dev/api-reference/types/edge)[]` An array of edges to render in a controlled flow. | `[]` |
| [](#defaultnodes)`defaultNodes` | `[Node](https://reactflow.dev/api-reference/types/node)[]` The initial nodes to render in an uncontrolled flow. |  |
| [](#defaultedges)`defaultEdges` | `[Edge](https://reactflow.dev/api-reference/types/edge)[]` The initial edges to render in an uncontrolled flow. |  |
| [](#paneclickdistance)`paneClickDistance` | `number` Distance that the mouse can move between mousedown/up that will trigger a click. | `0` |
| [](#nodeclickdistance)`nodeClickDistance` | `number` Distance that the mouse can move between mousedown/up that will trigger a click. | `0` |
| [](#nodetypes)`nodeTypes` | `NodeTypes` Custom node types to be available in a flow. React Flow matches a node’s type to a component in the `nodeTypes` object. | `{ input: InputNode, default: DefaultNode, output: OutputNode, group: GroupNode }` |
| [](#edgetypes)`edgeTypes` | `EdgeTypes` Custom edge types to be available in a flow. React Flow matches an edge’s type to a component in the `edgeTypes` object. | `{ default: BezierEdge, straight: StraightEdge, step: StepEdge, smoothstep: SmoothStepEdge, simplebezier: SimpleBezier }` |
| [](#nodeorigin)`nodeOrigin` | `[NodeOrigin](https://reactflow.dev/api-reference/types/node-origin)` The origin of the node to use when placing it in the flow or looking up its `x` and `y` position. An origin of `[0, 0]` means that a node’s top left corner will be placed at the `x` and `y` position. | `[0, 0]` |
| [](#prooptions)`proOptions` | `[ProOptions](https://reactflow.dev/api-reference/types/pro-options)` By default, we render a small attribution in the corner of your flows that links back to the project. Anyone is free to remove this attribution whether they’re a Pro subscriber or not but we ask that you take a quick look at our [https://reactflow.dev/learn/troubleshooting/remove-attribution](https://reactflow.dev/learn/troubleshooting/remove-attribution)  removing attribution guide before doing so. |  |
| [](#nodedragthreshold)`nodeDragThreshold` | `number` With a threshold greater than zero you can delay node drag events. If threshold equals 1, you need to drag the node 1 pixel before a drag event is fired. 1 is the default value, so clicks don’t trigger drag events. | `1` |
| [](#colormode)`colorMode` | `ColorMode` Controls color scheme used for styling the flow. | `'light'` |
| [](#debug)`debug` | `boolean` If set `true`, some debug information will be logged to the console like which events are fired. | `false` |
| [](#props)`...props` | `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onError">` |  |

###### Viewport props[](#viewport-props)


| Name | Type | Default |
| --- | --- | --- |
| [](#defaultviewport)`defaultViewport` | `[Viewport](https://reactflow.dev/api-reference/types/viewport)` Sets the initial position and zoom of the viewport. If a default viewport is provided but `fitView` is enabled, the default viewport will be ignored. | `{ x: 0, y: 0, zoom: 1 }` |
| [](#viewport)`viewport` | `[Viewport](https://reactflow.dev/api-reference/types/viewport)` When you pass a `viewport` prop, it’s controlled, and you also need to pass `onViewportChange` to handle internal changes. |  |
| [](#onviewportchange)`onViewportChange` | `(viewport: [Viewport](https://reactflow.dev/api-reference/types/viewport)) => void` Used when working with a controlled viewport for updating the user viewport state. |  |
| [](#fitview)`fitView` | `boolean` When `true`, the flow will be zoomed and panned to fit all the nodes initially provided. |  |
| [](#fitviewoptions)`fitViewOptions` | `[FitViewOptions](https://reactflow.dev/api-reference/types/fit-view-options)` When you typically call `fitView` on a `ReactFlowInstance`, you can provide an object of options to customize its behavior. This prop lets you do the same for the initial `fitView` call. |  |
| [](#minzoom)`minZoom` | `number` Minimum zoom level. | `0.5` |
| [](#maxzoom)`maxZoom` | `number` Maximum zoom level. | `2` |
| [](#snaptogrid)`snapToGrid` | `boolean` When enabled, nodes will snap to the grid when dragged. |  |
| [](#snapgrid)`snapGrid` | `SnapGrid` If `snapToGrid` is enabled, this prop configures the grid that nodes will snap to. |  |
| [](#onlyrendervisibleelements)`onlyRenderVisibleElements` | `boolean` You can enable this optimisation to instruct React Flow to only render nodes and edges that would be visible in the viewport. This might improve performance when you have a large number of nodes and edges but also adds an overhead. | `false` |
| [](#translateextent)`translateExtent` | `[CoordinateExtent](https://reactflow.dev/api-reference/types/coordinate-extent)` By default, the viewport extends infinitely. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right. | `[[-∞, -∞], [+∞, +∞]]` |
| [](#nodeextent)`nodeExtent` | `[CoordinateExtent](https://reactflow.dev/api-reference/types/coordinate-extent)` By default, nodes can be placed on an infinite flow. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right. |  |
| [](#preventscrolling)`preventScrolling` | `boolean` Disabling this prop will allow the user to scroll the page even when their pointer is over the flow. | `true` |
| [](#attributionposition)`attributionPosition` | `[PanelPosition](https://reactflow.dev/api-reference/types/panel-position)` By default, React Flow will render a small attribution in the bottom right corner of the flow. You can use this prop to change its position in case you want to place something else there. | `'bottom-right'` |

###### Edge props[](#edge-props)


| Name | Type | Default |
| --- | --- | --- |
| [](#elevateedgesonselect)`elevateEdgesOnSelect` | `boolean` Enabling this option will raise the z-index of edges when they are selected. |  |
| [](#defaultmarkercolor)`defaultMarkerColor` | `string` Color of edge markers. | `'#b1b1b7'` |
| [](#defaultedgeoptions)`defaultEdgeOptions` | `[DefaultEdgeOptions](https://reactflow.dev/api-reference/types/default-edge-options)` Defaults to be applied to all new edges that are added to the flow. Properties on a new edge will override these defaults if they exist. |  |
| [](#reconnectradius)`reconnectRadius` | `number` The radius around an edge connection that can trigger an edge reconnection. | `10` |
| [](#edgesreconnectable)`edgesReconnectable` | `boolean` Whether edges can be updated once they are created. When both this prop is `true` and an `onReconnect` handler is provided, the user can drag an existing edge to a new source or target. Individual edges can override this value with their reconnectable property. | `true` |

###### Event handlers[](#event-handlers)


**Warning**

It’s important to remember to define any event handlers outside of your component or using React’s `useCallback` hook. If you don’t, this can cause React Flow to enter an infinite re-render loop!

##### General Events[](#general-events)


| Name | Type | Default |
| --- | --- | --- |
| [](#onerror)`onError` | `OnError` Occasionally something may happen that causes React Flow to throw an error. Instead of exploding your application, we log a message to the console and then call this event handler. You might use it for additional logging or to show a message to the user. |  |
| [](#oninit)`onInit` | `OnInit<[Node](https://reactflow.dev/api-reference/types/node), [Edge](https://reactflow.dev/api-reference/types/edge)>` The `onInit` callback is called when the viewport is initialized. At this point you can use the instance to call methods like `fitView` or `zoomTo`. |  |
| [](#ondelete)`onDelete` | `OnDelete<[Node](https://reactflow.dev/api-reference/types/node), [Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler gets called when a node or edge is deleted. |  |
| [](#onbeforedelete)`onBeforeDelete` | `OnBeforeDelete<[Node](https://reactflow.dev/api-reference/types/node), [Edge](https://reactflow.dev/api-reference/types/edge)>` This handler is called before nodes or edges are deleted, allowing the deletion to be aborted by returning `false` or modified by returning updated nodes and edges. |  |

##### Node Events[](#node-events)


| Name | Type | Default |
| --- | --- | --- |
| [](#onnodeclick)`onNodeClick` | `NodeMouseHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when a user clicks on a node. |  |
| [](#onnodedoubleclick)`onNodeDoubleClick` | `NodeMouseHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when a user double-clicks on a node. |  |
| [](#onnodedragstart)`onNodeDragStart` | `OnNodeDrag<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when a user starts to drag a node. |  |
| [](#onnodedrag)`onNodeDrag` | `OnNodeDrag<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when a user drags a node. |  |
| [](#onnodedragstop)`onNodeDragStop` | `OnNodeDrag<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when a user stops dragging a node. |  |
| [](#onnodemouseenter)`onNodeMouseEnter` | `NodeMouseHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when mouse of a user enters a node. |  |
| [](#onnodemousemove)`onNodeMouseMove` | `NodeMouseHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when mouse of a user moves over a node. |  |
| [](#onnodemouseleave)`onNodeMouseLeave` | `NodeMouseHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when mouse of a user leaves a node. |  |
| [](#onnodecontextmenu)`onNodeContextMenu` | `NodeMouseHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler is called when a user right-clicks on a node. |  |
| [](#onnodesdelete)`onNodesDelete` | `OnNodesDelete<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler gets called when a node is deleted. |  |
| [](#onnodeschange)`onNodesChange` | `[OnNodesChange](https://reactflow.dev/api-reference/types/on-nodes-change)<[Node](https://reactflow.dev/api-reference/types/node)>` Use this event handler to add interactivity to a controlled flow. It is called on node drag, select, and move. |  |

##### Edge Events[](#edge-events)


| Name | Type | Default |
| --- | --- | --- |
| [](#onedgeclick)`onEdgeClick` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, edge: [Edge](https://reactflow.dev/api-reference/types/edge)) => void` This event handler is called when a user clicks on an edge. |  |
| [](#onedgedoubleclick)`onEdgeDoubleClick` | `EdgeMouseHandler<[Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler is called when a user double-clicks on an edge. |  |
| [](#onedgemouseenter)`onEdgeMouseEnter` | `EdgeMouseHandler<[Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler is called when mouse of a user enters an edge. |  |
| [](#onedgemousemove)`onEdgeMouseMove` | `EdgeMouseHandler<[Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler is called when mouse of a user moves over an edge. |  |
| [](#onedgemouseleave)`onEdgeMouseLeave` | `EdgeMouseHandler<[Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler is called when mouse of a user leaves an edge. |  |
| [](#onedgecontextmenu)`onEdgeContextMenu` | `EdgeMouseHandler<[Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler is called when a user right-clicks on an edge. |  |
| [](#onreconnect)`onReconnect` | `OnReconnect<[Edge](https://reactflow.dev/api-reference/types/edge)>` This handler is called when the source or target of a reconnectable edge is dragged from the current node. It will fire even if the edge’s source or target do not end up changing. You can use the `reconnectEdge` utility to convert the connection to a new edge. |  |
| [](#onreconnectstart)`onReconnectStart` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, edge: [Edge](https://reactflow.dev/api-reference/types/edge), handleType: HandleType) => void` This event fires when the user begins dragging the source or target of an editable edge. |  |
| [](#onreconnectend)`onReconnectEnd` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) | TouchEvent, edge: [Edge](https://reactflow.dev/api-reference/types/edge), handleType: HandleType) => void` This event fires when the user releases the source or target of an editable edge. It is called even if an edge update does not occur. |  |
| [](#onedgesdelete)`onEdgesDelete` | `OnEdgesDelete<[Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler gets called when an edge is deleted. |  |
| [](#onedgeschange)`onEdgesChange` | `[OnEdgesChange](https://reactflow.dev/api-reference/types/on-edges-change)<[Edge](https://reactflow.dev/api-reference/types/edge)>` Use this event handler to add interactivity to a controlled flow. It is called on edge select and remove. |  |

##### Connection Events[](#connection-events)


| Name | Type | Default |
| --- | --- | --- |
| [](#onconnect)`onConnect` | `OnConnect` When a connection line is completed and two nodes are connected by the user, this event fires with the new connection. You can use the `addEdge` utility to convert the connection to a complete edge. |  |
| [](#onconnectstart)`onConnectStart` | `OnConnectStart` This event handler gets called when a user starts to drag a connection line. |  |
| [](#onconnectend)`onConnectEnd` | `OnConnectEnd` This callback will fire regardless of whether a valid connection could be made or not. You can use the second `connectionState` parameter to have different behavior when a connection was unsuccessful. |  |
| [](#onclickconnectstart)`onClickConnectStart` | `OnConnectStart` |  |
| [](#onclickconnectend)`onClickConnectEnd` | `OnConnectEnd` |  |
| [](#isvalidconnection)`isValidConnection` | `IsValidConnection<[Edge](https://reactflow.dev/api-reference/types/edge)>` This callback can be used to validate a new connection If you return `false`, the edge will not be added to your flow. If you have custom connection logic its preferred to use this callback over the `isValidConnection` prop on the handle component for performance reasons. |  |

##### Pane Events[](#pane-events)


| Name | Type | Default |
| --- | --- | --- |
| [](#onmove)`onMove` | `OnMove` This event handler is called while the user is either panning or zooming the viewport. |  |
| [](#onmovestart)`onMoveStart` | `OnMove` This event handler is called when the user begins to pan or zoom the viewport. |  |
| [](#onmoveend)`onMoveEnd` | `OnMove` This event handler is called when panning or zooming viewport movement stops. If the movement is not user-initiated, the event parameter will be `null`. |  |
| [](#onpaneclick)`onPaneClick` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` This event handler gets called when user clicks inside the pane. |  |
| [](#onpanecontextmenu)`onPaneContextMenu` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) | React.[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` This event handler gets called when user right clicks inside the pane. |  |
| [](#onpanescroll)`onPaneScroll` | `(event?: WheelEvent<Element> | undefined) => void` This event handler gets called when user scroll inside the pane. |  |
| [](#onpanemousemove)`onPaneMouseMove` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` This event handler gets called when mouse moves over the pane. |  |
| [](#onpanemouseenter)`onPaneMouseEnter` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` This event handler gets called when mouse enters the pane. |  |
| [](#onpanemouseleave)`onPaneMouseLeave` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` This event handler gets called when mouse leaves the pane. |  |

##### Selection Events[](#selection-events)


| Name | Type | Default |
| --- | --- | --- |
| [](#onselectionchange)`onSelectionChange` | `OnSelectionChangeFunc<[Node](https://reactflow.dev/api-reference/types/node), [Edge](https://reactflow.dev/api-reference/types/edge)>` This event handler gets called when a user changes group of selected elements in the flow. |  |
| [](#onselectiondragstart)`onSelectionDragStart` | `SelectionDragHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler gets called when a user starts to drag a selection box. |  |
| [](#onselectiondrag)`onSelectionDrag` | `SelectionDragHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler gets called when a user drags a selection box. |  |
| [](#onselectiondragstop)`onSelectionDragStop` | `SelectionDragHandler<[Node](https://reactflow.dev/api-reference/types/node)>` This event handler gets called when a user stops dragging a selection box. |  |
| [](#onselectionstart)`onSelectionStart` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` |  |
| [](#onselectionend)`onSelectionEnd` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void` |  |
| [](#onselectioncontextmenu)`onSelectionContextMenu` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, nodes: [Node](https://reactflow.dev/api-reference/types/node)[]) => void` This event handler is called when a user right-clicks on a node selection. |  |

###### Interaction props[](#interaction-props)


| Name | Type | Default |
| --- | --- | --- |
| [](#nodesdraggable)`nodesDraggable` | `boolean` Controls whether all nodes should be draggable or not. Individual nodes can override this setting by setting their `draggable` prop. If you want to use the mouse handlers on non-draggable nodes, you need to add the `"nopan"` class to those nodes. | `true` |
| [](#nodesconnectable)`nodesConnectable` | `boolean` Controls whether all nodes should be connectable or not. Individual nodes can override this setting by setting their `connectable` prop. | `true` |
| [](#nodesfocusable)`nodesFocusable` | `boolean` When `true`, focus between nodes can be cycled with the `Tab` key and selected with the `Enter` key. This option can be overridden by individual nodes by setting their `focusable` prop. | `true` |
| [](#edgesfocusable)`edgesFocusable` | `boolean` When `true`, focus between edges can be cycled with the `Tab` key and selected with the `Enter` key. This option can be overridden by individual edges by setting their `focusable` prop. | `true` |
| [](#elementsselectable)`elementsSelectable` | `boolean` When `true`, elements (nodes and edges) can be selected by clicking on them. This option can be overridden by individual elements by setting their `selectable` prop. | `true` |
| [](#autopanonconnect)`autoPanOnConnect` | `boolean` When `true`, the viewport will pan automatically when the cursor moves to the edge of the viewport while creating a connection. | `true` |
| [](#autopanonnodedrag)`autoPanOnNodeDrag` | `boolean` When `true`, the viewport will pan automatically when the cursor moves to the edge of the viewport while dragging a node. | `true` |
| [](#autopanspeed)`autoPanSpeed` | `number` The speed at which the viewport pans while dragging a node or a selection box. | `15` |
| [](#panondrag)`panOnDrag` | `boolean | number[]` Enabling this prop allows users to pan the viewport by clicking and dragging. You can also set this prop to an array of numbers to limit which mouse buttons can activate panning. | `true` |
| [](#selectionondrag)`selectionOnDrag` | `boolean` Select multiple elements with a selection box, without pressing down `selectionKey`. | `false` |
| [](#selectionmode)`selectionMode` | `SelectionMode` When set to `"partial"`, when the user creates a selection box by click and dragging nodes that are only partially in the box are still selected. | `'full'` |
| [](#panonscroll)`panOnScroll` | `boolean` Controls if the viewport should pan by scrolling inside the container. Can be limited to a specific direction with `panOnScrollMode`. | `false` |
| [](#panonscrollspeed)`panOnScrollSpeed` | `number` Controls how fast viewport should be panned on scroll. Use together with `panOnScroll` prop. | `0.5` |
| [](#panonscrollmode)`panOnScrollMode` | `[PanOnScrollMode](https://reactflow.dev/api-reference/types/pan-on-scroll-mode)` This prop is used to limit the direction of panning when `panOnScroll` is enabled. The `"free"` option allows panning in any direction. | `"free"` |
| [](#zoomonscroll)`zoomOnScroll` | `boolean` Controls if the viewport should zoom by scrolling inside the container. | `true` |
| [](#zoomonpinch)`zoomOnPinch` | `boolean` Controls if the viewport should zoom by pinching on a touch screen. | `true` |
| [](#zoomondoubleclick)`zoomOnDoubleClick` | `boolean` Controls if the viewport should zoom by double-clicking somewhere on the flow. | `true` |
| [](#selectnodesondrag)`selectNodesOnDrag` | `boolean` If `true`, nodes get selected on drag. | `true` |
| [](#elevatenodesonselect)`elevateNodesOnSelect` | `boolean` Enabling this option will raise the z-index of nodes when they are selected. | `true` |
| [](#connectonclick)`connectOnClick` | `boolean` The `connectOnClick` option lets you click or tap on a source handle to start a connection and then click on a target handle to complete the connection. If you set this option to `false`, users will need to drag the connection line to the target handle to create a connection. | `true` |
| [](#connectionmode)`connectionMode` | `ConnectionMode` A loose connection mode will allow you to connect handles with differing types, including source-to-source connections. However, it does not support target-to-target connections. Strict mode allows only connections between source handles and target handles. | `'strict'` |

###### Connection line props[](#connection-line-props)


| Name | Type | Default |
| --- | --- | --- |
| [](#connectionlinestyle)`connectionLineStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Styles to be applied to the connection line. |  |
| [](#connectionlinetype)`connectionLineType` | `[ConnectionLineType](https://reactflow.dev/api-reference/types/connection-line-type)` The type of edge path to use for connection lines. Although created edges can be of any type, React Flow needs to know what type of path to render for the connection line before the edge is created! | `[ConnectionLineType](https://reactflow.dev/api-reference/types/connection-line-type).Bezier` |
| [](#connectionradius)`connectionRadius` | `number` The radius around a handle where you drop a connection line to create a new edge. | `20` |
| [](#connectionlinecomponent)`connectionLineComponent` | `ConnectionLineComponent<[Node](https://reactflow.dev/api-reference/types/node)>` React Component to be used as a connection line. |  |
| [](#connectionlinecontainerstyle)`connectionLineContainerStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Styles to be applied to the container of the connection line. |  |

###### Keyboard props[](#keyboard-props)


React Flow let’s you pass in a few different keyboard shortcuts as another way to interact with your flow. We’ve tried to set up sensible defaults like using backspace to delete any selected nodes or edges, but you can use these props to set your own.

To disable any of these shortcuts, pass in `null` to the prop you want to disable.

| Name | Type | Default |
| --- | --- | --- |
| [](#deletekeycode)`deleteKeyCode` | `KeyCode | null` If set, pressing the key or chord will delete any selected nodes and edges. Passing an array represents multiple keys that can be pressed. For example, `["Delete", "Backspace"]` will delete selected elements when either key is pressed. | `'Backspace'` |
| [](#selectionkeycode)`selectionKeyCode` | `KeyCode | null` If set, holding this key will let you click and drag to draw a selection box around multiple nodes and edges. Passing an array represents multiple keys that can be pressed. For example, `["Shift", "Meta"]` will allow you to draw a selection box when either key is pressed. | `'Shift'` |
| [](#multiselectionkeycode)`multiSelectionKeyCode` | `KeyCode | null` Pressing down this key you can select multiple elements by clicking. | `"Meta" for macOS, "Control" for other systems` |
| [](#zoomactivationkeycode)`zoomActivationKeyCode` | `KeyCode | null` If a key is set, you can zoom the viewport while that key is held down even if `panOnScroll` is set to `false`. By setting this prop to `null` you can disable this functionality. | `"Meta" for macOS, "Control" for other systems` |
| [](#panactivationkeycode)`panActivationKeyCode` | `KeyCode | null` If a key is set, you can pan the viewport while that key is held down even if `panOnScroll` is set to `false`. By setting this prop to `null` you can disable this functionality. | `'Space'` |
| [](#disablekeyboarda11y)`disableKeyboardA11y` | `boolean` You can use this prop to disable keyboard accessibility features such as selecting nodes or moving selected nodes with the arrow keys. | `false` |

###### Style props[](#style-props)


Applying certain classes to elements rendered inside the canvas will change how interactions are handled. These props let you configure those class names if you need to.

| Name | Type | Default |
| --- | --- | --- |
| [](#nopanclassname)`noPanClassName` | `string` If an element in the canvas does not stop mouse events from propagating, clicking and dragging that element will pan the viewport. Adding the `"nopan"` class prevents this behavior and this prop allows you to change the name of that class. | `"nopan"` |
| [](#nodragclassname)`noDragClassName` | `string` If a node is draggable, clicking and dragging that node will move it around the canvas. Adding the `"nodrag"` class prevents this behavior and this prop allows you to change the name of that class. | `"nodrag"` |
| [](#nowheelclassname)`noWheelClassName` | `string` Typically, scrolling the mouse wheel when the mouse is over the canvas will zoom the viewport. Adding the `"nowheel"` class to an element n the canvas will prevent this behavior and this prop allows you to change the name of that class. | `"nowheel"` |

###### Notes[](#notes)


* The props of this component get exported as `ReactFlowProps`

---

## The ReactFlowProvider component - React Flow

URL: https://reactflow.dev/api-reference/react-flow-provider

The `<ReactFlowProvider />` component is a [context provider](https://react.dev/learn/passing-data-deeply-with-context#)  that makes it possible to access a flow’s internal state outside of the [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow) component. Many of the hooks we provide rely on this component to work.

```typescript
import { ReactFlow, ReactFlowProvider, useNodes } from '@xyflow/react'
 
export default function Flow() {
  return (
    <ReactFlowProvider>
      <ReactFlow nodes={...} edges={...} />
      <Sidebar />
    </ReactFlowProvider>
  )
}
 
function Sidebar() {
  // This hook will only work if the component it's used in is a child of a
  // <ReactFlowProvider />.
  const nodes = useNodes()
 
  return (
    <aside>
      {nodes.map((node) => (
        <div key={node.id}>
          Node {node.id} -
            x: {node.position.x.toFixed(2)},
            y: {node.position.y.toFixed(2)}
        </div>
      ))}
    </aside>
  )
}
```

---

## Components - React Flow

URL: https://reactflow.dev/api-reference/components

###### [<Background />](https://reactflow.dev/api-reference/components/background)


The Background component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: lines, dots and cross.

[Read more](https://reactflow.dev/api-reference/components/background)

###### [<BaseEdge />](https://reactflow.dev/api-reference/components/base-edge)


The BaseEdge component gets used internally for all the edges. It can be used inside a custom edge and handles the invisible helper edge and the edge label for you.

[Read more](https://reactflow.dev/api-reference/components/base-edge)

###### [<ControlButton />](https://reactflow.dev/api-reference/components/control-button)


You can add buttons to the control panel by using the ControlButton component and pass it as a child to the Controls component.

[Read more](https://reactflow.dev/api-reference/components/control-button)

###### [<Controls />](https://reactflow.dev/api-reference/components/controls)


The Controls component renders a small panel that contains convenient buttons to zoom in, zoom out, fit the view, and lock the viewport.

[Read more](https://reactflow.dev/api-reference/components/controls)

###### [<EdgeLabelRenderer />](https://reactflow.dev/api-reference/components/edge-label-renderer)


Edges are SVG-based. If you want to render more complex labels you can use the EdgeLabelRenderer component to access a div based renderer. This component is a portal that renders the label in a div that is positioned on top of the edges. You can see an example usage of the component in the edge label renderer example.

[Read more](https://reactflow.dev/api-reference/components/edge-label-renderer)

###### [<EdgeText />](https://reactflow.dev/api-reference/components/edge-text)


You can use the EdgeText component as a helper component to display text within your custom edges.

[Read more](https://reactflow.dev/api-reference/components/edge-text)

###### [<Handle />](https://reactflow.dev/api-reference/components/handle)


The Handle component is used in your custom nodes to define connection points.

[Read more](https://reactflow.dev/api-reference/components/handle)

###### [<MiniMap />](https://reactflow.dev/api-reference/components/minimap)


The MiniMap component can be used to render an overview of your flow. It renders each node as an SVG element and visualizes where the current viewport is in relation to the rest of the flow.

[Read more](https://reactflow.dev/api-reference/components/minimap)

###### [<NodeResizeControl />](https://reactflow.dev/api-reference/components/node-resize-control)


To create your own resizing UI, you can use the NodeResizeControl component where you can pass children (such as icons).

[Read more](https://reactflow.dev/api-reference/components/node-resize-control)

###### [<NodeResizer />](https://reactflow.dev/api-reference/components/node-resizer)


The NodeResizer component can be used to add a resize functionality to your nodes. It renders draggable controls around the node to resize in all directions.

[Read more](https://reactflow.dev/api-reference/components/node-resizer)

###### [<NodeToolbar />](https://reactflow.dev/api-reference/components/node-toolbar)


The NodeToolbar component can render a toolbar or tooltip to one side of a custom node. This toolbar doesn't scale with the viewport so that the content is always visible.

[Read more](https://reactflow.dev/api-reference/components/node-toolbar)

###### [<Panel />](https://reactflow.dev/api-reference/components/panel)


The Panel component helps you position content above the viewport. It is used internally by the MiniMap and Controls components.

[Read more](https://reactflow.dev/api-reference/components/panel)

###### [<ViewportPortal />](https://reactflow.dev/api-reference/components/viewport-portal)


The ViewportPortal component can be used to add components to the same viewport of the flow where nodes and edges are rendered. This is useful when you want to render your own components that are adhere to the same coordinate system as the nodes & edges and are also affected by zooming and panning

[Read more](https://reactflow.dev/api-reference/components/viewport-portal)

---

## The Background component - React Flow

URL: https://reactflow.dev/api-reference/components/background

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Background/Background.tsx) 

The `<Background />` component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: `lines`, `dots` and `cross`.

```typescript
import { useState } from 'react';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
      <Background color="#ccc" variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}
```

###### Props[](#props)


| Name | Type | Default |
| --- | --- | --- |
| [](#id)`id` | `string` When multiple backgrounds are present on the page, each one should have a unique id. |  |
| [](#color)`color` | `string` Color of the pattern. |  |
| [](#bgcolor)`bgColor` | `string` Color of the background. |  |
| [](#classname)`className` | `string` Class applied to the container. |  |
| [](#patternclassname)`patternClassName` | `string` Class applied to the pattern. |  |
| [](#gap)`gap` | `number | [number, number]` The gap between patterns. Passing in a tuple allows you to control the x and y gap independently. | `20` |
| [](#size)`size` | `number` The radius of each dot or the size of each rectangle if `BackgroundVariant.Dots` or `BackgroundVariant.Cross` is used. This defaults to 1 or 6 respectively, or ignored if `BackgroundVariant.Lines` is used. |  |
| [](#offset)`offset` | `number | [number, number]` Offset of the pattern. | `0` |
| [](#linewidth)`lineWidth` | `number` The stroke thickness used when drawing the pattern. | `1` |
| [](#variant)`variant` | `[BackgroundVariant](https://reactflow.dev/api-reference/types/background-variant)` Variant of the pattern. | `[BackgroundVariant](https://reactflow.dev/api-reference/types/background-variant).Dots` |
| [](#style)`style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Style applied to the container. |  |

###### Examples[](#examples)


##### Combining multiple backgrounds[](#combining-multiple-backgrounds)


It is possible to layer multiple `<Background />` components on top of one another to create something more interesting. The following example shows how to render a square grid accented every 10th line.

```typescript
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 
export default function Flow() {
  return (
    <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
      <Background
        id="1"
        gap={10}
        color="#f1f1f1"
        variant={BackgroundVariant.Lines}
      />
 
      <Background
        id="2"
        gap={100}
        color="#ccc"
        variant={BackgroundVariant.Lines}
      />
    </ReactFlow>
  );
}
```

###### Notes[](#notes)


* When combining multiple `<Background />` components it’s important to give each of them a unique `id` prop!

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## The BaseEdge component - React Flow

URL: https://reactflow.dev/api-reference/components/base-edge

The `<BaseEdge />` component gets used internally for all the edges. It can be used inside a custom edge and handles the invisible helper edge and the edge label for you.

```typescript
import { BaseEdge } from '@xyflow/react';
 
export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  return <BaseEdge path={edgePath} {...props} />;
}
```

NameTypeDefault[](#path)`path``string`

The SVG path string that defines the edge. This should look something like `'M 0 0 L 100 100'` for a simple line. The utility functions like `getSimpleBezierEdge` can be used to generate this string for you.

[](#markerstart)`markerStart``string`

The id of the SVG marker to use at the start of the edge. This should be defined in a `<defs>` element in a separate SVG document or element.

[](#markerend)`markerEnd``string`

The id of the SVG marker to use at the end of the edge. This should be defined in a `<defs>` element in a separate SVG document or element.

[](#label)`label``[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)`

The label or custom element to render along the edge. This is commonly a text label or some custom controls.

[](#labelstyle)`labelStyle``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Custom styles to apply to the label.

[](#labelshowbg)`labelShowBg``boolean`[](#labelbgstyle)`labelBgStyle``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`[](#labelbgpadding)`labelBgPadding``[number, number]`[](#labelbgborderradius)`labelBgBorderRadius``number`[](#interactionwidth)`interactionWidth``number`

The width of the invisible area around the edge that the user can interact with. This is useful for making the edge easier to click or hover over.

`20`[](#labelx)`labelX``number`

The x position of edge label

[](#labely)`labelY``number`

The y position of edge label

[](#props)`...props``Omit<SVGAttributes<SVGPathElement>, "d" | "path" | "markerStart" | "markerEnd">`

---

## The ControlButton component - React Flow

URL: https://reactflow.dev/api-reference/components/control-button

You can add buttons to the control panel by using the `<ControlButton />` component and pass it as a child to the [`<Controls />`](https://reactflow.dev/api-reference/components/controls) component.

```typescript
import { MagicWand } from '@radix-ui/react-icons'
import { ReactFlow, Controls, ControlButton } from '@xyflow/react'
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]} edges={[...]}>
      <Controls>
        <ControlButton onClick={() => alert('Something magical just happened. ✨')}>
          <MagicWand />
        </ControlButton>
      </Controls>
    </ReactFlow>
  )
}
```

The `<ControlButton />` component accepts any prop valid on a HTML `<button />` element.

---

## The Controls component - React Flow

URL: https://reactflow.dev/api-reference/components/controls

The `<Controls />` component renders a small panel that contains convenient buttons to zoom in, zoom out, fit the view, and lock the viewport.

For TypeScript users, the props type for the `<Controls />` component is exported as `ControlProps`.

NameTypeDefault[](#showzoom)`showZoom``boolean`

Whether or not to show the zoom in and zoom out buttons. These buttons will adjust the viewport zoom by a fixed amount each press.

`true`[](#showfitview)`showFitView``boolean`

Whether or not to show the fit view button. By default, this button will adjust the viewport so that all nodes are visible at once.

`true`[](#showinteractive)`showInteractive``boolean`

Show button for toggling interactivity

`true`[](#fitviewoptions)`fitViewOptions``[FitViewOptions](https://reactflow.dev/api-reference/types/fit-view-options)`

Customise the options for the fit view button. These are the same options you would pass to the fitView function.

[](#onzoomin)`onZoomIn``() => void`

Called in addition the default zoom behavior when the zoom in button is clicked.

[](#onzoomout)`onZoomOut``() => void`

Called in addition the default zoom behavior when the zoom out button is clicked.

[](#onfitview)`onFitView``() => void`

Called when the fit view button is clicked. When this is not provided, the viewport will be adjusted so that all nodes are visible.

[](#oninteractivechange)`onInteractiveChange``(interactiveStatus: boolean) => void`

Called when the interactive (lock) button is clicked.

[](#position)`position``[PanelPosition](https://reactflow.dev/api-reference/types/panel-position)`

Position of the controls on the pane

`[PanelPosition](https://reactflow.dev/api-reference/types/panel-position).BottomLeft`[](#children)`children``[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)`[](#style)`style``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Style applied to container

[](#classname)`className``string`

Class name applied to container

[](#aria-label)`aria-label``string``'React Flow controls'`[](#orientation)`orientation``"horizontal" | "vertical"``'vertical'`

---

## The Handle component - React Flow

URL: https://reactflow.dev/api-reference/components/handle

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Handle/index.tsx) 

The `<Handle />` component is used in your [custom nodes](https://reactflow.dev/learn/customization/custom-nodes) to define connection points.

```typescript
import { Handle, Position } from '@xyflow/react';
 
export const CustomNode = ({ data }) => {
  return (
    <>
      <div style={{ padding: '10px 20px' }}>
        {data.label}
      </div>
 
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};
```

###### Props[](#props)


For TypeScript users, the props type for the `<Handle />` component is exported as `HandleProps`.

| Name | Type | Default |
| --- | --- | --- |
| [](#id)`id` | `string | null` Id of the handle. |  |
| [](#type)`type` | `HandleType` Type of the handle. | `"source"` |
| [](#position)`position` | `[Position](https://reactflow.dev/api-reference/types/position)` The position of the handle relative to the node. In a horizontal flow source handles are typically `Position.Right` and in a vertical flow they are typically `Position.Top`. | `[Position](https://reactflow.dev/api-reference/types/position).Top` |
| [](#isconnectable)`isConnectable` | `boolean` Should you be able to connect to/from this handle. | `true` |
| [](#isconnectablestart)`isConnectableStart` | `boolean` Dictates whether a connection can start from this handle. | `true` |
| [](#isconnectableend)`isConnectableEnd` | `boolean` Dictates whether a connection can end on this handle. | `true` |
| [](#isvalidconnection)`isValidConnection` | `IsValidConnection` Called when a connection is dragged to this handle. You can use this callback to perform some custom validation logic based on the connection target and source, for example. Where possible, we recommend you move this logic to the `isValidConnection` prop on the main ReactFlow component for performance reasons. |  |
| [](#onconnect)`onConnect` | `OnConnect | undefined` Callback called when connection is made |  |
| [](#props)`...props` | `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "id">` |  |

###### Examples[](#examples)


##### Custom handle with validation[](#custom-handle-with-validation)


You can create your own custom handles by wrapping the `<Handle />` component. This example shows a custom handle that only allows connections when the connection source matches a given id.

```typescript
import { Handle, Position } from '@xyflow/react';
 
export const TargetHandleWithValidation = ({ position, source }) => (
  <Handle
    type="target"
    position={position}
    isValidConnection={(connection) => connection.source === source}
    onConnect={(params) => console.log('handle onConnect', params)}
    style={{ background: '#fff' }}
  />
);
```

##### Style handles when connecting[](#style-handles-when-connecting)


The handle receives the additional class names `connecting` when the connection line is above the handle and `valid` if the connection is valid. You can find an example which uses these classes [here](https://reactflow.dev/examples/interaction/validation).

##### Multiple handles[](#multiple-handles)


If you need multiple source or target handles you can achieve this by creating a custom node. Normally you just use the id of a node for the `source` or `target` of an edge. If you have multiple source or target handles you need to pass an id to these handles. These ids can be used by an edge with the `sourceHandle` and `targetHandle` options, so that you can connect a specific handle. If you have a node with an id = `1` and a handle with an id = `a` you can connect this handle by using the node `source=1` and the `sourceHandle=a`.

##### Dynamic handles[](#dynamic-handles)


If you are programmatically changing the position or number of handles in your custom node, you need to update the node internals with the [`useUpdateNodeInternals`](https://reactflow.dev/api-reference/hooks/use-update-node-internals) hook.

You can find an example of how to implement a custom node with multiple handles in the [custom node guide](https://reactflow.dev/learn/customization/custom-nodes) or in the [custom node example](https://reactflow.dev/examples/nodes/custom-node).

##### Custom handle styles[](#custom-handle-styles)


Since the handle is a div, you can use CSS to style it or pass a style prop to customize a Handle. You can see this in the [Add Node On Edge Drop](https://reactflow.dev/examples/nodes/add-node-on-edge-drop) and [Simple Floating Edges](https://reactflow.dev/examples/edges/simple-floating-edges) examples.

###### Notes[](#notes)


* If you need to hide a handle for some reason, you must use `visibility: hidden` or `opacity: 0` instead of `display: none`. This is important because React Flow needs to calculate the dimensions of the handle to work properly and using `display: none` will report a width and height of 0!

Last updated on

April 12, 2025

---

## The EdgeLabelRenderer component - React Flow

URL: https://reactflow.dev/api-reference/components/edge-label-renderer

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/EdgeLabelRenderer/index.tsx) 

Edges are SVG-based. If you want to render more complex labels you can use the `<EdgeLabelRenderer />` component to access a div based renderer. This component is a portal that renders the label in a `<div />` that is positioned on top of the edges. You can see an example usage of the component in the [edge label renderer](https://reactflow.dev/examples/edges/edge-label-renderer) example.

```typescript
import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
 
const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);
 
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#ffcc00',
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
 
export default CustomEdge;
```

###### Props[](#props)


| Name | Type | Default |
| --- | --- | --- |
| [](#children)`children` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` |  |

###### Notes[](#notes)


* The `<EdgeLabelRenderer />` has no pointer events by default. If you want to add mouse interactions you need to set the style `pointerEvents: 'all'` and add the `nopan` class on the label or the element you want to interact with.

Last updated on

April 12, 2025

---

## The EdgeText component - React Flow

URL: https://reactflow.dev/api-reference/components/edge-text

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/EdgeText.tsx) 

You can use the `<EdgeText />` component as a helper component to display text within your custom edges.

```typescript
import { EdgeText } from '@xyflow/react';
 
export function CustomEdgeLabel({ label }) {
  return (
    <EdgeText
      x={100}
      y={100}
      label={label}
      labelStyle={{ fill: 'white' }}
      labelShowBg
      labelBgStyle={{ fill: 'red' }}
      labelBgPadding={[2, 4]}
      labelBgBorderRadius={2}
    />
  );
}
```

###### Props[](#props)


For TypeScript users, the props type for the `<EdgeText />` component is exported as `EdgeTextProps`.

| Name | Type | Default |
| --- | --- | --- |
| [](#x)`x` | `number` The x position where the label should be rendered. |  |
| [](#y)`y` | `number` The y position where the label should be rendered. |  |
| [](#label)`label` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` The label or custom element to render along the edge. This is commonly a text label or some custom controls. |  |
| [](#labelstyle)`labelStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Custom styles to apply to the label. |  |
| [](#labelshowbg)`labelShowBg` | `boolean` |  |
| [](#labelbgstyle)`labelBgStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` |  |
| [](#labelbgpadding)`labelBgPadding` | `[number, number]` |  |
| [](#labelbgborderradius)`labelBgBorderRadius` | `number` |  |
| [](#props)`...props` | `Omit<SVGAttributes<SVGElement>, "x" | "y">` |  |

Additionally, you may also pass any standard React HTML attributes such as `onClick`, `className` and so on.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## The MiniMap component - React Flow

URL: https://reactflow.dev/api-reference/components/minimap

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/MiniMap/MiniMap.tsx) 

The `<MiniMap />` component can be used to render an overview of your flow. It renders each node as an SVG element and visualizes where the current viewport is in relation to the rest of the flow.

```typescript
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeStrokeWidth={3} />
    </ReactFlow>
  );
}
```

###### Props[](#props)


For TypeScript users, the props type for the `<MiniMap />` component is exported as `MiniMapProps`.

| Name | Type | Default |
| --- | --- | --- |
| [](#onclick)`onClick` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, position: [XYPosition](https://reactflow.dev/api-reference/types/xy-position)) => void` Callback called when minimap is clicked. |  |
| [](#nodecolor)`nodeColor` | `string | GetMiniMapNodeAttribute<[Node](https://reactflow.dev/api-reference/types/node)>` Color of nodes on minimap. | `"#e2e2e2"` |
| [](#nodestrokecolor)`nodeStrokeColor` | `string | GetMiniMapNodeAttribute<[Node](https://reactflow.dev/api-reference/types/node)>` Stroke color of nodes on minimap. | `"transparent"` |
| [](#nodeclassname)`nodeClassName` | `string | GetMiniMapNodeAttribute<[Node](https://reactflow.dev/api-reference/types/node)>` Class name applied to nodes on minimap. | `""` |
| [](#nodeborderradius)`nodeBorderRadius` | `number` Border radius of nodes on minimap. | `5` |
| [](#nodestrokewidth)`nodeStrokeWidth` | `number` Stroke width of nodes on minimap. | `2` |
| [](#nodecomponent)`nodeComponent` | `[ComponentType](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L75)<[MiniMapNodeProps](https://reactflow.dev/api-reference/types/mini-map-node-props)>` A custom component to render the nodes in the minimap. This component must render an SVG element! |  |
| [](#bgcolor)`bgColor` | `string` Background color of minimap. |  |
| [](#maskcolor)`maskColor` | `string` The color of the mask that covers the portion of the minimap not currently visible in the viewport. | `"rgba(240, 240, 240, 0.6)"` |
| [](#maskstrokecolor)`maskStrokeColor` | `string` Stroke color of mask representing viewport. | `transparent` |
| [](#maskstrokewidth)`maskStrokeWidth` | `number` Stroke width of mask representing viewport. | `1` |
| [](#position)`position` | `[PanelPosition](https://reactflow.dev/api-reference/types/panel-position)` Position of minimap on pane. | `[PanelPosition](https://reactflow.dev/api-reference/types/panel-position).BottomRight` |
| [](#onnodeclick)`onNodeClick` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, node: [Node](https://reactflow.dev/api-reference/types/node)) => void` Callback called when node on minimap is clicked. |  |
| [](#pannable)`pannable` | `boolean` Determines whether you can pan the viewport by dragging inside the minimap. | `false` |
| [](#zoomable)`zoomable` | `boolean` Determines whether you can zoom the viewport by scrolling inside the minimap. | `false` |
| [](#arialabel)`ariaLabel` | `string | null` There is no text inside the minimap for a screen reader to use as an accessible name, so it’s important we provide one to make the minimap accessible. The default is sufficient, but you may want to replace it with something more relevant to your app or product. | `"React Flow mini map"` |
| [](#inversepan)`inversePan` | `boolean` Invert direction when panning the minimap viewport. |  |
| [](#zoomstep)`zoomStep` | `number` Step size for zooming in/out on minimap. | `10` |
| [](#offsetscale)`offsetScale` | `number` Offset the viewport on the minimap, acts like a padding. | `5` |
| [](#props)`...props` | `Omit<HTMLAttributes<SVGSVGElement>, "onClick">` |  |

###### Examples[](#examples)


##### Making the mini map interactive[](#making-the-mini-map-interactive)


By default, the mini map is non-interactive. To allow users to interact with the viewport by panning or zooming the minimap, you can set either of the `zoomable` or `pannable` (or both!) props to `true`.

```typescript
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}
```

##### Implement a custom mini map node[](#implement-a-custom-mini-map-node)


It is possible to pass a custom component to the `nodeComponent` prop to change how nodes are rendered in the mini map. If you do this you **must** use only SVG elements in your component if you want it to work correctly.

```typescript
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeComponent={MiniMapNode} />
    </ReactFlow>
  );
}
 
function MiniMapNode({ x, y }) {
  return <circle cx={x} cy={y} r="50" />;
}
```

Check out the documentation for [`MiniMapNodeProps`](https://reactflow.dev/api-reference/types/mini-map-node-props) to see what props are passed to your custom component.

##### Customising mini map node color[](#customising-mini-map-node-color)


The `nodeColor`, `nodeStrokeColor`, and `nodeClassName` props can be a function that takes a [`Node`](https://reactflow.dev/api-reference/types/node) and computes a value for the prop. This can be used to customize the appearance of each mini map node.

This example shows how to color each mini map node based on the node’s type:

```typescript
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeColor={nodeColor} />
    </ReactFlow>
  );
}
 
function nodeColor(node) {
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#ff0072';
  }
}
```

###### TypeScript[](#typescript)


This component accepts a generic type argument of custom node types. See this [section in our Typescript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
<MiniMap<CustomNodeType> nodeColor={nodeColor} />
```

---

## The NodeResizeControl component - React Flow

URL: https://reactflow.dev/api-reference/components/node-resize-control

To create your own resizing UI, you can use the `NodeResizeControl` component where you can pass children (such as icons).

For TypeScript users, the props type for the `<NodeResizeControl />` component is exported as `ResizeControlProps`.

NameTypeDefault[](#nodeid)`nodeId``string`

Id of the node it is resizing.

[](#color)`color``string`

Color of the resize handle.

[](#minwidth)`minWidth``number`

Minimum width of node.

`10`[](#minheight)`minHeight``number`

Minimum height of node.

`10`[](#maxwidth)`maxWidth``number`

Maximum width of node.

`Number.MAX_VALUE`[](#maxheight)`maxHeight``number`

Maximum height of node.

`Number.MAX_VALUE`[](#keepaspectratio)`keepAspectRatio``boolean`

Keep aspect ratio when resizing.

`false`[](#shouldresize)`shouldResize``ShouldResize`

Callback to determine if node should resize.

[](#onresizestart)`onResizeStart``OnResizeStart`

Callback called when resizing starts.

[](#onresize)`onResize``OnResize`

Callback called when resizing.

[](#onresizeend)`onResizeEnd``OnResizeEnd`

Callback called when resizing ends.

[](#position)`position``ControlPosition`

Position of the control.

[](#variant)`variant``ResizeControlVariant`

Variant of the control.

`"handle"`[](#classname)`className``string`[](#style)`style``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`[](#children)`children``[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)`

---

## The NodeToolbar component - React Flow

URL: https://reactflow.dev/api-reference/components/node-toolbar

This component can render a toolbar or tooltip to one side of a custom node. This toolbar doesn’t scale with the viewport so that the content is always visible.

```typescript
import { memo } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
 
const CustomNode = ({ data }) => {
  return (
    <>
      <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
        <button>delete</button>
        <button>copy</button>
        <button>expand</button>
      </NodeToolbar>
 
      <div style={{ padding: '10px 20px' }}>
        {data.label}
      </div>
 
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};
 
export default memo(CustomNode);
```

For TypeScript users, the props type for the `<NodeToolbar />` component is exported as `NodeToolbarProps`. Additionally, the `<NodeToolbar />` component accepts all props of the HTML `<div />` element.

NameTypeDefault[](#nodeid)`nodeId``string | string[]`

By passing in an array of node id’s you can render a single tooltip for a group or collection of nodes.

[](#isvisible)`isVisible``boolean`

If `true`, node toolbar is visible even if node is not selected.

[](#position)`position``[Position](https://reactflow.dev/api-reference/types/position)`

Position of the toolbar relative to the node.

`[Position](https://reactflow.dev/api-reference/types/position).Top`[](#offset)`offset``number`

The space between the node and the toolbar, measured in pixels.

`10`[](#align)`align``Align`

Align the toolbar relative to the node.

`"center"`[](#props)`...props``HTMLAttributes<HTMLDivElement>`

---

## The NodeResizer component - React Flow

URL: https://reactflow.dev/api-reference/components/node-resizer

```typescript
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  Controls,
} from '@xyflow/react';
 
import ResizableNode from './ResizableNode';
import ResizableNodeSelected from './ResizableNodeSelected';
import CustomResizerNode from './CustomResizerNode';
 
import '@xyflow/react/dist/style.css';
 
 
const nodeTypes = {
  ResizableNode,
  ResizableNodeSelected,
  CustomResizerNode,
};
 
const initialNodes = [
  {
    id: '1',
    type: 'ResizableNode',
    data: { label: 'NodeResizer' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'ResizableNodeSelected',
    data: { label: 'NodeResizer when selected' },
    position: { x: 100, y: 300 },
  },
  {
    id: '3',
    type: 'CustomResizerNode',
    data: { label: 'Custom Resize Icon' },
    position: { x: 150, y: 150 },
    style: {
      height: 100,
    },
  },
];
 
const initialEdges = [];
 
export default function NodeToolbarExample() {
  return (
    <ReactFlow
      defaultNodes={initialNodes}
      defaultEdges={initialEdges}
      minZoom={0.2}
      maxZoom={4}
      fitView
      nodeTypes={nodeTypes}
      style={{ backgroundColor: "#F7F9FB" }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
```

---

## The Panel component - React Flow

URL: https://reactflow.dev/api-reference/components/panel

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Panel/index.tsx) 

The `<Panel />` component helps you position content above the viewport. It is used internally by the [`<MiniMap />`](https://reactflow.dev/api-reference/components/minimap) and [`<Controls />`](https://reactflow.dev/api-reference/components/controls) components.

```typescript
import { ReactFlow, Panel } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]} fitView>
      <Panel position="top-left">top-left</Panel>
      <Panel position="top-center">top-center</Panel>
      <Panel position="top-right">top-right</Panel>
      <Panel position="bottom-left">bottom-left</Panel>
      <Panel position="bottom-center">bottom-center</Panel>
      <Panel position="bottom-right">bottom-right</Panel>
    </ReactFlow>
  );
}
```

###### Props[](#props)


For TypeScript users, the props type for the `<Panel />` component is exported as `PanelProps`. Additionally, the `<Panel />` component accepts all props of the HTML `<div />` element.

| Name | Type | Default |
| --- | --- | --- |
| [](#position)`position` | `[PanelPosition](https://reactflow.dev/api-reference/types/panel-position) | undefined` The position of the panel. | `"top-left"` |
| [](#props)`...props` | `DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>` |  |

Last updated on

April 12, 2025

---

## The ViewportPortal component - React Flow

URL: https://reactflow.dev/api-reference/components/viewport-portal

`<ViewportPortal />` component can be used to add components to the same viewport of the flow where nodes and edges are rendered. This is useful when you want to render your own components that are adhere to the same coordinate system as the nodes & edges and are also affected by zooming and panning

```typescript
import React from 'react';
import { ViewportPortal } from '@xyflow/react';
 
export default function () {
  return (
    <ViewportPortal>
      <div
        style={{ transform: 'translate(100px, 100px)', position: 'absolute' }}
      >
        This div is positioned at [100, 100] on the flow.
      </div>
    </ViewportPortal>
  );
}
```

---

## Hooks - React Flow

URL: https://reactflow.dev/api-reference/hooks

###### [useConnection()](https://reactflow.dev/api-reference/hooks/use-connection)


The useConnection hook returns the current connection when there is an active connection interaction. If no connection interaction is active, it returns null for every property. A typical use case for this hook is to colorize handles based on a certain condition (e.g. if the connection is valid or not).

[Read more](https://reactflow.dev/api-reference/hooks/use-connection)

###### [useEdges()](https://reactflow.dev/api-reference/hooks/use-edges)


This hook returns an array of the current edges. Components that use this hook will re-render whenever any edge changes.

[Read more](https://reactflow.dev/api-reference/hooks/use-edges)

###### [useEdgesState()](https://reactflow.dev/api-reference/hooks/use-edges-state)


This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the ReactFlowInstance. You can think of it like React's \`useState\` hook with an additional helper callback.

[Read more](https://reactflow.dev/api-reference/hooks/use-edges-state)

###### [useHandleConnections()](https://reactflow.dev/api-reference/hooks/use-handle-connections)


This hook returns an array of the current edges. Components that use this hook will re-render whenever any edge changes.

[Read more](https://reactflow.dev/api-reference/hooks/use-handle-connections)

###### [useInternalNode()](https://reactflow.dev/api-reference/hooks/use-internal-node)


This hook returns an InternalNode object for the given node ID.

[Read more](https://reactflow.dev/api-reference/hooks/use-internal-node)

###### [useKeyPress()](https://reactflow.dev/api-reference/hooks/use-key-press)


This hook lets you listen for specific key codes and tells you whether they are currently pressed or not.

[Read more](https://reactflow.dev/api-reference/hooks/use-key-press)

###### [useNodeConnections()](https://reactflow.dev/api-reference/hooks/use-node-connections)


This hook returns an array of connected edges. Components that use this hook will re-render whenever any edge changes.

[Read more](https://reactflow.dev/api-reference/hooks/use-node-connections)

###### [useNodeId()](https://reactflow.dev/api-reference/hooks/use-node-id)


You can use this hook to get the id of the node it is used inside. It is useful if you need the node's id deeper in the render tree but don't want to manually drill down the id as a prop.

[Read more](https://reactflow.dev/api-reference/hooks/use-node-id)

###### [useNodes()](https://reactflow.dev/api-reference/hooks/use-nodes)


This hook returns an array of the current nodes. Components that use this hook will re-render whenever any node changes, including when a node is selected or moved.

[Read more](https://reactflow.dev/api-reference/hooks/use-nodes)

###### [useNodesData()](https://reactflow.dev/api-reference/hooks/use-nodes-data)


With this hook you can subscribe to changes of a node data of a specific node.

[Read more](https://reactflow.dev/api-reference/hooks/use-nodes-data)

###### [useNodesInitialized()](https://reactflow.dev/api-reference/hooks/use-nodes-initialized)


This hook tells you whether all the nodes in a flow have been measured and given a width and height. When you add a node to the flow, this hook will return false and then true again once the node has been measured.

[Read more](https://reactflow.dev/api-reference/hooks/use-nodes-initialized)

###### [useNodesState()](https://reactflow.dev/api-reference/hooks/use-nodes-state)


This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the ReactFlowInstance. You can think of it like React's \`useState\` hook with an additional helper callback.

[Read more](https://reactflow.dev/api-reference/hooks/use-nodes-state)

###### [useOnSelectionChange()](https://reactflow.dev/api-reference/hooks/use-on-selection-change)


This hook lets you listen for changes to both node and edge selection. As the name implies, the callback you provide will be called whenever the selection of either nodes or edges changes.

[Read more](https://reactflow.dev/api-reference/hooks/use-on-selection-change)

###### [useOnViewportChange()](https://reactflow.dev/api-reference/hooks/use-on-viewport-change)


The useOnViewportChange hook lets you listen for changes to the viewport such as panning and zooming. You can provide a callback for each phase of a viewport change: onStart, onChange, and onEnd.

[Read more](https://reactflow.dev/api-reference/hooks/use-on-viewport-change)

###### [useReactFlow()](https://reactflow.dev/api-reference/hooks/use-react-flow)


This hook returns a ReactFlowInstance that can be used to update nodes and edges, manipulate the viewport, or query the current state of the flow.

[Read more](https://reactflow.dev/api-reference/hooks/use-react-flow)

###### [useStore()](https://reactflow.dev/api-reference/hooks/use-store)


This hook can be used to subscribe to internal state changes of the React Flow component. The useStore hook is re-exported from the Zustand state management library, so you should check out their docs for more details.

[Read more](https://reactflow.dev/api-reference/hooks/use-store)

###### [useStoreApi()](https://reactflow.dev/api-reference/hooks/use-store-api)


In some cases, you might need to access the store directly. This hook returns the store object which can be used on demand to access the state or dispatch actions.

[Read more](https://reactflow.dev/api-reference/hooks/use-store-api)

###### [useUpdateNodeInternals()](https://reactflow.dev/api-reference/hooks/use-update-node-internals)


When you programmatically add or remove handles to a node or update a node's handle position, you need to let React Flow know about it using this hook. This will update the internal dimensions of the node and properly reposition handles on the canvas if necessary.

[Read more](https://reactflow.dev/api-reference/hooks/use-update-node-internals)

###### [useViewport()](https://reactflow.dev/api-reference/hooks/use-viewport)


The useViewport hook is a convenient way to read the current state of the Viewport in a component. Components that use this hook will re-render whenever the viewport changes.

[Read more](https://reactflow.dev/api-reference/hooks/use-viewport)

---

## useConnection() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-connection

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useConnection.ts) 

The `useConnection` hook returns the current connection state when there is an active connection interaction. If no connection interaction is active, it returns `null` for every property. A typical use case for this hook is to colorize handles based on a certain condition (e.g. if the connection is valid or not).

```typescript
import { useConnection } from '@xyflow/react';
 
export default function App() {
  const connection = useConnection();
 
  return (
    <div>
      {connection ? `Someone is trying to make a connection from ${connection.fromNode} to this one.` : 'There are currently no incoming connections!'}
    </div>
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#connectionselector)`connectionSelector` | `(connection: [ConnectionState](https://reactflow.dev/api-reference/types/connection-state)<[InternalNode](https://reactflow.dev/api-reference/types/internal-node)<[NodeType](https://reactflow.dev/api-reference/types/node)>>) => SelectorReturn` An optional selector function used to extract a slice of the `ConnectionState` data. Using a selector can prevent component re-renders where data you don’t otherwise care about might change. If a selector is not provided, the entire `ConnectionState` object is returned unchanged. |  |

**Returns:**

[](#returns)`SelectorReturn`

ConnectionState

Last updated on

April 12, 2025

---

## useEdges() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-edges

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useEdges.ts) 

This hook returns an array of the current edges. Components that use this hook will re-render **whenever any edge changes**.

```typescript
import { useEdges } from '@xyflow/react';
 
export default function () {
  const edges = useEdges();
 
  return <div>There are currently {edges.length} edges!</div>;
}
```

###### Signature[](#signature)


**Parameters:**

This function does not accept any parameters.

**Returns:**

[](#returns)`[EdgeType](https://reactflow.dev/api-reference/types/edge)[]`

An array of all edges currently in the flow.

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom edge types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const nodes = useEdges<CustomEdgeType>();
```

###### Notes[](#notes)


* Relying on `useEdges` unnecessarily can be a common cause of performance issues. Whenever any edge changes, this hook will cause the component to re-render. Often we actually care about something more specific, like when the *number* of edges changes: where possible try to use [`useStore`](https://reactflow.dev/api-reference/hooks/use-store) instead.

Last updated on

April 12, 2025

---

## useEdgesState() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-edges-state

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesEdgesState.ts) 

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the `ReactFlowInstance`. You can think of it like React’s `useState` hook with an additional helper callback.

```typescript
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
 
const initialNodes = [];
const initialEdges = [];
 
export default function () {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#initialedges)`initialEdges` | `[EdgeType](https://reactflow.dev/api-reference/types/edge)[]` |  |

**Returns:**

[](#returns)`[edges: [EdgeType](https://reactflow.dev/api-reference/types/edge)[], setEdges: [Dispatch](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[SetStateAction](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[EdgeType](https://reactflow.dev/api-reference/types/edge)[]>>, onEdgesChange: [OnEdgesChange](https://reactflow.dev/api-reference/types/on-edges-change)<[EdgeType](https://reactflow.dev/api-reference/types/edge)>]`

* `edges`: The current array of edges. You might pass this directly to the `edges` prop of your `<ReactFlow />` component, or you may want to manipulate it first to perform some layouting, for example.
* `setEdges`: A function that you can use to update the edges. You can pass it a new array of edges or a callback that receives the current array of edges and returns a new array of edges. This is the same as the second element of the tuple returned by React’s `useState` hook.
* `onEdgesChange`: A handy callback that can take an array of `EdgeChanges` and update the edges state accordingly. You’ll typically pass this directly to the `onEdgesChange` prop of your `<ReactFlow />` component.

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom edge types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const nodes = useEdgesState<CustomEdgeType>();
```

###### Notes[](#notes)


* This hook was created to make prototyping easier and our documentation examples clearer. Although it is OK to use this hook in production, in practice you may want to use a more sophisticated state management solution like [Zustand](https://reactflow.dev/docs/guides/state-management/)  instead.

Last updated on

April 12, 2025

---

## useHandleConnections() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-handle-connections

This hook returns an array connections on a specific handle or handle type.

```typescript
import { useHandleConnections } from '@xyflow/react';
 
export default function () {
  const connections = useHandleConnections({ type: 'target', id: 'my-handle' });
 
  return (
    <div>There are currently {connections.length} incoming connections!</div>
  );
}
```

---

## useInternalNode() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-internal-node

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useInternalNode.ts) 

This hook returns the internal representation of a specific node. Components that use this hook will re-render **whenever any node changes**, including when a node is selected or moved.

```typescript
import { useInternalNode } from '@xyflow/react';
 
export default function () {
  const internalNode = useInternalNode('node-1');
  const absolutePosition = internalNode.internals.positionAbsolute;
 
  return (
    <div>
      The absolute position of the node is at:
      <p>x: {absolutePosition.x}</p>
      <p>y: {absolutePosition.y}</p>
    </div>
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#id)`id` | `string` The ID of a node you want to observe. |  |

**Returns:**

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const internalNode = useInternalNode<CustomNodeType>();
```

---

## useKeyPress() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-key-press

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useKeyPress.ts) 

This hook lets you listen for specific key codes and tells you whether they are currently pressed or not.

```typescript
import { useKeyPress } from '@xyflow/react';
 
export default function () {
  const spacePressed = useKeyPress('Space');
  const cmdAndSPressed = useKeyPress(['Meta+s', 'Strg+s']);
 
  return (
    <div>
      {spacePressed && <p>Space pressed!</p>}
      {cmdAndSPressed && <p>Cmd + S pressed!</p>}
    </div>
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#keycode)`keyCode` | `KeyCode` The key code (string or array of strings) specifies which key(s) should trigger an action. A **string** can represent: * A **single key**, e.g. `'a'` * A **key combination**, using `'+'` to separate keys, e.g. `'a+d'` An **array of strings** represents **multiple possible key inputs**. For example, `['a', 'd+s']` means the user can press either the single key `'a'` or the combination of `'d'` and `'s'`. | `null` |
| [](#optionstarget)`options.target` | `Window | Document | HTMLElement | ShadowRoot | null` Listen to key presses on a specific element. | `document` |
| [](#optionsactinsideinputwithmodifier)`options.actInsideInputWithModifier` | `boolean` You can use this flag to prevent triggering the key press hook when an input field is focused. | `true` |
| [](#optionspreventdefault)`options.preventDefault` | `boolean` |  |

**Returns:**

[](#returns)`boolean`

###### Notes[](#notes)


* This hook does not rely on a `ReactFlowInstance` so you are free to use it anywhere in your app!

Last updated on

April 12, 2025

---

## useNodeId() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-node-id

On This Page

* [Signature](#signature)
* [Notes](#notes)

[Source on Github](https://github.com/xyflow/xyflow/blob/v11/packages/core/src/contexts/NodeIdContext.ts/#L7) 

You can use this hook to get the id of the node it is used inside. It is useful if you need the node’s id deeper in the render tree but don’t want to manually drill down the id as a prop.

```typescript
import { useNodeId } from '@xyflow/react';
 
export default function CustomNode() {
  return (
    <div>
      <span>This node has an id of </span>
      <NodeIdDisplay />
    </div>
  );
}
 
function NodeIdDisplay() {
  const nodeId = useNodeId();
 
  return <span>{nodeId}</span>;
}
```

###### Signature[](#signature)


**Parameters:**

This function does not accept any parameters.

**Returns:**

[](#returns)`string | null`

The id for a node in the flow.

###### Notes[](#notes)


* This hook should only be used within a custom node or its children.

Last updated on

April 12, 2025

---

## useNodeConnections() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-node-connections

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodeConnections.ts) 

This hook returns an array of connections on a specific node, handle type (‘source’, ‘target’) or handle ID.

```typescript
import { useNodeConnections } from '@xyflow/react';
 
export default function () {
  const connections = useNodeConnections({
    handleType: 'target',
    handleId: 'my-handle',
  });
 
  return (
    <div>There are currently {connections.length} incoming connections!</div>
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#0id)`[0]?.id` | `string` ID of the node, filled in automatically if used inside custom node. |  |
| [](#0handletype)`[0]?.handleType` | `HandleType` What type of handle connections do you want to observe? |  |
| [](#0handleid)`[0]?.handleId` | `string` Filter by handle id (this is only needed if the node has multiple handles of the same type). |  |
| [](#0onconnect)`[0]?.onConnect` | `(connections: [Connection](https://reactflow.dev/api-reference/types/connection)[]) => void` Gets called when a connection is established. |  |
| [](#0ondisconnect)`[0]?.onDisconnect` | `(connections: [Connection](https://reactflow.dev/api-reference/types/connection)[]) => void` Gets called when a connection is removed. |  |

**Returns:**

[](#returns)`[NodeConnection](https://reactflow.dev/api-reference/types/node-connection)[]`

An array with connections.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## useNodes() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-nodes

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodes.ts) 

This hook returns an array of the current nodes. Components that use this hook will re-render **whenever any node changes**, including when a node is selected or moved.

```typescript
import { useNodes } from '@xyflow/react';
 
export default function () {
  const nodes = useNodes();
 
  return <div>There are currently {nodes.length} nodes!</div>;
}
```

###### Signature[](#signature)


**Parameters:**

This function does not accept any parameters.

**Returns:**

[](#returns)`[NodeType](https://reactflow.dev/api-reference/types/node)[]`

An array of all nodes currently in the flow.

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const nodes = useNodes<CustomNodeType>();
```

###### Notes[](#notes)


* Relying on `useNodes` unnecessarily can be a common cause of performance issues. Whenever any node changes, this hook will cause the component to re-render. Often we actually care about something more specific, like when the *number* of nodes changes: where possible try to use [`useStore`](https://reactflow.dev/api-reference/hooks/use-store) instead.

Last updated on

April 12, 2025

---

## useOnSelectionChange() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-on-selection-change

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnSelectionChange.ts) 

This hook lets you listen for changes to both node and edge selection. As the name implies, the callback you provide will be called whenever the selection of *either* nodes or edges changes.

**Warning**

You need to memoize the passed `onChange` handler, otherwise the hook will not work correctly.

```typescript
import { useState } from 'react';
import { ReactFlow, useOnSelectionChange } from '@xyflow/react';
 
function SelectionDisplay() {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
 
  // the passed handler has to be memoized, otherwise the hook will not work correctly
  const onChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id));
    setSelectedEdges(edges.map((edge) => edge.id));
  }, []);
 
  useOnSelectionChange({
    onChange,
  });
 
  return (
    <div>
      <p>Selected nodes: {selectedNodes.join(', ')}</p>
      <p>Selected edges: {selectedEdges.join(', ')}</p>
    </div>
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#0onchange)`[0].onChange` | `OnSelectionChangeFunc<[NodeType](https://reactflow.dev/api-reference/types/node), [EdgeType](https://reactflow.dev/api-reference/types/edge)>` The handler to register. |  |

**Returns:**

[](#returns)`void`

###### Notes[](#notes)


* This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](https://reactflow.dev/api-reference/react-flow-provider) or a [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow) component.

Last updated on

April 12, 2025

---

## useNodesState() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-nodes-state

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesEdgesState.ts) 

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the `ReactFlowInstance`. You can think of it like React’s `useState` hook with an additional helper callback.

```typescript
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
 
const initialNodes = [];
const initialEdges = [];
 
export default function () {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#initialnodes)`initialNodes` | `[NodeType](https://reactflow.dev/api-reference/types/node)[]` |  |

**Returns:**

[](#returns)`[nodes: [NodeType](https://reactflow.dev/api-reference/types/node)[], setNodes: [Dispatch](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[SetStateAction](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[NodeType](https://reactflow.dev/api-reference/types/node)[]>>, onNodesChange: [OnNodesChange](https://reactflow.dev/api-reference/types/on-nodes-change)<[NodeType](https://reactflow.dev/api-reference/types/node)>]`

* `nodes`: The current array of nodes. You might pass this directly to the `nodes` prop of your `<ReactFlow />` component, or you may want to manipulate it first to perform some layouting, for example.
* `setNodes`: A function that you can use to update the nodes. You can pass it a new array of nodes or a callback that receives the current array of nodes and returns a new array of nodes. This is the same as the second element of the tuple returned by React’s `useState` hook.
* `onNodesChange`: A handy callback that can take an array of `NodeChanges` and update the nodes state accordingly. You’ll typically pass this directly to the `onNodesChange` prop of your `<ReactFlow />` component.

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const nodes = useNodesState<CustomNodeType>();
```

###### Notes[](#notes)


* This hook was created to make prototyping easier and our documentation examples clearer. Although it is OK to use this hook in production, in practice you may want to use a more sophisticated state management solution like [Zustand](https://reactflow.dev/docs/guides/state-management/)  instead.

Last updated on

April 12, 2025

---

## useNodesInitialized() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-nodes-initialized

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesInitialized.ts) 

This hook tells you whether all the nodes in a flow have been measured and given a width and height. When you add a node to the flow, this hook will return `false` and then `true` again once the node has been measured.

```typescript
import { useReactFlow, useNodesInitialized } from '@xyflow/react';
import { useEffect, useState } from 'react';
 
const options = {
  includeHiddenNodes: false,
};
 
export default function useLayout() {
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized(options);
  const [layoutedNodes, setLayoutedNodes] = useState(getNodes());
 
  useEffect(() => {
    if (nodesInitialized) {
      setLayoutedNodes(yourLayoutingFunction(getNodes()));
    }
  }, [nodesInitialized]);
 
  return layoutedNodes;
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#optionsincludehiddennodes)`options.includeHiddenNodes` | `boolean` | `false` |

**Returns:**

[](#returns)`boolean`

Whether or not the nodes have been initialized by the `<ReactFlow />` component and given a width and height.

###### Notes[](#notes)


* This hook always returns `false` if the internal nodes array is empty.

Last updated on

April 12, 2025

---

## useOnViewportChange() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-on-viewport-change

The `useOnViewportChange` hook lets you listen for changes to the viewport such as panning and zooming. You can provide a callback for each phase of a viewport change: `onStart`, `onChange`, and `onEnd`.

```typescript
import { useCallback } from 'react';
import { useOnViewportChange } from '@xyflow/react';
 
function ViewportChangeLogger() {
  useOnViewportChange({
    onStart: (viewport: Viewport) => console.log('start', viewport),
    onChange: (viewport: Viewport) => console.log('change', viewport),
    onEnd: (viewport: Viewport) => console.log('end', viewport),
  });
 
  return null;
}
```

---

## useNodesData() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-nodes-data

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesData.ts) 

This hook lets you subscribe to changes of a specific nodes `data` object.

```typescript
import { useNodesData } from '@xyflow/react';
 
export default function () {
  const nodeData = useNodesData('nodeId-1');
 
  const nodesData = useNodesData(['nodeId-1', 'nodeId-2']);
}
```

###### Signature[](#signature)


**Parameters:**

| Name | Type | Default |
| --- | --- | --- |
| [](#nodeid)`nodeId` | `string` The id of the node to get the data from. |  |

**Returns:**

[](#returns1)`Pick<[NodeType](https://reactflow.dev/api-reference/types/node), "id" | "type" | "data"> | null`

An object (or array of object) with `id`, `type`, `data` representing each node.

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const nodesData = useNodesData<NodesType>(['nodeId-1', 'nodeId-2']);
```

Last updated on

April 12, 2025

---

## useUpdateNodeInternals() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-update-node-internals

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useUpdateNodeInternals.ts) 

When you programmatically add or remove handles to a node or update a node’s handle position, you need to let React Flow know about it using this hook. This will update the internal dimensions of the node and properly reposition handles on the canvas if necessary.

```typescript
import { useCallback, useState } from 'react';
import { Handle, useUpdateNodeInternals } from '@xyflow/react';
 
export default function RandomHandleNode({ id }) {
  const updateNodeInternals = useUpdateNodeInternals();
  const [handleCount, setHandleCount] = useState(0);
  const randomizeHandleCount = useCallback(() => {
    setHandleCount(Math.floor(Math.random() * 10));
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);
 
  return (
    <>
      {Array.from({ length: handleCount }).map((_, index) => (
        <Handle
          key={index}
          type="target"
          position="left"
          id={`handle-${index}`}
        />
      ))}
 
      <div>
        <button onClick={randomizeHandleCount}>Randomize handle count</button>
        <p>There are {handleCount} handles on this node.</p>
      </div>
    </>
  );
}
```

###### Signature[](#signature)


**Parameters:**

This function does not accept any parameters.

**Returns:**

[](#returns)`UpdateNodeInternals`

Use this function to tell React Flow to update the internal state of one or more nodes that you have changed programmatically.

###### Notes[](#notes)


* This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](https://reactflow.dev/api-reference/react-flow-provider) or a [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow) component.

Last updated on

April 12, 2025

---

## useReactFlow() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-react-flow

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useReactFlow.ts) 

This hook returns a [`ReactFlowInstance`](https://reactflow.dev/api-reference/types/react-flow-instance) that can be used to update nodes and edges, manipulate the viewport, or query the current state of the flow.

```typescript
import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
 
export function NodeCounter() {
  const reactFlow = useReactFlow();
  const [count, setCount] = useState(0);
  const countNodes = useCallback(() => {
    setCount(reactFlow.getNodes().length);
    // you need to pass it as a dependency if you are using it with useEffect or useCallback
    // because at the first render, it's not initialized yet and some functions might not work.
  }, [reactFlow]);
 
  return (
    <div>
      <button onClick={countNodes}>Update count</button>
      <p>There are {count} nodes in the flow.</p>
    </div>
  );
}
```

###### Signature[](#signature)


**Parameters:**

This function does not accept any parameters.

**Returns:**

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom node & edge types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const reactFlow = useReactFlow<CustomNodeType, CustomEdgeType>();
```

###### Notes[](#notes)


* This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](https://reactflow.dev/api-reference/react-flow-provider) or a [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow) component.
* Unlike [`useNodes`](https://reactflow.dev/api-reference/hooks/use-nodes) or [`useEdges`](https://reactflow.dev/api-reference/hooks/use-edges), this hook won’t cause your component to re-render when state changes. Instead, you can query the state when you need it by using methods on the [`ReactFlowInstance`](https://reactflow.dev/api-reference/types/react-flow-instance) this hook returns.

Last updated on

April 12, 2025

---

## useViewport() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-viewport

The `useViewport` hook is a convenient way to read the current state of the [`Viewport`](https://reactflow.dev/api-reference/types/viewport) in a component. Components that use this hook will re-render **whenever the viewport changes**.

```typescript
import { useViewport } from '@xyflow/react';
 
export default function ViewportDisplay() {
  const { x, y, zoom } = useViewport();
 
  return (
    <div>
      <p>
        The viewport is currently at ({x}, {y}) and zoomed to {zoom}.
      </p>
    </div>
  );
}
```

This function does not accept any parameters.

The current viewport.

---

## useStoreApi() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-store-api

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useStore.ts) 

In some cases, you might need to access the store directly. This hook returns the store object which can be used on demand to access the state or dispatch actions.

**Note**

This hook should only be used if there is no other way to access the internal state. For many of the common use cases, there are dedicated hooks available such as [`useReactFlow`](https://reactflow.dev/api-reference/hooks/use-react-flow), [`useViewport`](https://reactflow.dev/api-reference/hooks/use-viewport), etc.

```typescript
import { useState, useCallback } from 'react';
import { ReactFlow, useStoreApi } from '@xyflow/react';
 
const NodesLengthDisplay = () => {
  const [nodesLength, setNodesLength] = useState(0);
  const store = useStoreApi();
 
  const onClick = useCallback(() => {
    const { nodes } = store.getState();
    const length = nodes.length || 0;
 
    setNodesLength(length);
  }, [store]);
 
  return (
    <div>
      <p>The current number of nodes is: {nodesLength}</p>
      <button onClick={onClick}>Update node length.</button>
    </div>
  );
};
 
function Flow() {
  return (
    <ReactFlow nodes={nodes}>
      <NodesLengthLogger />
    </ReactFlow>
  );
}
```

This example computes the number of nodes in the flow *on-demand*. This is in contrast to the example in the [`useStore`](https://reactflow.dev/api-reference/hooks/use-store) hook that re-renders the component whenever the number of nodes changes.

Choosing whether to calculate values on-demand or to subscribe to changes as they happen is a bit of a balancing act. On the one hand, putting too many heavy calculations in an event handler can make your app feel sluggish or unresponsive. On the other hand, computing values eagerly can lead to slow or unnecessary re-renders.

We make both this hook and [`useStore`](https://reactflow.dev/api-reference/hooks/use-store) available so that you can choose the approach that works best for your use-case.

###### Signature[](#signature)


**Parameters:**

This function does not accept any parameters.

**Returns:**

The store object.

| Name | Type |
| --- | --- |
| [](#getstate)`getState` | `() => ReactFlowState<[NodeType](https://reactflow.dev/api-reference/types/node), [EdgeType](https://reactflow.dev/api-reference/types/edge)>` |
| [](#setstate)`setState` | `(partial: ReactFlowState<[NodeType](https://reactflow.dev/api-reference/types/node), [EdgeType](https://reactflow.dev/api-reference/types/edge)> | [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<ReactFlowState<[NodeType](https://reactflow.dev/api-reference/types/node), [EdgeType](https://reactflow.dev/api-reference/types/edge)>> | ((state: ReactFlowState<...>) => ReactFlowState<...> | [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<...>), replace?: boolean | undefined) => void` |
| [](#subscribe)`subscribe` | `(listener: (state: ReactFlowState<[NodeType](https://reactflow.dev/api-reference/types/node), [EdgeType](https://reactflow.dev/api-reference/types/edge)>, prevState: ReactFlowState<[NodeType](https://reactflow.dev/api-reference/types/node), [EdgeType](https://reactflow.dev/api-reference/types/edge)>) => void) => () => void` |

###### TypeScript[](#typescript)


This hook accepts a generic type argument of custom node & edge types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const store = useStoreApi<CustomNodeType, CustomEdgeType>();
```

Last updated on

April 12, 2025

---

## useStore() - React Flow

URL: https://reactflow.dev/api-reference/hooks/use-store

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useStore.ts) 

This hook can be used to subscribe to internal state changes of the React Flow component. The `useStore` hook is re-exported from the [Zustand](https://github.com/pmndrs/zustand)  state management library, so you should check out their docs for more details.

This hook should only be used if there is no other way to access the internal state. For many of the common use cases, there are dedicated hooks available such as [`useReactFlow`](https://reactflow.dev/api-reference/hooks/use-react-flow), [`useViewport`](https://reactflow.dev/api-reference/hooks/use-viewport), etc.

```typescript
import { ReactFlow, useStore } from '@xyflow/react';
 
const nodesLengthSelector = (state) =>
  state.nodes.length || 0;
 
const NodesLengthDisplay = () => {
  const nodesLength = useStore(nodesLengthSelector);
 
  return <div>The current number of nodes is: {nodesLength}</div>;
};
 
function Flow() {
  return (
    <ReactFlow nodes={[...]}>
      <NodesLengthDisplay />
    </ReactFlow>
  );
}
```

This example computes the number of nodes eagerly. Whenever the number of nodes in the flow changes, the `<NodesLengthDisplay />` component will re-render. This is in contrast to the example in the [`useStoreApi`](https://reactflow.dev/api-reference/hooks/use-store-api) hook that only computes the number of nodes when a button is clicked.

Choosing whether to calculate values on-demand or to subscribe to changes as they happen is a bit of a balancing act. On the one hand, putting too many heavy calculations in an event handler can make your app feel sluggish or unresponsive. On the other hand, computing values eagerly can lead to slow or unnecessary re-renders.

We make both this hook and [`useStoreApi`](https://reactflow.dev/api-reference/hooks/use-store-api) available so that you can choose the approach that works best for your use-case.

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#selector)`selector` | `(state: ReactFlowState) => StateSlice` A selector function that returns a slice of the flow’s internal state. Extracting or transforming just the state you need is a good practice to avoid unnecessary re-renders. |  |
| [](#equalityfn)`equalityFn` | `(a: StateSlice, b: StateSlice) => boolean` A function to compare the previous and next value. This is incredibly useful for preventing unnecessary re-renders. Good sensible defaults are using `Object.is` or importing `zustand/shallow`, but you can be as granular as you like. |  |

**Returns:**

[](#returns)`StateSlice`

The selected state slice.

###### Examples[](#examples)


##### Triggering store actions[](#triggering-store-actions)


You can manipulate the internal React Flow state by triggering internal actions through the `useStore` hook. These actions are already used internally throughout the library, but you can also use them to implement custom functionality.

```typescript
import { useStore } from '@xyflow/react';
 
const setMinZoomSelector = (state) => state.setMinZoom;
 
function MinZoomSetter() {
  const setMinZoom = useStore(setMinZoomSelector);
 
  return <button onClick={() => setMinZoom(6)}>set min zoom</button>;
}
```

###### TypeScript[](#typescript)


This hook can be typed by typing the selector function. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const nodes = useStore((s: ReactFlowState<CustomNodeType>) => ({
  nodes: s.nodes,
}));
```

###### Notes[](#notes)


* You should define your store selector function *outside* of the component that uses it, or use React’s `useCallback` hook to memoize the function. Not doing this can incur a slight performance penalty.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Types - React Flow

URL: https://reactflow.dev/api-reference/types

###### [BackgroundVariant](https://reactflow.dev/api-reference/types/background-variant)


The three variants are exported as an enum for convenience. You can either import the enum and use it like BackgroundVariant.Lines or you can use the raw string value directly.

[Read more](https://reactflow.dev/api-reference/types/background-variant)

###### [Connection](https://reactflow.dev/api-reference/types/connection)


The Connection type is the basic minimal description of an Edge between two nodes. The addEdge util can be used to upgrade a Connection to an Edge.

[Read more](https://reactflow.dev/api-reference/types/connection)

###### [ConnectionLineComponentProps](https://reactflow.dev/api-reference/types/connection-line-component-props)


If you want to render a custom component for connection lines, you can set the connectionLineComponent prop on the ReactFlow component. The ConnectionLineComponentProps are passed to your custom component.

[Read more](https://reactflow.dev/api-reference/types/connection-line-component-props)

###### [ConnectionLineType](https://reactflow.dev/api-reference/types/connection-line-type)


If you set the connectionLineType prop on your ReactFlow component, it will dictate the style of connection line rendered when creating new edges.

[Read more](https://reactflow.dev/api-reference/types/connection-line-type)

###### [ConnectionState](https://reactflow.dev/api-reference/types/connection-state)


Data about an ongoing connection.

[Read more](https://reactflow.dev/api-reference/types/connection-state)

###### [CoordinateExtent](https://reactflow.dev/api-reference/types/coordinate-extent)


A coordinate extent represents two points in a coordinate system: one in the top left corner and one in the bottom right corner. It is used to represent the bounds of nodes in the flow or the bounds of the viewport.

[Read more](https://reactflow.dev/api-reference/types/coordinate-extent)

###### [DefaultEdgeOptions](https://reactflow.dev/api-reference/types/default-edge-options)


Many properties on an Edge are optional. When a new edge is created, the properties that are not provided will be filled in with the default values passed to the defaultEdgeOptions prop of the ReactFlow component.

[Read more](https://reactflow.dev/api-reference/types/default-edge-options)

###### [DeleteElements](https://reactflow.dev/api-reference/types/delete-elements)


DeleteElements deletes nodes and edges from the flow and return the deleted edges and nodes asynchronously.

[Read more](https://reactflow.dev/api-reference/types/delete-elements)

###### [Edge](https://reactflow.dev/api-reference/types/edge)


Where a Connection is the minimal description of an edge between two nodes, an \`Edge\` is the complete description with everything React Flow needs to know in order to render it.

[Read more](https://reactflow.dev/api-reference/types/edge)

###### [EdgeChange](https://reactflow.dev/api-reference/types/edge-change)


The onEdgesChange callback takes an array of EdgeChange objects that you should use to update your flow's state. The EdgeChange type is a union of four different object types that represent that various ways an edge can change in a flow.

[Read more](https://reactflow.dev/api-reference/types/edge-change)

###### [EdgeMarker](https://reactflow.dev/api-reference/types/edge-marker)


Edges can optionally have markers at the start and end of an edge. The EdgeMarker type is used to configure those markers! Check the docs for MarkerType for details on what types of edge marker are available.

[Read more](https://reactflow.dev/api-reference/types/edge-marker)

###### [EdgeProps](https://reactflow.dev/api-reference/types/edge-props)


When you implement a custom edge it is wrapped in a component that enables some basic functionality. Your custom edge component receives the following props:

[Read more](https://reactflow.dev/api-reference/types/edge-props)

###### [FitViewOptions](https://reactflow.dev/api-reference/types/fit-view-options)


When calling fitView these options can be used to customize the behavior. For example, the duration option can be used to transform the viewport smoothly over a given amount of time.

[Read more](https://reactflow.dev/api-reference/types/fit-view-options)

###### [Handle](https://reactflow.dev/api-reference/types/handle)


Handle attributes like id, position, and type.

[Read more](https://reactflow.dev/api-reference/types/handle)

###### [HandleConnection](https://reactflow.dev/api-reference/types/handle-connection)


The HandleConnection type is a Connection that includes the edgeId.

[Read more](https://reactflow.dev/api-reference/types/handle-connection)

###### [InternalNode](https://reactflow.dev/api-reference/types/internal-node)


The InternalNode is an extension of the base Node type with additional properties React Flow uses internally for rendering.

[Read more](https://reactflow.dev/api-reference/types/internal-node)

###### [MarkerType](https://reactflow.dev/api-reference/types/marker-type)


Edges may optionally have a marker on either end. The MarkerType type enumerates the options available to you when configuring a given marker.

[Read more](https://reactflow.dev/api-reference/types/marker-type)

###### [MiniMapNodeProps](https://reactflow.dev/api-reference/types/mini-map-node-props)


[Read more](https://reactflow.dev/api-reference/types/mini-map-node-props)

###### [Node](https://reactflow.dev/api-reference/types/node)


The Node type represents everything React Flow needs to know about a given node. Many of these properties can be manipulated both by React Flow or by you, but some such as width and height should be considered read-only.

[Read more](https://reactflow.dev/api-reference/types/node)

###### [NodeChange](https://reactflow.dev/api-reference/types/node-change)


The onNodesChange callback takes an array of NodeChange objects that you should use to update your flow's state. The NodeChange type is a union of six different object types that represent that various ways an node can change in a flow.

[Read more](https://reactflow.dev/api-reference/types/node-change)

###### [NodeConnection](https://reactflow.dev/api-reference/types/node-connection)


The NodeConnection type is a Connection that includes the edgeId.

[Read more](https://reactflow.dev/api-reference/types/node-connection)

###### [NodeHandle](https://reactflow.dev/api-reference/types/node-handle)


Edges may optionally have a marker on either end. The MarkerType type enumerates the options available to you when configuring a given marker.

[Read more](https://reactflow.dev/api-reference/types/node-handle)

###### [NodeOrigin](https://reactflow.dev/api-reference/types/node-origin)


The origin of a Node determines how it is placed relative to its own coordinates.

[Read more](https://reactflow.dev/api-reference/types/node-origin)

###### [NodeProps](https://reactflow.dev/api-reference/types/node-props)


When you implement a custom node it is wrapped in a component that enables basic functionality like selection and dragging. Your custom node receives the following props:

[Read more](https://reactflow.dev/api-reference/types/node-props)

###### [OnEdgesChange](https://reactflow.dev/api-reference/types/on-edges-change)


[Read more](https://reactflow.dev/api-reference/types/on-edges-change)

###### [OnNodesChange](https://reactflow.dev/api-reference/types/on-nodes-change)


[Read more](https://reactflow.dev/api-reference/types/on-nodes-change)

###### [PanOnScrollMode](https://reactflow.dev/api-reference/types/pan-on-scroll-mode)


This enum is used to set the different modes of panning the viewport when the user scrolls.

[Read more](https://reactflow.dev/api-reference/types/pan-on-scroll-mode)

###### [PanelPosition](https://reactflow.dev/api-reference/types/panel-position)


This type is mostly used to help position things on top of the flow viewport. For example both the MiniMap and Controls components take a position prop of this type.

[Read more](https://reactflow.dev/api-reference/types/panel-position)

###### [Position](https://reactflow.dev/api-reference/types/position)


While PanelPosition can be used to place a component in the corners of a container, the Position enum is less precise and used primarily in relation to edges and handles.

[Read more](https://reactflow.dev/api-reference/types/position)

###### [ProOptions](https://reactflow.dev/api-reference/types/pro-options)


By default, we render a small attribution in the corner of your flows that links back to the project. Anyone is free to remove this attribution whether they're a Pro subscriber or not but we ask that you take a quick look at our removing attribution guide before doing so.

[Read more](https://reactflow.dev/api-reference/types/pro-options)

###### [ReactFlowInstance](https://reactflow.dev/api-reference/types/react-flow-instance)


The ReactFlowInstance provides a collection of methods to query and manipulate the internal state of your flow. You can get an instance by using the useReactFlow hook or attaching a listener to the onInit event.

[Read more](https://reactflow.dev/api-reference/types/react-flow-instance)

###### [ReactFlowJsonObject](https://reactflow.dev/api-reference/types/react-flow-json-object)


A JSON-compatible representation of your flow. You can use this to save the flow to a database for example and load it back in later.

[Read more](https://reactflow.dev/api-reference/types/react-flow-json-object)

###### [ResizeParams](https://reactflow.dev/api-reference/types/resize-params)


The ResizeParams type is used to type the various events that are emitted by the NodeResizer component. You'll sometimes see this type extended with an additional direction field too.

[Read more](https://reactflow.dev/api-reference/types/resize-params)

###### [Viewport](https://reactflow.dev/api-reference/types/viewport)


Internally, React Flow maintains a coordinate system that is independent of the rest of the page. The Viewport type tells you where in that system your flow is currently being display at and how zoomed in or out it is.

[Read more](https://reactflow.dev/api-reference/types/viewport)

###### [XYPosition](https://reactflow.dev/api-reference/types/xy-position)


All positions are stored in an object with x and y coordinates.

[Read more](https://reactflow.dev/api-reference/types/xy-position)

---

## Connection - React Flow

URL: https://reactflow.dev/api-reference/types/connection

The `Connection` type is the basic minimal description of an [`Edge`](https://reactflow.dev/api-reference/types/edge) between two nodes. The [`addEdge`](https://reactflow.dev/api-reference/utils/add-edge) util can be used to upgrade a `Connection` to an [`Edge`](https://reactflow.dev/api-reference/types/edge).

NameTypeDefault[](#source)`source``string`

The id of the node this connection originates from.

[](#target)`target``string`

The id of the node this connection terminates at.

[](#sourcehandle)`sourceHandle``string | null`

When not `null`, the id of the handle on the source node that this connection originates from.

[](#targethandle)`targetHandle``string | null`

When not `null`, the id of the handle on the target node that this connection terminates at.

---

## ConnectionLineComponentProps - React Flow

URL: https://reactflow.dev/api-reference/types/connection-line-component-props

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L193) 

If you want to render a custom component for connection lines, you can set the `connectionLineComponent` prop on the [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow#connection-connectionLineComponent) component. The `ConnectionLineComponentProps` are passed to your custom component.

```typescript
export type ConnectionLineComponentProps = {
  connectionLineStyle?: React.CSSProperties;
  connectionLineType: ConnectionLineType;
  fromNode?: Node;
  fromHandle?: Handle;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition: Position;
  toPosition: Position;
  connectionStatus: 'valid' | 'invalid' | null;
};
```

###### Props[](#props)


| Name | Type | Default |
| --- | --- | --- |
| [](#connectionlinestyle)`connectionLineStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` |  |
| [](#connectionlinetype)`connectionLineType` | `[ConnectionLineType](https://reactflow.dev/api-reference/types/connection-line-type)` |  |
| [](#fromnode)`fromNode` | `[InternalNode](https://reactflow.dev/api-reference/types/internal-node)<[NodeType](https://reactflow.dev/api-reference/types/node)>` The node the connection line originates from. |  |
| [](#fromhandle)`fromHandle` | `[Handle](https://reactflow.dev/api-reference/types/handle)` The handle on the `fromNode` that the connection line originates from. |  |
| [](#fromx)`fromX` | `number` |  |
| [](#fromy)`fromY` | `number` |  |
| [](#tox)`toX` | `number` |  |
| [](#toy)`toY` | `number` |  |
| [](#fromposition)`fromPosition` | `[Position](https://reactflow.dev/api-reference/types/position)` |  |
| [](#toposition)`toPosition` | `[Position](https://reactflow.dev/api-reference/types/position)` |  |
| [](#connectionstatus)`connectionStatus` | `"valid" | "invalid" | null` If there is an `isValidConnection` callback, this prop will be set to `"valid"` or `"invalid"` based on the return value of that callback. Otherwise, it will be `null`. |  |
| [](#tonode)`toNode` | `[InternalNode](https://reactflow.dev/api-reference/types/internal-node)<[NodeType](https://reactflow.dev/api-reference/types/node)> | null` |  |
| [](#tohandle)`toHandle` | `[Handle](https://reactflow.dev/api-reference/types/handle) | null` |  |

Last updated on

April 12, 2025

---

## CoordinateExtent - React Flow

URL: https://reactflow.dev/api-reference/types/coordinate-extent

A coordinate extent represents two points in a coordinate system: one in the top left corner and one in the bottom right corner. It is used to represent the bounds of nodes in the flow or the bounds of the viewport.

```typescript
export type CoordinateExtent = [[number, number], [number, number]];
```

---

## BackgroundVariant - React Flow

URL: https://reactflow.dev/api-reference/types/background-variant

The three variants are exported as an enum for convenience. You can either import the enum and use it like `BackgroundVariant.Lines` or you can use the raw string value directly.

```typescript
export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
  Cross = 'cross',
}
```

---

## ConnectionLineType - React Flow

URL: https://reactflow.dev/api-reference/types/connection-line-type

If you set the `connectionLineType` prop on your [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow#connection-connectionLineType) component, it will dictate the style of connection line rendered when creating new edges.

```typescript
export enum ConnectionLineType {
  Bezier = 'default',
  Straight = 'straight',
  Step = 'step',
  SmoothStep = 'smoothstep',
  SimpleBezier = 'simplebezier',
}
```

---

## ConnectionState - React Flow

URL: https://reactflow.dev/api-reference/types/connection-state

The `ConnectionState` type bundles all information about an ongoing connection. It is returned by the [`useConnection`](https://reactflow.dev/api-reference/hooks/use-connection) hook.

```typescript
type NoConnection = {
  inProgress: false;
  isValid: null;
  from: null;
  fromHandle: null;
  fromPosition: null;
  fromNode: null;
  to: null;
  toHandle: null;
  toPosition: null;
  toNode: null;
};
type ConnectionInProgress = {
  inProgress: true;
  isValid: boolean | null;
  from: XYPosition;
  fromHandle: Handle;
  fromPosition: Position;
  fromNode: NodeBase;
  to: XYPosition;
  toHandle: Handle | null;
  toPosition: Position;
  toNode: NodeBase | null;
};
 
type ConnectionState = ConnectionInProgress | NoConnection;
```

NameTypeDefault[](#inprogress)`inProgress``boolean`

Indicates whether a connection is currently in progress.

[](#isvalid)`isValid``boolean | null`

If an ongoing connection is above a handle or inside the connection radius, this will be `true` or `false`, otherwise `null`.

[](#from)`from``[XYPosition](https://reactflow.dev/api-reference/types/xy-position) | null`

Returns the xy start position or `null` if no connection is in progress.

[](#fromhandle)`fromHandle``[Handle](https://reactflow.dev/api-reference/types/handle) | null`

Returns the start handle or `null` if no connection is in progress.

[](#fromposition)`fromPosition``[Position](https://reactflow.dev/api-reference/types/position) | null`

Returns the side (called position) of the start handle or `null` if no connection is in progress.

[](#fromnode)`fromNode``[NodeType](https://reactflow.dev/api-reference/types/node) | null`

Returns the start node or `null` if no connection is in progress.

[](#to)`to``[XYPosition](https://reactflow.dev/api-reference/types/xy-position) | null`

Returns the xy end position or `null` if no connection is in progress.

[](#tohandle)`toHandle``[Handle](https://reactflow.dev/api-reference/types/handle) | null`

Returns the end handle or `null` if no connection is in progress.

[](#toposition)`toPosition``[Position](https://reactflow.dev/api-reference/types/position) | null`

Returns the side (called position) of the end handle or `null` if no connection is in progress.

[](#tonode)`toNode``[NodeType](https://reactflow.dev/api-reference/types/node) | null`

Returns the end node or `null` if no connection is in progress.

---

## DeleteElements - React Flow

URL: https://reactflow.dev/api-reference/types/delete-elements

DeleteElements deletes provided nodes and edges and handles deleting any connected edges as well as child nodes. Returns successfully deleted edges and nodes asynchronously.

```typescript
export type DeleteElements = (payload: {
  nodes?: (Partial<Node> & { id: Node['id'] })[];
  edges?: (Partial<Edge> & { id: Edge['id'] })[];
}) => Promise<{
  deletedNodes: Node[];
  deletedEdges: Edge[];
}>;
```

---

## Edge - React Flow

URL: https://reactflow.dev/api-reference/types/edge

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L34-L353) 

Where a [`Connection`](https://reactflow.dev/api-reference/types/connection) is the minimal description of an edge between two nodes, an `Edge` is the complete description with everything React Flow needs to know in order to render it.

```typescript
export type Edge<T> = DefaultEdge<T> | SmoothStepEdge<T> | BezierEdge<T>;
```

###### Variants[](#variants)


##### Edge[](#edge)


[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L34-L353) 

| Name | Type | Default |
| --- | --- | --- |
| [](#id)`id` | `string` Unique id of an edge. |  |
| [](#type)`type` | `[EdgeType](https://reactflow.dev/api-reference/types/edge)` Type of edge defined in `edgeTypes`. |  |
| [](#source)`source` | `string` Id of source node. |  |
| [](#target)`target` | `string` Id of target node. |  |
| [](#sourcehandle)`sourceHandle` | `string | null` Id of source handle, only needed if there are multiple handles per node. |  |
| [](#targethandle)`targetHandle` | `string | null` Id of target handle, only needed if there are multiple handles per node. |  |
| [](#animated)`animated` | `boolean` |  |
| [](#hidden)`hidden` | `boolean` |  |
| [](#deletable)`deletable` | `boolean` |  |
| [](#selectable)`selectable` | `boolean` |  |
| [](#data)`data` | `EdgeData` Arbitrary data passed to an edge. |  |
| [](#selected)`selected` | `boolean` |  |
| [](#markerstart)`markerStart` | `[EdgeMarkerType](https://reactflow.dev/api-reference/types/edge-marker)` Set the marker on the beginning of an edge. |  |
| [](#markerend)`markerEnd` | `[EdgeMarkerType](https://reactflow.dev/api-reference/types/edge-marker)` Set the marker on the end of an edge. |  |
| [](#zindex)`zIndex` | `number` |  |
| [](#arialabel)`ariaLabel` | `string` |  |
| [](#interactionwidth)`interactionWidth` | `number` ReactFlow renders an invisible path around each edge to make them easier to click or tap on. This property sets the width of that invisible path. |  |
| [](#label)`label` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` The label or custom element to render along the edge. This is commonly a text label or some custom controls. |  |
| [](#labelstyle)`labelStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Custom styles to apply to the label. |  |
| [](#labelshowbg)`labelShowBg` | `boolean` |  |
| [](#labelbgstyle)`labelBgStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` |  |
| [](#labelbgpadding)`labelBgPadding` | `[number, number]` |  |
| [](#labelbgborderradius)`labelBgBorderRadius` | `number` |  |
| [](#style)`style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` |  |
| [](#classname)`className` | `string` |  |
| [](#reconnectable)`reconnectable` | `boolean | HandleType` Determines whether the edge can be updated by dragging the source or target to a new node. This property will override the default set by the `edgesReconnectable` prop on the `<ReactFlow />` component. |  |
| [](#focusable)`focusable` | `boolean` |  |

##### SmoothStepEdge[](#smoothstepedge)


[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L45-L46) 

The `SmoothStepEdge` variant has all the same fields as an `Edge`, but it also has the following additional fields:

| Name | Type | Default |
| --- | --- | --- |
| [](#type)`type` | `"smoothstep"` |  |
| [](#pathoptions)`pathOptions` | `{ offset?: number; borderRadius?: number; }` |  |

##### BezierEdge[](#bezieredge)


[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L52-L53) 

The `BezierEdge` variant has all the same fields as an `Edge`, but it also has the following additional fields:

| Name | Type | Default |
| --- | --- | --- |
| [](#type)`type` | `"default"` |  |
| [](#pathoptions)`pathOptions` | `{ curvature?: number; }` |  |

###### Default edge types[](#default-edge-types)


You can create any of React Flow’s default edges by setting the `type` property to one of the following values:

* `"default"`
* `"straight"`
* `"step"`
* `"smoothstep"`
* `"simplebezier"`

If you don’t set the `type` property at all, React Flow will fallback to the `"default"` bezier curve edge type.

These default edges are available even if you set the [`edgeTypes`](https://reactflow.dev/api-reference/react-flow#edge-types) prop to something else, unless you override any of these keys directly.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## EdgeChange - React Flow

URL: https://reactflow.dev/api-reference/types/edge-change

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## DefaultEdgeOptions - React Flow

URL: https://reactflow.dev/api-reference/types/default-edge-options

Many properties on an [`Edge`](https://reactflow.dev/api-reference/types/edge) are optional. When a new edge is created, the properties that are not provided will be filled in with the default values passed to the `defaultEdgeOptions` prop of the [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow#defaultedgeoptions) component.

```typescript
export type DefaultEdgeOptions<T> = {
  type?: string;
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  data?: T;
  selected?: boolean;
  markerStart?: string | EdgeMarker;
  markerEnd?: string | EdgeMarker;
  zIndex?: number;
  ariaLabel?: string;
  interactionWidth?: number;
  focusable?: boolean;
};
```

NameTypeDefault[](#type)`type``string | undefined`

Type of edge defined in `edgeTypes`.

[](#animated)`animated``boolean`[](#hidden)`hidden``boolean`[](#deletable)`deletable``boolean`[](#selectable)`selectable``boolean`[](#data)`data``[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>`

Arbitrary data passed to an edge.

[](#markerstart)`markerStart``[EdgeMarkerType](https://reactflow.dev/api-reference/types/edge-marker)`

Set the marker on the beginning of an edge.

[](#markerend)`markerEnd``[EdgeMarkerType](https://reactflow.dev/api-reference/types/edge-marker)`

Set the marker on the end of an edge.

[](#zindex)`zIndex``number`[](#arialabel)`ariaLabel``string`[](#interactionwidth)`interactionWidth``number`

ReactFlow renders an invisible path around each edge to make them easier to click or tap on. This property sets the width of that invisible path.

[](#label)`label``[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)`

The label or custom element to render along the edge. This is commonly a text label or some custom controls.

[](#labelstyle)`labelStyle``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Custom styles to apply to the label.

[](#labelshowbg)`labelShowBg``boolean`[](#labelbgstyle)`labelBgStyle``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`[](#labelbgpadding)`labelBgPadding``[number, number]`[](#labelbgborderradius)`labelBgBorderRadius``number`[](#style)`style``[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`[](#classname)`className``string`[](#reconnectable)`reconnectable``boolean | HandleType`

Determines whether the edge can be updated by dragging the source or target to a new node. This property will override the default set by the `edgesReconnectable` prop on the `<ReactFlow />` component.

[](#focusable)`focusable``boolean`

---

## FitViewOptions - React Flow

URL: https://reactflow.dev/api-reference/types/fit-view-options

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## EdgeMarker - React Flow

URL: https://reactflow.dev/api-reference/types/edge-marker

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## HandleConnection - React Flow

URL: https://reactflow.dev/api-reference/types/handle-connection

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Handle - React Flow

URL: https://reactflow.dev/api-reference/types/handle

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## EdgeProps - React Flow

URL: https://reactflow.dev/api-reference/types/edge-props

When you implement a custom edge it is wrapped in a component that enables some basic functionality. Your custom edge component receives the following props:

```typescript
export type EdgeProps<EdgeType extends Edge = Edge> = {
  id: string;
  animated: boolean;
  data: EdgeType['data'];
  style: React.CSSProperties;
  selected: boolean;
  source: string;
  target: string;
  sourceHandleId?: string | null;
  targetHandleId?: string | null;
  interactionWidth: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  label?: string | React.ReactNode;
  labelStyle?: React.CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  markerStart?: string;
  markerEnd?: string;
  pathOptions?: any;
};
```

---

## MarkerType - React Flow

URL: https://reactflow.dev/api-reference/types/marker-type

Edges may optionally have a marker on either end. The MarkerType type enumerates the options available to you when configuring a given marker.

```typescript
export enum MarkerType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
}
```

---

## InternalNode - React Flow

URL: https://reactflow.dev/api-reference/types/internal-node

The `InternalNode` type is identical to the base [`Node`](https://reactflow.dev/api-references/types/node) type but is extended with some additional properties used internally by React Flow. Some functions and callbacks that return nodes may return an `InternalNode`.

NameTypeDefault[](#id)`id``string`

Unique id of a node

[](#position)`position``[XYPosition](https://reactflow.dev/api-reference/types/xy-position)`

Position of a node on the pane

[](#data)`data``[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>`

Arbitrary data passed to a node

[](#type)`type``string`

Type of node defined in nodeTypes

[](#sourceposition)`sourcePosition``[Position](https://reactflow.dev/api-reference/types/position)`

Only relevant for default, source, target nodeType. controls source position

[](#targetposition)`targetPosition``[Position](https://reactflow.dev/api-reference/types/position)`

Only relevant for default, source, target nodeType. controls target position

[](#hidden)`hidden``boolean`[](#selected)`selected``boolean`[](#dragging)`dragging``boolean`

True, if node is being dragged

[](#draggable)`draggable``boolean`[](#selectable)`selectable``boolean`[](#connectable)`connectable``boolean`[](#deletable)`deletable``boolean`[](#draghandle)`dragHandle``string`[](#width)`width``number`[](#height)`height``number`[](#initialwidth)`initialWidth``number`[](#initialheight)`initialHeight``number`[](#parentid)`parentId``string`

Parent node id, used for creating sub-flows

[](#zindex)`zIndex``number`[](#extent)`extent``"parent" | [CoordinateExtent](https://reactflow.dev/api-reference/types/coordinate-extent)`

Boundary a node can be moved in

[](#expandparent)`expandParent``boolean`[](#arialabel)`ariaLabel``string`[](#origin)`origin``[NodeOrigin](https://reactflow.dev/api-reference/types/node-origin)`

Origin of the node relative to it’s position

[](#handles)`handles``[NodeHandle](https://reactflow.dev/api-reference/types/node-handle)[]`[](#measured)`measured``{ width?: number; height?: number; } & { width?: number; height?: number; }`[](#internals)`internals``{ positionAbsolute: [XYPosition](https://reactflow.dev/api-reference/types/xy-position); z: number; userNode: [NodeType](https://reactflow.dev/api-reference/types/node); handleBounds?: NodeHandleBounds; bounds?: NodeBounds; }`

---

## Node - React Flow

URL: https://reactflow.dev/api-reference/types/node

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L10) 

The `Node` type represents everything React Flow needs to know about a given node. Many of these properties can be manipulated both by React Flow or by you, but some such as `width` and `height` should be considered read-only.

```typescript
export type Node<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string = string,
> = {
  id: string;
  position: XYPosition;
  data: NodeData;
  type?: NodeType;
  sourcePosition?: Position;
  targetPosition?: Position;
  hidden?: boolean;
  selected?: boolean;
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  resizing?: boolean;
  deletable?: boolean;
  dragHandle?: string;
  width?: number | null;
  height?: number | null;
  parentId?: string;
  zIndex?: number;
  extent?: 'parent' | CoordinateExtent;
  expandParent?: boolean;
  ariaLabel?: string;
  focusable?: boolean;
  style?: React.CSSProperties;
  className?: string;
  origin?: NodeOrigin;
  handles?: NodeHandle[];
  measured?: {
    width?: number;
    height?: number;
  };
};
```

###### Fields[](#fields)


| Name | Type | Default |
| --- | --- | --- |
| [](#id)`id` | `string` Unique id of a node |  |
| [](#position)`position` | `[XYPosition](https://reactflow.dev/api-reference/types/xy-position)` Position of a node on the pane |  |
| [](#data)`data` | `NodeData` Arbitrary data passed to a node |  |
| [](#type)`type` | `[NodeType](https://reactflow.dev/api-reference/types/node)` Type of node defined in nodeTypes |  |
| [](#sourceposition)`sourcePosition` | `[Position](https://reactflow.dev/api-reference/types/position)` Only relevant for default, source, target nodeType. controls source position |  |
| [](#targetposition)`targetPosition` | `[Position](https://reactflow.dev/api-reference/types/position)` Only relevant for default, source, target nodeType. controls target position |  |
| [](#hidden)`hidden` | `boolean` |  |
| [](#selected)`selected` | `boolean` |  |
| [](#dragging)`dragging` | `boolean` True, if node is being dragged |  |
| [](#draggable)`draggable` | `boolean` |  |
| [](#selectable)`selectable` | `boolean` |  |
| [](#connectable)`connectable` | `boolean` |  |
| [](#deletable)`deletable` | `boolean` |  |
| [](#draghandle)`dragHandle` | `string` |  |
| [](#width)`width` | `number` |  |
| [](#height)`height` | `number` |  |
| [](#initialwidth)`initialWidth` | `number` |  |
| [](#initialheight)`initialHeight` | `number` |  |
| [](#parentid)`parentId` | `string` Parent node id, used for creating sub-flows |  |
| [](#zindex)`zIndex` | `number` |  |
| [](#extent)`extent` | `"parent" | [CoordinateExtent](https://reactflow.dev/api-reference/types/coordinate-extent)` Boundary a node can be moved in |  |
| [](#expandparent)`expandParent` | `boolean` |  |
| [](#arialabel)`ariaLabel` | `string` |  |
| [](#origin)`origin` | `[NodeOrigin](https://reactflow.dev/api-reference/types/node-origin)` Origin of the node relative to it’s position |  |
| [](#handles)`handles` | `[NodeHandle](https://reactflow.dev/api-reference/types/node-handle)[]` |  |
| [](#measured)`measured` | `{ width?: number; height?: number; }` |  |

###### Default node types[](#default-node-types)


You can create any of React Flow’s default nodes by setting the `type` property to one of the following values:

* `"default"`
* `"input"`
* `"output"`
* `"group"`

If you don’t set the `type` property at all, React Flow will fallback to the `"default"` node with both an input and output port.

These default nodes are available even if you set the [`nodeTypes`](https://reactflow.dev/api-reference/react-flow#node-types) prop to something else, unless you override any of these keys directly.

###### Notes[](#notes)


* You shouldn’t try to set the `width` or `height` of a node directly. It is calculated internally by React Flow and used when rendering the node in the viewport. To control a node’s size you should use the `style` or `className` props to apply CSS styles instead.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## NodeChange - React Flow

URL: https://reactflow.dev/api-reference/types/node-change

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## NodeHandle - React Flow

URL: https://reactflow.dev/api-reference/types/node-handle

```typescript
export type NodeHandle = {
  x: number,
  y: number,
  position: Position,
  id?: string | null,
  width?: number,
  height?: number,
  type?: 'source' | 'target',
}
```

---

## MiniMapNodeProps - React Flow

URL: https://reactflow.dev/api-reference/types/mini-map-node-props

```typescript
export type MiniMapNodeProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  className: string;
  color: string;
  shapeRendering: string;
  strokeColor: string;
  strokeWidth: number;
  style?: CSSProperties;
  selected: boolean;
  onClick?: (event: MouseEvent, id: string) => void;
};
```

---

## NodeConnection - React Flow

URL: https://reactflow.dev/api-reference/types/node-connection

The `NodeConnection` type is an extension of a basic [Connection](https://reactflow.dev/api-reference/types/connection) that includes the `edgeId`.

NameTypeDefault[](#source)`source``string`

The id of the node this connection originates from.

[](#target)`target``string`

The id of the node this connection terminates at.

[](#sourcehandle)`sourceHandle``string | null`

When not `null`, the id of the handle on the source node that this connection originates from.

[](#targethandle)`targetHandle``string | null`

When not `null`, the id of the handle on the target node that this connection terminates at.

[](#edgeid)`edgeId``string`

---

## NodeProps - React Flow

URL: https://reactflow.dev/api-reference/types/node-props

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L89) 

When you implement a [custom node](https://reactflow.dev/learn/customization/custom-nodes) it is wrapped in a component that enables basic functionality like selection and dragging. Your custom node receives the following props:

```typescript
export type NodeProps<NodeType extends Node = Node> = {
  id: string;
  data: Node['data'];
  dragHandle?: boolean;
  type?: string;
  selected?: boolean;
  isConnectable?: boolean;
  zIndex?: number;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  dragging: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
};
```

###### Usage[](#usage)


```typescript
import { useState } from 'react';
import { NodeProps, Node } from '@xyflow/react';
 
export type CounterNode = Node<
  {
    initialCount?: number;
  },
  'counter'
>;
 
export default function CounterNode(props: NodeProps<CounterNode>) {
  const [count, setCount] = useState(props.data?.initialCount ?? 0);
 
  return (
    <div>
      <p>Count: {count}</p>
      <button className="nodrag" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

Remember to register your custom node by adding it to the [`nodeTypes`](https://reactflow.dev/api-reference/react-flow#nodetypes) prop of your `<ReactFlow />` component.

```typescript
import { ReactFlow } from '@xyflow/react';
import CounterNode from './CounterNode';
 
const nodeTypes = {
  counterNode: CounterNode,
};
 
export default function App() {
  return <ReactFlow nodeTypes={nodeTypes} ... />
}
```

You can read more in our [custom node guide](https://reactflow.dev/learn/customization/custom-nodes).

###### Fields[](#fields)


| Name | Type | Default |
| --- | --- | --- |
| [](#id)`id` | `[NodeType](https://reactflow.dev/api-reference/types/node)["id"]` Unique id of a node. |  |
| [](#data)`data` | `[NodeType](https://reactflow.dev/api-reference/types/node)["data"]` Arbitrary data passed to a node. |  |
| [](#width)`width` | `[NodeType](https://reactflow.dev/api-reference/types/node)["width"]` |  |
| [](#height)`height` | `[NodeType](https://reactflow.dev/api-reference/types/node)["height"]` |  |
| [](#sourceposition)`sourcePosition` | `[NodeType](https://reactflow.dev/api-reference/types/node)["sourcePosition"]` Only relevant for default, source, target nodeType. Controls source position. |  |
| [](#targetposition)`targetPosition` | `[NodeType](https://reactflow.dev/api-reference/types/node)["targetPosition"]` Only relevant for default, source, target nodeType. Controls target position. |  |
| [](#draghandle)`dragHandle` | `[NodeType](https://reactflow.dev/api-reference/types/node)["dragHandle"]` A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements. |  |
| [](#parentid)`parentId` | `[NodeType](https://reactflow.dev/api-reference/types/node)["parentId"]` Parent node id, used for creating sub-flows. |  |
| [](#type)`type` | `[NodeType](https://reactflow.dev/api-reference/types/node)["type"]` Type of node defined in `nodeTypes`. |  |
| [](#dragging)`dragging` | `[NodeType](https://reactflow.dev/api-reference/types/node)["dragging"]` Whether or not the node is currently being dragged. |  |
| [](#zindex)`zIndex` | `[NodeType](https://reactflow.dev/api-reference/types/node)["zIndex"]` |  |
| [](#selectable)`selectable` | `[NodeType](https://reactflow.dev/api-reference/types/node)["selectable"]` |  |
| [](#deletable)`deletable` | `[NodeType](https://reactflow.dev/api-reference/types/node)["deletable"]` |  |
| [](#selected)`selected` | `[NodeType](https://reactflow.dev/api-reference/types/node)["selected"]` |  |
| [](#draggable)`draggable` | `[NodeType](https://reactflow.dev/api-reference/types/node)["draggable"]` Whether or not the node is able to be dragged. |  |
| [](#isconnectable)`isConnectable` | `boolean` Whether a node is connectable or not. |  |
| [](#positionabsolutex)`positionAbsoluteX` | `number` Position absolute x value. |  |
| [](#positionabsolutey)`positionAbsoluteY` | `number` Position absolute y value. |  |

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## OnEdgesChange - React Flow

URL: https://reactflow.dev/api-reference/types/on-edges-change

```typescript
export type OnEdgesChange<EdgeType extends Edge = Edge> = (
  changes: EdgeChange<EdgeType>[],
) => void;
```

This type accepts a generic type argument of custom edge types. See this [section in our Typescript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const onEdgesChange: OnEdgesChange = useCallback(
  (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  [setEdges],
);
```

---

## OnNodesChange - React Flow

URL: https://reactflow.dev/api-reference/types/on-nodes-change

```typescript
export type OnNodesChange<NodeType extends Node = Node> = (
  changes: NodeChange<NodeType>[],
) => void;
```

This type accepts a generic type argument of custom nodes types. See this [section in our TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```typescript
const onNodesChange: OnNodesChange = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  [setNodes],
);
```

---

## NodeOrigin - React Flow

URL: https://reactflow.dev/api-reference/types/node-origin

The origin of a Node determines how it is placed relative to its own coordinates. `[0, 0]` places it at the top left corner, `[0.5, 0.5]` right in the center and `[1, 1]` at the bottom right of its position.

```typescript
export type NodeOrigin = [number, number];
```

---

## PanOnScrollMode - React Flow

URL: https://reactflow.dev/api-reference/types/pan-on-scroll-mode

This enum is used to set the different modes of panning the viewport when the user scrolls. The `Free` mode allows the user to pan in any direction by scrolling with a device like a trackpad. The `Vertical` and `Horizontal` modes restrict scroll panning to only the vertical or horizontal axis, respectively.

```typescript
export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}
```

---

## Position - React Flow

URL: https://reactflow.dev/api-reference/types/position

While [`PanelPosition`](https://reactflow.dev/api-reference/types/panel-position) can be used to place a component in the corners of a container, the `Position` enum is less precise and used primarily in relation to edges and handles.

```typescript
export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}
```

---

## PanelPosition - React Flow

URL: https://reactflow.dev/api-reference/types/panel-position

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## ProOptions - React Flow

URL: https://reactflow.dev/api-reference/types/pro-options

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## ReactFlowInstance - React Flow

URL: https://reactflow.dev/api-reference/types/react-flow-instance

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/instance.ts/#L178-L179) 

The `ReactFlowInstance` provides a collection of methods to query and manipulate the internal state of your flow. You can get an instance by using the [`useReactFlow`](https://reactflow.dev/api-reference/hooks/use-react-flow) hook or attaching a listener to the [`onInit`](https://reactflow.dev/api-reference/react-flow#event-oninit) event.

```typescript
export type ReactFlowInstance<T, U> = {
  // Nodes and Edges
  getNode: (id: string) => Node<T> | undefined;
  getNodes: () => Node<T>[];
  addNodes: (payload: Node<T>[] | Node<T>) => void;
  setNodes: (payload: Node<T>[] | ((nodes: Node<T>[]) => Node<T>[])) => void;
 
  getEdge: (id: string) => Edge<U> | undefined;
  getEdges: () => Edge<U>[];
  addEdges: (payload: Edge<U>[] | Edge<U>) => void;
  setEdges: (payload: Edge<U>[] | ((edges: Edge<U>[]) => Edge<U>[])) => void;
 
  toObject: () => ReactFlowJsonObject<T, U>;
  deleteElements: (payload: {
    nodes?: (Partial<Node> & { id: Node['id'] })[];
    edges?: (Partial<Edge> & { id: Edge['id'] })[];
  }) => void;
  getNodesBounds: (nodes: (NodeType | InternalNode | string)[]) => Rect;
 
  // Intersections
  getIntersectingNodes: (
    node: (Partial<Node<T>> & { id: Node['id'] }) | Rect,
    partially?: boolean,
    nodes?: Node<T>[],
  ) => Node<T>[];
 
  isNodeIntersecting: (
    node: (Partial<Node<T>> & { id: Node['id'] }) | Rect,
    area: Rect,
    partially?: boolean,
  ) => boolean;
 
  // Viewport
  viewportInitialized: boolean;
  zoomIn: (options?: { duration: number }) => void;
  zoomOut: (options?: { duration: number }) => void;
  zoomTo: (zoomLevel: number, options?: { duration: number }) => void;
  getZoom: () => number;
  setViewport: (viewport: Viewport, options?: { duration: number }) => void;
  getViewport: () => Viewport;
  fitView: (fitViewOptions?: FitViewOptions) => boolean;
  setCenter: (
    x: number,
    y: number,
    options?: { duration: number; zoom: number },
  ) => void;
  fitBounds: (
    bounds: Rect,
    options?: { duration: number; padding: number },
  ) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  flowToScreenPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  updateNode: (
    id: string,
    nodeUpdate: Partial<NodeType> | ((node: NodeType) => Partial<NodeType>),
    options?: { replace: boolean },
  ) => void;
  updateNodeData: (
    id: string,
    dataUpdate:
      | Partial<NodeType>['data']
      | ((node: Node) => Partial<NodeType>['data']),
    options?: { replace: boolean },
  ) => void;
  updateEdge: (
    id: string,
    edgeUpdate: Partial<EdgeType> | ((node: EdgeType) => Partial<EdgeType>),
    options?: { replace: boolean },
  ) => void;
  updateEdgeData: (
    id: string,
    dataUpdate:
      | Partial<EdgeType>['data']
      | ((node: Edge) => Partial<EdgeType>['data']),
    options?: { replace: boolean },
  ) => void;
};
```

###### Fields[](#fields)


##### Nodes and edges[](#nodes-and-edges)


| Name | Type | Default |
| --- | --- | --- |
| [](#getnodes)`getNodes` | `() => [Node](https://reactflow.dev/api-reference/types/node)[]` Returns nodes. |  |
| [](#setnodes)`setNodes` | `(payload: [Node](https://reactflow.dev/api-reference/types/node)[] | ((nodes: [Node](https://reactflow.dev/api-reference/types/node)[]) => [Node](https://reactflow.dev/api-reference/types/node)[])) => void` Set your nodes array to something else by either overwriting it with a new array or by passing in a function to update the existing array. If using a function, it is important to make sure a new array is returned instead of mutating the existing array. Calling this function will trigger the `onNodesChange` handler in a controlled flow. |  |
| [](#addnodes)`addNodes` | `(payload: [Node](https://reactflow.dev/api-reference/types/node) | [Node](https://reactflow.dev/api-reference/types/node)[]) => void` Add one or many nodes to your existing nodes array. Calling this function will trigger the `onNodesChange` handler in a controlled flow. |  |
| [](#getnode)`getNode` | `(id: string) => [Node](https://reactflow.dev/api-reference/types/node) | undefined` Returns a node by id. |  |
| [](#getinternalnode)`getInternalNode` | `(id: string) => [InternalNode](https://reactflow.dev/api-reference/types/internal-node)<[Node](https://reactflow.dev/api-reference/types/node)> | undefined` Returns an internal node by id. |  |
| [](#getedges)`getEdges` | `() => [Edge](https://reactflow.dev/api-reference/types/edge)[]` Returns edges. |  |
| [](#setedges)`setEdges` | `(payload: [Edge](https://reactflow.dev/api-reference/types/edge)[] | ((edges: [Edge](https://reactflow.dev/api-reference/types/edge)[]) => [Edge](https://reactflow.dev/api-reference/types/edge)[])) => void` Set your edges array to something else by either overwriting it with a new array or by passing in a function to update the existing array. If using a function, it is important to make sure a new array is returned instead of mutating the existing array. Calling this function will trigger the `onEdgesChange` handler in a controlled flow. |  |
| [](#addedges)`addEdges` | `(payload: [Edge](https://reactflow.dev/api-reference/types/edge) | [Edge](https://reactflow.dev/api-reference/types/edge)[]) => void` Add one or many edges to your existing edges array. Calling this function will trigger the `onEdgesChange` handler in a controlled flow. |  |
| [](#getedge)`getEdge` | `(id: string) => [Edge](https://reactflow.dev/api-reference/types/edge) | undefined` Returns an edge by id. |  |
| [](#toobject)`toObject` | `() => [ReactFlowJsonObject](https://reactflow.dev/api-reference/types/react-flow-json-object)<[Node](https://reactflow.dev/api-reference/types/node), [Edge](https://reactflow.dev/api-reference/types/edge)>` Returns the nodes, edges and the viewport as a JSON object. |  |
| [](#deleteelements)`deleteElements` | `(params: DeleteElementsOptions) => Promise<{ deletedNodes: [Node](https://reactflow.dev/api-reference/types/node)[]; deletedEdges: [Edge](https://reactflow.dev/api-reference/types/edge)[]; }>` Deletes nodes and edges. |  |
| [](#updatenode)`updateNode` | `(id: string, nodeUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Node](https://reactflow.dev/api-reference/types/node)> | ((node: [Node](https://reactflow.dev/api-reference/types/node)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Node](https://reactflow.dev/api-reference/types/node)>), options?: { replace: boolean; } | undefined) => void` Updates a node. |  |
| [](#updatenodedata)`updateNodeData` | `(id: string, dataUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>> | ((node: [Node](https://reactflow.dev/api-reference/types/node)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>>), options?: { replace: boolean; } | undefined) => void` Updates the data attribute of a node. |  |
| [](#updateedge)`updateEdge` | `(id: string, edgeUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Edge](https://reactflow.dev/api-reference/types/edge)> | ((edge: [Edge](https://reactflow.dev/api-reference/types/edge)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Edge](https://reactflow.dev/api-reference/types/edge)>), options?: { replace: boolean; } | undefined) => void` Updates an edge. |  |
| [](#updateedgedata)`updateEdgeData` | `(id: string, dataUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown> | undefined> | ((edge: [Edge](https://reactflow.dev/api-reference/types/edge)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown> | undefined>), options?: { ...; } | undefined) => void` Updates the data attribute of a edge. |  |
| [](#getnodesbounds)`getNodesBounds` | `(nodes: (string | [Node](https://reactflow.dev/api-reference/types/node) | [InternalNode](https://reactflow.dev/api-reference/types/internal-node))[]) => Rect` Returns the bounds of the given nodes or node ids. |  |
| [](#gethandleconnections)`getHandleConnections` | `({ type, id, nodeId, }: { type: HandleType; nodeId: string; id?: string | null; }) => [HandleConnection](https://reactflow.dev/api-reference/types/handle-connection)[]` Get all the connections of a handle belonging to a specific node. The type parameter be either `'source'` or `'target'`. |  |
| [](#getnodeconnections)`getNodeConnections` | `({ type, handleId, nodeId, }: { type?: HandleType; nodeId: string; handleId?: string | null; }) => [NodeConnection](https://reactflow.dev/api-reference/types/node-connection)[]` Gets all connections to a node. Can be filtered by handle type and id. |  |

##### Intersections[](#intersections)


| Name | Type | Default |
| --- | --- | --- |
| [](#getintersectingnodes)`getIntersectingNodes` | `(node: [Node](https://reactflow.dev/api-reference/types/node) | Rect | { id: string; }, partially?: boolean | undefined, nodes?: [Node](https://reactflow.dev/api-reference/types/node)[] | undefined) => [Node](https://reactflow.dev/api-reference/types/node)[]` Find all the nodes currently intersecting with a given node or rectangle. The `partially` parameter can be set to `true` to include nodes that are only partially intersecting. |  |
| [](#isnodeintersecting)`isNodeIntersecting` | `(node: [Node](https://reactflow.dev/api-reference/types/node) | Rect | { id: string; }, area: Rect, partially?: boolean | undefined) => boolean` Determine if a given node or rectangle is intersecting with another rectangle. The `partially` parameter can be set to true return `true` even if the node is only partially intersecting. |  |

##### Viewport[](#viewport)


| Name | Type | Default |
| --- | --- | --- |
| [](#zoomin)`zoomIn` | `ZoomInOut` Zooms viewport in by 1.2. |  |
| [](#zoomout)`zoomOut` | `ZoomInOut` Zooms viewport out by 1 / 1.2. |  |
| [](#zoomto)`zoomTo` | `ZoomTo` Zoom the viewport to a given zoom level. Passing in a `duration` will animate the viewport to the new zoom level. |  |
| [](#getzoom)`getZoom` | `GetZoom` Get the current zoom level of the viewport. |  |
| [](#setviewport)`setViewport` | `SetViewport` Sets the current viewport. |  |
| [](#getviewport)`getViewport` | `GetViewport` Returns the current viewport. |  |
| [](#setcenter)`setCenter` | `SetCenter` Center the viewport on a given position. Passing in a `duration` will animate the viewport to the new position. |  |
| [](#fitbounds)`fitBounds` | `FitBounds` A low-level utility function to fit the viewport to a given rectangle. By passing in a `duration`, the viewport will animate from its current position to the new position. The `padding` option can be used to add space around the bounds. |  |
| [](#screentoflowposition)`screenToFlowPosition` | `(clientPosition: [XYPosition](https://reactflow.dev/api-reference/types/xy-position), options?: { snapToGrid: boolean; } | undefined) => [XYPosition](https://reactflow.dev/api-reference/types/xy-position)` With this function you can translate a screen pixel position to a flow position. It is useful for implementing drag and drop from a sidebar for example. |  |
| [](#flowtoscreenposition)`flowToScreenPosition` | `(flowPosition: [XYPosition](https://reactflow.dev/api-reference/types/xy-position)) => [XYPosition](https://reactflow.dev/api-reference/types/xy-position)` Translate a position inside the flow’s canvas to a screen pixel position. |  |
| [](#viewportinitialized)`viewportInitialized` | `boolean` React Flow needs to mount the viewport to the DOM and initialize its zoom and pan behavior. This property tells you when viewport is initialized. |  |
| [](#fitview)`fitView` | `FitView<[Node](https://reactflow.dev/api-reference/types/node)>` |  |

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Viewport - React Flow

URL: https://reactflow.dev/api-reference/types/viewport

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## ReactFlowJsonObject - React Flow

URL: https://reactflow.dev/api-reference/types/react-flow-json-object

A JSON-compatible representation of your flow. You can use this to save the flow to a database for example and load it back in later.

```typescript
export type ReactFlowJsonObject<T, U> = {
  nodes: Node<T>[];
  edges: Edge<U>[];
  viewport: Viewport;
};
```

---

## XYPosition - React Flow

URL: https://reactflow.dev/api-reference/types/xy-position

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## ResizeParams - React Flow

URL: https://reactflow.dev/api-reference/types/resize-params

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## Utils - React Flow

URL: https://reactflow.dev/api-reference/utils

###### [addEdge()](https://reactflow.dev/api-reference/utils/add-edge)


This util is a convenience function to add a new Edge to an array of edges. It also performs some validation to make sure you don't add an invalid edge or duplicate an existing one.

[Read more](https://reactflow.dev/api-reference/utils/add-edge)

###### [applyEdgeChanges()](https://reactflow.dev/api-reference/utils/apply-edge-changes)


Various events on the ReactFlow component can produce an EdgeChange that describes how to update the edges of your flow in some way. If you don't need any custom behavior, this util can be used to take an array of these changes and apply them to your edges.

[Read more](https://reactflow.dev/api-reference/utils/apply-edge-changes)

###### [applyNodeChanges()](https://reactflow.dev/api-reference/utils/apply-node-changes)


Various events on the ReactFlow component can produce a NodeChange that describes how to update the nodes of your flow in some way. If you don't need any custom behavior, this util can be used to take an array of these changes and apply them to your nodes.

[Read more](https://reactflow.dev/api-reference/utils/apply-node-changes)

###### [getBezierPath()](https://reactflow.dev/api-reference/utils/get-bezier-path)


The getBezierPath util returns everything you need to render a bezier edge between two nodes.

[Read more](https://reactflow.dev/api-reference/utils/get-bezier-path)

###### [getConnectedEdges()](https://reactflow.dev/api-reference/utils/get-connected-edges)


Given an array of nodes that may be connected to one another and an array of all your edges, this util gives you an array of edges that connect any of the given nodes together.

[Read more](https://reactflow.dev/api-reference/utils/get-connected-edges)

###### [getIncomers()](https://reactflow.dev/api-reference/utils/get-incomers)


This util is used to tell you what nodes, if any, are connected to the given node as the source of an edge.

[Read more](https://reactflow.dev/api-reference/utils/get-incomers)

###### [getNodesBounds()](https://reactflow.dev/api-reference/utils/get-nodes-bounds)


Returns the bounding box that contains all the given nodes in an array. This can be useful when combined with \`getViewportForBounds\` to calculate the correct transform to fit the given nodes in a viewport.

[Read more](https://reactflow.dev/api-reference/utils/get-nodes-bounds)

###### [getOutgoers()](https://reactflow.dev/api-reference/utils/get-outgoers)


This util is used to tell you what nodes, if any, are connected to the given node as the target of an edge.

[Read more](https://reactflow.dev/api-reference/utils/get-outgoers)

###### [getSimpleBezierPath()](https://reactflow.dev/api-reference/utils/get-simple-bezier-path)


The getSimpleBezierPath util returns everything you need to render a simple bezier edge between two nodes.

[Read more](https://reactflow.dev/api-reference/utils/get-simple-bezier-path)

###### [getSmoothStepPath()](https://reactflow.dev/api-reference/utils/get-smooth-step-path)


The getSmoothStepPath util returns everything you need to render a stepped path between two nodes. The borderRadius property can be used to choose how rounded the corners of those steps are.

[Read more](https://reactflow.dev/api-reference/utils/get-smooth-step-path)

###### [getStraightPath()](https://reactflow.dev/api-reference/utils/get-straight-path)


Calculates the straight line path between two points.

[Read more](https://reactflow.dev/api-reference/utils/get-straight-path)

###### [getViewportForBounds()](https://reactflow.dev/api-reference/utils/get-viewport-for-bounds)


This util returns the viewport for the given bounds. You might use this to pre-calculate the viewport for a given set of nodes on the server or calculate the viewport for the given bounds \_without\_ changing the viewport directly.

[Read more](https://reactflow.dev/api-reference/utils/get-viewport-for-bounds)

###### [isEdge()](https://reactflow.dev/api-reference/utils/is-edge)


Test whether an object is usable as an Edge. In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true.

[Read more](https://reactflow.dev/api-reference/utils/is-edge)

###### [isNode()](https://reactflow.dev/api-reference/utils/is-node)


Test whether an object is usable as a Node. In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true.

[Read more](https://reactflow.dev/api-reference/utils/is-node)

###### [reconnectEdge()](https://reactflow.dev/api-reference/utils/reconnect-edge)


A handy utility to reconnect an existing Edge with new properties. This searches your edge array for an edge with a matching id and updates its properties with the connection you provide.

[Read more](https://reactflow.dev/api-reference/utils/reconnect-edge)

---

## applyNodeChanges() - React Flow

URL: https://reactflow.dev/api-reference/utils/apply-node-changes

Various events on the [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow) component can produce a [`NodeChange`](https://reactflow.dev/api-reference/types/node-change) that describes how to update the nodes of your flow in some way. If you don’t need any custom behavior, this util can be used to take an array of these changes and apply them to your nodes.

```typescript
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges } from '@xyflow/react';
 
export default function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
    },
    [setNodes],
  );
 
  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />
  );
}
```

---

## applyEdgeChanges() - React Flow

URL: https://reactflow.dev/api-reference/utils/apply-edge-changes

Various events on the [`<ReactFlow />`](https://reactflow.dev/api-reference/react-flow) component can produce an [`EdgeChange`](https://reactflow.dev/api-reference/types/edge-change) that describes how to update the edges of your flow in some way. If you don’t need any custom behavior, this util can be used to take an array of these changes and apply them to your edges.

```typescript
import { useState, useCallback } from 'react';
import { ReactFlow, applyEdgeChanges } from '@xyflow/react';
 
export default function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
    },
    [setEdges],
  );
 
  return (
    <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} />
  );
}
```

---

## addEdge() - React Flow

URL: https://reactflow.dev/api-reference/utils/add-edge

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/general.ts/#L100) 

This util is a convenience function to add a new [`Edge`](https://reactflow.dev/api-reference/types/edge) to an array of edges. It also performs some validation to make sure you don’t add an invalid edge or duplicate an existing one.

```typescript
import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
 
export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (connection) => {
      setEdges((oldEdges) => addEdge(connection, oldEdges));
    },
    [setEdges],
  );
 
  return <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} />;
}
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#edgeparams)`edgeParams` | `[EdgeType](https://reactflow.dev/api-reference/types/edge) | [Connection](https://reactflow.dev/api-reference/types/connection)` Either an `Edge` or a `Connection` you want to add. |  |
| [](#edges)`edges` | `[EdgeType](https://reactflow.dev/api-reference/types/edge)[]` The array of all current edges. |  |

**Returns:**

[](#returns)`[EdgeType](https://reactflow.dev/api-reference/types/edge)[]`

A new array of edges with the new edge added.

###### Notes[](#notes)


* If an edge with the same `target` and `source` already exists (and the same `targetHandle` and `sourceHandle` if those are set), then this util won’t add a new edge even if the `id` property is different.

Last updated on

April 12, 2025

---

## getBezierPath() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-bezier-path

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/bezier-edge.ts/#L95) 

The `getBezierPath` util returns everything you need to render a bezier edge between two nodes.

```typescript
import { Position, getBezierPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});
 
console.log(path); //=> "M0,20 C75,20 75,100 150,100"
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#0sourcex)`[0].sourceX` | `number` The `x` position of the source handle. |  |
| [](#0sourcey)`[0].sourceY` | `number` The `y` position of the source handle. |  |
| [](#0sourceposition)`[0].sourcePosition` | `[Position](https://reactflow.dev/api-reference/types/position)` The position of the source handle. | `[Position](https://reactflow.dev/api-reference/types/position).Bottom` |
| [](#0targetx)`[0].targetX` | `number` The `x` position of the target handle. |  |
| [](#0targety)`[0].targetY` | `number` The `y` position of the target handle. |  |
| [](#0targetposition)`[0].targetPosition` | `[Position](https://reactflow.dev/api-reference/types/position)` The position of the target handle. | `[Position](https://reactflow.dev/api-reference/types/position).Top` |
| [](#0curvature)`[0].curvature` | `number` The curvature of the bezier edge. | `0.25` |

**Returns:**

[](#returns)`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

A path string you can use in an SVG, the `labelX` and `labelY` position (center of path) and `offsetX`, `offsetY` between source handle and label.

* `path`: the path to use in an SVG `<path>` element.
* `labelX`: the `x` position you can use to render a label for this edge.
* `labelY`: the `y` position you can use to render a label for this edge.
* `offsetX`: the absolute difference between the source `x` position and the `x` position of the middle of this path.
* `offsetY`: the absolute difference between the source `y` position and the `y` position of the middle of this path.

###### Notes[](#notes)


* This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.

Last updated on

April 12, 2025

---

## getConnectedEdges() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-connected-edges

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L224) 

This utility filters an array of edges, keeping only those where either the source or target node is present in the given array of nodes.

```typescript
import { getConnectedEdges } from '@xyflow/react';
 
const nodes = [
  { id: 'a', position: { x: 0, y: 0 } },
  { id: 'b', position: { x: 100, y: 0 } },
];
const edges = [
  { id: 'a->c', source: 'a', target: 'c' },
  { id: 'c->d', source: 'c', target: 'd' },
];
 
const connectedEdges = getConnectedEdges(nodes, edges);
// => [{ id: 'a->c', source: 'a', target: 'c' }]
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#nodes)`nodes` | `[NodeType](https://reactflow.dev/api-reference/types/node)[]` Nodes you want to get the connected edges for. |  |
| [](#edges)`edges` | `[EdgeType](https://reactflow.dev/api-reference/types/edge)[]` All edges. |  |

**Returns:**

[](#returns)`[EdgeType](https://reactflow.dev/api-reference/types/edge)[]`

Array of edges that connect any of the given nodes with each other.

Last updated on

April 12, 2025

---

## getIncomers() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-incomers

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L91) 

This util is used to tell you what nodes, if any, are connected to the given node as the *source* of an edge.

```typescript
import { getIncomers } from '@xyflow/react';
 
const nodes = [];
const edges = [];
 
const incomers = getIncomers(
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'node' } },
  nodes,
  edges,
);
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#node)`node` | `[NodeType](https://reactflow.dev/api-reference/types/node) | { id: string; }` The node to get the connected nodes from. |  |
| [](#nodes)`nodes` | `[NodeType](https://reactflow.dev/api-reference/types/node)[]` The array of all nodes. |  |
| [](#edges)`edges` | `[EdgeType](https://reactflow.dev/api-reference/types/edge)[]` The array of all edges. |  |

**Returns:**

[](#returns)`[NodeType](https://reactflow.dev/api-reference/types/node)[]`

An array of nodes that are connected over edges where the target is the given node.

Last updated on

April 12, 2025

---

## getNodesBounds() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-nodes-bounds

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L133) 

Returns the bounding box that contains all the given nodes in an array. This can be useful when combined with [`getViewportForBounds`](https://reactflow.dev/api-reference/utils/get-viewport-for-bounds) to calculate the correct transform to fit the given nodes in a viewport.

**Note**

This function was previously called `getRectOfNodes`

```typescript
import { getNodesBounds } from '@xyflow/react';
 
const nodes = [
  {
    id: 'a',
    position: { x: 0, y: 0 },
    data: { label: 'a' },
    width: 50,
    height: 25,
  },
  {
    id: 'b',
    position: { x: 100, y: 100 },
    data: { label: 'b' },
    width: 50,
    height: 25,
  },
];
 
const bounds = getNodesBounds(nodes);
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#nodes)`nodes` | `(string | [NodeType](https://reactflow.dev/api-reference/types/node) | InternalNodeBase<[NodeType](https://reactflow.dev/api-reference/types/node)>)[]` Nodes to calculate the bounds for. |  |
| [](#paramsnodeorigin)`params.nodeOrigin` | `[NodeOrigin](https://reactflow.dev/api-reference/types/node-origin)` Origin of the nodes: `[0, 0]` for top-left, `[0.5, 0.5]` for center. | `[0, 0]` |
| [](#paramsnodelookup)`params.nodeLookup` | `NodeLookup<InternalNodeBase<[NodeType](https://reactflow.dev/api-reference/types/node)>>` |  |

**Returns:**

[](#returns)`Rect`

Bounding box enclosing all nodes.

Last updated on

April 12, 2025

A project by the xyflow team

We are building and maintaining open source software for node-based UIs since 2019.

---

## getSimpleBezierPath() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-simple-bezier-path

[Source on Github](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/SimpleBezierEdge.tsx/#L32) 

The `getSimpleBezierPath` util returns everything you need to render a simple bezier edge between two nodes.

```typescript
import { Position, getSimpleBezierPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getSimpleBezierPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});
 
console.log(path); //=> "M0,20 C75,20 75,100 150,100"
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#0sourcex)`[0].sourceX` | `number` |  |
| [](#0sourcey)`[0].sourceY` | `number` |  |
| [](#0sourceposition)`[0].sourcePosition` | `[Position](https://reactflow.dev/api-reference/types/position)` | `[Position](https://reactflow.dev/api-reference/types/position).Bottom` |
| [](#0targetx)`[0].targetX` | `number` |  |
| [](#0targety)`[0].targetY` | `number` |  |
| [](#0targetposition)`[0].targetPosition` | `[Position](https://reactflow.dev/api-reference/types/position)` | `[Position](https://reactflow.dev/api-reference/types/position).Top` |

**Returns:**

[](#returns)`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

* `path`: the path to use in an SVG `<path>` element.
* `labelX`: the `x` position you can use to render a label for this edge.
* `labelY`: the `y` position you can use to render a label for this edge.
* `offsetX`: the absolute difference between the source `x` position and the `x` position of the middle of this path.
* `offsetY`: the absolute difference between the source `y` position and the `y` position of the middle of this path.

###### Notes[](#notes)


* This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.

Last updated on

April 12, 2025

---

## getOutgoers() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-outgoers

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L64) 

This util is used to tell you what nodes, if any, are connected to the given node as the *target* of an edge.

```typescript
import { getOutgoers } from '@xyflow/react';
 
const nodes = [];
const edges = [];
 
const outgoers = getOutgoers(
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'node' } },
  nodes,
  edges,
);
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#node)`node` | `[NodeType](https://reactflow.dev/api-reference/types/node) | { id: string; }` The node to get the connected nodes from. |  |
| [](#nodes)`nodes` | `[NodeType](https://reactflow.dev/api-reference/types/node)[]` The array of all nodes. |  |
| [](#edges)`edges` | `[EdgeType](https://reactflow.dev/api-reference/types/edge)[]` The array of all edges. |  |

**Returns:**

[](#returns)`[NodeType](https://reactflow.dev/api-reference/types/node)[]`

An array of nodes that are connected over edges where the source is the given node.

Last updated on

April 12, 2025

---

## getSmoothStepPath() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-smooth-step-path

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts/#L215) 

The `getSmoothStepPath` util returns everything you need to render a stepped path between two nodes. The `borderRadius` property can be used to choose how rounded the corners of those steps are.

```typescript
import { Position, getSmoothStepPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});
 
console.log(path); //=> "M0 20L20 20L 70,20Q 75,20 75,25L 75,95Q ..."
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#0sourcex)`[0].sourceX` | `number` The `x` position of the source handle. |  |
| [](#0sourcey)`[0].sourceY` | `number` The `y` position of the source handle. |  |
| [](#0sourceposition)`[0].sourcePosition` | `[Position](https://reactflow.dev/api-reference/types/position)` The position of the source handle. | `[Position](https://reactflow.dev/api-reference/types/position).Bottom` |
| [](#0targetx)`[0].targetX` | `number` The `x` position of the target handle. |  |
| [](#0targety)`[0].targetY` | `number` The `y` position of the target handle. |  |
| [](#0targetposition)`[0].targetPosition` | `[Position](https://reactflow.dev/api-reference/types/position)` The position of the target handle. | `[Position](https://reactflow.dev/api-reference/types/position).Top` |
| [](#0borderradius)`[0].borderRadius` | `number` | `5` |
| [](#0centerx)`[0].centerX` | `number` |  |
| [](#0centery)`[0].centerY` | `number` |  |
| [](#0offset)`[0].offset` | `number` | `20` |

**Returns:**

[](#returns)`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

A path string you can use in an SVG, the `labelX` and `labelY` position (center of path) and `offsetX`, `offsetY` between source handle and label.

* `path`: the path to use in an SVG `<path>` element.
* `labelX`: the `x` position you can use to render a label for this edge.
* `labelY`: the `y` position you can use to render a label for this edge.
* `offsetX`: the absolute difference between the source `x` position and the `x` position of the middle of this path.
* `offsetY`: the absolute difference between the source `y` position and the `y` position of the middle of this path.

###### Notes[](#notes)


* This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.
* You can set the `borderRadius` property to `0` to get a step edge path.

Last updated on

April 12, 2025

---

## getViewportForBounds() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-viewport-for-bounds

[Source on Github](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/general.ts/#L170) 

This util returns the viewport for the given bounds. You might use this to pre-calculate the viewport for a given set of nodes on the server or calculate the viewport for the given bounds *without* changing the viewport directly.

**Note**

This function was previously called `getTransformForBounds`

```typescript
import { getViewportForBounds } from '@xyflow/react';
 
const { x, y, zoom } = getViewportForBounds(
  {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  },
  1200,
  800,
  0.5,
  2,
);
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#bounds)`bounds` | `Rect` Bounds to fit inside viewport. |  |
| [](#width)`width` | `number` Width of the viewport. |  |
| [](#height)`height` | `number` Height of the viewport. |  |
| [](#minzoom)`minZoom` | `number` Minimum zoom level of the resulting viewport. |  |
| [](#maxzoom)`maxZoom` | `number` Maximum zoom level of the resulting viewport. |  |
| [](#padding)`padding` | `Padding` Padding around the bounds. |  |

**Returns:**

A transformed Viewport that encloses the given bounds which you can pass to e.g. setViewport .

| Name | Type |
| --- | --- |
| [](#x)`x` | `number` |
| [](#y)`y` | `number` |
| [](#zoom)`zoom` | `number` |

###### Notes[](#notes)


* This is quite a low-level utility. You might want to look at the [`fitView`](https://reactflow.dev/api-reference/types/react-flow-instance#fitview) or [`fitBounds`](https://reactflow.dev/api-reference/types/react-flow-instance#fitbounds) methods for a more practical api.

Last updated on

April 12, 2025

---

## isNode() - React Flow

URL: https://reactflow.dev/api-reference/utils/is-node

Test whether an object is usable as a [`Node`](https://reactflow.dev/api-reference/types/node). In TypeScript this is a type guard that will narrow the type of whatever you pass in to [`Node`](https://reactflow.dev/api-reference/types/node) if it returns `true`.

```typescript
import { isNode } from '@xyflow/react';
 
const node = {
  id: 'node-a',
  data: {
    label: 'node',
  },
  position: {
    x: 0,
    y: 0,
  },
};
 
if (isNode(node)) {
  // ..
}
```

NameTypeDefault[](#element)`element``unknown`

The element to test.

[](#returns)`boolean`

Tests whether the provided value can be used as a `Node`. If you’re using TypeScript, this function acts as a type guard and will narrow the type of the value to `Node` if it returns `true`.

---

## getStraightPath() - React Flow

URL: https://reactflow.dev/api-reference/utils/get-straight-path

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/straight-edge.ts/#L30) 

Calculates the straight line path between two points.

```typescript
import { getStraightPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getStraightPath({
  sourceX: source.x,
  sourceY: source.y,
  targetX: target.x,
  targetY: target.y,
});
 
console.log(path); //=> "M 0,20L 150,100"
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
```

###### Signature[](#signature)


**Parameters:**
| Name | Type | Default |
| --- | --- | --- |
| [](#0sourcex)`[0].sourceX` | `number` The `x` position of the source handle. |  |
| [](#0sourcey)`[0].sourceY` | `number` The `y` position of the source handle. |  |
| [](#0targetx)`[0].targetX` | `number` The `x` position of the target handle. |  |
| [](#0targety)`[0].targetY` | `number` The `y` position of the target handle. |  |

**Returns:**

[](#returns)`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

A path string you can use in an SVG, the `labelX` and `labelY` position (center of path) and `offsetX`, `offsetY` between source handle and label.

* `path`: the path to use in an SVG `<path>` element.
* `labelX`: the `x` position you can use to render a label for this edge.
* `labelY`: the `y` position you can use to render a label for this edge.
* `offsetX`: the absolute difference between the source `x` position and the `x` position of the middle of this path.
* `offsetY`: the absolute difference between the source `y` position and the `y` position of the middle of this path.

###### Notes[](#notes)


* This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.

Last updated on

April 12, 2025

---

## isEdge() - React Flow

URL: https://reactflow.dev/api-reference/utils/is-edge

Test whether an object is usable as an [`Edge`](https://reactflow.dev/api-reference/types/edge). In TypeScript this is a type guard that will narrow the type of whatever you pass in to [`Edge`](https://reactflow.dev/api-reference/types/edge) if it returns `true`.

```typescript
import { isEdge } from '@xyflow/react';
 
const edge = {
  id: 'edge-a',
  source: 'a',
  target: 'b',
};
 
if (isEdge(edge)) {
  // ...
}
```

NameTypeDefault[](#element)`element``unknown`

The element to test

[](#returns)`boolean`

Tests whether the provided value can be used as an `Edge`. If you’re using TypeScript, this function acts as a type guard and will narrow the type of the value to `Edge` if it returns `true`.

---

## reconnectEdge() - React Flow

URL: https://reactflow.dev/api-reference/utils/reconnect-edge

A handy utility to update an existing [`Edge`](https://reactflow.dev/api-reference/types/edge) with new properties. This searches your edge array for an edge with a matching `id` and updates its properties with the connection you provide.

```typescript
const onReconnect = useCallback(
  (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
  []
);
```

NameTypeDefault[](#oldedge)`oldEdge``[EdgeType](https://reactflow.dev/api-reference/types/edge)`

The edge you want to update.

[](#newconnectionsource)`newConnection.source``string`

The id of the node this connection originates from.

[](#newconnectiontarget)`newConnection.target``string`

The id of the node this connection terminates at.

[](#newconnectionsourcehandle)`newConnection.sourceHandle``string | null`

When not `null`, the id of the handle on the source node that this connection originates from.

[](#newconnectiontargethandle)`newConnection.targetHandle``string | null`

When not `null`, the id of the handle on the target node that this connection terminates at.

[](#edges)`edges``[EdgeType](https://reactflow.dev/api-reference/types/edge)[]`

The array of all current edges.

[](#optionsshouldreplaceid)`options.shouldReplaceId``boolean`

Should the id of the old edge be replaced with the new connection id.

`true`

---

