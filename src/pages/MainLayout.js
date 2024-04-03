import React, { useState, useContext } from "react";
import {
  BellOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Layout,
  Menu,
  message,
  notification,
  Row,
  Space,
  Switch,
} from "antd";
import { MenuItemWithPlus } from "../components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Theme from "../config/Theme";
import { Context } from "../localeWrapper";

import { ReactComponent as AccountantOutlined } from "../assets/icons/menu-icons/AccountantOutlined.svg";
import { ReactComponent as ReportOutlined } from "../assets/icons/menu-icons/ReportOutlined.svg";

const { Header, Content, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentMenuItem = location.pathname ? location.pathname : "main";
  const [notiApi, notiCtxHolder] = notification.useNotification();
  const [msgApi, msgCtxHolder] = message.useMessage();
  const name = localStorage.getItem("name");
  const language = useContext(Context);

  // Extracting submenu keys
  const [openKeys, setOpenKeys] = useState([]);

  const onOpenChange = (keys) => {
    setOpenKeys(keys.slice(-1)); // Keep only the last key opened
  };

  const isActiveRoute = (routePath) => {
    return location.pathname === routePath;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: Theme.colorPrimary,
          colorInfo: Theme.colorInfo,
        },
      }}
    >
      {notiCtxHolder}
      {msgCtxHolder}
      <Layout className="main-layout">
        <Sider
          style={{ backgroundColor: Theme.colorPrimary }}
          breakpoint="lg"
          collapsedWidth="0"
          width="17rem"
          height="100vh"
          onBreakpoint={(broken) => {
            if (broken) setCollapsed(true);
          }}
          trigger={null}
          collapsible={true}
          collapsed={collapsed}
        >
          {/* <div className="demo-logo-vertical" /> */}
          <div className="app-logo-container">
            <div className="app-logo">
              <img
                alt="Piti"
                src={process.env.PUBLIC_URL + "/piti.jpeg"}
              />
            </div>
          </div>

          <Menu
            style={{
              backgroundColor: Theme.colorPrimary,
            }}
            color={Theme.bgColorPrimary}
            mode="inline"
            defaultSelectedKeys={"Home"}
            selectedKeys={[currentMenuItem]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onClick={(item) =>
              navigate(item.key === "home" ? "/" : item.key, {
                state: { ...location.state },
              })
            }
            items={[
              {
                key: "home",
                style: isActiveRoute("/")
                  ? { backgroundColor: Theme.darkGreen }
                  : {},
                icon: <HomeOutlined />,
                label: (
                  <FormattedMessage id="menu.home" defaultMessage="Home" />
                ),
              },
              //Accountant
              {
                key: "accountant",
                label: (
                  <FormattedMessage
                    id="menu.accountant"
                    defaultMessage="Accountant"
                  />
                ),
                icon: <AccountantOutlined width={20} height={20} />,
                children: [
                  {
                    key: "manualJournals",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.manualJournals"
                            defaultMessage="Manual Journals"
                          />
                        }
                        path="/manualJournals/new"
                      />
                    ),
                  },

                  {
                    key: "chartOfAccounts",
                    label: (
                      <FormattedMessage
                        id="menu.chartOfAccounts"
                        defaultMessage="Chart of Accountants"
                      />
                    ),
                  },
                ],
              },
              //Reports
              {
                key: "reports",
                label: (
                  <FormattedMessage
                    id="menu.reports"
                    defaultMessage="Reports"
                  />
                ),
                icon: <ReportOutlined width={20} height={20} />,
              },
              //Settings
              {
                key: "settings",
                label: (
                  <FormattedMessage
                    id="menu.settings"
                    defaultMessage="Settings"
                  />
                ),
                icon: <SettingOutlined />,
                children: [
                  {
                    key: "profile",
                    label: (
                      <FormattedMessage
                        id="menu.profile"
                        defaultMessage="Profile"
                      />
                    ),
                  },
                  {
                    key: "branch",
                    label: (
                      <FormattedMessage
                        id="menu.branch"
                        defaultMessage="Branches"
                      />
                    ),
                  },
                  {
                    key: "warehouses",
                    label: (
                      <FormattedMessage
                        id="menu.warehouses"
                        defaultMessage="Warehouses"
                      />
                    ),
                  },
                  {
                    key: "currencies",
                    label: (
                      <FormattedMessage
                        id="menu.currencies"
                        defaultMessage="Currencies"
                      />
                    ),
                  },
                  // {
                  //   key: "openingBalances",
                  //   label: (
                  //     <FormattedMessage
                  //       id="menu.openingBalances"
                  //       defaultMessage="Opening Balances"
                  //     />
                  //   ),
                  // },
                  {
                    key: "transactionNumberSeries",
                    label: (
                      <FormattedMessage
                        id="menu.transactionNumberSeries"
                        defaultMessage="Transaction Number Series"
                      />
                    ),
                  },
                  {
                    key: "taxes",
                    label: (
                      <FormattedMessage
                        id="menu.taxes"
                        defaultMessage="Taxes"
                      />
                    ),
                  },
                  // {
                  //   key: "users",
                  //   label: (
                  //     <FormattedMessage
                  //       id="menu.users"
                  //       defaultMessage="Users"
                  //     />
                  //   ),
                  // },
                  // {
                  //   key: "roles",
                  //   label: (
                  //     <FormattedMessage
                  //       id="menu.roles"
                  //       defaultMessage="Roles"
                  //     />
                  //   ),
                  // },
                ],
              },
            ]}
          ></Menu>
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: Theme.bgColor,
              marginBottom: 1,
              height: "5rem",
            }}
          >
            <Row style={{ justifyContent: "space-between", marginRight: 10 }}>
              <Space size="middle">
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                    marginTop: "4px",
                  }}
                />
                <Switch
                  checkedChildren={
                    <FormattedMessage
                      id="locale.english"
                      defaultMessage="English"
                    />
                  }
                  unCheckedChildren={
                    <FormattedMessage
                      id="locale.myanmar"
                      defaultMessage="မြန်မာ"
                    />
                  }
                  checked={language.locale === "en" ? true : false}
                  onChange={(checked) =>
                    language.selectLanguage(checked ? "en" : "mm")
                  }
                />
              </Space>
              <Space size="middle">
                <Badge count={1} overflowCount={99}>
                  <Avatar
                    style={{ backgroundColor: Theme.colorPrimary }}
                    shape="square"
                    icon={<BellOutlined />}
                  />
                </Badge>
                <Dropdown.Button
                  type="primary"
                  icon={<UserOutlined />}
                  menu={{
                    items: [
                      {
                        key: "1",
                        label: (
                          <FormattedMessage
                            id="action.changePassword"
                            defaultMessage="Change Password"
                          />
                        ),
                      },
                      {
                        key: "2",
                        label: (
                          <FormattedMessage
                            id="action.logout"
                            defaultMessage="Log Out"
                          />
                        ),
                      },
                    ],
                    onClick: ({ key }) => {
                      // if (key === '1') navigate('/changepassword', navigate('new', {state: {...location.state, from: {pathname: location.pathname}}}));
                      if (key === "2") navigate("/logout", { replace: true });
                    },
                  }}
                >
                  {name || "User"}
                </Dropdown.Button>
              </Space>
            </Row>
          </Header>
          <Content
          // style={{
          //   margin: '24px 16px 0',
          // }}
          >
            <div
              style={{
                minHeight: 360,
                background: Theme.bgColorPrimary,
                height: "100%",
                overflow: "auto",
              }}
            >
              <Outlet context={[notiApi, msgApi]} />
            </div>
          </Content>
          {/* <Footer
            style={{
              textAlign: 'center',
            }}
          >
            MKitchen Distribution System ©2023
          </Footer> */}
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
export default App;
