import React, { useState } from "react";
import "./Taxes.css";
import TaxRates from "./TaxRates";
import TaxSettings from "./TaxSettings";

const Taxes = () => {
  const [activeTab, setActiveTab] = useState("rates");

  return (
    <>
      <div className="taxes-page-container">
        <div>
          <div className="page-header taxes-page-header">
            <p className="page-header-text">Taxes</p>
          </div>
          <div className="list-column">
            <div className="reports-group">
              <ul className="nav-pills">
                <li className="nav-item" onClick={() => setActiveTab("rates")}>
                  <span className={activeTab === "rates" && "active-menu"}>
                    Tax Rates
                  </span>
                </li>
                <li
                  className="nav-item"
                  onClick={() => setActiveTab("settings")}
                >
                  <span className={activeTab === "settings" && "active-menu"}>
                    Tax Settings
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="content-column">
          {activeTab === "rates" ? <TaxRates /> : <TaxSettings />}
        </div>
      </div>
    </>
  );
};

export default Taxes;
