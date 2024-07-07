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

const PaymentMadePDF = ({ selectedRecord, business }) => {
  const [maxAmountWidth, setMaxAmountWidth] = useState(0);
  const [maxRateWidth, setMaxRateWidth] = useState(0);
  const [maxDiscountWidth, setMaxDiscountWidth] = useState(0);

  const data = selectedRecord?.paidBills ? selectedRecord?.paidBills : [];

  //   let hasDetailDiscount = false;
  //   data.forEach((d) => {
  //     if (d.detailDiscountAmount > 0) {
  //       hasDetailDiscount = true;
  //     }
  //   });

  //   useEffect(() => {
  //     let maxAmountLength = 0;
  //     let maxRateLength = 0;
  //     let maxDiscountLength = 0;

  //     data?.forEach((item) => {
  //       maxAmountLength = Math.max(
  //         maxAmountLength,
  //         item.detailTotalAmount.toString().length > 8
  //           ? item?.detailTotalAmount.toString().length
  //           : 8
  //       );
  //       maxRateLength = Math.max(
  //         maxRateLength,
  //         item.detailUnitRate.toString().length > 7
  //           ? item?.detailUnitRate.toString().length
  //           : 7
  //       );
  //       maxDiscountLength = Math.max(
  //         maxDiscountLength,
  //         item.detailDiscount.toString().length > 8
  //           ? item?.detailDiscount.toString().length
  //           : 8
  //       );
  //       console.log(maxAmountLength, maxRateLength, maxDiscountLength);
  //     });
  //     const extraPixelsForDecimalPlaces =
  //       selectedRecord?.currency?.decimalPlaces * 6;
  //     // Calculate the extra pixels for every length of 3
  //     const extraPixelsForMaxAmount = Math.floor(maxAmountLength / 3) * 2;
  //     const extraPixelsForMaxRate = Math.floor(maxRateLength / 3) * 2;
  //     const extraPixelsForMaxDiscount = Math.floor(maxDiscountLength / 3) * 2;

  //     // Calculate the final widths with the additional pixels
  //     const maxAmountWidth =
  //       maxAmountLength * 6 +
  //       4 +
  //       extraPixelsForMaxAmount +
  //       extraPixelsForDecimalPlaces;
  //     const maxRateWidth =
  //       maxRateLength * 6 +
  //       4 +
  //       extraPixelsForMaxRate +
  //       extraPixelsForDecimalPlaces;
  //     const maxDiscountWidth =
  //       maxDiscountLength * 6 +
  //       4 +
  //       extraPixelsForMaxDiscount +
  //       extraPixelsForDecimalPlaces;

  //     setMaxAmountWidth(maxAmountWidth);
  //     setMaxRateWidth(maxRateWidth);
  //     setMaxDiscountWidth(maxDiscountWidth);
  //   }, [data, selectedRecord]);

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
        <CustomText style={styles.header}>PAYMENTS MADE{"\n"}</CustomText>
        <CustomText>
          # {selectedRecord.paymentNumber}
          {"\n"}
          {"\n"}
        </CustomText>
        <CustomText style={[styles.subHeader1, styles.boldText]}>
          Amount Paid {"\n"}
        </CustomText>
        <CustomText style={[styles.subHeader2, styles.boldText]}>
          {selectedRecord.currency.symbol}{" "}
          <FormattedNumber
            value={selectedRecord.amount + selectedRecord.bankCharges}
            style="decimal"
            minimumFractionDigits={selectedRecord.currency.decimalPlaces}
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
          <CustomText>Paid To{"\n"}</CustomText>
          <CustomText style={styles.primaryColor}>
            {selectedRecord?.supplier?.name}
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
            <CustomText>Payment Date :{"\n"}</CustomText>
            {selectedRecord?.referenceNumber && (
              <CustomText>Reference Number :{"\n"}</CustomText>
            )}
            {selectedRecord?.paymentMode?.name && (
              <CustomText>Payment Mode :{"\n"}</CustomText>
            )}
            <CustomText>Bank Charges :{"\n"}</CustomText>
            {selectedRecord?.withdrawAccount?.name && (
              <CustomText>Paid Through :{"\n"}</CustomText>
            )}
          </CustomText>
        </View>
        <View style={styles.lineHeight2}>
          <CustomText style={styles.alignRight}>
            <CustomText>
              {dayjs(selectedRecord?.supplierPaymentDate).format(
                REPORT_DATE_FORMAT
              )}
              {"\n"}
            </CustomText>
            {selectedRecord?.referenceNumber && (
              <CustomText>
                {selectedRecord.referenceNumber}
                {"\n"}
              </CustomText>
            )}
            {selectedRecord?.paymentMode?.name && (
              <CustomText>
                {selectedRecord?.paymentMode?.name}
                {"\n"}
              </CustomText>
            )}
            <CustomText>
              {selectedRecord.currency.symbol}{" "}
              <FormattedNumber
                value={selectedRecord.bankCharges}
                style="decimal"
                minimumFractionDigits={selectedRecord.currency.decimalPlaces}
              />
              {"\n"}
            </CustomText>
            {selectedRecord?.withdrawAccount?.name && (
              <CustomText>
                {selectedRecord?.withdrawAccount?.name}
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
      <View style={[styles.headerRow, { flex: 1, paddingLeft: 10 }]}>
        <CustomText style={styles.alignLeft}>Bill Number</CustomText>
      </View>
      <View style={[styles.headerRow, { flex: 1, paddingLeft: 10 }]}>
        <CustomText>Bill Date</CustomText>
      </View>
      <View style={[styles.headerRow, { flex: 1, paddingRight: 10 }]}>
        <CustomText style={styles.alignRight}>Bill Amount</CustomText>
      </View>
      <View
        style={[
          styles.headerRow,

          styles.alignRight,
          { flex: 1, paddingRight: 10 },
        ]}
      >
        <CustomText>Payment Amount</CustomText>
      </View>
    </View>
  );

  const TableBody = () => (
    <IntlProvider>
      <View>
        <CustomText style={{ fontSize: 13, marginBottom: "17.6px" }}>
          Payment For
        </CustomText>
      </View>
      <View wrap>
        <TableHead />
        {data.map((item, index) => (
          <View wrap={false} key={index} style={styles.bodyRow}>
            <View style={[{ flex: 1, padding: 10 }]}>
              <CustomText style={styles.alignLeft}>
                {item.bill?.billNumber}
              </CustomText>
            </View>
            <View style={[{ flex: 1, padding: 10 }]}>
              <CustomText>
                {dayjs(item.bill?.billDate).format(REPORT_DATE_FORMAT)}
              </CustomText>
            </View>
            <View style={[{ flex: 1, padding: 10 }]}>
              <CustomText style={styles.alignRight}>
                <FormattedNumber
                  value={item.bill?.billTotalAmount}
                  style="decimal"
                  minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                />
              </CustomText>
            </View>
            <View style={[styles.alignRight, { flex: 1, padding: 10 }]}>
              <CustomText>
                <FormattedNumber
                  value={item.paidAmount}
                  style="decimal"
                  minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                />
              </CustomText>
            </View>
          </View>
        ))}
      </View>
    </IntlProvider>
  );

  const Divider = () => (
    <View
      style={{
        width: "100%",
        borderTop: "1px solid #ebeaf2",
        margin: "24px 0",
      }}
    ></View>
  );

  const BalanceDetail = () => (
    <View style={[styles.balanceDetails]}>
      <CustomText style={[styles.alignRight, { paddingRight: 11 }]}>
        <CustomText> Sub Total{"\n"}</CustomText>
        {selectedRecord.supplierPaymentDiscountAmount > 0 && (
          <CustomText>
            Discount{" "}
            {selectedRecord.supplierPaymentDiscountType === "P" &&
              "(" + selectedRecord.supplierPaymentDiscount + "%)"}
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.supplierPaymentTotalTaxAmount > 0 && (
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
            value={selectedRecord?.supplierPaymentSubtotal}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency.decimalPlaces}
          />
          {"\n"}
        </CustomText>
        {selectedRecord.supplierPaymentDiscountAmount > 0 && (
          <CustomText>
            -
            <FormattedNumber
              value={selectedRecord?.supplierPaymentDiscountAmount}
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency.decimalPlaces}
            />
            {"\n"}
          </CustomText>
        )}
        {selectedRecord.supplierPaymentTotalTaxAmount > 0 && (
          <CustomText>
            <FormattedNumber
              value={selectedRecord?.supplierPaymentTotalTaxAmount}
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
            value={selectedRecord?.supplierPaymentTotalAmount}
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
      <Divider />

      <TableBody />

      {/* <BalanceDetail /> */}
      <Note />
      <PageNumber />
    </PDFDocument>
  );
};

export default PaymentMadePDF;
