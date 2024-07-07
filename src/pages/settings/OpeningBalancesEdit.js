import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Col,
  Collapse,
  Divider,
  Flex,
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
import { ReactComponent as DiamondOutlined } from "../../assets/icons/DiamondOutlined.svg";
import { ReactComponent as ArrowDownwardOutlined } from "../../assets/icons/ArrowDownwardOutlined.svg";
import { ReactComponent as ArrowUpwardOutlined } from "../../assets/icons/ArrowUpwardOutlined.svg";
import { ReactComponent as BankAltOutlined } from "../../assets/icons/BankAltOutlined.svg";
import { ReactComponent as SavingsOutlined } from "../../assets/icons/SavingsOutlined.svg";
import { ReactComponent as ReceiptOutlined } from "../../assets/icons/ReceiptOutlined.svg";
import { ReactComponent as WalletOutlined } from "../../assets/icons/WalletOutlined.svg";
import { ReactComponent as PoliceOutlined } from "../../assets/icons/PoliceOutlined.svg";

const OpeningBalancesEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();
  const from = location.state?.from?.pathname || "/";
  const [isBalanceTableVisible, setIsBalanceTableVisible] = useState(true);
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [obAdjustments, setObAdjustments] = useState(0);
  const [total, setTotal] = useState(0);
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

  const getAccountIcon = (mainType) => {
    switch (mainType) {
      case "Asset":
        return <DiamondOutlined />;
      // case "Receivable":
      //   return <ArrowDownwardOutlined />;
      // case "Payable":
      //   return <ArrowUpwardOutlined />;
      case "Expense":
        return <ReceiptOutlined />;
      case "Liability":
        return <PoliceOutlined />;
      case "Equity":
        return <SavingsOutlined />;
      case "Income":
        return <WalletOutlined />;
      default:
        return null;
    }
  };

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
      icon: getAccountIcon(key),
      accounts: groups[key],
    }));
  }, [accounts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBalanceTableVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    const target = document.getElementById("balance-table");
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, []);

  const updateTotals = () => {
    let debitsTotal = 0;
    let creditsTotal = 0;

    groupedAccounts.forEach((group) => {
      group.accounts.forEach((account) => {
        const debitValue = form.getFieldValue(`debit${account.id}`);
        const creditValue = form.getFieldValue(`credit${account.id}`);

        if (debitValue && !isNaN(debitValue)) {
          debitsTotal += parseFloat(debitValue);
        }

        if (creditValue && !isNaN(creditValue)) {
          creditsTotal += parseFloat(creditValue);
        }
      });
    });

    setTotalDebits(debitsTotal);
    setTotalCredits(creditsTotal);
    setObAdjustments(creditsTotal - debitsTotal);
    setTotal(debitsTotal + creditsTotal);
  };

  const handleDebitBlur = (accountId) => (e) => {
    const debitValue = parseFloat(e.target.value || 0);

    if (debitValue > 0) {
      form.setFieldsValue({ [`credit${accountId}`]: null });
    }

    updateTotals();
  };

  const handleCreditBlur = (accountId) => (e) => {
    const creditValue = parseFloat(e.target.value || 0);

    if (creditValue > 0) {
      form.setFieldsValue({ [`debit${accountId}`]: null });
    }

    updateTotals();
  };

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
      <div className="ob-page-content page-content-with-padding">
        <div className="ob-page-form-wrapper">
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
            <Collapse
              // size="large"
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
                    <Flex align="center">
                      <ArrowDownwardOutlined />
                    </Flex>
                    <h4 style={{ margin: 0 }}>Accounts Receivable</h4>
                  </Space>
                }
                key={1}
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
                <Row>
                  <Col span={9} className="account-value-box">
                    <p>Accounts Receivable</p>
                  </Col>
                  <Col span={4} className="account-value-box">
                    {" "}
                    -{" "}
                  </Col>
                  <Col span={5} className="account-value-box">
                    <Form.Item
                      // name={`debit${account.id}`}
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
                      <Input
                        style={{ textAlign: "right" }}
                        // onBlur={handleDebitBlur(account.id)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={5} className="account-value-box">
                    <Form.Item
                      // name={`credit${account.id}`}
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
                      <Input
                        style={{ textAlign: "right" }}
                        // onBlur={handleCreditBlur(account.id)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Collapse.Panel>
              <Collapse.Panel
                header={
                  <Space>
                    <Flex align="center">
                      <ArrowUpwardOutlined />
                    </Flex>
                    <h4 style={{ margin: 0 }}>Accounts Payable</h4>
                  </Space>
                }
                key={2}
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
                <Row>
                  <Col span={9} className="account-value-box">
                    <p>Accounts Payable</p>
                  </Col>
                  <Col span={4} className="account-value-box">
                    {" "}
                    -{" "}
                  </Col>
                  <Col span={5} className="account-value-box">
                    <Form.Item
                      // name={`debit${account.id}`}
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
                      <Input
                        style={{ textAlign: "right" }}
                        // onBlur={handleDebitBlur(account.id)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={5} className="account-value-box">
                    <Form.Item
                      // name={`credit${account.id}`}
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
                      <Input
                        style={{ textAlign: "right" }}
                        // onBlur={handleCreditBlur(account.id)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Collapse.Panel>
              {groupedAccounts.map((group, index) => (
                <Collapse.Panel
                  header={
                    <Space>
                      <Flex align="center">{group.icon}</Flex>
                      <h4 style={{ margin: 0 }}>{group.mainType}</h4>
                    </Space>
                  }
                  key={3 + index}
                >
                  <Row className="account-value-row">
                    <Col span={9} className="account-value-box">
                      <label>ACCOUNTS</label>
                    </Col>
                    <Col span={4} className="account-value-box">
                      <label>AVAILABLE BALANCE</label>
                    </Col>
                    <Col
                      span={5}
                      className="account-value-box text-align-right"
                    >
                      <label>DEBIT</label>
                    </Col>
                    <Col
                      span={5}
                      className="account-value-box text-align-right"
                    >
                      <label className="">CREDIT</label>
                    </Col>
                  </Row>
                  {group.accounts.map((account) => (
                    <Row key={account.id}>
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
                          <Input
                            style={{ textAlign: "right" }}
                            onBlur={handleDebitBlur(account.id)}
                          />
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
                          <Input
                            style={{ textAlign: "right" }}
                            onBlur={handleCreditBlur(account.id)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </Collapse.Panel>
              ))}
            </Collapse>
            <Row className="new-manual-journal-table-footer">
              {/* <Col span={1}></Col> */}
              <Col
                span={24}
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
                        style={{ verticalAlign: "middle", width: "30%" }}
                        className="text-align-right"
                      >
                        <FormattedMessage
                          id="label.total"
                          defaultMessage="Total"
                        />
                      </td>
                      <td
                        className="text-align-right"
                        style={{
                          paddingTop: "0.5rem",
                          width: "18%",
                        }}
                      >
                        {totalDebits}
                      </td>
                      <td
                        className="text-align-right"
                        style={{
                          paddingTop: "0.5rem",
                          width: "15%",
                          paddingRight: "1.2rem",
                        }}
                      >
                        {totalCredits}
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="text-align-right"
                        style={{ paddingTop: "0.5rem", color: "var(--red)" }}
                      >
                        <FormattedMessage
                          id="label.openingBalanceAdjustments"
                          defaultMessage="Opening Balance Adjustments"
                        />
                      </td>
                      <td
                        className="text-align-right"
                        style={{
                          paddingTop: "0.5rem",
                          color: "var(--red)",
                        }}
                      >
                        {obAdjustments > 0 && obAdjustments}
                      </td>
                      <td
                        className="text-align-right"
                        style={{
                          paddingTop: "0.5rem",
                          color: "var(--red)",
                          paddingRight: "1.2rem",
                        }}
                      >
                        {obAdjustments <= 0 && -obAdjustments}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-align-right">
                        <div
                          style={{
                            fontSize: "var(--small-text)",
                            opacity: "70%",
                          }}
                        >
                          This account will hold the difference in credit and
                          debit.
                        </div>
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
                        <b>
                          <FormattedMessage
                            id="label.totalAmount"
                            defaultMessage="Total Amount"
                          />
                        </b>
                      </td>
                      <td
                        className="text-align-right"
                        style={{ paddingTop: "0.5rem" }}
                      >
                        <b>{total}</b>
                      </td>
                      <td
                        className="text-align-right"
                        style={{ paddingTop: "0.5rem", paddingRight: "1.2rem" }}
                      >
                        <b>{total}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-align-right">
                        <div
                          style={{
                            fontSize: "var(--small-text)",
                            opacity: "70%",
                          }}
                        >
                          <b>Opening Balance Adjustment account</b>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Col>
            </Row>
            <div className="page-actions-bar page-actions-bar-margin ob-actions-bar">
              <Button
                // loading={loading}
                type="primary"
                htmlType="submit"
                className="page-actions-btn"
                onClick={form.submit}
              >
                <FormattedMessage id="button.save" defaultMessage="Save" />
              </Button>
              <Button
                // loading={loading}
                className="page-actions-btn"
                onClick={() =>
                  navigate(from, { state: location.state, replace: true })
                }
              >
                <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
              </Button>
              {!isBalanceTableVisible && (
                <Flex className="ob-total-floater">
                  <span style={{ wordBreak: "keep-all", color: "var(--red)" }}>
                    Opening Balance Adjustments:{" "}
                  </span>
                  <span style={{ marginRight: "1rem" }}>{obAdjustments}</span>
                  <span style={{ wordBreak: "keep-all" }}>TOTAL AMOUNT: </span>
                  <span> {total}</span>
                </Flex>
              )}
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default OpeningBalancesEdit;
