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
  title,
  label,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleNavigate = () => {
    navigate(from, { state: location.state, replace: true });
  };

  return (
    <div className="page-header">
      <Space size="large">
        <Button icon={<CollapseOutlined />} onClick={onCollapseClick} />
        <PeriodDropdown
          refetch={refetch}
          isPaginated={isPaginated}
          hasFromDate={hasFromDate}
          setCurrentPage={setCurrentPage}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
        <Flex vertical>
          <span style={{ fontSize: "0.8rem" }}>{title}</span>
          <span>{label}</span>
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
          <Dropdown trigger="click">
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
