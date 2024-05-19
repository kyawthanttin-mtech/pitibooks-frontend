import React, { useState, useContext, Suspense } from "react";
import {
  BellOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  TagOutlined,
  DollarOutlined,
  BankOutlined,
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
import { useQuery, useBackgroundQuery } from "@apollo/client";
import { ErrorBoundary, MenuItemWithPlus } from "../components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Theme from "../config/Theme";
import { Context } from "../localeWrapper";
import ErrorPage from "./ErrorPage";
import InitialLoadingPage from "./IntialLoadingPage";

import { ReactComponent as AccountantOutlined } from "../assets/icons/menu-icons/AccountantOutlined.svg";
import { ReactComponent as ShoppingOutlined } from "../assets/icons/menu-icons/ShoppingOutlined.svg";
import { ReactComponent as ReportOutlined } from "../assets/icons/menu-icons/ReportOutlined.svg";

import {
  AccountQueries,
  BranchQueries,
  BusinessQueries,
  CategoryQueries,
  CurrencyQueries,
  StateQueries,
  TaxQueries,
  TownshipQueries,
  WarehouseQueries,
  ProductQueries,
  ShipmentPreferenceQueries,
  PaymentModeQueries,
  ReasonQueries,
  UnitQueries,
  DeliveryMethodQueries,
} from "../graphql";

const { GET_ALL_ACCOUNTS } = AccountQueries;
const { GET_BUSINESS } = BusinessQueries;
const { GET_ALL_BRANCHES } = BranchQueries;
const { GET_ALL_PRODUCT_CATEGORIES } = CategoryQueries;
const { GET_ALL_CURRENCIES } = CurrencyQueries;
const { GET_ALL_STATES } = StateQueries;
const { GET_ALL_TAXES, GET_ALL_TAX_GROUPS } = TaxQueries;
const { GET_ALL_TOWNSHIPS } = TownshipQueries;
const { GET_ALL_WAREHOUSES } = WarehouseQueries;
const { GET_ALL_PRODUCTS, GET_ALL_PRODUCT_VARIANTS } = ProductQueries;
const { GET_ALL_SHIPMENT_PREFERENCES } = ShipmentPreferenceQueries;
const { GET_ALL_PAYMENT_MODES } = PaymentModeQueries;
const { GET_ALL_REASONS } = ReasonQueries;
const { GET_ALL_PRODUCT_UNITS } = UnitQueries;
const { GET_ALL_DELIVERY_METHODS } = DeliveryMethodQueries;

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

  const {
    data,
    loading,
    error,
    refetch: refetchBusiness,
  } = useQuery(GET_BUSINESS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [allAccountsQueryRef, { refetch: refetchAllAccounts }] =
    useBackgroundQuery(GET_ALL_ACCOUNTS);
  const [allBranchesQueryRef, { refetch: refetchAllBranches }] =
    useBackgroundQuery(GET_ALL_BRANCHES);
  const [allCurrenciesQueryRef, { refetch: refetchAllCurrencies }] =
    useBackgroundQuery(GET_ALL_CURRENCIES);
  const [allStatesQueryRef] = useBackgroundQuery(GET_ALL_STATES);
  const [allTaxesQueryRef, { refetch: refetchAllTaxes }] =
    useBackgroundQuery(GET_ALL_TAXES);
  const [allTaxGroupsQueryRef, { refetch: refetchAllTaxGroups }] =
    useBackgroundQuery(GET_ALL_TAX_GROUPS);
  const [allTownshipsQueryRef] = useBackgroundQuery(GET_ALL_TOWNSHIPS);
  const [allWarehousesQueryRef, { refetch: refetchAllWarehouses }] =
    useBackgroundQuery(GET_ALL_WAREHOUSES);
  const [allProductsQueryRef, { refetch: refetchAllProducts }] =
    useBackgroundQuery(GET_ALL_PRODUCTS);
  const [
    allShipmentPreferencesQueryRef,
    { refetch: refetchAllShipmentPreferences },
  ] = useBackgroundQuery(GET_ALL_SHIPMENT_PREFERENCES);
  const [allPaymentModesQueryRef, { refetch: refetchAllPaymentModes }] =
    useBackgroundQuery(GET_ALL_PAYMENT_MODES);
  const [allReasonsQueryRef, { refetch: refetchAllReasons }] =
    useBackgroundQuery(GET_ALL_REASONS);
  const [
    allProductCategoriesQueryRef,
    { refetch: refetchAllProductCategories },
  ] = useBackgroundQuery(GET_ALL_PRODUCT_CATEGORIES);
  const [allProductUnitsQueryRef, { refetch: refetchAllProductUnits }] =
    useBackgroundQuery(GET_ALL_PRODUCT_UNITS);
  const [allDeliveryMethodsQueryRef, { refetch: refetchAllDeliveryMethods }] =
    useBackgroundQuery(GET_ALL_DELIVERY_METHODS);
  const [allProductVariantsQueryRef, { refetch: refetchAllProductVariants }] =
    useBackgroundQuery(GET_ALL_PRODUCT_VARIANTS);

  if (loading) {
    return <InitialLoadingPage />;
  }

  if (error) {
    if (
      error.message.toLowerCase().includes("status code 401") ||
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("access denied")
    ) {
      navigate("/logout", { replace: true });
      return;
    }
    return <ErrorPage error={error} refetch={refetchBusiness} />;
  }

  const business = data.getBusiness;

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
                alt="Pitibooks"
                // src={process.env.PUBLIC_URL + "/mkitchen-logo.svg"}
                src={process.env.PUBLIC_URL + "/pitibooks.png"}
              />
            </div>
          </div>

          <Menu
            style={{
              backgroundColor: Theme.colorPrimary,
            }}
            className="main-menu"
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

              //Products
              {
                key: "productsMenu",
                label: (
                  <FormattedMessage
                    id="menu.products"
                    defaultMessage="Products"
                  />
                ),
                icon: <TagOutlined />,
                children: [
                  {
                    key: "products",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.products"
                            defaultMessage="Products"
                          />
                        }
                        path="products/new"
                      />
                    ),
                  },
                  {
                    key: "productGroups",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.productGroups"
                            defaultMessage="Product Groups"
                          />
                        }
                        path="/productGroups/new"
                      />
                    ),
                  },
                  {
                    key: "inventoryAdjustments",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.inventoryAdjustments"
                            defaultMessage="Inventory Adjustments"
                          />
                        }
                        path="/inventoryAdjustments/new"
                      />
                    ),
                  },
                  {
                    key: "transferOrders",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.transferOrders"
                            defaultMessage="Transfer Orders"
                          />
                        }
                        path="/transferOrders/new"
                      />
                    ),
                  },
                  {
                    key: "productCategories",
                    label: (
                      <FormattedMessage
                        id="menu.productCategories"
                        defaultMessage="Product Categories"
                      />
                    ),
                  },
                  {
                    key: "productUnits",
                    label: (
                      <FormattedMessage
                        id="menu.productUnits"
                        defaultMessage="Product Units"
                      />
                    ),
                  },
                ],
              },
              //Banking
              {
                key: "banking",
                label: (
                  <FormattedMessage
                    id="menu.banking"
                    defaultMessage="Banking"
                  />
                ),
                icon: <BankOutlined width={20} height={20} />,
              },
              // Sales
              {
                key: "sales",
                label: (
                  <FormattedMessage id="menu.sales" defaultMessage="Sales" />
                ),
                icon: <DollarOutlined width={18} height={18} />,
                children: [
                  {
                    key: "customers",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.customers"
                            defaultMessage="Customers"
                          />
                        }
                        path="/customers/new"
                      />
                    ),
                  },
                  {
                    key: "salesOrders",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.salesOrders"
                            defaultMessage="Sales Orders"
                          />
                        }
                        path="/salesOrders/new"
                      />
                    ),
                  },
                  {
                    key: "paymentsReceived",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.paymentsReceived"
                            defaultMessage="Payments Received"
                          />
                        }
                        path="/paymentsReceived/new"
                      />
                    ),
                  },
                  {
                    key: "invoices",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.invoices"
                            defaultMessage="Invoices"
                          />
                        }
                        path="/invoices/new"
                      />
                    ),
                  },
                  {
                    key: "creditNotes",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.creditNotes"
                            defaultMessage="Credit Notes"
                          />
                        }
                        path="/creditNotes/new"
                      />
                    ),
                  },
                ],
              },
              //Purchases
              {
                key: "purchases",
                label: (
                  <FormattedMessage
                    id="menu.purchases"
                    defaultMessage="Purchases"
                  />
                ),
                icon: <ShoppingOutlined width={18} height={18} />,
                children: [
                  {
                    key: "suppliers",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.suppliers"
                            defaultMessage="Suppliers"
                          />
                        }
                        path="/suppliers/new"
                      />
                    ),
                  },
                  {
                    key: "expenses",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.expenses"
                            defaultMessage="Expenses"
                          />
                        }
                        path="/expenses/new"
                      />
                    ),
                  },
                  {
                    key: "purchaseOrders",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.purchaseOrders"
                            defaultMessage="Purchase Orders"
                          />
                        }
                        path="/purchaseOrders/new"
                      />
                    ),
                  },
                  {
                    key: "bills",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.bills"
                            defaultMessage="Bills"
                          />
                        }
                        path="/bills/new"
                      />
                    ),
                  },
                  {
                    key: "paymentsMade",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.paymentsMade"
                            defaultMessage="Payments Made"
                          />
                        }
                        path="/paymentsMade/new"
                      />
                    ),
                  },
                  {
                    key: "supplierCredits",
                    label: (
                      <MenuItemWithPlus
                        label={
                          <FormattedMessage
                            id="menu.supplierCredits"
                            defaultMessage="Supplier Credits"
                          />
                        }
                        path="/supplierCredits/new"
                      />
                    ),
                  },
                ],
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
                        defaultMessage="Chart of Accounts"
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
                    key: "warehouses",
                    label: (
                      <FormattedMessage
                        id="menu.warehouses"
                        defaultMessage="Warehouses"
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
                    key: "currencies",
                    label: (
                      <FormattedMessage
                        id="menu.currencies"
                        defaultMessage="Currencies"
                      />
                    ),
                  },
                  {
                    key: "openingBalances",
                    label: (
                      <FormattedMessage
                        id="menu.openingBalances"
                        defaultMessage="Opening Balances"
                      />
                    ),
                  },
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
                  {
                    key: "users",
                    label: (
                      <FormattedMessage
                        id="menu.users"
                        defaultMessage="Users"
                      />
                    ),
                  },
                  {
                    key: "roles",
                    label: (
                      <FormattedMessage
                        id="menu.roles"
                        defaultMessage="Roles"
                      />
                    ),
                  },
                  {
                    key: "shipmentPreferences",
                    label: (
                      <FormattedMessage
                        id="menu.shipmentPreferences"
                        defaultMessage="Shipment Preferences"
                      />
                    ),
                  },
                  {
                    key: "paymentModes",
                    label: (
                      <FormattedMessage
                        id="menu.paymentModes"
                        defaultMessage="Payment Modes"
                      />
                    ),
                  },
                  {
                    key: "deliveryMethods",
                    label: (
                      <FormattedMessage
                        id="menu.deliveryMethods"
                        defaultMessage="Delivery Methods"
                      />
                    ),
                  },
                  {
                    key: "reasons",
                    label: (
                      <FormattedMessage
                        id="menu.reasons"
                        defaultMessage="Reasons"
                      />
                    ),
                  },
                  {
                    key: "salesPersons",
                    label: (
                      <FormattedMessage
                        id="menu.salesPersons"
                        defaultMessage="Sales Persons"
                      />
                    ),
                  },
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
              <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <Suspense fallback={<InitialLoadingPage />}>
                  <Outlet
                    context={{
                      notiApi,
                      msgApi,
                      business,
                      refetchBusiness,
                      allAccountsQueryRef,
                      refetchAllAccounts,
                      allBranchesQueryRef,
                      refetchAllBranches,
                      allCurrenciesQueryRef,
                      refetchAllCurrencies,
                      allStatesQueryRef,
                      allTownshipsQueryRef,
                      allTaxesQueryRef,
                      refetchAllTaxes,
                      allTaxGroupsQueryRef,
                      refetchAllTaxGroups,
                      allWarehousesQueryRef,
                      refetchAllWarehouses,
                      allProductsQueryRef,
                      refetchAllProducts,
                      allShipmentPreferencesQueryRef,
                      refetchAllShipmentPreferences,
                      allPaymentModesQueryRef,
                      refetchAllPaymentModes,
                      allReasonsQueryRef,
                      refetchAllReasons,
                      allProductCategoriesQueryRef,
                      refetchAllProductCategories,
                      allProductUnitsQueryRef,
                      refetchAllProductUnits,
                      allDeliveryMethodsQueryRef,
                      refetchAllDeliveryMethods,
                      allProductVariantsQueryRef,
                      refetchAllProductVariants,
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
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
