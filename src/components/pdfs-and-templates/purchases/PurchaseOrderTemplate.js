import React from "react";

const PurchaseOrderTemplate = ({ selectedRecord }) => {
  return (
    <div className="details-page">
      <div className="details-container">
        <div className="ribbon text-ellipsis">
          <div
            className={`ribbon-inner ${
              selectedRecord.status === "CLOSED"
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
              <tbody style={{ lineHeight: "1.5rem" }}>
                <tr>
                  <td>
                    <span
                      style={{
                        fontSize: "var(--detail-text)",
                        marginBottom: "4px",
                      }}
                    >
                      <b>Piti Baby</b>
                    </span>
                    <br />
                    <span>Myanmar</span>
                    <br />
                    <span>useremail@gmail.com</span>
                    <br />
                    <br />
                    <span>Vendor Address</span>
                    <br />
                    <span style={{ color: "var(--primary-color)" }}>
                      {selectedRecord.vendorName}
                    </span>
                  </td>
                  <td className="text-align-right">
                    <span style={{ fontSize: "2.2rem" }}>PURCHASE ORDER</span>
                    <br />
                    <span># {selectedRecord.purchaseOrder}</span>
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
                      <label>Deliver To</label>
                      <br />
                      <span>
                        <span>Kyaw</span>
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
                            <span>Date :</span>
                          </td>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>{selectedRecord.date}</span>
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
                  border: "1px solid red",
                }}
              >
                <tr
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
                    <span>1</span>
                  </td>
                  <td
                    rowSpan="1"
                    style={{
                      padding: "10px 10px 5px 10px",
                      verticalAlign: "top",
                      wordWrap: "break-word",
                    }}
                  >
                    <span>cake (Purple)</span>
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
                    <span>1.00</span>
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
                    <span>20,000.00</span>
                  </td>
                  <td
                    className="text-align-right"
                    rowSpan="1"
                    style={{
                      padding: "10px 10px 10px 5px",
                      wordWrap: "break-word",
                    }}
                  >
                    <span>20,000.00</span>
                  </td>
                </tr>
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
                        20,000.00
                      </td>
                    </tr>
                    <tr className="text-align-right">
                      <td
                        style={{
                          padding: "5px 10px 5px 0",
                          verticalAlign: "middle",
                        }}
                      >
                        Discount (10.00%)
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
                        <b>MMK22,000.00</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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

export default PurchaseOrderTemplate;
