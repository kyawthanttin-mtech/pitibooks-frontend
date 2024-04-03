import React, { useState, useEffect } from "react";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import "../Template.css";
import styles from "./InvoicePDFStyles";
// import { data } from "./InvoiceData";
const data = [
  {
    itemName: "cake",
    qty: "1.00",
    rate: "11111114.00",
    amount: (1 * 43000.0).toFixed(2),
  },
  {
    itemName:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean rhoncus, nisl sed placerat tristique, velit velit suscipit mi, at varius nisl orci a sapien. Aenean luctus eu nulla id malesuada. Curabitur at sem laoreet, pretium dolor in, tempus lacus. Nulla.",
    qty: "3.00",
    rate: "200.00",
    amount: (3 * 200.0).toFixed(2),
  },
  {
    itemName: "cup",
    qty: "2.00",
    rate: "485.00",
    amount: (2 * 400.0).toFixed(2),
  },
  {
    itemName: "csdfp",
    qty: "2.00",
    rate: "100.00",
    amount: (2 * 86760.0).toFixed(2),
  },
  {
    itemName: "fdsf",
    qty: "4.00",
    rate: "3000.00",
    amount: (4 * 3000.0).toFixed(2),
  },
  {
    itemName: "adf",
    qty: "7.00",
    rate: "800.00",
    amount: (7 * 800.0).toFixed(2),
  },
  {
    itemName: "fefd",
    qty: "1.00",
    rate: "4000.00",
    amount: (1 * 4000000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10454356.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
  {
    itemName: "gdd",
    qty: "6.00",
    rate: "10000.00",
    amount: (6 * 10000.0).toFixed(2),
  },
];

//caculate total balance
const total = data
  .reduce((acc, item) => acc + parseFloat(item.amount), 0)
  .toFixed(2);

//break text
const breakText = (text) => {
  const maxCharactersPerLine = 10;
  const chunks = [];
  let index = 0;

  while (index < text.length) {
    chunks.push(text.slice(index, index + maxCharactersPerLine));
    index += maxCharactersPerLine;
  }

  return chunks.join("\n");
};

//custom text component
const CustomText = ({ children, style, ...props }) => (
  <Text style={[styles.text, style]} {...props}>
    {children}
  </Text>
);

//height

const Invoice = ({ selectedRecord }) => {
  const [maxAmountWidth, setMaxAmountWidth] = useState(0);
  const [maxRateWidth, setMaxRateWidth] = useState(0);

  //find and set max width
  useEffect(() => {
    let maxAmountLength = 0;
    let maxRateLength = 0;

    data.forEach((item) => {
      maxAmountLength = Math.max(maxAmountLength, item.amount.length);
      maxRateLength = Math.max(maxRateLength, item.rate.length);
      console.log(maxAmountLength, maxRateLength);
    });

    setMaxAmountWidth(maxAmountLength * 6 + 4);
    setMaxRateWidth(maxRateLength * 6 + 4);
  }, []);

  const InvoiceTitle = () => (
    <View style={styles.titleSection} debug>
      <View>
        <CustomText style={styles.boldText}>
          {selectedRecord.customerName}
          {"\n"}
        </CustomText>
        <CustomText>Myanmar{"\n"}</CustomText>
        <CustomText>useremail@gmail.com</CustomText>
      </View>
      <CustomText style={styles.alignRight}>
        <CustomText style={styles.header}>INVOICE{"\n"}</CustomText>
        <CustomText>
          # {selectedRecord.invoice}
          {"\n"}
          {"\n"}
        </CustomText>
        <CustomText style={[styles.subHeader1, styles.boldText]}>
          Balance Due {"\n"}
        </CustomText>
        <CustomText style={[styles.subHeader2, styles.boldText]}>
          MMK{selectedRecord.balanceDue}
          {"\n"}
          {"\n"}
        </CustomText>
      </CustomText>
    </View>
  );

  const InvoiceDetail = () => (
    <View style={styles.section1} debug>
      <View style={[styles.alignBottom, { paddingBottom: 10 }]}>
        <CustomText>
          <CustomText>Bill To{"\n"}</CustomText>
          <CustomText style={styles.boldText}>
            {selectedRecord.customerName}
          </CustomText>
        </CustomText>
      </View>
      <View style={[styles.invoiceDetails, styles.alignRight]}>
        <View
          style={[
            styles.marginRight28,
            styles.lineHeight2,
            { marginBottom: 10 },
          ]}
        >
          <CustomText style={styles.alignRight}>
            <CustomText>Invoice Date :{"\n"}</CustomText>
            <CustomText>Terms :{"\n"}</CustomText>
            <CustomText>Due Date :{"\n"}</CustomText>
            <CustomText>P.O# :</CustomText>
          </CustomText>
        </View>
        <View style={styles.lineHeight2}>
          <CustomText style={styles.alignRight}>
            <CustomText>
              {selectedRecord.invoiceDate}
              {"\n"}
            </CustomText>
            <CustomText> Due On Receipt{"\n"}</CustomText>
            <CustomText>
              {selectedRecord.dueDate}
              {"\n"}
            </CustomText>
            <CustomText>{selectedRecord.orderNumber}</CustomText>
          </CustomText>
        </View>
      </View>
    </View>
  );

  const TableHead = () => (
    <View style={styles.thead} fixed debug>
      <View style={[styles.headerRow, styles.cell1]}>
        <CustomText style={styles.alignCenter}>#</CustomText>
      </View>
      <View style={[styles.headerRow, styles.cell2]}>
        <CustomText>Items & Descriptions</CustomText>
      </View>
      <View style={[styles.headerRow, styles.cell3]}>
        <CustomText style={styles.alignRight}>Qty</CustomText>
      </View>
      <View
        style={[
          styles.headerRow,
          styles.cell4,
          styles.alignRightFlex,
          { width: maxRateWidth },
        ]}
      >
        <CustomText>Rate</CustomText>
      </View>
      <View
        style={[
          styles.headerRow,
          styles.cell5,
          styles.alignRightFlex,
          { width: maxAmountWidth },
        ]}
      >
        <CustomText>Amount</CustomText>
      </View>
    </View>
  );

  const TableBody = () => (
    <View wrap>
      <TableHead />
      {data.map((item, index) => (
        <View wrap={false} key={index} style={styles.bodyRow}>
          <View style={[styles.number, {}]} debug>
            <CustomText>{index + 1}</CustomText>
          </View>
          <View style={[styles.itemName, {}]} debug>
            <CustomText>{item.itemName}</CustomText>
          </View>
          <View debug style={[styles.qty, {}]}>
            <CustomText style={styles.alignRight}>{item.qty}</CustomText>
          </View>
          <View
            debug
            style={[
              styles.rate,
              styles.alignRightFlex,
              {
                width: maxRateWidth,
              },
            ]}
            id="rate"
          >
            <CustomText>{item.rate}</CustomText>
          </View>
          <View
            debug
            style={[
              styles.amount,
              styles.alignRightFlex,
              {
                width: maxAmountWidth,
              },
            ]}
            id="amount"
          >
            <CustomText>{item.amount}</CustomText>
          </View>
        </View>
      ))}
    </View>
  );

  const BalanceDetail = () => (
    <View style={[styles.balanceDetails, {}]}>
      <CustomText style={[styles.alignRight, { paddingRight: 11 }]}>
        <CustomText> Sub Total{"\n"}</CustomText>
        <CustomText> Commercial Tax (5%){"\n"}</CustomText>
        <CustomText style={styles.boldText}>Total{"\n"}</CustomText>
        <CustomText style={[styles.boldText]}>Balance Due</CustomText>
      </CustomText>
      <CustomText style={styles.alignRight}>
        <CustomText>
          {total}
          {"\n"}
        </CustomText>
        <CustomText>
          1,500.00
          {"\n"}
        </CustomText>
        <CustomText style={[styles.boldText]}>
          MMK{+total + 1500}
          {"\n"}
        </CustomText>
        <CustomText style={[styles.boldText]}>
          MMK{selectedRecord.balanceDue}
        </CustomText>
      </CustomText>
    </View>
  );

  const Note = () => (
    <View style={styles.noteContainer}>
      <CustomText>Notes{"\n"}</CustomText>
      <CustomText style={styles.notes}>Thanks for your business</CustomText>
      <CustomText id="text">Something</CustomText>
    </View>
  );

  const PageNumber = () => (
    <CustomText
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  );

  // const Footer = () => <View fixed style={styles.footer}></View>;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceTitle />
        <InvoiceDetail />
        <TableBody />
        <BalanceDetail />
        <Note />
        <PageNumber />
      </Page>
    </Document>
  );
};

export default Invoice;
