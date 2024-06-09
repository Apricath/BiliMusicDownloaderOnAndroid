import { FlatList, Pressable, StyleSheet, Text, ToastAndroid, TouchableHighlight, View, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from "react";
import HTML from 'react-native-render-html';

import DownloadHistoryItem from "../interface/DownloadHistoryItem";

import { downloadHistory_OpenDB, downloadHistory_getAllDownloadHistory } from "../db/downloadHistoryDB";
import ChooseCid from "../components/ChooseCid";
import isLightColorScheme from "../utils/isLightColorScheme";
import pageStyle from "../styles/pageStyle";

const DownloadHistory = React.memo(() => {
  const { width, height } = useWindowDimensions();
  const [downloadHistoryItems, setDownloadHistoryItems] = useState<Array<DownloadHistoryItem>>([]);

  const db_OpenDB = async () => {
    const db = await downloadHistory_OpenDB();
    if (db === undefined) {
      return;
    }
    setDownloadHistoryItems(await downloadHistory_getAllDownloadHistory(db));
  };

  useEffect(() => {
    db_OpenDB();
  }, []);

  const renderItem = ({ item }: { item: DownloadHistoryItem }) => (
    <View style={[
      styles.line,
      isLightColorScheme()
        ? { backgroundColor: 'white' }
        : { backgroundColor: '#666666' }
    ]}>
      <View style={[
        styles.item,
        { width: width - 80 },
        isLightColorScheme()
          ? { backgroundColor: '#e6e6e6' }
          : { backgroundColor: '#999999' }
      ]}>
        <HTML
          source={{ html: item.title }}
          contentWidth={width}
          baseStyle={
            { color: isLightColorScheme() ? 'black' : '#f2f2f2' }
          }
          tagsStyles={
            {
              em: { fontStyle: 'normal' },
            }
          }
        />
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ChooseCid searchListItem={item} />
      </View>
    </View>
  );

  return (
    <View style={[
      pageStyle.container,
      isLightColorScheme() ? pageStyle.lightContainer : pageStyle.darkContainer
    ]}>
      <View style={[
        pageStyle.Header,
        isLightColorScheme() ? pageStyle.lightHeader : pageStyle.darkHeader
      ]}>
        <Text style={[pageStyle.HeaderTitle]}>
          历史记录
        </Text>
      </View>
      <TouchableHighlight
        style={[
          pageStyle.openButton,
          isLightColorScheme() ? { backgroundColor: "#2296f3" } : { backgroundColor: "#999999" }
        ]}
        onPress={async () => {
          try {
            await db_OpenDB();
            ToastAndroid.show("刷新成功", ToastAndroid.SHORT);
          } catch (error) {
            console.log("刷新失败", error);
          }
        }}
        underlayColor="#026cc6"
      >
        <Text style={[
          styles.textStyle,
          { width: width * 0.12 },
          isLightColorScheme() ? { color: "white" } : { color: "#f2f2f2" }
        ]}>
          刷新
        </Text>
      </TouchableHighlight>
      <FlatList
        data={downloadHistoryItems}
        renderItem={renderItem}
        keyExtractor={item => item.title}
        refreshing
        ListEmptyComponent={() => (
          <View
            style={[{ justifyContent: "center", alignItems: "center", height: height - 128 }]}
          >
            <Text>
              暂无历史记录
            </Text>
          </View>
        )}
      />
    </View>
  );
});

// 使用React.memo解决: You seem to update props of the "TRenderEngineProvider" component in short periods of time, 
// causing costly tree rerenders (last update was 40.16ms ago). See https://stackoverflow.com/q/68966120/2779871
export default DownloadHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  line: {
    flexDirection: 'row',
  },
  item: {
    marginVertical: 4,
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
    borderCurve: "circular",
    borderRadius: 12
  },
  onPressButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    height: 32
  },
  openButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
    height: 32,
    marginVertical: 4,
    position: 'absolute',
    right: 8,
    top: 4,
    width: 56
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  lightModeColor: {
    color: 'black',
    backgroundColor: 'white',
  },
  darkModeColor: {
    color: '#f2f2f2',
    backgroundColor: '#666666',
  }
});