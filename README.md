# sirkit
JavaScript Framework for creating circuits or graphs of Components that implement data flow mechanics.

The simplest concept is the idea, that there are 2 basic functions, send and on.  Send to put a value into an input port for a component, and on to receive a value from an output port.

Binding two components with a "connection" becomes the supremely simple on((v) => this.send(v))
By adding named ports you get send(inputPort,value), and on(outputPort,function(outputValue);

The guts of a component are either a simple function x => y, or a graph of components and connections.
{ inputs: [names]
  outputs: [names],
  components: {
   name: Component,
  }
  connections: [
    [in.portName, component.input],
    [component.output,component.input],
    [component.output,component.output]
  ]

