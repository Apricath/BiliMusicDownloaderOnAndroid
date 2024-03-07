import { Text, View, Alert, TextInput, FlatList, StyleSheet, ToastAndroid, useWindowDimensions, Pressable, Appearance } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import HTML from 'react-native-render-html';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import SearchListItem from '../interface/SearchListItem';
import Cid from '../interface/Cid';

import ChooseCid from '../components/ChooseCid';

const Search = () => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState<string>("");
  const [searchList, setSearchList] = useState<Array<SearchListItem>>([]);
  const [isTextInputFocused, setIsTextInputFocused] = useState<boolean>(false);

  // FEAT: 开始搜索
  const handleBiliSearch = () => {
    if (searchText.trim() === "") {
      ToastAndroid.show("搜索失败！请输入关键字后再搜索！", ToastAndroid.SHORT);
      return;
    }
    axios({
      method: "get",
      url: "https://api.bilibili.com/x/web-interface/search/type",
      params: {
        "search_type": "video",
        "keyword": `${searchText}`,
      },
      headers: {
        "Host": "api.bilibili.com",
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    })
    .then(res => {
      loadSearchList(res);
    })
    .catch(err => {
      // console.log(err);
      Alert.alert("搜索失败！", "请检查网络环境或者尝试重新获取B站Cookie！" + err);
    });
  }

  // FEAT: 提取搜索结果
  const loadSearchList = (res:any) => {
    // 用any很正常，我不会给搜索结果写结构，太复杂了
    let tempSearchList: Array<SearchListItem> = [];
    let tempSearchListItem: SearchListItem = {} as SearchListItem;
    for (let i = 0; i < res.data.data.result.length; i++) {
      tempSearchListItem.title    = res.data.data.result[i].title   ;
      tempSearchListItem.author   = res.data.data.result[i].author  ;
      tempSearchListItem.bvid     = res.data.data.result[i].bvid    ;   // bv号作为循环渲染时的key
      tempSearchListItem.pic      = res.data.data.result[i].pic     ;
      tempSearchListItem.play     = res.data.data.result[i].play    ;
      tempSearchListItem.duration = res.data.data.result[i].duration;
      tempSearchList.push(tempSearchListItem);
      tempSearchListItem = {} as SearchListItem;
    }
    setSearchList(tempSearchList);
  }

  // FEAT: FlatList的renderItem方法，目前没吃透
  const renderItem = ({ item }: { item: SearchListItem }) => (
    <View style={[
      styles.line,
      Appearance.getColorScheme() === 'light'
        ? { backgroundColor: 'white'}
        : { backgroundColor: '#666666'}
    ]}>
      <View style={[
        styles.item,
        { width: width - 80 }, 
        Appearance.getColorScheme() === 'light'
          ? { backgroundColor: '#e6e6e6'}
          : { backgroundColor: '#999999'}
      ]}>
        <HTML
          source={{html: item.title}}
          contentWidth={width}
          baseStyle={
            { color: Appearance.getColorScheme() === 'light' ? 'black' : '#f2f2f2'}
          }
          tagsStyles={
            {
              em: { fontWeight: 'bold', fontStyle: 'normal', color:  Appearance.getColorScheme() === 'light' ? '#2296f3' : 'white' },
            }
          }
        />
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <ChooseCid searchListItem={item} />
      </View>
    </View>
  );

  return (
    <View style={[
      styles.container,
      Appearance.getColorScheme() === 'light' ? styles.lightModeColor : styles.darkModeColor
    ]}>
      <View
        style={[
          { display: 'flex', flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1 },
          Appearance.getColorScheme() === 'light' ? { borderBottomColor: '#f2f2f2' } : { borderBottomColor: '#999999', backgroundColor: '#333333' }
        ]}
      >
        <TextInput
          style={[
            { borderColor: isTextInputFocused ? "#2196F3" : "#e8e8e8", borderWidth: 1, borderCurve: "circular", borderRadius: 12 }, 
            { backgroundColor: 'white' },
            { width: width - 80, height: 40 },
            { marginRight: 8, marginLeft: 8, paddingHorizontal: 8 },
            Appearance.getColorScheme() === 'light' ? styles.lightModeColor : styles.darkModeColor
          ]}
          value={ searchText }
          placeholder="请输入关键字搜索"
          placeholderTextColor={ Appearance.getColorScheme() === 'light' ? '#999999' : '#f2f2f2' }
          onChangeText={(e) => { setSearchText(e) }}
          onFocus={() => setIsTextInputFocused(true)}
          onBlur={() => setIsTextInputFocused(false)}
        />
        <Pressable
          onPress={() => { handleBiliSearch() }}
          style={({ pressed }) => [
            Appearance.getColorScheme() === 'light'
              ? { backgroundColor: pressed ? '#999999' : 'white' }
              : { backgroundColor: pressed ? '#999999' : '#666666' },
            { width: 56, height: 40, justifyContent: 'center', alignItems: 'center' },
            { borderColor: "#e8e8e8", borderWidth: 1, borderCurve: "circular", borderRadius: 12 }
          ]}
        >
          <MaterialCommunityIcons name="magnify" color={ Appearance.getColorScheme() === 'light' ? '#2196F3' : '#f2f2f2' } size={ 24 }/>
        </Pressable>
      </View>
      <FlatList
        data={searchList}
        renderItem={renderItem}
        keyExtractor={item => item.title + item.bvid}
      />
    </View>
  );
};

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
  lightModeColor: {
    color: 'black',
    backgroundColor: 'white',
  },
  darkModeColor: {
    color: '#f2f2f2',
    backgroundColor: '#666666',
  }
});

export default Search;
