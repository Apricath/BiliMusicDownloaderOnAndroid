import React from 'react';
import { Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import * as Progress from 'react-native-progress';
import isLightColorScheme from '../utils/isLightColorScheme';

interface Props {
  progress: number;
  stopDownload: () => any;
  isDownloading: boolean;
  bytesWritten: number;
  contentLength: number;
}

const formatBytes = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt((Math.floor(Math.log(bytes) / Math.log(1000))).toString(), 10);
  return (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + sizes[i];
}

const DownloadProgress: React.FC<Props> = ({ progress, stopDownload, isDownloading, bytesWritten, contentLength }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDownloading}
      onRequestClose={() => stopDownload()}
    >
      <View style={[styles.centeredView]}>
        <View
          style={[
            styles.modalView,
            isLightColorScheme() ? { backgroundColor: 'white' } : { backgroundColor: '#666666' }
          ]}
        >
          <Progress.Bar progress={progress} width={200} />
          <Text
            style={[
              { fontSize: 12, paddingHorizontal: 12, textAlign: 'center' },
              isLightColorScheme() ? { color: 'black' } : { color: '#f2f2f2' }
            ]}
          >
            {formatBytes(bytesWritten)} / {formatBytes(contentLength)}
          </Text>
          <TouchableHighlight
            style={[
              styles.openButton,
              { marginTop: 4 },
              isLightColorScheme() ? { backgroundColor: '#2196F3' } : { backgroundColor: '#999999' }
            ]}
            onPress={() => stopDownload()}
            underlayColor="#e8e8e8"
          >
            <Text
              style={[
                { fontSize: 12, paddingHorizontal: 12, textAlign: 'center' },
                isLightColorScheme() ? { color: 'white' } : { color: '#f2f2f2' }
              ]}
            >
              取消
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
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
  },
});

export default React.memo(DownloadProgress);
