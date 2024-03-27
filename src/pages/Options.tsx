import { StyleSheet, Text, View, Alert, Button, useWindowDimensions, ToastAndroid, Pressable, Appearance } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker'

import OptionItem from "../components/OptionItem";
import OptionButton from "../components/OptionButton";
import { downloadHistory_OpenDB, downloadHistory_cleanTable } from "../db/downloadHistoryDB";
import storage from "../db/downloadPath";

const Options = () => {
  const rootPath = '/storage/emulated/0/';
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
  
  const [downloadPath, setDownloadPath] = useState<string>(
    '/storage/emulated/0/Download',
  );
  // TODO: 修改储存地址
  const handleStorage = async () => {
    const ret = await DocumentPicker.pickDirectory();
    if (ret !== null) {
      const appendPath = ret.uri.split('%3A').at(1)?.replaceAll('%2F', '/');
      storage.save({
        key: 'downloadPath', // 注意:请不要在key中使用_下划线符号!
        data: {
          path: `${rootPath + appendPath}`,
          isDefault: false,
        },
        expires: null,
      });
      setDownloadPath(rootPath + appendPath);
    }
  }
  // TODO: 恢复储存地址
  const reStorage = async () => {
    storage.save({
      key: 'downloadPath', // 注意:请不要在key中使用_下划线符号!
      data: {
        path: '/storage/emulated/0/Download',
        isDefault: false,
      },
      expires: null,
    });
    setDownloadPath('/storage/emulated/0/Download');
    ToastAndroid.show("恢复成功", ToastAndroid.SHORT);
  }
  // 初始化的时候加载下载地址，首次启动需要创建
  useEffect(() => {
    storage
      .load({key: 'downloadPath'})
      .then(ret => {
        console.log('useEffect: load download path', ret);
        if (ret?.isDefault === false) {
          setDownloadPath(ret?.path);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

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
        <View>
          <OptionItem title="保存地址" description={ downloadPath } />
          <OptionButton handleFunc={ handleStorage } description="更改路径" />
        </View>
        <View>
          <OptionItem title="恢复默认保存地址" description="/storage/emulated/0/Download" />
          <OptionButton handleFunc={ reStorage } description="恢复" />
        </View>
        <OptionItem title="深色模式" description="默认跟随系统，热切换可能会出现渲染问题" />
        <View>
          <OptionItem title="清空历史记录" description="可能需要手动刷新" />
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
