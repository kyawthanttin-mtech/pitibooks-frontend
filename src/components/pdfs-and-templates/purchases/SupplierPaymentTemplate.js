/* eslint-disable react/style-prop-object */
import React from "react";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { Divider } from "antd";
import { useOutletContext } from "react-router-dom";
import { FormattedNumber } from "react-intl";

const SupplierPaymentTemplate = ({ selectedRecord }) => {
  const { business } = useOutletContext();
  const details = selectedRecord?.paidBills ? selectedRecord?.paidBills : [];
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
                    <span># {selectedRecord.paymentNumber}</span>
                    <div style={{ clear: "both", marginTop: "20px" }}>
                      <span style={{ fontSize: "1rem" }}>
                        <b>Amount Paid</b>
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
                      <label>Paid To:</label>
                      <br />
                      <span>
                        <span style={{ color: "var(--primary-color)" }}>
                          {selectedRecord.supplier.name}
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
                            <span>{selectedRecord.paymentMode?.name}</span>
                          </td>
                        </tr>
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
                            <span>Paid Through :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.withdrawAccount.name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Notes :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.notes}</span>
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
                      <span>{detail.bill.billNumber}</span>
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
                        {dayjs(detail.bill.billDate).format(REPORT_DATE_FORMAT)}
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
                          value={detail.bill.billTotalAmount}
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

export default SupplierPaymentTemplate;
