import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { FormattedMessage } from "react-intl";

const SearchCriteriaDisplay = ({ handleModalClear, children }) => {
  return (
    <>
      <div
        style={{
          padding: "1rem 1.5rem",
          background: "#eef8f1",
          fontSize: 13,
        }}
      >
        <Flex justify="space-between">
          <span>
            <i>
              <FormattedMessage
                id="label.searchCriteria"
                defaultMessage="Search Criteria"
              />
            </i>
          </span>
          <CloseOutlined
            style={{ cursor: "pointer" }}
            onClick={handleModalClear}
          />
        </Flex>
        <ul style={{ paddingLeft: "1.5rem" }}>{children}</ul>
      </div>
    </>
  );
};

export default SearchCriteriaDisplay;
