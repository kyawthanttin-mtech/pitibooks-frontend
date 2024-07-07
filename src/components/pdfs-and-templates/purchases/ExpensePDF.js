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

const ExpensePDF = ({ selectedRecord, business }) => {
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
    let maxDiscountLength = 0;

    data?.forEach((item) => {
      maxDiscountLength = Math.max(maxDiscountLength, 14);
    });

    // Calculate the final widths with the additional pixels
    const maxDiscountWidth = maxDiscountLength * 6 + 4;
    setMaxDiscountWidth(maxDiscountWidth);
  }, [data, selectedRecord]);

  console.log(maxDiscountWidth);

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
        <CustomText style={styles.header}>
          INVENTORY{"\n"}ADJUSTMENTS{"\n"}
        </CustomText>
      </CustomText>
    </View>
  );

  const Detail = () => (
    <View style={styles.section1}>
      <View style={[styles.alignBottom, { paddingBottom: 10 }]}>
        {/* <CustomText>
          <CustomText>Supplier:{"\n"}</CustomText>
          <CustomText style={styles.primaryColor}>
            {selectedRecord?.supplierName}
          </CustomText>
        </CustomText> */}
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
            <CustomText>Reason :{"\n"}</CustomText>
            <CustomText>Account :{"\n"}</CustomText>
            <CustomText>Adjustment Type :{"\n"}</CustomText>
            <CustomText>Branch Name :{"\n"}</CustomText>
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
            <CustomText>
              {selectedRecord?.reason}
              {"\n"}
            </CustomText>
            <CustomText>
              {selectedRecord?.account?.name}
              {"\n"}
            </CustomText>
            <CustomText>
              {selectedRecord?.adjustmentType}
              {"\n"}
            </CustomText>
            <CustomText>
              {selectedRecord?.branch?.name}
              {"\n"}
            </CustomText>
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

      <View
        style={[
          styles.headerRow,
          styles.cell5,
          styles.alignRightFlex,
          { width: maxDiscountWidth },
        ]}
      >
        <CustomText>Adjusted Value</CustomText>
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
                    value={item.adjustedValue}
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
      <View>
        <CustomText style={styles.subHeader1}>
          Branch: <CustomText>{selectedRecord?.branch?.name}</CustomText>
          {"\n"}
        </CustomText>
        <CustomText style={[{ fontSize: "14px" }, styles.boldText]}>
          Expense Details
        </CustomText>
      </View>
      <View
        style={{
          borderBottom: "0.3px solid #333333",
          width: "100%",
          marginTop: "16px",
          marginBottom: "28px",
        }}
      ></View>
      <View>
        <CustomText>Expense Amount</CustomText>
        <CustomText style={{ fontSize: "14px", color: "red" }}>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={selectedRecord?.totalAmount}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />{" "}
          <CustomText style={{ fontSize: "9px", color: "black" }}>
            on {dayjs(selectedRecord?.expenseDate).format(REPORT_DATE_FORMAT)}
          </CustomText>
          {"\n"}
          {"\n"}
        </CustomText>
      </View>
      <View>
        <CustomText>Expense Account</CustomText>
        <CustomText style={{ fontSize: "20px" }}>
          {selectedRecord?.expenseAccount?.name}
          {"\n"}
          {"\n"}
        </CustomText>
      </View>
      <View>
        <View style={{ marginBottom: "24px" }}>
          <CustomText>Paid Through</CustomText>
          <CustomText>
            {selectedRecord?.assetAccount?.name}
            {"\n"}
          </CustomText>
        </View>
        {selectedRecord?.referenceNumber && (
          <View style={{ marginBottom: "24px" }}>
            <CustomText>Reference Number</CustomText>
            <CustomText>
              {selectedRecord?.referenceNumber}
              {"\n"}
            </CustomText>
          </View>
        )}
        {selectedRecord?.expenseTax && (
          <>
            <View style={{ marginBottom: "24px" }}>
              <CustomText>Tax</CustomText>
              <CustomText>
                {selectedRecord.expenseTax.name} (
                {selectedRecord.expenseTax.rate}
                %){"\n"}
              </CustomText>
            </View>
            <View style={{ marginBottom: "24px" }}>
              <CustomText>Tax Amount</CustomText>
              <CustomText>
                {selectedRecord.currency.symbol}{" "}
                <FormattedNumber
                  value={selectedRecord.taxAmount}
                  style="decimal"
                  minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                />{" "}
                ({selectedRecord.isTaxInclusive ? "Inclusive" : "Exclusive"})
                {"\n"}
              </CustomText>
            </View>
          </>
        )}
        <View style={{ marginBottom: "24px" }}>
          <CustomText>Supplier</CustomText>
          <CustomText>
            {selectedRecord?.supplier?.name}
            {"\n"}
          </CustomText>
        </View>
        <View style={{ marginBottom: "24px" }}>
          <CustomText>Customer</CustomText>
          <CustomText>
            {selectedRecord?.customer?.name}
            {"\n"}
          </CustomText>
        </View>
      </View>
      <PageNumber />
    </PDFDocument>
  );
};

export default ExpensePDF;
