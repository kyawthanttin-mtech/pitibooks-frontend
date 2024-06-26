import React from "react";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";

const OpeningBalances = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Opening Balances</p>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() =>
              navigate("edit", {
                state: {
                  ...location.state,
                  from: { pathname: location.pathname },
                  clonePO: null,
                },
              })
            }
          >
            <span>
              <FormattedMessage id="button.edit" defaultMessage="Edit" />
            </span>
          </Button>
          <Button icon={<DeleteOutlined />} />
        </Space>
      </div>
      <div className="page-content"></div>
    </>
  );
};

export default OpeningBalances;
