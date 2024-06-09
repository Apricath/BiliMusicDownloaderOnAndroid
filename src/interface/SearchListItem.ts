interface SearchListItem {
  title: string,    // 标题
  author?: string,   // up主
  bvid: string,     // bv号
  pic?: string,      // 封面url
  play?: number,     // 播放量
  duration?: string, // 时长
}

export default SearchListItem;