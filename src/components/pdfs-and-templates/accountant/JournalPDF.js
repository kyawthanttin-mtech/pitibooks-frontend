import React, { useState, useEffect, useMemo } from "react";
import styles from "../PDFStyle";
import { FormattedNumber, IntlProvider } from "react-intl";
import { Text, View, Image } from "@react-pdf/renderer";
import PDFDocument from "../PDFDocument";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";

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

const CustomText = ({ children, style, ...props }) => (
  <Text style={[styles.text, style]} {...props}>
    {children}
  </Text>
);

const JournalPDF = ({ selectedRecord, business }) => {
  const [maxCreditWidth, setMaxCreditWidth] = useState(0);
  const [maxDebitWidth, setMaxDebitWidth] = useState(0);

  const data = useMemo(
    () => (selectedRecord?.transactions ? selectedRecord.transactions : []),
    [selectedRecord?.transactions]
  );

  let hasDetailDiscount = false;
  data.forEach((d) => {
    if (d.detailDiscountAmount > 0) {
      hasDetailDiscount = true;
    }
  });

  useEffect(() => {
    let maxDebitLength = 0;
    let maxCreditLength = 0;

    data?.forEach((item) => {
      maxDebitLength = Math.max(
        maxDebitLength,
        item.debit.toString().length > 12 ? item?.debit.toString().length : 12
      );
      maxCreditLength = Math.max(
        maxCreditLength,
        item.credit.toString().length > 12 ? item?.credit.toString().length : 12
      );
      console.log(maxDebitLength, maxCreditLength);
    });
    const extraPixelsForDecimalPlaces =
      selectedRecord?.currency?.decimalPlaces * 6;
    // Calculate the extra pixels for every length of 3
    const extraPixelsForMaxAmount = Math.floor(maxDebitLength / 3) * 2;
    const extraPixelsForMaxRate = Math.floor(maxCreditLength / 3) * 2;

    // Calculate the final widths with the additional pixels
    const maxDebitWidth =
      maxDebitLength * 6 +
      4 +
      extraPixelsForMaxAmount +
      extraPixelsForDecimalPlaces;
    const maxCreditWidth =
      maxCreditLength * 6 +
      4 +
      extraPixelsForMaxRate +
      extraPixelsForDecimalPlaces;

    setMaxDebitWidth(maxDebitWidth);
    setMaxCreditWidth(maxCreditWidth);
  }, [data, selectedRecord]);

  console.log(maxDebitWidth);

  const Title = () => (
    <View style={styles.titleSection}>
      <View>
        {business?.logoUrl && (
          <View>
            <Image src={business?.logoUrl} style={styles.logoImg} />
          </View>
        )}
        <CustomText style={styles.boldText}>
          {business?.name}
          {"\n"}
        </CustomText>
        <CustomText>
          {business?.country}
          {"\n"}
        </CustomText>
        <CustomText>
          {business?.email}
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
        </CustomText>
        {selectedRecord?.supplier?.name && (
          <>
            <CustomText>Supplier {"\n"}</CustomText>
            <CustomText style={styles.primaryColor}>
              {selectedRecord?.supplier?.name} {"\n"}
              {"\n"}
            </CustomText>{" "}
          </>
        )}
        {selectedRecord?.customer?.name && (
          <>
            <CustomText>Customer {"\n"}</CustomText>
            <CustomText style={styles.primaryColor}>
              {selectedRecord?.customer?.name}
            </CustomText>
          </>
        )}
      </View>
      <CustomText style={styles.alignRight}>
        <CustomText style={styles.header}>JOURNAL{"\n"}</CustomText>
        <CustomText>
          # {selectedRecord?.journalNumber}
          {"\n"}
          {"\n"}
        </CustomText>
      </CustomText>
    </View>
  );

  const Detail = () => (
    <View style={styles.section1}>
      <View style={[styles.alignBottom, { paddingBottom: 10 }]}>
        <CustomText>
          <CustomText>Notes{"\n"}</CustomText>
          <CustomText>{selectedRecord?.notes}</CustomText>
        </CustomText>
      </View>
      <View style={[styles.contentDetails, styles.alignRight]}>
        <View
          style={[
            styles.marginRight28,
            styles.lineHeight2,
            { marginBottom: 10 },
          ]}
        >
          <CustomText style={styles.alignRight}>
            <CustomText>Date :{"\n"}</CustomText>
            {selectedRecord?.referenceNumber && (
              <CustomText>Reference Number :{"\n"}</CustomText>
            )}
          </CustomText>
        </View>
        <View style={styles.lineHeight2}>
          <CustomText style={styles.alignRight}>
            <CustomText>
              {dayjs(selectedRecord?.supplierCreditDate).format(
                REPORT_DATE_FORMAT
              )}
              {"\n"}
            </CustomText>
            {selectedRecord?.referenceNumber && (
              <CustomText>
                {selectedRecord?.referenceNumber}
                {"\n"}
              </CustomText>
            )}
          </CustomText>
        </View>
      </View>
    </View>
  );

  const TableHead = () => (
    <View style={styles.thead} fixed>
      <View style={[styles.headerRow, styles.cell2]}>
        <CustomText>Account</CustomText>
      </View>

      <View
        style={[
          styles.headerRow,
          styles.cell5,
          styles.alignRightFlex,
          { width: maxDebitWidth },
        ]}
      >
        <CustomText>Debit</CustomText>
      </View>
      <View
        style={[
          styles.headerRow,
          styles.cell5,
          styles.alignRightFlex,
          { width: maxCreditWidth },
        ]}
      >
        <CustomText>Credit</CustomText>
      </View>
    </View>
  );

  const TableBody = () => (
    <IntlProvider>
      <View wrap>
        <TableHead />
        {data.map((item, index) => (
          <View wrap={false} key={index} style={styles.bodyRow}>
            <View style={[styles.itemName, {}]}>
              <CustomText>{item.account?.name}</CustomText>
            </View>

            <View
              style={[
                styles.rate,
                styles.alignRightFlex,
                {
                  width: maxDebitWidth,
                },
              ]}
              id="discount"
            >
              <CustomText>
                {item.detailDiscountType === "P" ? (
                  item.detailDiscount + "%"
                ) : (
                  <FormattedNumber
                    value={item.debit}
                    style="decimal"
                    minimumFractionDigits={
                      selectedRecord?.currency?.decimalPlaces
                    }
                  />
                )}
              </CustomText>
            </View>
            <View
              style={[
                styles.rate,
                styles.alignRightFlex,
                {
                  width: maxCreditWidth,
                },
              ]}
              id="discount"
            >
              <CustomText>
                {item.detailDiscountType === "P" ? (
                  item.detailDiscount + "%"
                ) : (
                  <FormattedNumber
                    value={item.credit}
                    style="decimal"
                    minimumFractionDigits={
                      selectedRecord?.currency?.decimalPlaces
                    }
                  />
                )}
              </CustomText>
            </View>
          </View>
        ))}
      </View>
    </IntlProvider>
  );

  const BalanceDetail = () => (
    <View style={[styles.balanceDetails]}>
      <CustomText style={[styles.alignRight, { paddingRight: 11 }]}>
        <CustomText> Sub Total{"\n"}</CustomText>
        {selectedRecord.supplierCreditDiscountAmount > 0 && (
          <CustomText>
            Discount{" "}
            {selectedRecord.supplierCreditDiscountType === "P" &&
              "(" + selectedRecord.supplierCreditDiscount + "%)"}
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.supplierCreditTotalTaxAmount > 0 && (
          <CustomText>
            Tax {selectedRecord.isDetailTaxInclusive && "(Inclusive)"}
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.adjustmentAmount > 0 && (
          <CustomText>Adjustment{"\n"}</CustomText>
        )}
        <CustomText style={styles.boldText}>Total{"\n"}</CustomText>
      </CustomText>
      <CustomText style={styles.alignRight}>
        <CustomText>
          <FormattedNumber
            value={selectedRecord?.supplierCreditSubtotal}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />
          {"\n"}
        </CustomText>
        {selectedRecord.supplierCreditDiscountAmount > 0 && (
          <CustomText>
            -
            <FormattedNumber
              value={selectedRecord?.supplierCreditDiscountAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.supplierCreditTotalTaxAmount > 0 && (
          <CustomText>
            <FormattedNumber
              value={selectedRecord?.supplierCreditTotalTaxAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.adjustmentAmount > 0 && (
          <CustomText>
            <FormattedNumber
              value={selectedRecord.adjustmentAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        <CustomText style={[styles.boldText]}>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={selectedRecord?.supplierCreditTotalAmount}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />
          {"\n"}
        </CustomText>
      </CustomText>
    </View>
  );

  const Note = () => (
    <View style={styles.noteContainer}>
      {selectedRecord?.notes && (
        <>
          <CustomText>Notes{"\n"}</CustomText>
          <CustomText style={styles.notes}>{selectedRecord?.notes}</CustomText>
        </>
      )}
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
    <PDFDocument styles={styles}>
      <Title />
      <Detail />
      <TableBody />
      <PageNumber />
    </PDFDocument>
  );
};

export default JournalPDF;
