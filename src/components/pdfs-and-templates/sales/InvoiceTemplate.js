import React, { useEffect } from "react";
import "../Template.css";
import { data } from "./InvoiceData";
import { useOutletContext } from "react-router-dom";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import dayjs from "dayjs";
import { FormattedNumber } from "react-intl";

const InvoiceTemplate = ({ selectedRecord }) => {
  const { business } = useOutletContext();
  const details = selectedRecord?.details ? selectedRecord?.details : [];
  let hasDetailDiscount = false;
  details.forEach((d) => {
    if (d.detailDiscountAmount > 0) {
      hasDetailDiscount = true;
    }
  });

  useEffect(() => {
    const container = document.getElementById("test");
    if (container) {
      const computedStyle = window.getComputedStyle(container);
      const minWidth = parseFloat(computedStyle.minWidth);
      const actualWidth = container.offsetWidth;
      const expendedWidth = Math.max(minWidth, actualWidth);
      console.log("Expended width:", expendedWidth, "px");
    }
  }, []);
  const total = data
    .reduce((acc, item) => acc + parseFloat(item.amount), 0)
    .toFixed(2);
  return (
    <div className="details-page">
      <div className="details-container">
        {/* <div className="ribbon text-ellipsis">
          <div
            className={`ribbon-inner ${
              selectedRecord.status === "Paid"
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
              <tbody>
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
                  </td>
                  <td className="text-align-right">
                    <span style={{ fontSize: "2.2rem" }}>INVOICE</span>
                    <br />
                    <span># {selectedRecord.invoiceNumber}</span>
                    <div style={{ clear: "both", marginTop: "20px" }}>
                      <span style={{ fontSize: "0.8rem" }}>
                        <b>Balance Due</b>
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
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "60%",
                      verticalAlign: "bottom",
                      wordWrap: "break-word",
                    }}
                  >
                    <div>
                      <label>Bill To</label>
                      <br />
                      <span>
                        <strong>
                          <span>
                            <a>{selectedRecord.customerName}</a>
                          </span>
                        </strong>
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
                            <span>Invoice Date :</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span>
                              {dayjs(selectedRecord.invoiceDate).format(
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
                          <td className="text-align-right">
                            <span>
                              {selectedRecord.invoicePaymentTerms
                                .split(/(?=[A-Z])/)
                                .join(" ")}
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
                          <td className="text-align-right">
                            <span>
                              {dayjs(selectedRecord.invoiceDueDate).format(
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
                            <span>SO # :</span>
                          </td>
                          <td className="text-align-right">
                            <span>{selectedRecord.orderNumber}</span>
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
                    Item & Description
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
                  border: "1px solid black",
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
                        padding: "10px 0 10px 5px",
                        textAlign: "center",
                        wordWrap: "break-word",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      rowSpan="1"
                      valign="top"
                      style={{
                        wordBreak: "break-word",
                        padding: "10px 0 10px 20px",
                      }}
                    >
                      <div>
                        <span>{detail.name}</span>
                        <br />
                        <span></span>
                      </div>
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
                        {total}
                      </td>
                    </tr>
                    <tr className="text-align-right">
                      <td
                        style={{
                          padding: "5px 10px 5px 0",
                          verticalAlign: "middle",
                        }}
                      >
                        Commercial Tax (5%)
                      </td>
                      <td
                        style={{
                          width: "120px",
                          verticalAlign: "middle",
                          padding: "10px 10px 10px 5px",
                        }}
                      >
                        1,500.00
                      </td>
                    </tr>
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
                        <b>MMK{+total + 1500}</b>
                      </td>
                    </tr>
                    <tr style={{ height: "40px" }} className="text-align-right">
                      <td
                        style={{
                          padding: "5px 10px 5px 0",
                          verticalAlign: "middle",

                          // backgroundColor: "#f5f4f3",
                        }}
                      >
                        <b>Balance Due</b>
                      </td>
                      <td
                        style={{
                          width: "120px",
                          verticalAlign: "middle",
                          padding: "10px 10px 10px 5px",
                          // backgroundColor: "#f5f4f3",
                        }}
                      >
                        <b>MMK{selectedRecord.balanceDue}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ clear: "both" }}></div>
            <div
              style={{
                clear: "both",
                marginTop: "50px",
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
                Thanks for your business
              </p>
            </div>
          </div>
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

export default InvoiceTemplate;
