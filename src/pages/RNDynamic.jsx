// src/pages/RNDynamic.jsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

// map your JSON’s nativeComponent strings → actual RN components
const componentMap = {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Picker,
  "Picker.Item": Picker.Item,
  TouchableOpacity: Pressable,
  Pressable,
  ImageBackground,
};

function renderNode(node, key) {
  // text or number → simple <Text>
  if (node == null) return null;
  if (typeof node === "string" || typeof node === "number") {
    return <Text key={key}>{node}</Text>;
  }

  const { nativeComponent, rnProps = {}, children = [] } = node;
  const Component = componentMap[nativeComponent] || View;

  // extract style object (flat) and the rest of props
  const { style: baseStyle = {}, onClick, ...rest } = rnProps;

  // map onClick → onPress
  if (onClick) {
    rest.onPress = onClick;
  }

  // uncontrolled TextInput: value → defaultValue
  if (nativeComponent === "TextInput" && rest.value != null) {
    rest.defaultValue = rest.value;
    delete rest.value;
  }

  // Pressable: support press-state styling
  if (Component === Pressable) {
    return (
      <Pressable
        key={key}
        {...rest}
        style={({ pressed }) => [baseStyle, pressed && rnProps.active]}
      >
        {(Array.isArray(children) ? children : [children]).map((c, i) =>
          renderNode(c, `${key}-${i}`)
        )}
      </Pressable>
    );
  }

  // TextInput is a void element: render self-closing with no children
  if (Component === TextInput) {
    return <TextInput key={key} {...rest} style={baseStyle} />;
  }

  if (nativeComponent === "Image" && children.length > 0) {
    const ImgComponent = ImageBackground;
    return (
      <ImgComponent key={key} {...rest} style={baseStyle}>
        {children.map((c, i) => renderNode(c, `${key}-${i}`))}
      </ImgComponent>
    );
  }

  if (Component === Image) {
    return <Image key={key} {...rest} style={baseStyle} />;
  }

  // default: render other components with children
  return (
    <Component key={key} {...rest} style={baseStyle}>
      {(Array.isArray(children) ? children : [children]).map((c, i) =>
        renderNode(c, `${key}-${i}`)
      )}
    </Component>
  );
}

export default function RNDynamic() {
  const [nodes, setNodes] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/components");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setNodes(await res.json());
      } catch (err) {
        console.error("RNDynamic: load error:", err);
        setNodes([]);
      }
    })();
  }, []);

  if (nodes === null) {
    return (
      <View style={styles.center}>
        <Text>Loading components…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📱 React Native Dynamic Renderer</Text>
      {nodes.length === 0 ? (
        <Text>No components saved yet.</Text>
      ) : (
        nodes.map((node) => (
          <View key={node.id} style={styles.wrapper}>
            {renderNode(node, `node-${node.id}`)}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000", // avoid default white
  },
  wrapper: { marginVertical: 8, alignItems: "center" },
});
