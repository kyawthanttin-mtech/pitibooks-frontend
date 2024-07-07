import React, { useState } from "react";
import { CaretRightFilled } from "@ant-design/icons";
import { Divider } from "antd";

const AccordionTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [isContentExpanded, setIsContentExpanded] = useState(true);

  const toggleContent = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const handleTabClick = (tabKey, event) => {
    setActiveTab(tabKey);
    if (isContentExpanded) {
      event.stopPropagation();
    }
  };

  return (
    <div className="bill-receives-container">
      <div
        className={`nav-bar ${!isContentExpanded && "collapsed"}`}
        onClick={toggleContent}
      >
        <ul className="nav-tabs">
          {tabs.map(
            (tab, index) =>
              (tab.data?.length > 0 || tab.data?.id > 0) && (
                <React.Fragment key={tab.key}>
                  <li
                    key={tab.key}
                    className={`nav-link ${
                      activeTab === tab.key && isContentExpanded && "active"
                    }`}
                    onClick={(event) => handleTabClick(tab.key, event)}
                  >
                    <span>{tab.title}</span>
                    <span className="bill">
                      {tab.data || tab.data?.id > 0 ? tab.data?.length || 1 : 0}
                    </span>
                  </li>
                  <Divider type="vertical" className="tab-divider" />
                </React.Fragment>
              )
          )}
        </ul>
        <CaretRightFilled
          style={{
            transform: `rotate(${isContentExpanded ? 90 : 0}deg)`,
            transition: "0.4s",
          }}
        />
      </div>

      <div className={`content-wrapper ${isContentExpanded && "show"}`}>
        {tabs.map(
          (tab) =>
            activeTab === tab.key && (
              <div
                key={tab.key}
                className={`bill-tab ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default AccordionTabs;
