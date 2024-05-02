import React, { useState, useMemo } from "react";
import "./PurchaseOrdersNew.css";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Radio,
  Divider,
  Flex,
  Row,
  Col,
  Dropdown,
  Modal,
  Space,
  AutoComplete,
} from "antd";
import {
  CloseCircleOutlined,
  PlusCircleFilled,
  UploadOutlined,
  CloseOutlined,
  DownOutlined,
  SearchOutlined,
  CaretDownFilled,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import {
  PaginatedTable,
  SupplierSearchModal,
  AddPurchaseProductsModal,
} from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { ReactComponent as ImageOutlined } from "../../assets/icons/ImageOutlined.svg";
import { ReactComponent as TaxOutlined } from "../../assets/icons/TaxOutlined.svg";
import { ReactComponent as PercentageOutlined } from "../../assets/icons/PercentageOutlined.svg";
import {
  // JournalQueries,
  JournalMutations,
  AccountQueries,
  CurrencyQueries,
  BranchQueries,
  WarehouseQueries,
  SupplierQueries,
} from "../../graphql";
import { useApolloClient } from "@apollo/client";

// const { GET_JOURNALS } = JournalQueries;
const { CREATE_JOURNAL } = JournalMutations;
const { GET_ALL_ACCOUNTS } = AccountQueries;
const { GET_ALL_CURRENCIES } = CurrencyQueries;
const { GET_ALL_BRANCHES } = BranchQueries;
const { GET_WAREHOUSES, GET_WAREHOUSE } = WarehouseQueries;
const { GET_PAGINATE_SUPPLIER } = SupplierQueries;

const paymentTerms = [
  "Net15",
  "Net30",
  "Net45",
  "Net60",
  "DueMonthEnd",
  "DueNextMonthEnd",
  "DueOnReceipt",
  "Custom",
];

const initialValues = {
  paymentTerms: "DueOnReceipt",
  purchaseOrderNumber: "auto",
};

const discountTypes = [
  {
    key: "0",
    label: "At Transaction Level",
  },
  {
    key: "1",
    label: "At Line Item Level",
  },
];

const taxPreferences = [
  {
    key: "0",
    label: "Tax Exclusive",
  },
  {
    key: "1",
    label: "Tax Inclusive",
  },
];
const items = [
  {
    id: "S1",
    productName: "Cake (Purple)",
    sku: "123456",
    stockOnHand: "44.0",
  },
  { id: "G2", productName: "Shirt", sku: "823456", stockOnHand: "45.0" },
  { id: "G3", productName: "Pants", sku: "123756", stockOnHand: "56.0" },
  { id: "G4", productName: "Shirt", sku: "000000", stockOnHand: "3.0" },
  {
    id: "S2",
    productName: "Cake (Pink)",
    sku: "173456",
    stockOnHand: "0.0",
  },
  {
    id: "C1",
    productName: "Hat",
    sku: "143456",
    stockOnHand: "0.0",
  },
  {
    id: "C2",
    productName: "Cup",
    sku: "143656",
    stockOnHand: "122",
  },
  {
    id: "C3",
    productName: "Hat",
    sku: "343434",
    stockOnHand: "0.0",
  },
];

const PurchaseOrdersNew = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([{ key: 1 }]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const {notiApi} = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const client = useApolloClient();
  const [discountType, setDiscountType] = useState({
    key: "0",
    label: "At Transaction Level",
  });
  const [taxPreference, setTaxPreference] = useState({
    key: "0",
    label: "Tax Exclusive",
  });
  const [addProductsModalOpen, setAddPurchaseProductsModalOpen] = useState(false);

  // Queries
  const { data: branchData, loading: branchLoading } = useQuery(
    GET_ALL_BRANCHES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: accountData, loading: accountLoading } = useQuery(
    GET_ALL_ACCOUNTS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: currencyData, loading: currencyLoading } = useQuery(
    GET_ALL_CURRENCIES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: warehouseData, loading: warehouseLoading } = useQuery(
    GET_WAREHOUSES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  // Mutations
  const [createJournal, { loading: createLoading }] = useMutation(
    CREATE_JOURNAL,
    {
      onCompleted() {
        openSuccessNotification(
          notiApi,
          <FormattedMessage
            id="purchaseOrder.created"
            defaultMessage="New Purchase Order Created"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading =
    branchLoading || currencyLoading || createLoading || warehouseLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const accounts = useMemo(() => {
    return accountData?.listAllAccount?.filter((acc) => acc.isActive === true);
  }, [accountData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const onFinish = (values) => {
    // console.log("values", values);
    const transactions = data.map((item) => ({
      accountId: values[`account${item.key}`],
      debit: parseFloat(values[`debit${item.key}`]) || 0,
      credit: parseFloat(values[`credit${item.key}`]) || 0,
      description: values[`description${item.key}`],
    }));

    const input = {
      referenceNumber: values.referenceNumber,
      journalDate: values.date,
      journalNotes: values.notes,
      branchId: values.branch,
      currencyId: values.currency,
      transactions,
    };
    // console.log("Transactions", transactions);
    // console.log("Input", input);
    createJournal({
      variables: { input },
    });
  };

  const handleAddRow = () => {
    const newRowKey = data.length + 1;
    setData([...data, { key: newRowKey }]);
  };

  const handleRemoveRow = (keyToRemove) => {
    const newData = data.filter((item) => item.key !== keyToRemove);
    setData(newData);
  };

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    form.setFieldsValue({ supplierName: record.name });
  };

  const handleWarehouseSelectChange = async (value) => {
    if (value) {
      try {
        const { data: warehouseAddressData, loading: addressLoading } =
          await client.query({
            query: GET_WAREHOUSE,
            variables: { id: value },
          });

        if (
          !addressLoading &&
          warehouseAddressData &&
          warehouseAddressData.getWarehouse
        ) {
          const warehouseAddress = warehouseAddressData.getWarehouse.address;

          // Update delivery address field with fetched address
          form.setFieldsValue({ deliveryAddress: warehouseAddress });
        }
      } catch (error) {
        console.error("Error fetching warehouse address:", error);
      }
    }
  };

  const handleTaxPreferenceChange = (key) => {
    const taxPreference = taxPreferences.find((option) => option.key === key);
    setTaxPreference(taxPreference);
  };
  const handleDiscountTypeChange = (key) => {
    console.log("kee", typeof key);
    const discountType = discountTypes.find((option) => option.key === key);
    console.log(discountType);
    setDiscountType(discountType);
  };

  const columns = [
    // {
    //   title: "Product Details",
    //   dataIndex: "itemImg",
    //   key: "itemImg",
    //   width: "5%",
    //   colSpan: 2,
    //   render: () => <ImageOutlined style={{ opacity: "50%" }} />,
    // },
    {
      title: "Product Details",
      dataIndex: "productName",
      key: "productName",
      width: "20%",
      render: (text, record) => {
        return text ? (
          <div>
            <Flex justify="space-between">
              {text}
              <CloseCircleOutlined
              // onClick={() => handleRemoveSelectedItem(record.id)}
              />
            </Flex>
            <div>SKU: {record.sku}</div>
          </div>
        ) : (
          <Form.Item name={`product${record.key}`}>
            <AutoComplete
              style={{
                width: 200,
              }}
              // options={options}
              placeholder="Type to add item"
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
              }
            />
            {/* <AutoSuggest
              items={items}
              onSelect={handleSelectItem}
              rowKey={record.key}
            /> */}
          </Form.Item>
        );
      },
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      width: "10%",
      render: (_, record) => (
        <Form.Item name={`account${record.key}`}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={
              <FormattedMessage
                id="label.account.placeholder"
                defaultMessage="Select an account"
              />
            }
          >
            {accounts?.map((account) => (
              <Select.Option
                key={account.id}
                value={account.id}
                label={account.name}
              >
                {account.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      render: (text, record) => (
        <Form.Item name={`quantity${record.key}`}>
          <Input
            value={text ? text.toFixed(2) : "1.00"}
            className="text-align-right "
          />
        </Form.Item>
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      width: "10%",
      render: (text, record) => (
        <Form.Item name={`rate${record.key}`}>
          <Input
            value={text ? text.toFixed(2) : "1.00"}
            className="text-align-right "
          />
        </Form.Item>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      width: "10%",
      hidden: discountType.key === "0",
      render: (text, record) => (
        <Form.Item name="discount">
          <Input
            addonAfter={
              <Select defaultValue=".com">
                <Select.Option value=".com">%</Select.Option>
                <Select.Option value=".jp">MMK</Select.Option>
              </Select>
            }
          />
        </Form.Item>
      ),
    },
    {
      title: "Tax",
      dataIndex: "tax",
      key: "tax",
      width: "10%",
      render: (_, record) => (
        <Form.Item name={`tax${record.key}`}>
          <Select showSearch className="custom-select">
            {/* {warehouseOptions.map((option) => (
              <Select.Option value={option} key={option}></Select.Option>
            ))} */}
          </Select>
        </Form.Item>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
      // render: (text, record) => (
      //   <Form.Item name={`account${record.key}`}>
      //     <Input
      //       value={text ? text.toFixed(2) : "1.00"}
      //       className="text-align-right"
      //     />
      //   </Form.Item>
      // ),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "3%",
      render: (_, record) => (
        <CloseCircleOutlined
          style={{ color: "red" }}
          onClick={() => handleRemoveRow(record.key)}
        />
      ),
    },
  ];

  return (
    <>
      <SupplierSearchModal
        modalOpen={searchModalOpen}
        setModalOpen={setSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />
      <AddPurchaseProductsModal
        data={data}
        setData={setData}
        isOpen={addProductsModalOpen}
        setIsOpen={setAddPurchaseProductsModalOpen}
        onCancel={() => setAddPurchaseProductsModalOpen(false)}
        items={items}
        onAddItems={(selectedItems, quantity) => {
          console.log("Selected Items:", selectedItems);
          console.log("Quantity:", quantity);
        }}
      />
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="supplierCredits.new"
            defaultMessage="New Supplier Credit"
          />
        </p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        />
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <Form form={form} onFinish={onFinish} initialValues={initialValues}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.supplierName"
                defaultMessage="Supplier Name"
              />
            }
            name="supplierName"
            shouldUpdate
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
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
            <Input
              className="search-input"
              disabled={!selectedSupplier}
              suffix={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  className="search-btn"
                  onClick={setSearchModalOpen}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
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
            <Select allowClear showSearch optionFilterProp="label">
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
          <Form.Item
            label={
              <FormattedMessage
                id="label.deliveryAddress"
                defaultMessage="Delivery Address"
              />
            }
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            labelAlign="left"
            name="deliveryWarehouse"
          >
            <Select
              placeholder="Select or type to add"
              showSearch
              allowClear
              loading={loading}
              optionFilterProp="label"
              onChange={handleWarehouseSelectChange}
            >
              {warehouses?.map((w) => (
                <Select.Option key={w.id} value={w.id} label={w.name}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5, offset: 3 }}
            labelAlign="left"
            name="deliveryAddress"
          >
            <TextArea rows={4} />
          </Form.Item>
          {/* <Form.Item
            label={
              <FormattedMessage
                id="label.purchaseOrderNumber"
                defaultMessage="Purchase Order #"
              />
            }
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            labelAlign="left"
            name="purchaseOrderNumber"
          >
            <Radio.Group>
              <Radio value="auto"> Auto </Radio>
              <Radio value="manual"> Manual </Radio>
            </Radio.Group>
          </Form.Item> */}
          <Form.Item
            label={
              <FormattedMessage
                id="label.referenceNumber"
                defaultMessage="Reference #"
              />
            }
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="label.date" defaultMessage="Date" />}
            name="date"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.date.required"
                    defaultMessage="Select the Date"
                  />
                ),
              },
            ]}
          >
            <DatePicker
              onChange={(date, dateString) => console.log(date, dateString)}
            ></DatePicker>
          </Form.Item>
          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.deliveryDate"
                    defaultMessage="Expected Delivery Date"
                  />
                }
                name="deliveryDate"
                labelAlign="left"
                labelCol={{ span: 9 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.date.required"
                        defaultMessage="Select the Date"
                      />
                    ),
                  },
                ]}
              >
                <DatePicker
                  onChange={(date, dateString) => console.log(date, dateString)}
                ></DatePicker>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paymentTerms"
                    defaultMessage="Payment Terms"
                  />
                }
                name="paymentTerms"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select
                  placeholder="Select or type to add"
                  showSearch
                  allowClear
                  loading={loading}
                  optionFilterProp="label"
                >
                  {paymentTerms?.map((p) => (
                    <Select.Option key={p} value={p} label={p}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={
              <FormattedMessage
                id="label.shipmentPreference"
                defaultMessage="Shipment Preference"
              />
            }
            name="shipmentPreference"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
          >
            <Select></Select>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.currency" defaultMessage="Currency" />
            }
            name="currency"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.currency.required"
                    defaultMessage="Select the Currency"
                  />
                ),
              },
            ]}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {currencyData?.listAllCurrency.map((currency) => (
                <Select.Option
                  key={currency.id}
                  value={currency.id}
                  label={currency.name}
                >
                  {currency.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Flex
            style={{
              height: "5rem",
              background: "var(--main-bg-color)",
              paddingInline: "1.5rem",
            }}
            align="center"
          >
            <Space>
              <Form.Item
                style={{ margin: 0 }}
                name="warehouse"
                label={
                  <FormattedMessage
                    id="label.warehouse"
                    defaultMessage="Warehouse"
                  />
                }
              >
                <Select
                  placeholder="Select Warehouse"
                  showSearch
                  allowClear
                  loading={loading}
                  optionFilterProp="label"
                >
                  {warehouses?.map((w) => (
                    <Select.Option key={w.id} value={w.id} label={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Divider type="vertical" />
              <Form.Item style={{ margin: 0 }}>
                <Dropdown
                  trigger="click"
                  style={{ height: "2.5rem" }}
                  menu={{
                    items: taxPreferences?.map((item) => ({
                      ...item,
                      onClick: ({ key }) => handleTaxPreferenceChange(key),
                    })),
                    selectable: true,
                    selectedKeys: [taxPreference.key],
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <span
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <TaxOutlined style={{ width: "18", height: "18" }} />
                      </span>
                      {taxPreference.label}
                      <DownOutlined />
                    </Space>
                  </div>
                </Dropdown>
              </Form.Item>
              <Divider type="vertical" />
              <Form.Item style={{ margin: 0 }}>
                <Dropdown
                  trigger="click"
                  style={{ height: "2.5rem" }}
                  menu={{
                    items: discountTypes?.map((item) => ({
                      ...item,
                      onClick: ({ key }) => handleDiscountTypeChange(key),
                    })),
                    selectable: true,
                    selectedKeys: [discountType.key],
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Space style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <PercentageOutlined
                          style={{ width: "18", height: "18" }}
                        />
                      </span>
                      {discountType.label}
                      <DownOutlined />
                    </Space>
                  </div>
                </Dropdown>
              </Form.Item>
            </Space>
          </Flex>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            className="item-details-table"
          />
          <br />
          <Button
            icon={<PlusCircleFilled className="plus-circle-icon" />}
            onClick={handleAddRow}
            className="add-row-item-btn"
          >
            Add New Row
          </Button>
          <Divider type="vertical" />
          <Button
            icon={<PlusCircleFilled className="plus-circle-icon" />}
            className="add-row-item-btn"
            onClick={() => setAddPurchaseProductsModalOpen(true)}
          >
            Add Products In Bulk
          </Button>
          <Row className="new-manual-journal-table-footer">
            <Col lg={8}>
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "normal",
                }}
              >
                <Form.Item style={{ margin: 0, width: "100%" }}>
                  <label>Customer Notes</label>
                  <TextArea rows={4}></TextArea>
                </Form.Item>
              </div>
            </Col>
            <Col
              lg={12}
              offset={4}
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <table cellSpacing="0" border="0" width="100%" id="balance-table">
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", width: "20%" }}>
                      <FormattedMessage
                        id="label.subTotal"
                        defaultMessage="Sub Total"
                      />
                    </td>

                    <td
                      className="text-align-right"
                      style={{ width: "20%" }}
                      colSpan={2}
                    >
                      0.00
                    </td>
                  </tr>
                  {discountType.key === "0" && (
                    <tr>
                      <td>
                        <FormattedMessage
                          id="label.discount"
                          defaultMessage="Discount"
                        />
                      </td>
                      <td style={{ width: "20%" }} offset={10}>
                        <Form.Item name="discount" style={{ margin: 0 }}>
                          <Input
                            addonAfter={
                              <Select defaultValue=".com">
                                <Select.Option value=".com">%</Select.Option>
                                <Select.Option value=".jp">MMK</Select.Option>
                              </Select>
                            }
                          />
                        </Form.Item>
                      </td>
                      <td className="text-align-right" style={{ width: "20%" }}>
                        0.00
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td>Adjustment</td>
                    <td style={{ width: "20%" }} offset={10}>
                      <Form.Item name="adjustment" style={{ margin: 0 }}>
                        <Input></Input>
                      </Form.Item>
                    </td>
                    <td className="text-align-right" style={{ width: "20%" }}>
                      0.00
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="label.total"
                        defaultMessage="Total"
                      />
                    </td>
                    <td className="text-align-right" colSpan="2">
                      0.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <div className="attachment-upload">
            <p>
              <FormattedMessage
                id="label.attachments"
                defaultMessage="Attachments"
              />
            </p>
            <Button
              type="dashed"
              icon={<UploadOutlined />}
              className="attachment-upload-button"
            >
              <FormattedMessage
                id="button.uploadFile"
                defaultMessage="Upload File"
              />
            </Button>
            <p>
              <FormattedMessage
                id="label.uploadLimit"
                defaultMessage="You can upload a maximum of 5 files, 5MB each"
              />
            </p>
          </div>
        </Form>
      </div>
      <div className="page-actions-bar">
        <Button
          loading={createLoading}
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          onClick={form.submit}
        >
          <FormattedMessage id="button.save" defaultMessage="Save" />
        </Button>
        {/* <Button className="page-actions-btn">Save as Draft</Button> */}
        <Button
          className="page-actions-btn"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        >
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </div>
    </>
  );
};

export default PurchaseOrdersNew;
