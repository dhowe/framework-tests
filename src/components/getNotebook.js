import Prism from 'https://cdn.jsdelivr.net/npm/prism-es6@1.2.0/prism.min.js'
import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";

function getNotebook(notebook, parent) {
  parent.replaceChildren();
  new Runtime().module(notebook, name => {

    const container = document.createElement("div");
    const inspector = new Inspector(container);

    inspector.original = inspector.fulfilled; // preserve default fulfilled

    inspector.fulfilled = (value) => {  // override fulfilled

      // console.log(name, "type: ", typeof value, value); // DEBUG
      let pre, code;
      if (!(value instanceof Element)) {
        // if not already an element then create elements for code highlighting
        pre = document.createElement("pre");
        pre.className = 'language-javascript';
        code = document.createElement("code");
        code.className = 'language-javascript';
      }
      // now parse the possibilities
      if (typeof value === 'function') {
        let valueCode = value.toString();
        // this allows for => arrow functions
        if (!valueCode.startsWith("function")) valueCode = `${name} = ${valueCode}`;
        code.innerHTML = valueCode;
        pre.appendChild(code);
        container.appendChild(pre);
        Prism.highlightElement(pre); // syntax highlight
      } else {
        inspector.original(value, name); //  if not function: do default fulfilled
        if (!(value instanceof Element)) {
          if (typeof value === "string" || typeof value === 'number' || typeof value === 'boolean') {
            code.innerHTML = container.innerHTML;
            container.innerHTML = "";
          } else {
            // use JSON.stringify to format the object as a string
            code.innerHTML = `${name} = ${JSON.stringify(value, 0, 2)}`;
            console.log(name, value, _aMap()); // DEBUG
          }
          pre.appendChild(code);
          container.appendChild(pre);
          Prism.highlightElement(pre); // syntax highlight
        }
      }
      return inspector;
    };

    parent.append(container);

    // TODO make these configuration options for this code
    // for cells with defined names ...
    if (name) {
      // give them an id attribute (for #links)
      container.id = name;
      console.log("name:", name); // DEBUG
      // do not display them if their names start with underscore
      if (name.startsWith("_")) container.style.display = "none";
    }

    return inspector;
  });
}
export { getNotebook }
