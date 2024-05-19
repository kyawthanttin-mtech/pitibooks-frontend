/* eslint-disable react/style-prop-object */
import React from "react";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { Divider, Space, Flex } from "antd";
import { useOutletContext } from "react-router-dom";
import { FormattedNumber } from "react-intl";

const BillTemplate = ({ selectedRecord }) => {
  const { business } = useOutletContext();
  const details = selectedRecord?.details ? selectedRecord?.details : [];
  let hasDetailDiscount = false;
  details.forEach((d) => {
    if (d.detailDiscountAmount > 0) {
      hasDetailDiscount = true;
    }
  });
  return (
    <div className="details-page">
      <div className="details-container">
        {/* <div className="ribbon text-ellipsis">
          <div
            className={`ribbon-inner ${
              selectedRecord.status === "CLOSED"
                ? "ribbon-success"
                : "ribbon-overdue"
            }`}
          >
            {selectedRecord.status}
          </div>
        </div> */}
        <div className="template">
          <div className="template-header header-content"></div>
          <div className="template-body">
            <table className="title-section" id="title-table">
              <tbody style={{ lineHeight: "1.5rem" }}>
                <tr>
                  <td>
                    <span
                      style={{
                        fontSize: "var(--detail-text)",
                        marginBottom: "4px",
                      }}
                    >
                      <b>{business.name}</b>
                    </span>
                    <br />
                    <span>{business.country}</span>
                    <br />
                    <span>{business.email}</span>
                    <br />
                    {/* <br />
                    <span>Supplier:</span>
                    <br />
                    <span style={{ color: "var(--primary-color)" }}>
                      {selectedRecord.supplier.name}
                    </span> */}
                  </td>
                  <td className="text-align-right">
                    <span style={{ fontSize: "2.2rem" }}>BILL</span>
                    <br />
                    <span># {selectedRecord.billNumber}</span>
                    <div style={{ clear: "both", marginTop: "20px" }}>
                      <span style={{ fontSize: "0.8rem" }}>
                        <b>Remaining Balance</b>
                      </span>
                      <br />
                      <span style={{ fontSize: "1.1rem" }}>
                        <b>
                          {selectedRecord.currency.symbol}{" "}
                          <FormattedNumber
                            value={
                              selectedRecord.billTotalAmount -
                              selectedRecord.billTotalPaidAmount
                            }
                            style="decimal"
                            minimumFractionDigits={
                              selectedRecord.currency.decimalPlaces
                            }
                          />
                        </b>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="invoice-details" id="invoice-table">
              <tbody style={{ lineHeight: "1.5rem" }}>
                <tr>
                  <td
                    style={{
                      width: "60%",
                      verticalAlign: "bottom",
                      wordWrap: "break-word",
                    }}
                  >
                    <div>
                      <label>Bill From</label>
                      <br />
                      <span>
                        <span style={{ color: "var(--primary-color)" }}>
                          {selectedRecord.supplier.name}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td
                    align="right"
                    style={{
                      verticalAlign: "bottom",
                      width: "40%",
                    }}
                  >
                    <table
                      style={{
                        float: "right",
                        width: "100%",
                        tableLayout: "fixed",
                        wordWrap: "break-word",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Bill Date :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>
                              {dayjs(selectedRecord.billDate).format(
                                REPORT_DATE_FORMAT
                              )}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Due Date :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>
                              {dayjs(selectedRecord.billDueDate).format(
                                REPORT_DATE_FORMAT
                              )}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Payment Terms :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>
                              {selectedRecord.billPaymentTerms
                                .split(/(?=[A-Z])/)
                                .join(" ")}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              id="main-table"
              className="main-table"
              border="0"
              cellPadding="0"
              cellSpacing="0"
              style={{
                width: "100%",
                marginTop: "20px",
                tableLayout: "fixed",
              }}
            >
              <thead style={{ verticalAlign: "middle" }}>
                <tr
                  style={{
                    height: "32px",
                    background: "#3C3D3A",
                    color: "white",
                  }}
                >
                  <td
                    style={{
                      padding: "5px 0 5px 5px",
                      width: "5%",
                      textAlign: "center",
                      height: "2.5rem",
                    }}
                  >
                    #
                  </td>
                  <td
                    style={{
                      padding: "5px 10px 5px 20px",
                      textAlign: "left",
                    }}
                  >
                    Product & Description
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                      width: "11%",
                    }}
                  >
                    Qty
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                      width: "12%",
                    }}
                  >
                    Rate
                  </td>
                  {hasDetailDiscount && (
                    <td
                      className="text-align-right"
                      style={{
                        padding: "5px 10px 5px 5px",
                        width: "12%",
                      }}
                    >
                      Discount
                    </td>
                  )}
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                      width: "12%",
                    }}
                  >
                    Amount
                  </td>
                </tr>
              </thead>
              <tbody
                style={{
                  verticalAlign: "middle",
                  border: "1px solid red",
                }}
              >
                {details.map((detail, index) => (
                  <tr
                    key={index}
                    style={{
                      pageBreakAfter: "auto",
                      pageBreakInside: "avoid",
                      display: "table-row",
                      verticalAlign: "top",
                    }}
                  >
                    <td
                      rowSpan="1"
                      valign="top"
                      style={{
                        wordBreak: "break-word",
                        padding: "10px 0 10px 20px",
                      }}
                    >
                      <span>{index + 1}</span>
                    </td>
                    <td
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{detail.name}</span>
                    </td>
                    <td
                      rowSpan="1"
                      className="text-align-right"
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{detail.detailQty}</span>
                    </td>
                    <td
                      className="text-align-right"
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>
                        <FormattedNumber
                          value={detail.detailUnitRate}
                          style="decimal"
                          minimumFractionDigits={
                            selectedRecord.currency.decimalPlaces
                          }
                        />
                      </span>
                    </td>
                    {hasDetailDiscount && (
                      <td
                        rowSpan="1"
                        className="text-align-right"
                        style={{
                          padding: "10px 10px 5px 10px",
                          verticalAlign: "top",
                          wordWrap: "break-word",
                        }}
                      >
                        <span>
                          {detail.detailDiscountType === "P" ? (
                            detail.detailDiscount + "%"
                          ) : (
                            <FormattedNumber
                              value={detail.detailDiscountAmount}
                              style="decimal"
                              minimumFractionDigits={
                                selectedRecord.currency.decimalPlaces
                              }
                            />
                          )}
                        </span>
                      </td>
                    )}
                    <td
                      className="text-align-right"
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 10px 5px",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>
                        <FormattedNumber
                          value={detail.detailTotalAmount}
                          style="decimal"
                          minimumFractionDigits={
                            selectedRecord.currency.decimalPlaces
                          }
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ width: "100%", marginTop: "2px" }}>
              <div>
                <div></div>
              </div>
              <div style={{ width: "50%", float: "right" }}>
                <table
                  cellSpacing="0"
                  border="0"
                  width="100%"
                  id="balance-table"
                >
                  <tbody>
                    <tr className="text-align-right">
                      <td
                        style={{
                          padding: "5px 10px 5px 0",
                          verticalAlign: "middle",
                        }}
                      >
                        Sub Total
                      </td>
                      <td
                        style={{
                          width: "120px",
                          verticalAlign: "middle",
                          padding: "10px 10px 10px 5px",
                        }}
                      >
                        <span>
                          <FormattedNumber
                            value={selectedRecord.billSubtotal}
                            style="decimal"
                            minimumFractionDigits={
                              selectedRecord.currency.decimalPlaces
                            }
                          />
                        </span>
                      </td>
                    </tr>
                    {selectedRecord.orderDiscountAmount > 0 && (
                      <tr className="text-align-right">
                        <td
                          style={{
                            padding: "5px 10px 5px 0",
                            verticalAlign: "middle",
                          }}
                        >
                          Discount{" "}
                          {selectedRecord.orderDiscountType === "P" &&
                            "(" + selectedRecord.orderDiscount + "%)"}
                        </td>
                        <td
                          style={{
                            width: "120px",
                            verticalAlign: "middle",
                            padding: "10px 10px 10px 5px",
                          }}
                        >
                          <span>
                            -
                            <FormattedNumber
                              value={selectedRecord.orderDiscountAmount}
                              style="decimal"
                              minimumFractionDigits={
                                selectedRecord.currency.decimalPlaces
                              }
                            />
                          </span>
                        </td>
                      </tr>
                    )}
                    {selectedRecord.orderTotalTaxAmount > 0 && (
                      <tr className="text-align-right">
                        <td
                          style={{
                            padding: "5px 10px 5px 0",
                            verticalAlign: "middle",
                          }}
                        >
                          Tax{" "}
                          {selectedRecord.isDetailTaxInclusive && "(Inclusive)"}
                        </td>
                        <td
                          style={{
                            width: "120px",
                            verticalAlign: "middle",
                            padding: "10px 10px 10px 5px",
                          }}
                        >
                          <span>
                            <FormattedNumber
                              value={selectedRecord.orderTotalTaxAmount}
                              style="decimal"
                              minimumFractionDigits={
                                selectedRecord.currency.decimalPlaces
                              }
                            />
                          </span>
                        </td>
                      </tr>
                    )}
                    {selectedRecord.adjustmentAmount > 0 && (
                      <tr className="text-align-right">
                        <td
                          style={{
                            padding: "5px 10px 5px 0",
                            verticalAlign: "middle",
                          }}
                        >
                          Adjustment
                        </td>
                        <td
                          style={{
                            width: "120px",
                            verticalAlign: "middle",
                            padding: "10px 10px 10px 5px",
                          }}
                        >
                          <span>
                            <FormattedNumber
                              value={selectedRecord.adjustmentAmount}
                              style="decimal"
                              minimumFractionDigits={
                                selectedRecord.currency.decimalPlaces
                              }
                            />
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="text-align-right">
                      <td
                        style={{
                          padding: "5px 10px 5px 0",
                          verticalAlign: "middle",
                        }}
                      >
                        <b>Total</b>
                      </td>
                      <td
                        style={{
                          width: "120px",
                          verticalAlign: "middle",
                          padding: "10px 10px 10px 5px",
                        }}
                      >
                        <b>
                          {selectedRecord.currency.symbol}{" "}
                          <FormattedNumber
                            value={selectedRecord.billTotalAmount}
                            style="decimal"
                            minimumFractionDigits={
                              selectedRecord.currency.decimalPlaces
                            }
                          />
                        </b>
                      </td>
                    </tr>
                    <tr className="text-align-right">
                      <td
                        style={{
                          padding: "5px 10px 5px 0",
                          verticalAlign: "middle",
                        }}
                      >
                        <b>Remaining</b>
                      </td>
                      <td
                        style={{
                          width: "120px",
                          verticalAlign: "middle",
                          padding: "10px 10px 10px 5px",
                        }}
                      >
                        <b>
                          {selectedRecord.currency.symbol}{" "}
                          <FormattedNumber
                            value={
                              selectedRecord.billTotalAmount -
                              selectedRecord.billTotalPaidAmount
                            }
                            style="decimal"
                            minimumFractionDigits={
                              selectedRecord.currency.decimalPlaces
                            }
                          />
                        </b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* <Divider />
            <Flex justify="end"></Flex>
            <Space>
              <span>Payment Terms :</span>
              <span>
                {selectedRecord.supplier?.supplierPaymentTerms
                  .split(/(?=[A-Z])/)
                  .join(" ") === "Custom"
                  ? `${selectedRecord.billPaymentTerms} (Due in ${selectedRecord.supplier?.supplierPaymentTermsCustomDays}day(s))`
                  : selectedRecord.supplier?.supplierPaymentTerms
                      .split(/(?=[A-Z])/)
                      .join(" ")}
              </span>
            </Space> */}
          </div>

          <div style={{ clear: "both" }}></div>
          <div
            className="template-footer"
            style={{
              height: "0.7in",
              fontSize: "6pt",
              color: "#aaaaaa",
              padding: "0 0.4in 0 0.5in",
              backgroundColor: "#ffffff",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BillTemplate;
