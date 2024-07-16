import React, { useEffect, useMemo, useRef, useState } from "react";
import { CaretRightFilled } from "@ant-design/icons";
import { Divider } from "antd";

const AccordionTabs = ({ tabs }) => {
  const filteredTabs = useMemo(
    () => tabs.filter((tab) => tab.data?.length > 0 || tab.data?.id > 0),
    [tabs]
  );
  const [activeTab, setActiveTab] = useState(filteredTabs[0]?.key);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

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
          {filteredTabs.map((tab, index) => (
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
              {index + 1 < filteredTabs.length && (
                <Divider type="vertical" className="tab-divider" />
              )}
            </React.Fragment>
          ))}
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
