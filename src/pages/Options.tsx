import { StyleSheet, Text, View, Alert, Button, useWindowDimensions, ToastAndroid, Pressable, Appearance } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker'

import OptionItem from "../components/OptionItem";
import OptionButton from "../components/OptionButton";
import { downloadHistory_OpenDB, downloadHistory_cleanTable } from "../db/downloadHistoryDB";
import storage from "../db/downloadPath";
import isLightColorScheme from "../utils/isLightColorScheme";
import pageStyle from "../styles/pageStyle";

const Options = () => {
  const rootPath = '/storage/emulated/0/';

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
        isDefault: true,
      },
      expires: null,
    });
    setDownloadPath('/storage/emulated/0/Download');
    ToastAndroid.show("恢复成功", ToastAndroid.SHORT);
  }
  // 初始化的时候加载下载地址，首次启动需要创建
  useEffect(() => {
    storage
      .load({ key: 'downloadPath' })
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
      pageStyle.container,
      isLightColorScheme() ? pageStyle.lightContainer : pageStyle.darkContainer
    ]}>
      <View style={[
        pageStyle.Header,
        isLightColorScheme() ? pageStyle.lightHeader : pageStyle.darkHeader
      ]}>
        <Text style={[pageStyle.HeaderTitle]}>
          设置
        </Text>
      </View>
      <View style={[{ position: "relative" }]}>
        <View>
          <OptionItem title="保存地址" description={downloadPath} />
          <OptionButton handleFunc={handleStorage} description="更改路径" />
        </View>
        <View>
          <OptionItem title="恢复默认保存地址" description="/storage/emulated/0/Download" />
          <OptionButton handleFunc={reStorage} description="恢复" />
        </View>
        <View>
          <OptionItem title="深色模式" description="默认跟随系统，热切换可能会出现渲染问题" />
        </View>
        <View>
          <OptionItem title="清空历史记录" description="可能需要手动刷新" />
          <OptionButton handleFunc={Options_cleanDownloadHistory} description="清空历史记录" />
        </View>
      </View>
    </View>
  );
};

export default Options;