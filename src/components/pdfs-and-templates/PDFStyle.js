import { StyleSheet, Font } from "@react-pdf/renderer";
import PDFTheme from "../../config/PDFTheme";

import RobotoRegular from "./fonts/Roboto-Regular.ttf";
import RobotoBold from "./fonts/Roboto-Bold.ttf";

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      fontWeight: "normal",
      fontStyle: "normal",
      src: RobotoRegular,
    },
    {
      fontWeight: 700,
      fontStyle: "normal",
      src: RobotoBold,
    },
  ],
});

//Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: PDFTheme.pageBackground,
    fontSize: 11,
    lineHeight: 1.2,
    flexDirection: "column",
    padding: "50 45 50 45",
    width: "790px",
  },
  text: { fontFamily: PDFTheme.font, color: PDFTheme.fontColor },
  boldText: { fontFamily: PDFTheme.font, fontWeight: "bold" },
  titleSection: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 26,
  },
  subHeader1: { fontSize: 10 },

  subHeader2: { fontSize: 13 },

  logoImg: {
    maxWidth: "180px",
    maxHeight: "180px",
    marginBottom: "5px",
  },

  section1: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 17,
  },
  alignRight: { textAlign: "right" },
  alignRightFlex: { display: "flex", alignItems: "flex-end" },
  alignBottom: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  alignCenter: { textAlign: "center" },
  lineHeight2: { lineHeight: 2 },
  marginRight28: { marginRight: 28 },
  contentDetails: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  //table header
  thead: { width: "100%", flexDirection: "row" },
  headerRow: {
    fontSize: 10,
    height: 23,
    backgroundColor: PDFTheme.tableHeaderColor,
    borderWidth: 0,
    color: PDFTheme.tableHeaderFontColor,
    display: "flex",
    justifyContent: "center",
  },
  cell1: { width: 30, color: "white" },
  cell2: { flex: 1, paddingLeft: 10, color: "white" },
  cell3: { width: 40, paddingRight: 5, color: "white" },
  cell4: { paddingRight: 5, paddingLeft: 5, color: "white" },
  cell5: { paddingRight: 5, paddingLeft: 5, color: "white" },

  //table body
  bodyRow: {
    width: "100%",
    flexDirection: "row",
    borderBottom: "1px solid #ebeaf2",
    minHeight: 30,
    display: "table-row",
  },
  number: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 10,
    width: 30,
    borderWidth: 0,
    display: "flex",
    alignItems: "center",
  },
  itemName: {
    fontSize: 10,
    padding: "10 5 10 10",
    flex: 3.5,
    borderWidth: 0,
  },
  qty: {
    fontSize: 10,
    width: 40,
    borderWidth: 0,
    padding: "10 5 10 0",
    height: "100%",
  },
  rate: {
    fontSize: 10,
    borderWidth: 0,
    padding: "10 5 10 5",
    height: "100%",
  },
  amount: {
    fontSize: 10,
    borderWidth: 0,
    padding: "10 5 10 5",
    height: "100%",
  },

  balanceDetails: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    maxWidth: "100%",
    marginTop: 20,
    marginRight: 0,
    marginLeft: "auto",
    lineHeight: 2.3,
  },
  table: {
    display: "flex",
    flexDirection: "row",
    maxWidth: "100%",
    fontSize: 10,
  },
  tableCol: { fontSize: 10, display: "flex", flexDirection: "column" },
  tableHeader: {
    width: "100%",
    height: 23,
    backgroundColor: PDFTheme.tableHeaderColor,
    borderWidth: 0,
    color: PDFTheme.tableHeaderFontColor,
    display: "flex",
    justifyContent: "center",
    verticalAlign: "center",
  },
  tableBody: {
    width: "100%",
    borderBottom: "0.2px solid #333333",
    minHeight: 30,
    padding: "10px 5px 5px 10px",
  },
  notes: { fontSize: 10 },
  noteContainer: {
    position: "absolute",
    bottom: 80,
    left: 40,
    right: 40,
    color: "gray",
  },
  pageNumber: {
    fontSize: 9,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  footer: {
    height: 100,
    fontSize: 6,
    color: "#aaaaaa",
    marginTop: 30,
    marginBottom: 30,
    width: "100%",
  },
  wordBreak: {
    wordBreak: "break-all",
    wordWrap: "break-word",
  },
  red: {
    color: PDFTheme.red,
  },
  primaryColor: {
    color: PDFTheme.primaryColor,
  },
});

export default styles;
