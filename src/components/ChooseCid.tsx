import { Text, View, ToastAndroid, FlatList, StyleSheet, useWindowDimensions, TouchableHighlight, Modal } from 'react-native';
import React, { Component, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { throttle } from 'lodash';

import Cid from '../interface/Cid';
import SearchListItem from '../interface/SearchListItem';
import DownloadHistoryItem from '../interface/DownloadHistoryItem';

import { downloadHistory_OpenDB, downloadHistory_addDownloadHistory } from '../db/downloadHistoryDB';
import isLightColorScheme from '../utils/isLightColorScheme';
import storage from '../db/downloadPath';
import DownloadProgress from './DownloadProgress';

interface Props {
  searchListItem: SearchListItem;
}

const ChooseCid: React.FC<Props> = ({ searchListItem }) => {
  const [cidList, setCidList] = useState<Array<Cid>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bytesWritten, setBytesWritten] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const [jobId, setJobId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // FEAT: 防止渲染阻塞按钮操作
  const throttledProgressHandler = throttle((res) => {
    setBytesWritten(res.bytesWritten);
    const progressPercentage = res.bytesWritten / res.contentLength;
    setProgress(progressPercentage);
  }, 500);

  // FEAT: 下载
  const handleDownload = async (title: string, url: string) => {
    setIsDownloading(true);
    let downloadPath = '';
    storage
      .load({ key: 'downloadPath' })
      .then(ret => {
        console.log('useEffect: load download path', ret);
        downloadPath = ret?.path;
        const options = {
          fromUrl: url,
          toFile: `${RNFS.DownloadDirectoryPath}/temp.m4a`,
          headers: {
            "Origin": "https://www.bilibili.com/",
            "Referer": "https://www.bilibili.com/",
            "Connection": "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          begin: (res: { contentLength: number; }) => {
            setContentLength(res.contentLength);
          },
          progress: (res: any) => {
            throttledProgressHandler(res);
          },

        };
        try {
          const ret = RNFS.downloadFile(options);
          setJobId(ret.jobId);
          ret.promise.then(res => {
            // FEAT: 取消音频平衡
            console.log('????: ', title);
            RNFS.moveFile(`${RNFS.DownloadDirectoryPath}/temp.m4a`, `${downloadPath}/${title}.m4a`)
              .then(() => {
                RNFS.unlink(`${RNFS.DownloadDirectoryPath}/temp.m4a`)
                  .catch((err) => console.log('RNFS.unlink err', err));
                RNFS.scanFile(`${downloadPath}/${title}.m4a`)
                  .then(() => { ToastAndroid.show("下载成功", ToastAndroid.SHORT); resetDownload(); })
                  .catch(() => { ToastAndroid.show("扫描失败，需要在文件管理中手动点击音频", ToastAndroid.SHORT); resetDownload(); });
              })
              .catch(() => { ToastAndroid.show("下载成功但移动失败，音频位于默认下载地址", ToastAndroid.SHORT); resetDownload(); });
          })
            .catch(err => {
              if (err.message === 'Download has been aborted')
                ToastAndroid.show("停止成功", ToastAndroid.SHORT);
              else
                ToastAndroid.show("下载失败", ToastAndroid.SHORT);
              setJobId(null);
              setIsDownloading(false);
              console.log('RNFS.downloadFile err', typeof err, err);
            });
        }
        catch (err) {
          console.log('handleDownload', err);
        };
      })
      .catch(err => {
        console.log(err);
      });
  }

  const resetDownload = () => {
    setIsDownloading(false);
    setProgress(0);
    setJobId(null);
  }

  const stopDownload = useCallback(() => {
    if (jobId !== null) {
      RNFS.stopDownload(jobId);
      console.log('Download stopped');
      resetDownload();
    }
  }, [jobId]);

  const db_AddDownloadHistory = async (title: string, bvid: string, part: string, cid: number) => {
    const temp: DownloadHistoryItem = {
      title: title,
      bvid: bvid,
      part: part,
      cid: cid
    }
    const db = await downloadHistory_OpenDB();
    if (db === undefined) {
      return;
    }
    try {
      await downloadHistory_addDownloadHistory(db, temp);
    } catch (error) {
      console.log(error);
    }
  };

  // FEAT: 打开选择意味着要开始请求Cid了
  const getCidList = () => {
    axios({
      method: "get",
      url: "https://api.bilibili.com/x/player/pagelist",
      params: {
        "bvid": `${searchListItem.bvid}`,
      }
    })
      .then(res => {
        loadCidList(res);
      })
      .catch(err => {
        console.log(err);
      });
  };

  // FEAT: 提取搜索结果
  const loadCidList = (res: any) => {
    // 用any很正常，我不会给搜索结果写结构，太复杂了
    let tempSearchList: Array<Cid> = [];
    let tempSearchListItem: Cid = {} as Cid;
    for (let i = 0; i < res.data.data.length; i++) {
      tempSearchListItem.cid = res.data.data[i].cid;
      tempSearchListItem.part = res.data.data[i].part;
      tempSearchList.push(tempSearchListItem);
      tempSearchListItem = {} as Cid;
    }
    setCidList(tempSearchList);
    setModalVisible(true);
  }

  // FEAT: 选中cid
  const handleCidSelect = async (part: string, cid: number) => {
    try {
      console.log("Before Axios request");
      const response = await axios({
        method: "get",
        url: "https://api.bilibili.com/x/player/playurl",
        params: {
          "fnval": 16,
          "bvid": `${searchListItem.bvid}`,
          "cid": `${cid}`,
        },
      });
      // 正则好难......
      const audioUrl = response.data.data.dash.audio[0].baseUrl;
      if (part.match(/.*[\/\\:|*?"<>]|&#x27;.*/)) {
        part = part.replaceAll(/[\/\\:\|*?"<>]/g, "").replaceAll("&#x27;", "'");
        ToastAndroid.show("目标文件名包含特殊字符，已修改为" + part, ToastAndroid.SHORT);
      }
      await handleDownload(part, audioUrl);
      await db_AddDownloadHistory(searchListItem.title, searchListItem.bvid, part, cid);
    } catch (err) {
      console.log("handleCidSelect", err);
    }
  }
  // FEAT: 渲染cid列表用
  const renderItem = ({ item }: { item: Cid }) => (
    <View>
      <TouchableHighlight
        style={[
          styles.cidButton,
          isLightColorScheme() ? { backgroundColor: '#f2f2f2' } : { backgroundColor: '#999999' }
        ]}
        onPress={() => {
          handleCidSelect(cidList.length === 1 ? searchListItem.title.replaceAll("<em class=\"keyword\">", "").replaceAll("</em>", "").trim() : item.part.trim(), item.cid);
        }}
        underlayColor="#e8e8e8"
      >
        <Text
          style={[
            { fontSize: 12, paddingHorizontal: 12, textAlign: 'center' },
            isLightColorScheme() ? { color: '#2196F3' } : { color: '#f2f2f2' }
          ]}
        >
          {item.part.trim() === "" ? searchListItem.title.replaceAll("<em class=\"keyword\">", "").replaceAll("</em>", "") : item.part}
        </Text>
      </TouchableHighlight>
    </View>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={[
            styles.modalView,
            isLightColorScheme() ? { backgroundColor: 'white' } : { backgroundColor: '#666666' }
          ]}
          >
            <FlatList
              data={cidList}
              renderItem={renderItem}
              keyExtractor={item => item.cid.toLocaleString()}
            />
            {isDownloading && <DownloadProgress progress={progress} stopDownload={stopDownload} isDownloading={isDownloading} bytesWritten={bytesWritten} contentLength={contentLength} />}
            <TouchableHighlight
              style={[
                styles.openButton,
                { marginTop: 4 },
                isLightColorScheme() ? { backgroundColor: '#2196F3' } : { backgroundColor: '#999999' }
              ]}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
              underlayColor='#026cc6'
            >
              <Text style={[
                styles.textStyle,
                { width: 48 },
                isLightColorScheme() ? { color: 'white' } : { color: '#f2f2f2' }
              ]}>
                取消
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <TouchableHighlight
        style={[
          styles.openButton,
          isLightColorScheme() ? { backgroundColor: "#2296f3" } : { backgroundColor: "#999999" }
        ]}
        onPress={() => {
          getCidList();
        }}
        underlayColor="#026cc6"
      >
        <Text style={[
          styles.textStyle,
          { width: 48 },
          isLightColorScheme() ? { color: "white" } : { color: "#f2f2f2" }
        ]}>
          选择
        </Text>
      </TouchableHighlight>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1
  },
  openButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
    height: 32,
    marginVertical: 4,
  },
  cidButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#2296f3",
    marginBottom: 4,
    borderRadius: 4,
    padding: 4,
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default ChooseCid;