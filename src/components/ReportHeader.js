import React from "react";
import { Button, Dropdown, Flex, Space } from "antd";
import {
  CaretDownFilled,
  PrinterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as CollapseOutlined } from "../assets/icons/CollapseOutlined.svg";
import { ReactComponent as ShareOutlined } from "../assets/icons/ShareOutlined.svg";
import { PeriodDropdown } from "../components";
import { FormattedMessage } from "react-intl";
import { pdf } from "@react-pdf/renderer";

const ReportHeader = ({
  onCollapseClick,
  onShareClick,
  onPrinterClick,
  onExportAsClick,
  refetch,
  isPaginated = false,
  hasFromDate = true,
  setCurrentPage,
  setFromDate,
  setToDate,
  setReportBasis,
  currentReport,
  setCollapsed,
  collapsed,
  PDFComponent,
  selectedRecord,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleNavigate = () => {
    navigate("/reports");
  };

  // const handleExportAsClick = async () => {
  //   if (!PDFComponent) {
  //     console.error("No PDF component provided");
  //     return;
  //   }

  //   const pdfDoc = <PDFComponent selectedRecord={selectedRecord} />;
  //   const blob = await pdf(pdfDoc).toBlob();
  //   const blobUrl = URL.createObjectURL(blob);

  //   const newTab = window.open(blobUrl, "_blank");
  //   if (newTab) {
  //     newTab.focus();
  //   } else {
  //     alert("Please allow popups for this website");
  //   }
  // };

  return (
    <div className="page-header">
      <Space size="large">
        <Button
          icon={<CollapseOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
        {/* <PeriodDropdown
          refetch={refetch}
          isPaginated={isPaginated}
          hasFromDate={hasFromDate}
          setCurrentPage={setCurrentPage}
          setFromDate={setFromDate}
          setToDate={setToDate}
        /> */}
        <Flex vertical justify="center" gap="1.1rem">
          {/* <div style={{ fontSize: "0.8rem", opacity: "90%" }}>
            {currentReport.title}
          </div> */}
          <div style={{ fontSize: "1.1rem" }}>{currentReport.title}</div>
        </Flex>
      </Space>
      <div>
        <Space>
          <Button
            icon={<ShareOutlined style={{ height: "1.3rem" }} />}
            onClick={onShareClick}
          ></Button>
          <Button
            icon={<PrinterOutlined />}
            type="primary"
            onClick={onPrinterClick}
          />
          <Dropdown
            trigger="click"
            menu={{
              items: [{ key: "1", label: "PDF" }],
              selectable: true,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                height: "2rem",
                alignItems: "center",
                border: "1px solid var(--border-color)",
                paddingInline: "0.5rem",
                cursor: "pointer",
                borderRadius: "0.3rem",
                justifyContent: "space-between",
              }}
              onClick={onExportAsClick}
            >
              <FormattedMessage
                id="button.exportAs"
                defaultMessage="Export As"
              />
              <CaretDownFilled style={{ width: "0.6rem", height: "0.6rem" }} />
            </div>
          </Dropdown>
          <Button
            icon={<CloseOutlined style={{ color: "red" }} />}
            type="text"
            onClick={handleNavigate}
          />
        </Space>
      </div>
    </div>
  );
};

export default ReportHeader;
