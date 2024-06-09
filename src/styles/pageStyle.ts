import { StyleSheet } from "react-native";

const pageStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    color: 'black',
    backgroundColor: 'white',
  },
  darkContainer: {
    color: '#f2f2f2',
    backgroundColor: '#666666',
  },
  Header: {
    height: 48,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  searchHeader: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1
  },
  lightHeader: {
    borderBottomColor: '#f2f2f2',
    backgroundColor: 'white',
  },
  darkHeader: {
    borderBottomColor: '#999999',
    backgroundColor: '#333333',
  },
  searchBar: {
    borderWidth: 1,
    borderCurve: 'circular',
    borderRadius: 12,
    height: 40,
    marginRight: 8,
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  searchButton: {
    width: 56,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderCurve: 'circular',
    borderRadius: 12
  },
  HeaderTitle: {
    paddingLeft: 8,
    fontSize: 20,
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
  openButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
    height: 32,
    marginVertical: 4,
    position: 'absolute',
    right: 8,
    top: 4,
    width: 56
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
});

const blueColor_1 = '#2196F3';

export default pageStyle;
