import React from "react";
import { Tabs, Button, Flex, Space, Dropdown, Table } from "antd";
import {
  CloseOutlined,
  EditOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { FormattedMessage } from "react-intl";
import dayjs from "dayjs";

const TxnDetailColumn = ({
  transactionRecord,
  setTransactionRecord,
  setTransactionRowIndex,
  setEditModalOpen,
}) => {
  console.log("transactins", transactionRecord);

  return (
    <div className={`txn-detail-column ${transactionRecord ? "open" : ""}`}>
      <Tabs
        style={{ paddingInline: "1.5rem" }}
        tabBarExtraContent={
          <Button
            icon={<CloseOutlined />}
            type="text"
            onClick={() => {
              setTransactionRecord(null);
              setTransactionRowIndex(0);
            }}
          />
        }
      >
        <Tabs.TabPane tab="Transaction Details" key="txnDetails">
          <Flex
            align="center"
            style={{
              height: "4.063rem",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={setEditModalOpen}
              ></Button>
              <Button>
                <Dropdown
                  trigger="click"
                  key={transactionRecord?.key}
                  menu={{
                    onClick: ({ key }) => {
                      // if (key === "1") handleDelete(selectedRecord.id);
                      // else if (key === "1") handleDelete(selectedRecord.id);
                    },
                    items: [
                      {
                        label: (
                          <FormattedMessage
                            id="button.delete"
                            defaultMessage="Delete"
                          />
                        ),
                        key: "1",
                      },
                    ],
                  }}
                >
                  <div style={{ height: "2rem" }}>
                    More <CaretDownOutlined />
                  </div>
                </Dropdown>
              </Button>
            </Space>
          </Flex>
          <div className="txn-details-content">
            <Flex
              style={{
                height: "auto",
                borderBottom: "1px solid var(--border-color)",
                paddingBlock: "1.5rem",
              }}
              vertical
              gap="1.5rem"
            >
              <Flex vertical>
                <span className="page-header-text">
                  {transactionRecord?.baseDebit > 0
                    ? transactionRecord?.baseDebit
                    : transactionRecord?.baseCredit}
                </span>
                <span>
                  on{" "}
                  {dayjs(transactionRecord?.transactionDateTime).format(
                    REPORT_DATE_FORMAT
                  )}
                </span>
              </Flex>
              <span className="badge-pill">Transfer Fund</span>
            </Flex>
            <div className="txn-details-body">
              <div>
                <div style={{ opacity: "70%" }}>Account Name</div>
                <p style={{ margin: 0, marginBottom: "1rem" }}>Advance Tax</p>
              </div>
              <div>
                <div style={{ opacity: "70%" }}>Supplier</div>
                <p
                  style={{
                    margin: 0,
                    marginBottom: "1rem",
                    color: "var(--primary-color)",
                  }}
                >
                  Hehe
                </p>
              </div>
              <div>
                <div style={{ opacity: "70%" }}>Bank Charges</div>
                <p style={{ margin: 0, marginBottom: "1rem" }}>MMK 000</p>
              </div>
              <Table
                className="txn-details-table"
                columns={[
                  {
                    title: "Bill Detail",
                    dataIndex: "billDetail",
                    key: "billDetail",
                  },
                  { title: "Payment", dataIndex: "payment", key: "payment" },
                ]}
                dataSource={[{ key: 1, payment: "00" }]}
                pagination={false}
              />
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Comment & History" key="cmt&his"></Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default TxnDetailColumn;
