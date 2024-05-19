/* eslint-disable react/style-prop-object */
import React from "react";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { Divider, Space, Flex } from "antd";
import { useOutletContext } from "react-router-dom";
import { FormattedNumber } from "react-intl";

const PaymentMadeTemplate = ({ selectedRecord }) => {
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
                    {/* <br />
                    <br />
                    <span>Supplier:</span>
                    <br />
                    <span style={{ color: "var(--primary-color)" }}>
                      {selectedRecord.supplier.name}
                    </span> */}
                  </td>
                  <td className="text-align-right">
                    <span style={{ fontSize: "2.2rem" }}>PAYMENTS MADE</span>
                    <br />
                    <span># {selectedRecord.orderNumber}</span>
                    <div style={{ clear: "both", marginTop: "20px" }}>
                      <span style={{ fontSize: "1rem" }}>
                        <b>Amount Paid</b>
                      </span>
                      <br />
                      <span style={{ fontSize: "1.1rem" }}>
                        <b>MMK Placeholder</b>
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
                      <label>Paid To:</label>
                      <br />
                      <span>
                        <span style={{ color: "var(--primary-color)" }}>
                          {selectedRecord.deliveryAddress}
                        </span>
                      </span>
                      {/* <br />
                      <span>
                        <span>{selectedRecord.supplier?.address}</span>
                      </span> */}
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
                            <span>Payment Date :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>
                              {dayjs(selectedRecord.orderDate).format(
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
                            <span>Reference Number :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.referenceNumber}</span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Payment Mode :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.referenceNumber}</span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Paid Through :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.referenceNumber}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <Divider />
            <p style={{ fontSize: "1.1rem" }}>Payment For</p>
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
                      padding: "5px 0 5px 10px",
                      textAlign: "left",
                      height: "2.5rem",
                    }}
                  >
                    Bill Number
                  </td>
                  <td
                    style={{
                      padding: "5px 10px 5px 5px",
                      textAlign: "left",
                    }}
                  >
                    Bill Date
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                    }}
                  >
                    Bill Amount
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                    }}
                  >
                    Payment Amount
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
                  </tr>
                ))}
              </tbody>
            </table>
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

export default PaymentMadeTemplate;
