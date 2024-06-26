import { Appearance, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import isLightColorScheme from "../utils/isLightColorScheme";

interface OptionButtonProps {
  handleFunc: () => any,
  description: string,
  confirm?: boolean
}

const OptionButton: React.FC<OptionButtonProps> = ({ handleFunc, description, confirm }) => {
  return (
    <Pressable
      onPress={() => { handleFunc() }}
      style={({ pressed }) => [
        isLightColorScheme()
          ? { backgroundColor: pressed ? '#999999' : 'white' }
          : { backgroundColor: pressed ? '#999999' : '#666666' },
        { height: 40, justifyContent: 'center', alignItems: 'center' },
        { borderColor: "#e8e8e8", borderWidth: 1, borderCurve: "circular", borderRadius: 12 },
        { position: 'absolute', right: 0, margin: 8, padding: 8 }
      ]}
    >
      <Text style={[
        { fontSize: 12 },
        isLightColorScheme() ? { color: '#2296f3' } : { color: '#f2f2f2' }
      ]}>
        {description}
      </Text>
    </Pressable>
  );
};

export default OptionButton;
