import React, { useEffect } from "react";
import "../Template.css";
import { data } from "./InvoiceData";

const InvoiceTemplate = ({ selectedRecord }) => {
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
      <span id="test" style={{ fontSize: 10 }}>
        9
      </span>
      <div className="details-container">
        <div className="ribbon text-ellipsis">
          <div
            className={`ribbon-inner ${
              selectedRecord.status === "Paid"
                ? "ribbon-success"
                : "ribbon-overdue"
            }`}
          >
            {selectedRecord.status}
          </div>
        </div>
        <div className="template">
          <div className="template-header header-content"></div>
          <div className="template-body">
            <table className="title-section" id="title-table">
              <tbody>
                <tr>
                  <td>
                    <span>
                      <b>{selectedRecord.customerName}</b>
                    </span>
                    <br />
                    <span>Myanmar</span>
                    <br />
                    <span>useremail@gmail.com</span>
                  </td>
                  <td className="text-align-right">
                    <span style={{ fontSize: "2.2rem" }}>INVOICE</span>
                    <br />
                    <span># {selectedRecord.invoice}</span>
                    <div style={{ clear: "both", marginTop: "20px" }}>
                      <span style={{ fontSize: "0.8rem" }}>
                        <b>Balance Due</b>
                      </span>
                      <br />
                      <span style={{ fontSize: "1.1rem" }}>
                        <b>MMK{selectedRecord.balanceDue}</b>
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
                            <span>{selectedRecord.invoiceDate}</span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Terms :</span>
                          </td>
                          <td className="text-align-right">
                            <span>Due On Receipt</span>
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
                            <span>{selectedRecord.dueDate}</span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>P.O# :</span>
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
                {data.map((item, index) => (
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
                        <span>{item.itemName}</span>
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
                      <span>{item.qty}</span>
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
                      <span>{item.rate}</span>
                    </td>
                    <td
                      className="text-align-right"
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 10px 5px",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{item.amount}</span>
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
