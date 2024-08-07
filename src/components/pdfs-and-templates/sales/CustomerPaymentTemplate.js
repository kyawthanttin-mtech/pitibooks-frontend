/* eslint-disable react/style-prop-object */
import React from "react";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { Divider } from "antd";
import { useOutletContext } from "react-router-dom";
import { FormattedNumber } from "react-intl";

const CustomerPaymentTemplate = ({ selectedRecord }) => {
  const { business } = useOutletContext();
  const details = selectedRecord?.paidInvoices
    ? selectedRecord?.paidInvoices
    : [];
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
                    {business?.logoUrl && (
                      <div>
                        <img
                          className="business-logo"
                          src={business?.logoUrl}
                          alt="Logo"
                        />
                      </div>
                    )}
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
                    <span style={{ fontSize: "2.2rem" }}>
                      PAYMENTS RECEIVED
                    </span>
                    <br />
                    <span># {selectedRecord.paymentNumber}</span>
                    <div style={{ clear: "both", marginTop: "20px" }}>
                      <span style={{ fontSize: "1rem" }}>
                        <b>Amount Received</b>
                      </span>
                      <br />
                      <span style={{ fontSize: "1.1rem" }}>
                        <b>
                          {selectedRecord.currency.symbol}{" "}
                          <FormattedNumber
                            value={
                              selectedRecord.amount + selectedRecord.bankCharges
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
                      <label>Paid By:</label>
                      <br />
                      <span>
                        <span style={{ color: "var(--primary-color)" }}>
                          {selectedRecord.customer?.name}
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
                              {dayjs(selectedRecord.paymentDate).format(
                                REPORT_DATE_FORMAT
                              )}
                            </span>
                          </td>
                        </tr>
                        {selectedRecord.paymentMode?.name && (
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
                              <span>{selectedRecord.paymentMode?.name}</span>
                            </td>
                          </tr>
                        )}

                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Bank Charges :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>
                              {selectedRecord.currency.symbol}{" "}
                              <FormattedNumber
                                value={selectedRecord.bankCharges}
                                style="decimal"
                                minimumFractionDigits={
                                  selectedRecord.currency.decimalPlaces
                                }
                              />
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
                            <span>Deposit To :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.depositAccount?.name}</span>
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
                    Invoice Number
                  </td>
                  <td
                    style={{
                      padding: "5px 10px 5px 5px",
                      textAlign: "left",
                    }}
                  >
                    Invoice Date
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                    }}
                  >
                    Invoice Amount
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                    }}
                  >
                    Payment Received
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
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{detail.invoice?.invoiceNumber}</span>
                    </td>
                    <td
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>
                        {dayjs(detail.invoice?.invoiceDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </span>
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
                          value={detail.invoice?.invoiceTotalAmount}
                          style="decimal"
                          minimumFractionDigits={
                            selectedRecord.currency.decimalPlaces
                          }
                        />
                      </span>
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
                          value={detail.paidAmount}
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
          </div>

          <div style={{ clear: "both" }}></div>
          <div style={{ clear: "both" }}></div>
          <br />
          {selectedRecord?.notes && (
            <div
              style={{
                clear: "both",
                paddingLeft: "3.3rem",
                width: "100%",
              }}
            >
              <label>Notes</label>
              <br />
              <p
                style={{
                  marginTop: "7px",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  fontSize: "0.8rem",
                }}
              >
                {selectedRecord?.notes}
              </p>
            </div>
          )}
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

export default CustomerPaymentTemplate;
