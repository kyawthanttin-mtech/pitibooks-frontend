import React, { useMemo } from "react";
import {
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  theme,
} from "antd";
import { CloseOutlined, CaretRightOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useReadQuery } from "@apollo/client";
import "./OpeningBalances.css";

const OpeningBalancesEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();
  const from = location.state?.from?.pathname || "/";
  const [form] = Form.useForm();
  const {
    notiApi,
    msgApi,
    business,
    allAccountsQueryRef,
    allBranchesQueryRef,
  } = useOutletContext();
  const { token } = theme.useToken();

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter((b) => b.isActive === true);
  }, [branchData]);

  const accounts = useMemo(() => {
    return accountData?.listAllAccount?.filter((a) => a.isActive === true);
  }, [accountData]);

  const groupedAccounts = useMemo(() => {
    if (!accounts) return [];

    const groups = {};
    accounts.forEach((account) => {
      const { mainType } = account;
      if (!groups[mainType]) {
        groups[mainType] = [];
      }
      groups[mainType].push(account);
    });

    return Object.keys(groups).map((key) => ({
      mainType: key,
      accounts: groups[key],
    }));
  }, [accounts]);

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Opening Balances Edit</p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        />
      </div>
      <div className="page-content page-content-with-padding">
        <Form form={form}>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            initialValue={business?.primaryBranch?.id}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.branch.required"
                    defaultMessage="Select the Branch"
                  />
                ),
              },
            ]}
          >
            <Select showSearch optionFilterProp="label">
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
          </Form.Item>
          <Divider />
          {/* <div style={{ width: "80%" }}> */}
          <Collapse
            style={{
              background: token.colorBgContainer,
            }}
            className="custom-collapse"
            bordered={false}
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            expandIconPosition="end"
          >
            <Collapse.Panel
              header={
                <Space>
                  <h4 style={{ margin: 0 }}>Accounts Receivable</h4>
                </Space>
              }
              key={1}
            ></Collapse.Panel>
            <Collapse.Panel
              header={
                <Space>
                  <h4 style={{ margin: 0 }}>Accounts Payable</h4>
                </Space>
              }
              key={2}
            ></Collapse.Panel>
            {groupedAccounts.map((group, index) => (
              <Collapse.Panel
                header={
                  <Space>
                    <h4 style={{ margin: 0 }}>{group.mainType}</h4>
                  </Space>
                }
                key={2 + index + 1}
              >
                <Row className="account-value-row">
                  <Col span={9} className="account-value-box">
                    <label>ACCOUNTS</label>
                  </Col>
                  <Col span={4} className="account-value-box">
                    <label>AVAILABLE BALANCE</label>
                  </Col>
                  <Col span={5} className="account-value-box text-align-right">
                    <label>DEBIT</label>
                  </Col>
                  <Col span={5} className="account-value-box text-align-right">
                    <label className="">CREDIT</label>
                  </Col>
                </Row>
                {group.accounts.map((account) => (
                  <Row>
                    <Col span={9} className="account-value-box">
                      <p key={account.id}>{account.name}</p>
                    </Col>
                    <Col span={4} className="account-value-box">
                      {" "}
                      -{" "}
                    </Col>
                    <Col span={5} className="account-value-box">
                      <Form.Item
                        name={`debit${account.id}`}
                        rules={[
                          () => ({
                            validator(_, value) {
                              if (!value) {
                                return Promise.resolve();
                              } else if (isNaN(value) || value.length > 20) {
                                return Promise.reject(
                                  intl.formatMessage({
                                    id: "validation.invalidInput",
                                    defaultMessage: "Invalid Input",
                                  })
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          }),
                        ]}
                      >
                        <Input style={{ textAlign: "right" }} />
                      </Form.Item>
                    </Col>
                    <Col span={5} className="account-value-box">
                      <Form.Item
                        name={`credit${account.id}`}
                        rules={[
                          () => ({
                            validator(_, value) {
                              if (!value) {
                                return Promise.resolve();
                              } else if (isNaN(value) || value.length > 20) {
                                return Promise.reject(
                                  intl.formatMessage({
                                    id: "validation.invalidInput",
                                    defaultMessage: "Invalid Input",
                                  })
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          }),
                        ]}
                      >
                        <Input style={{ textAlign: "right" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Collapse.Panel>
            ))}
          </Collapse>
          <Row className="new-manual-journal-table-footer">
            <Col span={1}></Col>
            <Col
              span={14}
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <table
                cellSpacing="0"
                border="0"
                id="balance-table"
                style={{
                  background: "rgba(245, 157, 0, 0.10)",
                  width: "100%",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{ verticalAlign: "middle", width: "20%" }}
                      className="text-align-right"
                    >
                      <FormattedMessage
                        id="label.total"
                        defaultMessage="Total"
                      />
                    </td>
                    <td
                      className="text-align-right"
                      style={{ width: "20%", paddingTop: "0.5rem" }}
                    >
                      0
                    </td>
                    <td className="text-align-right" style={{ width: "20%" }}>
                      0
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      <FormattedMessage
                        id="label.openingBalanceAdjustments"
                        defaultMessage="Opening Balance Adjustments"
                      />
                    </td>
                    <td
                      className="text-align-right"
                      style={{ width: "20%", paddingTop: "0.5rem" }}
                    >
                      0
                    </td>
                    <td
                      className="text-align-right"
                      style={{ width: "20%", paddingTop: "0.5rem" }}
                    >
                      0
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3}>
                      <Divider style={{ margin: 0, marginTop: "0.8rem" }} />
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      <FormattedMessage
                        id="label.totalAmount"
                        defaultMessage="Total Amount"
                      />
                    </td>
                    <td
                      className="text-align-right"
                      style={{ width: "20%", paddingTop: "0.5rem" }}
                    >
                      0
                    </td>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      0
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          {/* </div> */}
        </Form>
      </div>
    </>
  );
};

export default OpeningBalancesEdit;
