import { Button, Select, Space, Tooltip } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";
import PeriodDropdown from "./PeriodDropdown";
import { useOutletContext } from "react-router-dom";
import { useReadQuery } from "@apollo/client";
import moment from "moment";
import { FormattedMessage } from "react-intl";

const ReportFilterBar = ({
  refetch,
  isPaginated = false,
  hasFromDate = true,
  setCurrentPage,
  setFilteredDate,
  setFilteredBranch,
  loading,
}) => {
  const { allBranchesQueryRef, business } = useOutletContext();
  const [selectedBranchId, setSelectedBranchId] = useState(
    business?.primaryBranch?.id
  );
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  // useEffect(() => {
  //   setIsButtonDisabled(false); // Enable the button on component mount
  // }, []);

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
        currentDate: toDate,
        branchId: selectedBranchId,
      });
    }
    setFilteredDate({ fromDate, toDate });
    //it is necessary to set filteredBranch in the report page if the report page is paginated
    setFilteredBranch && setFilteredBranch(selectedBranchId);
    isPaginated && setCurrentPage(1);
    setIsButtonDisabled(true);
  };

  const handleBranchChange = (value) => {
    setSelectedBranchId(value);
    setIsButtonDisabled(false);
  };
  return (
    <div className="report-filter-bar">
      <Space size="large">
        <Space>
          <span>
            <FilterOutlined />
          </span>
          <span>
            <FormattedMessage id="label.filters" defaultMessage="Filters: " />
          </span>
        </Space>
        <Space>
          <PeriodDropdown
            refetch={refetch}
            isPaginated={isPaginated}
            hasFromDate={hasFromDate}
            setCurrentPage={setCurrentPage}
            setFromDate={setFromDate}
            setToDate={setToDate}
            setIsButtonDisabled={setIsButtonDisabled}
          />
          <Select
            className="report-filter-select"
            style={{ height: "2rem" }}
            optionFilterProp="label"
            defaultValue={business?.primaryBranch?.id}
            onChange={handleBranchChange}
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
          <Tooltip
            title={
              isButtonDisabled ? (
                <FormattedMessage
                  id="button.modifyFiltersToGenerateReport"
                  defaultMessage="Modify filters to generate report"
                />
              ) : (
                <FormattedMessage
                  id="button.generateReportToApplyFilters"
                  defaultMessage="Generate report to apply filters"
                />
              )
            }
          >
            <Button
              type="primary"
              onClick={() => handleGenerateReport()}
              disabled={isButtonDisabled}
              loading={loading}
            >
              <FormattedMessage
                id="button.generateReport"
                defaultMessage="Generate Report"
              />
            </Button>
          </Tooltip>
        </Space>
      </Space>
    </div>
  );
};

export default ReportFilterBar;
