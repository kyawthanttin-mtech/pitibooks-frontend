import { Button, Select, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import PeriodDropdown from "./PeriodDropdown";
import { useOutletContext } from "react-router-dom";
import { useReadQuery } from "@apollo/client";
import moment from "moment";

const ReportFilterBar = ({
  refetch,
  isPaginated = false,
  hasFromDate = true,
  setCurrentPage,
  setFilteredDate,
}) => {
  const { allBranchesQueryRef, business } = useOutletContext();
  const [selectedBranchId, setSelectedBranchId] = useState(
    business?.primaryBranch?.id
  );
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));

  // Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const handleGenerateReport = () => {
    if (hasFromDate) {
      refetch({
        fromDate,
        toDate,
        branchId: selectedBranchId,
      });
    } else {
      refetch({
        toDate,
        branchId: selectedBranchId,
      });
    }
    setFilteredDate({ fromDate, toDate });
    isPaginated && setCurrentPage(1);
  };

  return (
    <div className="report-filter-bar">
      <Space size="large">
        <Space>
          <span>
            <FilterOutlined />
          </span>
          <span>Filters:</span>
        </Space>
        <Space>
          <PeriodDropdown
            refetch={refetch}
            isPaginated={isPaginated}
            hasFromDate={hasFromDate}
            setCurrentPage={setCurrentPage}
            setFromDate={setFromDate}
            setToDate={setToDate}
          />
          <Select
            className="report-filter-select"
            style={{ height: "2rem" }}
            optionFilterProp="label"
            defaultValue={business?.primaryBranch?.id}
            onChange={(value) => setSelectedBranchId(value)}
          >
            {branches?.map((branch) => (
              <Select.Option
                key={branch.id}
                value={branch.id}
                label={branch.name}
              >
                {branch.name}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={() => handleGenerateReport()}>
            Generate Report
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default ReportFilterBar;
