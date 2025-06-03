export const injectReactRoot = () => {
  const id = "my-react-extension-root";
  let container = document.getElementById(id);

  if (!container) {
    container = document.createElement("div");
    container.id = id;
    // container.style.position = "fixed";
    // container.style.top = "20px";
    // container.style.right = "20px";
    // container.style.zIndex = "999999";
    // container.style.background = "white";
    // container.style.border = "1px solid #ccc";
    // container.style.padding = "10px";
    // container.style.borderRadius = "8px";
    document.body.appendChild(container);
  }

  return container;
};
