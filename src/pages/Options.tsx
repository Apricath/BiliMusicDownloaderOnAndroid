import { StyleSheet, Text, View, Alert, Button, useWindowDimensions, ToastAndroid, Pressable, Appearance } from "react-native";
import React, { useCallback } from "react";
import axios from 'axios';
import RNFS from 'react-native-fs';

import OptionItem from "../components/OptionItem";
import OptionButton from "../components/OptionButton";
import { downloadHistory_OpenDB, downloadHistory_cleanTable } from "../db/downloadHistoryDB";

const Options = () => {

  // FEAT: 获取B站Cookie
  const handleBiliCookie = () => {
    axios({
      method: "get",
      url: "https://www.bilibili.com",
      headers: {
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    })
    .then(res => {
      console.log(res.headers);
      ToastAndroid.show("获取B站Cookie成功", ToastAndroid.SHORT);
    })
    .catch(err => {
      console.log(err);
      Alert.alert("获取Cookie错误！", "请检查网络环境！");
    });
  }

  // FEAT: 清空历史记录
  const Options_cleanDownloadHistory = useCallback(async () => {
    const db = await downloadHistory_OpenDB();
    if (db === undefined) {
      return;
    }
    await downloadHistory_cleanTable(db);
    ToastAndroid.show("已清空历史记录", ToastAndroid.SHORT);
  }, []);
  
  // TODO: 修改储存地址
  const handleStorage = async () => {
    const ret = RNFS.readDir(RNFS.ExternalStorageDirectoryPath);
    ret.then(res => {
        console.log('success', res);
    }).catch(err => {
        console.log('err', err);
    });
  }

  return (
    <View style={[
      styles.container,
      Appearance.getColorScheme() === 'light' ? { backgroundColor: 'white' } : { backgroundColor: '#666666' }
    ]}>
      <View style={[
        { backgroundColor: 'white', height: 48, justifyContent: 'center', borderBottomWidth: 1 },
        Appearance.getColorScheme() === 'light' ? { borderBottomColor: '#d9d9d9' } : { borderBottomColor: '#999999' },
        Appearance.getColorScheme() === 'light' ? { backgroundColor: 'white' } : { backgroundColor: '#333333' }
      ]}>
        <Text style={[
          { paddingLeft: 8, fontSize: 20, color: 'black' },
          Appearance.getColorScheme() === 'light' ? { color: 'black' } : { color: '#f2f2f2' }
        ]}>
          设置
        </Text>
      </View>
      <View style={[{ position: "relative" }]}>
        <View>
          <OptionItem title="获取B站Cookie" description="首次使用请先点击右侧按钮" />
          <OptionButton handleFunc={ handleBiliCookie } description="获取Cookie" />
        </View>
        <OptionItem title="保存地址" description="默认位于系统下载目录" />
        <OptionItem title="深色模式" description="默认跟随系统，热切换可能会出现渲染问题" />
        <View>
          <OptionItem title="清空历史记录" description="可能需要刷新" />
          <OptionButton handleFunc={ Options_cleanDownloadHistory } description="清空历史记录" />
        </View>
        {/* <Button title="修改保存地址" onPress={() => {handleStorage()}} /> */}
      </View>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
