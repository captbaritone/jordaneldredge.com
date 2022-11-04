"use client";
import { useState, useEffect } from "react";

/**
 * Very dangerously set inner HTML.
 *
 * This component explicitly tries to execute the script tags in the
 * provided HTML. This is a very dangerous operation and should only be
 * used with trusted content.
 */
export default function Html({ html }) {
  const [ref, setRef] = useState(null);
  useEffect(() => {
    if (ref != null) {
      nodeScriptReplace(ref);
    }
  }, [ref]);
  return <span ref={setRef} dangerouslySetInnerHTML={{ __html: html }} />;
}

// https://stackoverflow.com/a/20584396
function nodeScriptReplace(node) {
  if (nodeScriptIs(node) === true) {
    node.parentNode.replaceChild(nodeScriptClone(node), node);
  } else {
    var i = -1,
      children = node.childNodes;
    while (++i < children.length) {
      nodeScriptReplace(children[i]);
    }
  }

  return node;
}
function nodeScriptClone(node) {
  var script = document.createElement("script");
  script.text = node.innerHTML;

  var i = -1,
    attrs = node.attributes,
    attr;
  while (++i < attrs.length) {
    script.setAttribute((attr = attrs[i]).name, attr.value);
  }
  return script;
}

function nodeScriptIs(node) {
  return node.tagName === "SCRIPT";
}
