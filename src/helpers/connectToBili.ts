import axios from "axios";
import { Alert, ToastAndroid } from "react-native";

const connectToBili = () => {
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
    })
    .catch(err => {
      console.log(err);
      Alert.alert("网络错误！", "请检查网络环境后重启应用！");
    });
}

export default connectToBili;
