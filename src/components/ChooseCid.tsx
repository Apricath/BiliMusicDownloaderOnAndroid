import { Text, View, ToastAndroid, Appearance, FlatList, StyleSheet, useWindowDimensions, TouchableHighlight, Modal} from 'react-native';
import React, { Component, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import RNFS from 'react-native-fs';
import SQLite from 'react-native-sqlite-storage';

import Cid from '../interface/Cid';
import SearchListItem from '../interface/SearchListItem';
import DownloadHistoryItem from '../interface/DownloadHistoryItem';

import { downloadHistory_OpenDB, downloadHistory_addDownloadHistory } from '../db/downloadHistoryDB';

interface Props {
  searchListItem: SearchListItem;
}


// FEAT: 下载
export const handleDownload = async (title: string, url: string) => {
  console.log("将使用默认的下载地址", RNFS.DownloadDirectoryPath);
  let downloadDest = `${RNFS.DownloadDirectoryPath}/${title}.m4a`;
  const options = {
      fromUrl: url,
      toFile: downloadDest,
      headers: {
          "Origin":  "https://www.bilibili.com/",
          "Referer": "https://www.bilibili.com/",
          "Connection": "keep-alive",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
  };
  try {
      // console.log("Before RNFetchBlob fetch");
      // const response = await axios({
      //     method: 'get',
      //     url: url,
      //     responseType: 'arraybuffer',
      //     headers: {
      //         "Origin":  "https://www.bilibili.com/",
      //         "Referer": "https://www.bilibili.com/",
      //     }
      // });
      // const base64String = fromByteArray(new Uint8Array(response.data));
      // const downloadDirPath = RNFS.DownloadDirectoryPath;
      // const filePath = `${downloadDirPath}/${title}.m4a`;
      // await RNFS.mkdir(downloadDirPath);
      
      // 使用RNFS.writeFile会报权限错误
      // await RNFS.writeFile(filePath, base64String, 'base64');

      const ret = RNFS.downloadFile(options);
      ret.promise.then(res => {
          // console.log('success', res);
          // console.log("File written successfully:", downloadDest);
          // Alert.alert("下载成功", downloadDest);
          ToastAndroid.show("下载成功", ToastAndroid.SHORT);
      }).catch(err => {
          console.log('err', err);
      });
  } catch (err) {
      console.log('handleDownload', err);
  };
}

const ChooseCid: React.FC<Props> = ({ searchListItem }) => {
    const { width } = useWindowDimensions();
    const [cidList, setCidList] = useState<Array<Cid>>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const db_AddDownloadHistory = useCallback(async (title: string, bvid: string, part: string, cid: number) => {
      const temp: DownloadHistoryItem = {
        // title: title.replaceAll("<em class=\"keyword\">", "").replaceAll("</em>", ""),
        title: title,
        bvid: bvid,
        part: part,
        cid: cid
      }
      // console.log('downloadHistory_OpenDB before');
      const db = await downloadHistory_OpenDB();
      if (db === undefined) {
        // console.log('downloadHistory_OpenDB DB undefined');
        return;
      }
      try {
        await downloadHistory_addDownloadHistory(db, temp);
        // console.log('downloadHistory_addDownloadHistory');
      } catch (error) {
        console.log(error);
      }
    }, []);

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
    const loadCidList = (res:any) => {
        // 用any很正常，我不会给搜索结果写结构，太复杂了
        let tempSearchList: Array<Cid> = [];
        let tempSearchListItem: Cid = {} as Cid;
        for (let i = 0; i < res.data.data.length; i++) {      
            tempSearchListItem.cid    = res.data.data[i].cid   ;
            tempSearchListItem.part   = res.data.data[i].part  ;
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
        const audioUrl = response.data.data.dash.audio[0].baseUrl;
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
          Appearance.getColorScheme() === 'light' ? { backgroundColor: '#f2f2f2' } : { backgroundColor: '#999999' }
        ]}
        onPress={() => {
          handleCidSelect(item.part.trim() === "" ? searchListItem.title.replaceAll("<em class=\"keyword\">", "").replaceAll("</em>", "") : item.part, item.cid);
        }}
        underlayColor="#e8e8e8"
      >
        <Text
          style={[
            { fontSize: 12 },
            Appearance.getColorScheme() === 'light' ? { color: '#2196F3' } : { color: '#f2f2f2' }
          ]}
        >
          { item.part.trim() === "" ? searchListItem.title.replaceAll("<em class=\"keyword\">", "").replaceAll("</em>", "") : item.part }
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
            // Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
            <View style={ styles.centeredView }>
              <View style={[
                  styles.modalView,
                  Appearance.getColorScheme() === 'light' ? { backgroundColor: 'white' } : { backgroundColor: '#666666' }
                ]}
              >
                <FlatList
                  data={cidList}
                  renderItem={renderItem}
                  keyExtractor={item => item.cid.toLocaleString()}
                />
                <TouchableHighlight
                  style={[
                    styles.openButton,
                    { marginTop: 4 },
                    Appearance.getColorScheme() === 'light' ? { backgroundColor: '#2196F3' } : { backgroundColor: '#999999' }
                  ]}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                  underlayColor='#026cc6'
                >
                  <Text style={[
                    styles.textStyle,
                    { width: 48 },
                    Appearance.getColorScheme() === 'light' ? { color: 'white' } : { color: '#f2f2f2' }
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
            Appearance.getColorScheme() === 'light' ? { backgroundColor: "#2296f3" } : { backgroundColor: "#999999" }
          ]}
          onPress={() => {
            getCidList();
          }}
          underlayColor="#026cc6"
        >
          <Text style={[
            styles.textStyle,
            { width: width * 0.12 },
            Appearance.getColorScheme() === 'light' ? { color: "white" } : { color: "#f2f2f2" }
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