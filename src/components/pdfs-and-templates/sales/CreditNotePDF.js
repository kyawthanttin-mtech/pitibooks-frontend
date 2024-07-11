/* eslint-disable react/style-prop-object */
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

const CreditNotePDF = ({ selectedRecord, business }) => {
  const [maxAmountWidth, setMaxAmountWidth] = useState(0);
  const [maxRateWidth, setMaxRateWidth] = useState(0);
  const [maxDiscountWidth, setMaxDiscountWidth] = useState(0);

  const data = useMemo(
    () => (selectedRecord?.details ? selectedRecord.details : []),
    [selectedRecord?.details]
  );

  let hasDetailDiscount = false;
  data.forEach((d) => {
    if (d.detailDiscountAmount > 0) {
      hasDetailDiscount = true;
    }
  });

  useEffect(() => {
    let maxAmountLength = 0;
    let maxRateLength = 0;
    let maxDiscountLength = 0;

    data?.forEach((item) => {
      maxAmountLength = Math.max(
        maxAmountLength,
        item.detailTotalAmount.toString().length > 8
          ? item?.detailTotalAmount.toString().length
          : 8
      );
      maxRateLength = Math.max(
        maxRateLength,
        item.detailUnitRate.toString().length > 7
          ? item?.detailUnitRate.toString().length
          : 7
      );
      maxDiscountLength = Math.max(
        maxDiscountLength,
        item.detailDiscount.toString().length > 8
          ? item?.detailDiscount.toString().length
          : 8
      );
      console.log(maxAmountLength, maxRateLength, maxDiscountLength);
    });
    const extraPixelsForDecimalPlaces =
      selectedRecord?.currency?.decimalPlaces * 6;
    // Calculate the extra pixels for every length of 3
    const extraPixelsForMaxAmount = Math.floor(maxAmountLength / 3) * 2;
    const extraPixelsForMaxRate = Math.floor(maxRateLength / 3) * 2;
    const extraPixelsForMaxDiscount = Math.floor(maxDiscountLength / 3) * 2;

    // Calculate the final widths with the additional pixels
    const maxAmountWidth =
      maxAmountLength * 6 +
      4 +
      extraPixelsForMaxAmount +
      extraPixelsForDecimalPlaces;
    const maxRateWidth =
      maxRateLength * 6 +
      4 +
      extraPixelsForMaxRate +
      extraPixelsForDecimalPlaces;
    const maxDiscountWidth =
      maxDiscountLength * 6 +
      4 +
      extraPixelsForMaxDiscount +
      extraPixelsForDecimalPlaces;

    setMaxAmountWidth(maxAmountWidth);
    setMaxRateWidth(maxRateWidth);
    setMaxDiscountWidth(maxDiscountWidth);
  }, [data, selectedRecord]);

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
      </View>
      <CustomText style={styles.alignRight}>
        <CustomText style={styles.header}>CREDIT NOTES{"\n"}</CustomText>
        <CustomText>
          # {selectedRecord.creditNoteNumber}
          {"\n"}
          {"\n"}
        </CustomText>
        {/* <CustomText style={[styles.subHeader1, styles.boldText]}>
          Available Credits {"\n"}
        </CustomText>
        <CustomText style={[styles.subHeader2, styles.boldText]}>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={selectedRecord.customer?.unusedCreditAmount}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />
          {"\n"}
          {"\n"}
        </CustomText> */}
        <CustomText style={[styles.subHeader1, styles.boldText]}>
          Remaining Balance {"\n"}
        </CustomText>
        <CustomText style={[styles.subHeader2, styles.boldText]}>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={selectedRecord?.remainingBalance}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />
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
          <CustomText>Customer:{"\n"}</CustomText>
          <CustomText style={styles.primaryColor}>
            {selectedRecord?.customer?.name}
          </CustomText>
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
              {dayjs(selectedRecord?.creditNoteDate).format(REPORT_DATE_FORMAT)}
              {"\n"}
            </CustomText>
            {selectedRecord?.referenceNumber && (
              <CustomText>
                {selectedRecord.referenceNumber}
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
      <View style={[styles.headerRow, styles.cell1]}>
        <CustomText style={styles.alignCenter}>#</CustomText>
      </View>
      <View style={[styles.headerRow, styles.cell2]}>
        <CustomText>Products & Descriptions</CustomText>
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
      {hasDetailDiscount && (
        <View
          style={[
            styles.headerRow,
            styles.cell4,
            styles.alignRightFlex,
            { width: maxDiscountWidth },
          ]}
        >
          <CustomText>Discount</CustomText>
        </View>
      )}

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
    <IntlProvider>
      <View wrap>
        <TableHead />
        {data.map((item, index) => (
          <View wrap={false} key={index} style={styles.bodyRow}>
            <View style={[styles.number, {}]}>
              <CustomText>{index + 1}</CustomText>
            </View>
            <View style={[styles.itemName, {}]}>
              <CustomText>{item.name}</CustomText>
            </View>
            <View style={[styles.qty, {}]}>
              <CustomText style={styles.alignRight}>
                {item.detailQty}
              </CustomText>
            </View>
            <View
              style={[
                styles.rate,
                styles.alignRightFlex,

                {
                  width: maxRateWidth,
                },
              ]}
              id="rate"
            >
              <CustomText style={styles.wordBreak}>
                <FormattedNumber
                  value={item.detailUnitRate}
                  style="decimal"
                  minimumFractionDigits={
                    selectedRecord?.currency?.decimalPlaces
                  }
                />
              </CustomText>
            </View>
            {hasDetailDiscount && (
              <View
                style={[
                  styles.rate,
                  styles.alignRightFlex,
                  {
                    width: maxDiscountWidth,
                  },
                ]}
                id="discount"
              >
                <CustomText>
                  {item.detailDiscountType === "P" ? (
                    item.detailDiscount + "%"
                  ) : (
                    <FormattedNumber
                      value={item.detailDiscountAmount}
                      style="decimal"
                      minimumFractionDigits={
                        selectedRecord.currency.decimalPlaces
                      }
                    />
                  )}
                </CustomText>
              </View>
            )}
            <View
              style={[
                styles.amount,
                styles.alignRightFlex,
                styles.wordBreak,
                {
                  width: maxAmountWidth,
                  // maxWidth: 69,
                  // wordBreak: "break-all",
                  // wordWrap: "break-word",
                },
              ]}
              id="amount"
            >
              <CustomText
                style={[
                  {
                    maxWidth: 69,
                    overflowWrap: "break-word",
                    wordBreak: "break-all",
                    wordWrap: "break-word",
                  },
                  styles.alignRight,
                ]}
              >
                <FormattedNumber
                  value={item.detailTotalAmount}
                  style="decimal"
                  minimumFractionDigits={
                    selectedRecord?.currency?.decimalPlaces
                  }
                />
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
        {selectedRecord.creditNoteDiscountAmount > 0 && (
          <CustomText>
            Discount{" "}
            {selectedRecord.creditNoteDiscountType === "P" &&
              "(" + selectedRecord.creditNoteDiscount + "%)"}
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.creditNoteTotalTaxAmount > 0 && (
          <CustomText>
            Tax {selectedRecord.isDetailTaxInclusive && "(Inclusive)"}
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.adjustmentAmount > 0 && (
          <CustomText>Adjustment{"\n"}</CustomText>
        )}
        <CustomText style={styles.boldText}>Total{"\n"}</CustomText>
        {selectedRecord.creditNoteTotalUsedAmount > 0 && (
          <CustomText style={[styles.boldText, styles.red]}>
            Used{"\n"}
          </CustomText>
        )}
        {selectedRecord.creditNoteTotalRefundAmount > 0 && (
          <CustomText style={[styles.boldText, styles.red]}>
            Refund{"\n"}
          </CustomText>
        )}
        <CustomText style={[styles.boldText]}>Remaining{"\n"}</CustomText>
      </CustomText>
      <CustomText style={styles.alignRight}>
        <CustomText>
          <FormattedNumber
            value={selectedRecord?.creditNoteSubtotal}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency.decimalPlaces}
          />
          {"\n"}
        </CustomText>
        {selectedRecord.creditNoteDiscountAmount > 0 && (
          <CustomText>
            -
            <FormattedNumber
              value={selectedRecord?.creditNoteDiscountAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.creditNoteTotalTaxAmount > 0 && (
          <CustomText>
            <FormattedNumber
              value={selectedRecord?.creditNoteTotalTaxAmount}
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
              minimumFractionDigits={selectedRecord.currency.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        <CustomText style={[styles.boldText]}>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={selectedRecord?.creditNoteTotalAmount}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />
          {"\n"}
        </CustomText>
        {selectedRecord.creditNoteTotalUsedAmount > 0 && (
          <CustomText style={[styles.boldText, styles.red]}>
            {"(-) "}
            <FormattedNumber
              value={selectedRecord?.creditNoteTotalUsedAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.creditNoteTotalRefundAmount > 0 && (
          <CustomText style={[styles.boldText, styles.red]}>
            {"(-) "}
            <FormattedNumber
              value={selectedRecord?.creditNoteTotalRefundAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        <CustomText style={[styles.boldText]}>
          {selectedRecord?.currency.symbol}{" "}
          <FormattedNumber
            value={selectedRecord?.remainingBalance}
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
      <BalanceDetail />
      <Note />
      <PageNumber />
    </PDFDocument>
  );
};

export default CreditNotePDF;
