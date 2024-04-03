import { useState, useEffect } from "react";
import moment from "moment";

export const usePeriodFilter = ({
  defaultPeriod = {
    key: "3",
    label: "This Month",
  },
  refetch,
  setCurrentPage,
  form,
  isPaginated = false,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);

  const items = [
    {
      key: "1",
      label: "Today",
    },
    {
      key: "2",
      label: "This Week",
    },
    {
      key: "3",
      label: "This Month",
    },
    {
      key: "4",
      label: "This Quarter",
    },
    {
      key: "5",
      label: "This Year",
    },
    {
      key: "6",
      label: "Yesterday",
    },
    {
      key: "7",
      label: "Previous Week",
    },
    {
      key: "8",
      label: "Previous Month",
    },
    {
      key: "9",
      label: "Previous Quarter",
    },
    {
      key: "10",
      label: "Previous Year",
    },
    {
      key: "11",
      label: "Custom",
    },
  ];

  const handlePeriodChange = (key) => {
    const selectedFilter = items.find((option) => option.key === key);
    setSelectedPeriod(selectedFilter);
    isPaginated && setCurrentPage(1);
    if (key !== "11") {
      setDropdownOpen(true);
    }
  };

  const handleDateRangeApply = () => {
    const dateRange = form.getFieldValue("dateRange");
    if (dateRange && dateRange.length === 2) {
      const [fromDate, toDate] = dateRange;
      refetch({
        fromDate: fromDate.startOf("day").toISOString(),
        toDate: toDate.endOf("day").toISOString(),
      });
      isPaginated && setCurrentPage(1);
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    const updateDates = () => {
      let fromDate, toDate;
      switch (selectedPeriod.key) {
        case "1":
          fromDate = moment().startOf("day");
          toDate = moment().endOf("day");
          break;
        case "2":
          fromDate = moment().startOf("week");
          toDate = moment().endOf("week");
          break;
        case "3":
          fromDate = moment().startOf("month");
          toDate = moment().endOf("month");
          break;
        case "4":
          fromDate = moment().startOf("quarter");
          toDate = moment().endOf("quarter");
          break;
        case "5":
          fromDate = moment().startOf("year");
          toDate = moment().endOf("year");
          break;
        case "6":
          fromDate = moment().subtract(1, "day").startOf("day");
          toDate = moment().subtract(1, "day").endOf("day");
          break;
        case "7":
          fromDate = moment().subtract(1, "week").startOf("week");
          toDate = moment().subtract(1, "week").endOf("week");
          break;
        case "8":
          fromDate = moment().subtract(1, "month").startOf("month");
          toDate = moment().subtract(1, "month").endOf("month");
          break;
        case "9":
          fromDate = moment().subtract(1, "quarter").startOf("quarter");
          toDate = moment().subtract(1, "quarter").endOf("quarter");
          break;
        case "10":
          fromDate = moment().subtract(1, "year").startOf("year");
          toDate = moment().subtract(1, "year").endOf("year");
          break;
        case "11":
          setShowDateRange(true);
          setDropdownOpen(true);
          return;
        default:
          fromDate = moment().startOf("month");
          toDate = moment().endOf("month");
          break;
      }
      refetch({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
    };
    if (selectedPeriod.key !== "11") {
      setShowDateRange(false);
    }
    updateDates();
  }, [selectedPeriod, refetch]);

  return {
    selectedPeriod,
    dropdownOpen,
    showDateRange,
    setDropdownOpen,
    handlePeriodChange,
    handleDateRangeApply,
    items,
  };
};
