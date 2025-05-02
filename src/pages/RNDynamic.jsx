// src/pages/RNDynamic.jsx

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

// Map your JSON’s nativeComponent strings to actual RN components
const componentMap = {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Picker,
  "Picker.Item": Picker.Item,
};

/**
 * Recursively render a JSON node into a React Native component.
 * Supports:
 *  - text/number nodes → <Text>
 *  - element nodes with `nativeComponent` + `rnProps` + `children`
 */
function renderNode(node, key) {
  if (node == null) return null;

  // Plain text or number → wrap in <Text>
  if (typeof node === "string" || typeof node === "number") {
    return <Text key={key}>{node}</Text>;
  }

  const { nativeComponent, rnProps = {}, children = [] } = node;
  const Component = componentMap[nativeComponent] || View;

  // Normalize children to an array and recurse
  const kids = (Array.isArray(children) ? children : [children]).map(
    (child, i) => renderNode(child, `${key}-${i}`)
  );

  return (
    <Component key={key} {...rnProps}>
      {kids}
    </Component>
  );
}

export default function RNDynamic() {
  const [nodes, setNodes] = useState(null);

  // Fetch JSON from your API endpoint on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/components");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setNodes(data);
      } catch (err) {
        console.error("RNDynamic: load error:", err);
        setNodes([]);
      }
    })();
  }, []);

  // Loading state
  if (nodes === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading components…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 12,
          color: "#fff",
        }}
      >
        📱 React Native Dynamic Renderer
      </Text>

      {nodes.length === 0 ? (
        <Text>No components saved yet.</Text>
      ) : (
        nodes.map((node) => (
          <View
            key={node.id}
            style={{ marginVertical: 8, alignItems: "center" }}
          >
            {renderNode(node, `node-${node.id}`)}
          </View>
        ))
      )}
    </ScrollView>
  );
}
