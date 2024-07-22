// Layout.js
import React, { useState, useMemo } from "react";
import { AutoComplete, Flex, Input, Layout, Menu } from "antd";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { reportData } from "./ReportData";
import ReportHeader from "../../components/ReportHeader";
import { Header } from "antd/es/layout/layout";
import { FormattedMessage } from "react-intl";

const { Sider, Content } = Layout;

const ReportLayout = ({ children }) => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [openKeys, setOpenKeys] = useState([]);

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
    navigate(`/reports/${value}`);
  };

  // Get the current active report key based on the pathname
  const getCurrentReportKey = () => {
    const currentPath = location.pathname.split("/")[2];
    return currentPath ? [currentPath] : [];
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys.slice(-1)); // Keep only the last key opened
  };

  // Get the current report title based on the pathname
  const getCurrentReportTitle = () => {
    const currentPath = location.pathname.split("/")[2];
    for (const category of reportData) {
      const report = category.reports.find((r) => r.to === currentPath);
      if (report) {
        return { title: category.title, label: report.label };
      }
    }
    return "";
  };

  const currentReport = useMemo(getCurrentReportTitle, [location.pathname]);

  return (
    <Layout style={{ height: "calc(100vh - 5.05rem)" }}>
      <Sider
        collapsed={collapsed}
        collapsedWidth="0"
        width={220}
        theme="light"
        style={{
          position: "absolute",
          zIndex: 1000,
          borderRight: "1px solid var(--border-color)",
          height: "calc(100vh - 5.05rem)",
          boxShadow:
            "0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Flex
          vertical
          gap="1.2rem"
          style={{
            padding: "12px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <Flex align="center" justify="space-between">
            <h3 style={{ margin: 0 }}>Reports</h3>
            <span>
              <CloseOutlined
                style={{ cursor: "pointer" }}
                onClick={() => setCollapsed(!collapsed)}
              />
            </span>
          </Flex>

          <AutoComplete
            onSearch={handleSearch}
            onSelect={handleSelect}
            options={searchResults}
          >
            <Input prefix={<SearchOutlined />} placeholder="Search Reports" />
          </AutoComplete>
        </Flex>
        <Menu
          mode="inline"
          className="report-menu"
          defaultSelectedKeys={getCurrentReportKey()}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          style={{
            height: "calc(100% - 106px)",
            borderRight: 0,
            overflow: "auto",
            paddingBottom: "2rem",
            scrollbarColor: "var(--border-color) transparent",
          }}
        >
          {reportData.map((category, index) => (
            <Menu.SubMenu
              key={category.title.toLowerCase().replace(" ", "")}
              title={<span>{category.title}</span>}
            >
              {category.reports.map((report, idx) => (
                <Menu.Item key={report.to}>
                  <NavLink to={`/reports/${report.to}`}>
                    <span>{report.label}</span>
                  </NavLink>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            height: "auto",
            padding: 0,
            lineHeight: 0,
            background: "none",
            zIndex: 100,
          }}
        >
          <ReportHeader
            setCollapsed={setCollapsed}
            collapsed={collapsed}
            currentReport={currentReport}
          />
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default ReportLayout;
