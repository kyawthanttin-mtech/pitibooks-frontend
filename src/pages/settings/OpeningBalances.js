import React, { useMemo } from "react";
import {
  Button,
  Col,
  Collapse,
  Divider,
  Flex,
  Input,
  Row,
  Space,
  theme,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useReadQuery } from "@apollo/client";
import { ReactComponent as DiamondOutlined } from "../../assets/icons/DiamondOutlined.svg";
import { ReactComponent as ArrowDownwardOutlined } from "../../assets/icons/ArrowDownwardOutlined.svg";
import { ReactComponent as ArrowUpwardOutlined } from "../../assets/icons/ArrowUpwardOutlined.svg";
import { ReactComponent as BankAltOutlined } from "../../assets/icons/BankAltOutlined.svg";
import { ReactComponent as SavingsOutlined } from "../../assets/icons/SavingsOutlined.svg";
import { ReactComponent as ReceiptOutlined } from "../../assets/icons/ReceiptOutlined.svg";
import { ReactComponent as WalletOutlined } from "../../assets/icons/WalletOutlined.svg";
import { ReactComponent as PoliceOutlined } from "../../assets/icons/PoliceOutlined.svg";

const OpeningBalances = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { allAccountsQueryRef } = useOutletContext();

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);

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

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Opening Balances</p>
        <Space>
          <Button
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
            style={{ background: "var(--main-bg-color)" }}
          >
            <span>
              <FormattedMessage id="button.edit" defaultMessage="Edit" />
            </span>
          </Button>
          <Button
            icon={<DeleteOutlined />}
            style={{ background: "var(--main-bg-color)" }}
          />
        </Space>
      </div>
      <div className="page-content page-content-with-padding">
        <div className="ob-page-form-wrapper">
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
                  <label>Branch</label>
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
                  <p style={{ marginBottom: "5px" }}>Inventory Asset</p>
                  <div style={{ opacity: "70%" }}>
                    <span>Name: Shampoo(shampoo)</span>
                    <Divider type="vertical" />
                    <span>Stock: 123</span>
                    <Divider type="vertical" />
                    <span>Rate: 2000</span>
                  </div>
                </Col>
                <Col span={4} className="account-value-box">
                  Primary Branch
                </Col>
                <Col span={5} className="account-value-box text-align-right">
                  0
                </Col>
                <Col span={5} className="account-value-box text-align-right">
                  0
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
                  <label>Branch</label>
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
                  <p style={{ marginBottom: "5px" }}>Inventory Asset</p>
                  <div style={{ opacity: "70%" }}>
                    <span>Name: Shampoo(shampoo)</span>
                    <Divider type="vertical" />
                    <span>Stock: 123</span>
                    <Divider type="vertical" />
                    <span>Rate: 2000</span>
                  </div>
                </Col>
                <Col span={4} className="account-value-box">
                  Primary Branch
                </Col>
                <Col span={5} className="account-value-box text-align-right">
                  0
                </Col>
                <Col span={5} className="account-value-box text-align-right">
                  0
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
                    <label>Branch</label>
                  </Col>
                  <Col span={5} className="account-value-box text-align-right">
                    <label>DEBIT</label>
                  </Col>
                  <Col span={5} className="account-value-box text-align-right">
                    <label className="">CREDIT</label>
                  </Col>
                </Row>
                {group.accounts.map((account) => (
                  <Row key={account.id}>
                    <Col span={9} className="account-value-box">
                      <p style={{ marginBottom: "5px" }} key={account.id}>
                        Inventory Asset
                      </p>
                      <div style={{ opacity: "70%", marginBottom: "1rem" }}>
                        <span>Name: Shampoo(shampoo)</span>
                        <Divider type="vertical" />
                        <span>Stock: 123</span>
                        <Divider type="vertical" />
                        <span>Rate: 2000</span>
                      </div>
                    </Col>
                    <Col span={4} className="account-value-box">
                      Primary Branch
                    </Col>
                    <Col
                      span={5}
                      className="account-value-box text-align-right"
                    >
                      0
                    </Col>
                    <Col
                      span={5}
                      className="account-value-box text-align-right"
                    >
                      0
                    </Col>
                  </Row>
                ))}
              </Collapse.Panel>
            ))}
          </Collapse>
          <div className="ob-total-section">
            <Row>
              <Col span={9} className="account-value-box"></Col>
              <Col span={4} className="account-value-box ">
                <b>TOTAL:</b>
              </Col>
              <Col span={5} className="account-value-box text-align-right">
                0
              </Col>
              <Col span={5} className="account-value-box text-align-right">
                0
              </Col>
            </Row>
          </div>
          {/* </Col>
          </Row> */}
        </div>
      </div>
    </>
  );
};

export default OpeningBalances;
