import React, { useState } from "react";
import "./Reports.css";
import { Row, Col, Input, AutoComplete, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ReactComponent as StarOutlined } from "../../assets/icons/StarOutlined.svg";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { reportData } from "./ReportData";

const ReportMenuItem = ({ icon, labelId, label, to, isTitle }) => {
  const location = useLocation();

  return (
    <div className={`rep-menu-list ${isTitle ? "no-border" : ""}`}>
      {icon}
      {to ? (
        <NavLink
          to={to}
          state={{
            ...location.state,
            from: { pathname: location.pathname },
          }}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "active" : ""
          }
        >
          <FormattedMessage id={labelId} defaultMessage={label} />
        </NavLink>
      ) : (
        <span style={{ fontSize: "1rem" }}>
          <FormattedMessage id={labelId} defaultMessage={label} />
        </span>
      )}
    </div>
  );
};

const Reports = () => {
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (value) => {
    const results = reportData.flatMap((category) =>
      category.reports
        .filter((report) =>
          report.label.toLowerCase().includes(value.toLowerCase())
        )
        .map((report) => ({
          value: report.to,
          label: (
            <div className="search-result-item">
              <FormattedMessage
                id={report.labelId}
                defaultMessage={report.label}
              />
            </div>
          ),
          category: category.title,
        }))
    );

    // Group results by category
    const groupedResults = results.reduce((acc, report) => {
      const category = report.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(report);
      return acc;
    }, {});

    const options = Object.keys(groupedResults).map((category, index) => ({
      key: `category-${index}`,
      label: category,
      options: groupedResults[category].map((report, idx) => ({
        key: `report-${index}-${idx}`,
        value: report.value,
        label: report.label,
      })),
    }));
    setSearchResults(options);
  };

  const handleSelect = (value) => {
    navigate(value);
  };

  return (
    <>
      <div className="page-header">
        <Flex dir="row" gap={"2rem"} align="center">
          <span className="page-header-text">
            <FormattedMessage id="menu.reports" defaultMessage="Reports" />
          </span>
          <AutoComplete
            onSearch={handleSearch}
            onSelect={handleSelect}
            options={searchResults}
            style={{ width: "20rem" }}
          >
            <Input prefix={<SearchOutlined />} placeholder="Search Reports" />
          </AutoComplete>
        </Flex>
      </div>
      <div className="page-content page-content-with-padding">
        <Row>
          {reportData.map((category, index) => (
            <Col span={8} key={index} className="menu-row">
              <ReportMenuItem
                icon={category.icon}
                labelId={`report.${category.title
                  .toLowerCase()
                  .replace(" ", "")}`}
                label={category.title}
                isTitle={true}
              />
              {category.reports.map((report, idx) => (
                <ReportMenuItem
                  disable={report.disable}
                  key={idx}
                  icon={<StarOutlined />}
                  labelId={report.labelId}
                  label={report.label}
                  to={report.to}
                />
              ))}
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default Reports;
