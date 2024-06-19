import { Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import React from "react";
import PeriodDropdown from "./PeriodDropdown";

const ReportFilterBar = ({
  refetch,
  isPaginated,
  hasFromDate,
  setCurrentPage,
  setFromDate,
  setToDate,
}) => {
  return (
    <div className="report-filter-bar">
      <Space size="large">
        <Space>
          <span>
            <FilterOutlined />
          </span>
          <span>Filters:</span>
        </Space>
        <PeriodDropdown
          refetch={refetch}
          isPaginated={isPaginated}
          hasFromDate={hasFromDate}
          setCurrentPage={setCurrentPage}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </Space>
    </div>
  );
};

export default ReportFilterBar;
