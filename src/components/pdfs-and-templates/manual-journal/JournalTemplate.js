/* eslint-disable react/style-prop-object */
import React from "react";
import { FormattedNumber } from "react-intl";

const JournalTemplate = ({ selectedRecord }) => {
  const data = selectedRecord.transactions;

  return (
    <div className="details-page">
      <div className="details-container">
        <div className="ribbon text-ellipsis">
          {/* <div
            className={`ribbon-inner ${
              selectedRecord.status === "Adjusted"
                ? "ribbon-success"
                : "ribbon-overdue"
            }`}
          >
            {selectedRecord.status}
          </div> */}
        </div>
        <div className="template">
          <div className="template-header header-content"></div>
          <div className="template-body">
            <table className="title-section" id="title-table">
              <tbody>
                <tr>
                  <td></td>
                  <td className="text-align-right">
                    <span style={{ fontSize: "2.2rem" }}>Journal</span>
                    <br />
                    <span># {selectedRecord.journalNumber}</span>
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
                      <label>Notes</label>
                      <br />
                      <span>{selectedRecord.notes}</span>
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
                        {/* <tr>
                          <td
                            className="text-align-right"
                            style={{
                              padding: "5px 10px 5px 0",
                            }}
                          >
                            <span>Amount :</span>
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
                                value={selectedRecord.totalAmount}
                                style="decimal"
                                minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                              />
                            </span>
                          </td>
                        </tr> */}
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
                    height: "2.5rem",
                    background: "#3C3D3A",
                    color: "white",
                  }}
                >
                  <td
                    style={{
                      padding: "5px 10px 5px 20px",
                      textAlign: "left",
                    }}
                  >
                    Account
                  </td>
                  {/* <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                      width: "17%",
                    }}
                  >
                    Contact
                  </td> */}
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                      width: "17%",
                    }}
                  >
                    Debits
                  </td>
                  <td
                    className="text-align-right"
                    style={{
                      padding: "5px 10px 5px 5px",
                      width: "17%",
                    }}
                  >
                    Credits
                  </td>
                </tr>
              </thead>
              <tbody
                style={{
                  verticalAlign: "middle",
                  border: "1px solid black",
                }}
              >
                {data?.map((item, index) => (
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
                      <div>
                        <span>{item.account.name}</span>
                        <br />
                        <span></span>
                      </div>
                    </td>
                    {/* <td
                      rowSpan="1"
                      className="text-align-right"
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{item.contact}</span>
                    </td> */}
                    <td
                      className="text-align-right"
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 5px 10px",
                        verticalAlign: "top",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{item.debit !== 0 && 
                        <FormattedNumber
                          value={item.debit}
                          style="decimal"
                          minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                        />
                      }</span>
                    </td>
                    <td
                      className="text-align-right"
                      rowSpan="1"
                      style={{
                        padding: "10px 10px 10px 5px",
                        wordWrap: "break-word",
                      }}
                    >
                      <span>{item.credit !== 0 && 
                        <FormattedNumber
                          value={item.credit}
                          style="decimal"
                          minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                        />
                      }</span>
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
                        <b>Total({selectedRecord.currency.symbol})</b>
                      </td>
                      <td
                        style={{
                          width: "120px",
                          verticalAlign: "middle",
                          padding: "10px 10px 10px 5px",
                        }}
                      >
                        <b>
                          <FormattedNumber
                            value={selectedRecord.totalAmount}
                            style="decimal"
                            minimumFractionDigits={selectedRecord.currency.decimalPlaces}
                          />
                        </b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ clear: "both" }}></div>
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

export default JournalTemplate;
