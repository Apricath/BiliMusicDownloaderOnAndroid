import { Text, View, Alert, TextInput, FlatList, StyleSheet, ToastAndroid, useWindowDimensions, Pressable, Appearance, Image } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import HTML from 'react-native-render-html';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import SearchListItem from '../interface/SearchListItem';
import Cid from '../interface/Cid';

import ChooseCid from '../components/ChooseCid';
import isLightColorScheme from '../utils/isLightColorScheme';
import pageStyle from '../styles/pageStyle';

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
  const loadSearchList = (res: any) => {
    // 用any很正常，我不会给搜索结果写结构，太复杂了
    let tempSearchList: Array<SearchListItem> = [];
    let tempSearchListItem: SearchListItem = {} as SearchListItem;
    for (let i = 0; i < res.data.data.result.length; i++) {
      tempSearchListItem.title = res.data.data.result[i].title;
      tempSearchListItem.author = res.data.data.result[i].author;
      tempSearchListItem.bvid = res.data.data.result[i].bvid;   // bv号作为循环渲染时的key
      tempSearchListItem.pic = res.data.data.result[i].pic;
      tempSearchListItem.play = res.data.data.result[i].play;
      tempSearchListItem.duration = res.data.data.result[i].duration;
      tempSearchList.push(tempSearchListItem);
      tempSearchListItem = {} as SearchListItem;
    }
    setSearchList(tempSearchList);
  }

  // FEAT: 格式化时间
  const formatTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    const formattedParts = parts.map(part => part.padStart(2, '0'));
    return formattedParts.join(':');
  }

  // FEAT: FlatList的renderItem方法
  const renderItem = ({ item }: { item: SearchListItem }) => (
    <View style={[
      pageStyle.line,
      isLightColorScheme() ? pageStyle.lightContainer : pageStyle.darkContainer
    ]}>
      <View style={[
        pageStyle.item,
        { width: width - 80 },
        isLightColorScheme() ? { backgroundColor: '#e6e6e6' } : { backgroundColor: '#999999' }
      ]}>
        <View style={[{ flexDirection: "column" }]}>
          {/* 调试失败，图片不显示，估计是请求给多了，服务器拒绝了 */}
          {/* <Image
            width={160}
            height={100}
            source={[{uri: 'https:' + item.pic}]}
          /> */}
          <View>
            <HTML
              source={{ html: item.title }}
              contentWidth={width}
              tagsStyles={{
                em: { fontWeight: 'bold', fontStyle: 'normal', color: isLightColorScheme() ? '#2296f3' : 'white' },
              }}
            />
          </View>
          <Text style={[{ color: isLightColorScheme() ? '#6b6b6b' : '#f2f2f2' }]}>
            UP：{item.author}
          </Text>
          {
            item.duration !== undefined && item.play !== undefined
            && <Text style={[{ color: isLightColorScheme() ? '#6b6b6b' : '#f2f2f2' }]}>
              总时长：{formatTime(item.duration)}    播放量：{item.play > 100000000 ? (item.play / 100000000).toFixed(2) + "亿" : item.play > 10000 ? (item.play / 10000).toFixed(2) + "万" : item.play}
            </Text>
          }
        </View>
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
      <View
        style={[
          pageStyle.searchHeader,
          isLightColorScheme() ? pageStyle.lightHeader : pageStyle.darkHeader
        ]}
      >
        <TextInput
          style={[
            { borderColor: isTextInputFocused ? '#2196F3' : '#e8e8e8', width: width - 80 },
            pageStyle.searchBar,
            { backgroundColor: 'white' },
          ]}
          value={searchText}
          placeholder="请输入关键字搜索"
          placeholderTextColor={isLightColorScheme() ? '#999999' : '#f2f2f2'}
          onChangeText={(e) => { setSearchText(e) }}
          onFocus={() => setIsTextInputFocused(true)}
          onBlur={() => setIsTextInputFocused(false)}
        />
        <Pressable
          onPress={() => { handleBiliSearch() }}
          style={({ pressed }) => [
            isLightColorScheme()
              ? { backgroundColor: pressed ? '#999999' : 'white' }
              : { backgroundColor: pressed ? '#999999' : '#666666' },
            pageStyle.searchButton
          ]}
        >
          <MaterialCommunityIcons name="magnify" color={isLightColorScheme() ? '#2196F3' : '#f2f2f2'} size={24} />
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

export default Search;
