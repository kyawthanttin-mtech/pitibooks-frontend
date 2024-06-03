import React, { useState, useEffect } from "react";
import { Dropdown, Form, Divider, Space, DatePicker, Button } from "antd";
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import moment from "moment";

const PeriodDropdown = ({
  refetch,
  isPaginated = false,
  setCurrentPage,
  hasFromDate = true,
  setFromDate,
  setToDate,
  fiscalYear,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    key: "3",
    label: "This Month",
  });
  const [form] = Form.useForm();

  const items = [
    {
      key: "1",
      label: <FormattedMessage id="period.today" defaultMessage="Today" />,
    },
    {
      key: "2",
      label: (
        <FormattedMessage id="period.thisWeek" defaultMessage="This Week" />
      ),
    },
    {
      key: "3",
      label: (
        <FormattedMessage id="period.thisMonth" defaultMessage="This Month" />
      ),
    },
    {
      key: "4",
      label: (
        <FormattedMessage
          id="period.thisQuarter"
          defaultMessage="This Quarter"
        />
      ),
    },
    {
      key: "5",
      label: (
        <FormattedMessage id="period.thisYear" defaultMessage="This Year" />
      ),
    },
    {
      key: "6",
      label: (
        <FormattedMessage id="period.yesterday" defaultMessage="Yesterday" />
      ),
    },
    {
      key: "7",
      label: (
        <FormattedMessage
          id="period.perviousWeek"
          defaultMessage="Previous Week"
        />
      ),
    },
    {
      key: "8",
      label: (
        <FormattedMessage
          id="period.previousMonth"
          defaultMessage="Previous Month"
        />
      ),
    },
    {
      key: "9",
      label: (
        <FormattedMessage
          id="period.previousQuarter"
          defaultMessage="Previous Quarter"
        />
      ),
    },
    {
      key: "10",
      label: (
        <FormattedMessage
          id="period.previousYear"
          defaultMessage="Previous Year"
        />
      ),
    },
    {
      key: "11",
      label: <FormattedMessage id="period.custom" defaultMessage="Custom" />,
    },
  ];

  const handlePeriodChange = (key) => {
    const selectedFilter = items.find((option) => option.key === key);
    setSelectedPeriod(selectedFilter);
    isPaginated && key !== "11" && setCurrentPage(1);
    if (key !== "11") {
      setDropdownOpen(true);
    }
  };

  const handleDateApply = () => {
    if (hasFromDate) {
      const dateRange = form.getFieldValue("dateRange");
      if (dateRange && dateRange.length === 2) {
        const [fromDate, toDate] = dateRange;
        setFromDate(fromDate);
        setToDate(toDate);
        refetch({
          fromDate: fromDate,
          toDate: toDate,
        });
        isPaginated && setCurrentPage(1);
        setDropdownOpen(false);
      }
    } else {
      const toDate = form.getFieldValue("endDate");
      if (toDate) {
        setToDate(toDate);
        refetch({
          toDate: toDate,
        });
        isPaginated && setCurrentPage(1);
        setDropdownOpen(false);
      }
    }
  };

  useEffect(() => {
    const updateDates = () => {
      let fiscalYear = "Jan";
      let currentMonth = moment().month();
      let fiscalStartMonth = moment().month(fiscalYear.substring(0, 3)).month();
      let quarter = Math.floor(
        ((currentMonth < fiscalStartMonth ? currentMonth + 12 : currentMonth) -
          fiscalStartMonth) /
          3
      );
      let quarterStartMonth = (fiscalStartMonth + quarter * 3) % 12;
      let quarterEndMonth = (fiscalStartMonth + 2 + quarter * 3) % 12;

      let fromDate, toDate;
      switch (selectedPeriod.key) {
        case "1":
          fromDate = moment().startOf("day").utc(true);
          toDate = moment().endOf("day").utc(true);
          break;
        case "2":
          fromDate = moment().startOf("week").utc(true);
          toDate = moment().endOf("week").utc(true);
          break;
        case "3":
          fromDate = moment().startOf("month").utc(true);
          toDate = moment().endOf("month").utc(true);
          break;
        case "4":
          fromDate = moment()
            .subtract(currentMonth < quarterStartMonth ? 1 : 0, "year")
            .month(quarterStartMonth)
            .startOf("month")
            .utc(true);
          toDate = moment()
            .add(quarterEndMonth < currentMonth ? 1 : 0, "year")
            .month(quarterEndMonth)
            .startOf("month")
            .utc(true);
          break;
        case "5":
          if (fiscalStartMonth > currentMonth) {
            fromDate = moment()
              .subtract(1, "year")
              .month(fiscalStartMonth)
              .startOf("month")
              .utc(true);
            toDate = moment()
              .month(fiscalStartMonth - 1)
              .endOf("month")
              .utc(true);
          } else {
            fromDate = moment()
              .month(fiscalStartMonth)
              .startOf("month")
              .utc(true);
            toDate = moment()
              .add(1, "year")
              .month(fiscalStartMonth - 1)
              .endOf("month")
              .utc(true);
          }
          break;
        case "6":
          fromDate = moment().subtract(1, "day").startOf("day").utc(true);
          toDate = moment().subtract(1, "day").endOf("day").utc(true);
          break;
        case "7":
          fromDate = moment().subtract(1, "week").startOf("week").utc(true);
          toDate = moment().subtract(1, "week").endOf("week").utc(true);
          break;
        case "8":
          fromDate = moment().subtract(1, "month").startOf("month").utc(true);
          toDate = moment().subtract(1, "month").endOf("month").utc(true);
          break;
        case "9":
          fromDate = moment()
            .subtract(currentMonth < quarterStartMonth ? 1 : 0, "year")
            .month(quarterStartMonth - 3)
            .startOf("month")
            .utc(true);
          toDate = moment()
            .add(quarterEndMonth < currentMonth ? 1 : 0, "year")
            .month(quarterEndMonth - 3)
            .startOf("month")
            .utc(true);
          break;
        case "10":
          if (fiscalStartMonth > currentMonth) {
            fromDate = moment()
              .subtract(2, "year")
              .month(fiscalStartMonth)
              .startOf("month")
              .utc(true);
            toDate = moment()
              .subtract(1, "year")
              .month(fiscalStartMonth - 1)
              .endOf("month")
              .utc(true);
          } else {
            fromDate = moment()
              .subtract(1, "year")
              .month(fiscalStartMonth)
              .startOf("month")
              .utc(true);
            toDate = moment()
              .month(fiscalStartMonth - 1)
              .endOf("month")
              .utc(true);
          }
          break;
        // case "11":
        //   setShowDateRange(true);
        //   setDropdownOpen(true);
        //   return;
        default:
          fromDate = moment().startOf("month").utc(true);
          toDate = moment().endOf("month").utc(true);
          break;
      }
      if (hasFromDate) {
        setFromDate(fromDate);
        setToDate(toDate);
        refetch({
          fromDate: fromDate,
          toDate: toDate,
        });
      } else {
        setToDate(toDate);
        refetch({
          toDate: toDate,
        });
      }
    };
    if (selectedPeriod.key === "11") {
      setShowDateRange(true);
      setDropdownOpen(true);
    } else {
      setShowDateRange(false);
      updateDates();
    }
  }, [selectedPeriod, setFromDate, setToDate, refetch, hasFromDate]);

  return (
    <Dropdown
      trigger="click"
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      menu={{
        items: items?.map((item) => ({
          ...item,
          onClick: ({ key }) => handlePeriodChange(key),
        })),
        selectable: true,
        selectedKeys: [selectedPeriod.key],
      }}
      dropdownRender={(menu) => (
        <div
          style={{
            minWidth: "11.686rem",
            maxWidth: "21rem",
            borderRadius: "8px",
            boxShadow:
              "0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          {React.cloneElement(menu, {
            style: { boxShadow: "none" },
          })}

          {showDateRange && (
            <Form form={form}>
              <Divider
                style={{
                  margin: 0,
                }}
              />
              <Space
                style={{
                  padding: 8,
                }}
              >
                <Form.Item
                  className="report-datepicker"
                  name={hasFromDate ? "dateRange" : "endDate"}
                  style={{ margin: 0 }}
                  rules={[
                    {
                      required: true,
                      message: "",
                    },
                  ]}
                >
                  {hasFromDate ? (
                    <DatePicker.RangePicker />
                  ) : (
                    <DatePicker placeholder="End Date" />
                  )}
                </Form.Item>
                <Button
                  type="primary"
                  onClick={() => {
                    form.submit();
                    handleDateApply();
                  }}
                >
                  <FormattedMessage id="button.apply" defaultMessage="Apply" />
                </Button>
              </Space>
            </Form>
          )}
        </div>
      )}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          height: "2rem",
          alignItems: "center",
          border: "1px solid var(--border-color)",
          paddingInline: "1rem",
          cursor: "pointer",
          borderRadius: "0.3rem",
          justifyContent: "space-between",
          minWidth: "10rem",
        }}
      >
        <Space>
          <CalendarOutlined />
          {selectedPeriod.label}
        </Space>
        <DownOutlined style={{ width: "0.7rem", height: "0.7rem" }} />
      </div>
    </Dropdown>
  );
};

export default PeriodDropdown;
