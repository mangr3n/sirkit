# sirkit

Sirkit is the spiritual child of [graflow](http://github.com/pmros/graflow)

JavaScript Framework for creating circuits or graphs of Components that implement data flow semantics. 

### What is a Component?(High Level Description)
A Component has input ports and output ports.  Values are sent into a Component through 
input ports.  Values come out of output ports.  Components are described either as simple pure functions, or as a graph 
of components(nodes) and connections(edges).

### No seriously what is a Component? (Practical Description)
A Component is a JavaScript Object (no inheritance) that implements two methods `send` and `on`.
```typescript
type HandlerFn = (value:any) => void;
interface Component {
  send: (value:any) -> void;
  send: (inputPort:String, value:any) => void;
  on: (handler:HandlerFn);
  on: (outputPort:String, handler:HandlerFn);
}
```
Every  Component has a default input port and a default output port.  The send and on functions with arity one refer to 
the default ports.

Binding two components with a "connection" is accomplished through:
```ecmascript 6
Component.on((v) => otherComponent.send(v));
```
### API idioms
The proper way to create a `Component`, is to call a function that returns an `Component` object. Implement `send` and 
`on`, and you have implemented a `Component`.

As we move forward with the development of Sirkit we reserve the right to, where deemed appropriate, create additional 
interfaces in order to expose additional framework capabilities, but the core is the Component interface.

### Function Components
Function Components are created by calling `Component` with a function that receives two arguments `value` and `next`.  
The simplest component is the Identity Component. 
```typescript
type HandlerFn = (value:any) => void;
type NextFn = (value:any,next:HandlerFn) => void;
type FunctionComponentFactory: (NextFn) => Component;
```
The simplest Function Component is Identity:
```typescript
const Identity:FunctionComponentFactory = () => Component((v,next) => next(v));
```
Identity Emits each value it receives.

`next` is a function that receives a single argument.  Instead of returning a value from your function, you invoke next
when and if you wish to send an output, you pass next the resulting value you want emitted from your Component's output 
port.

#### Function Component Examples
Two interesting `Components` are `Filter` and `Mapper`
##### Implemenetation
```ecmascript 6
// Filter takes a function that accepts a value and returns true or false;
// (v:any) => boolean
// Filter emits the value on it's output if the filterFn returns true when applied to the incoming value.
const Filter = (filterFn) => Component((v,next) => { if (filterFn(v)) next(v) }) ;

// The Mapper takes
const Mapper = (mapFn) => Component((v,next) => next(mapFn(v)));
````
##### Usage
```ecmascript 6
// Define you're components
const evenFilter = Filter(v => v % 2 == 0); // Emit even numbers, don't emit odd numbers
const addOneMapper = Mapper(v => v+1); // Add one

// Connect them to each other
evenFilter.on((v) => addOneMapper.send(v));  // Connected;
// Log the output
addOneMapper.on(v => console.log("Out: ",v));

// Send in values and watch the output
// Values frlow through
evenFilter.send(1);
evenFilter.send(2); // Out: 3
evenFilter.send(3);
evenFilter.send(4); // Out: 5
```



```javascript
{ 
  inputs: [names]
  outputs: [names],
  components: {
   name: Component,
  }
  connections: [
    [in.portName, component.input],
    [component.output,component.input],
    [component.output,component.output]
  ],
  debug: [portNames]
}
```

