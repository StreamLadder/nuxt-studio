import { visit as minimarkVisit } from "minimark";
export function sanitizeDocumentTree(document, collection) {
  if (!document.body && document.meta?.body?.type === "minimark") {
    document.body = document.meta?.body;
    Reflect.deleteProperty(document.meta, "body");
  }
  if (document.body?.type === "minimark") {
    document.body = removeLastStylesFromTree(document.body);
    minimarkVisit(document.body, (node) => node[0] === "pre", (node) => {
      const tag = node[0];
      const props = node[1];
      if ((props || {}).code) {
        Reflect.deleteProperty(props, "className");
        return [
          tag,
          {
            ...props || {},
            style: props.style || void 0,
            meta: props.meta || void 0
          },
          [
            "code",
            { __ignoreMap: "" },
            (props || {}).code
          ]
        ];
      }
      return node;
    });
  }
  if (collection?.schema?.definitions?.[collection.name]?.properties) {
    const properties = collection?.schema?.definitions?.[collection.name]?.properties;
    const hiddenKeys = Object.keys(properties || {}).filter((key) => properties?.[key]?.$content?.editor?.hidden);
    for (const key of hiddenKeys) {
      Reflect.deleteProperty(document, key);
    }
  }
  return document;
}
export function removeLastStylesFromTree(body) {
  if (body.value[body.value.length - 1]?.[0] === "style") {
    return { ...body, value: body.value.slice(0, -1) };
  }
  return body;
}
