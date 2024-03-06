import { StyleSheet, Text, View, Appearance } from "react-native";
import React from "react";

interface OptionItemProps {
  title: string,
  description: string
}

const OptionItem: React.FC<OptionItemProps> = ({ title, description }) => {
  return (
    <View>
      <Text style={[ 
          styles.settingTitle,
          Appearance.getColorScheme() === 'light' ? { color: 'black' } : { color: '#f2f2f2' }
        ]}>
          { title }
        </Text>
        <Text style={[
          styles.settingDescription,
          Appearance.getColorScheme() === 'light'
            ? { color: '#666666', borderBottomColor: '#d9d9d9' }
            : { color: '#d9d9d9', borderBottomColor: '#f2f2f2' },
        ]}>
          { description }
        </Text>
    </View>
  );
}

export default OptionItem;

const styles = StyleSheet.create({
  settingTitle: {
    marginTop: 8,
    marginLeft: 8,
    paddingLeft: 8,
    fontSize: 16,
    color: 'black'
  },
  settingDescription: {
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
  }
});
