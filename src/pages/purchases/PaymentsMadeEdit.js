import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Divider,
  Flex,
  Row,
  Col,
  Dropdown,
  InputNumber,
  Space,
  AutoComplete,
  Checkbox,
} from "antd";
import {
  CloseCircleOutlined,
  PlusCircleFilled,
  UploadOutlined,
  CloseOutlined,
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import { SupplierSearchModal } from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  AccountQueries,
  CurrencyQueries,
  BranchQueries,
  WarehouseQueries,
  SupplierQueries,
  ProductQueries,
  TaxQueries,
  ShipmentPreferenceQueries,
  PurchaseOrderMutations,
} from "../../graphql";
import { useApolloClient } from "@apollo/client";

const { CREATE_PURCHASE_ORDER } = PurchaseOrderMutations;
const { GET_ALL_ACCOUNTS } = AccountQueries;
const { GET_ALL_CURRENCIES } = CurrencyQueries;
const { GET_ALL_BRANCHES } = BranchQueries;
const { GET_WAREHOUSES, GET_WAREHOUSE } = WarehouseQueries;
const { GET_ALL_PRODUCTS } = ProductQueries;
const { GET_ALL_SHIPMENT_PREFERENCES } = ShipmentPreferenceQueries;
const { GET_TAXES, GET_TAX_GROUPS } = TaxQueries;
const { GET_PAGINATE_SUPPLIER } = SupplierQueries;

const initialValues = {
  paymentTerms: "DueOnReceipt",
  purchaseOrderNumber: "auto",
};

const PaymentsMadeNew = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([{ key: 1, amount: 0 }]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { notiApi } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const client = useApolloClient();

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

  const { data: productData, loading: productLoading } = useQuery(
    GET_ALL_PRODUCTS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: taxData, loading: taxLoading } = useQuery(GET_TAXES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: taxGroupData, loading: taxGroupLoading } = useQuery(
    GET_TAX_GROUPS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: shipmentPreferenceData, loading: shipmentPreferenceLoading } =
    useQuery(GET_ALL_SHIPMENT_PREFERENCES, {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    });

  // Mutations
  const [createPO, { loading: createLoading }] = useMutation(
    CREATE_PURCHASE_ORDER,
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
    branchLoading ||
    currencyLoading ||
    createLoading ||
    warehouseLoading ||
    accountLoading ||
    taxLoading ||
    taxGroupLoading ||
    productLoading ||
    shipmentPreferenceLoading;

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

  const products = useMemo(() => {
    return productData?.listAllProduct?.filter((p) => p.isActive === true);
  }, [productData]);

  const shipmentPreferences = useMemo(() => {
    return shipmentPreferenceData?.listAllShipmentPreference?.filter(
      (s) => s.isActive === true
    );
  }, [shipmentPreferenceData]);

  const taxes = useMemo(() => {
    return taxData?.listTax?.filter((tax) => tax.isActive === true);
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listTaxGroup?.filter((tax) => tax.isActive === true);
  }, [taxGroupData]);

  const allTax = [
    {
      title: "Tax",
      taxes: taxes
        ? [...taxes.map((tax) => ({ ...tax, id: "I" + tax.id }))]
        : [],
    },
    {
      title: "Tax Group",
      taxes: taxGroups
        ? [
            ...taxGroups.map((group) => ({
              ...group,
              id: "G" + group.id,
            })),
          ]
        : [],
    },
  ];

  const onFinish = (values) => {};

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    form.setFieldsValue({ supplierName: record.name });
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "date",
      key: "date",
      render: (text, record) => <></>,
    },
    {
      title: "Bill#",
      dataIndex: "billNumber",
      key: "billNumber",
    },
    {
      title: (
        <FormattedMessage
          id="label.purchaseOrderNumber"
          defaultMessage="Purchase Order #"
        />
      ),
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: (
        <FormattedMessage id="label.billAmount" defaultMessage="Bill Amount" />
      ),
      dataIndex: "billAmount",
      key: "billAmount",
    },
    {
      title: (
        <FormattedMessage id="label.billAmount" defaultMessage="Bill Amount" />
      ),
      dataIndex: "billAmount",
      key: "billAmount",
    },
    {
      title: "Amount Due",
      dataIndex: "amountDue",
      key: "amountDue",
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      width: "13%",
      render: (_, record) => (
        <>
          <Input />
          <Flex justify="end">
            <Button type="link" style={{ paddingInline: 0 }}>
              Pay in Full
            </Button>
          </Flex>
        </>
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

      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="paymentMade.new"
            defaultMessage="New Payment Made"
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
          <Row>
            <Col lg={8}>
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
                labelCol={{ span: 8 }}
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
                  onClick={setSearchModalOpen}
                  className="search-input"
                  suffix={
                    <Button
                      style={{ width: "2.5rem" }}
                      type="primary"
                      icon={<SearchOutlined />}
                      className="search-btn"
                      onClick={setSearchModalOpen}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage id="label.branch" defaultMessage="Branch" />
                }
                name="branch"
                labelAlign="left"
                labelCol={{ span: 8 }}
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
            </Col>
          </Row>
          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paymentMade"
                    defaultMessage="Payment Made"
                  />
                }
                name="paymentMade"
                labelAlign="left"
                labelCol={{ span: 8 }}
                className="margin-less-input"
              >
                <Input></Input>
              </Form.Item>
              <Form.Item
                name="paymentMade"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ offset: 8 }}
              >
                <Checkbox>Pay full amount (MMK 939393)</Checkbox>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.bankCharges"
                    defaultMessage="Bank Charges (if any)"
                  />
                }
                labelCol={{ span: 8 }}
                labelAlign="left"
                name="bankCharges"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paymentDate"
                    defaultMessage="Payment Date"
                  />
                }
                name="paymentDate"
                labelAlign="left"
                labelCol={{ span: 8 }}
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

              <Form.Item
                label={
                  <FormattedMessage
                    id="label.referenceNumber"
                    defaultMessage="Reference #"
                  />
                }
                name="referenceNumber"
                labelAlign="left"
                labelCol={{ span: 8 }}
              >
                <Input maxLength={255}></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paymentMode"
                    defaultMessage="Payment Mode"
                  />
                }
                name="paymentMode"
                labelAlign="left"
                labelCol={{ span: 8 }}
              >
                <Select></Select>
              </Form.Item>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paidThrough"
                    defaultMessage="Paid Through"
                  />
                }
                name="paidThrough"
                labelAlign="left"
                labelCol={{ span: 8 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.paidThrough.required"
                        defaultMessage="Select the Paid Through"
                      />
                    ),
                  },
                ]}
              >
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
                  {/* {assetAccounts?.map((account) => (
                <Select.Option
                  key={account.id}
                  value={account.id}
                  label={account.name}
                >
                  {account.name}
                </Select.Option>
              ))} */}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Flex justify="end">
            <Button type="link">Clear Applied Amount</Button>
          </Flex>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            className="item-details-table"
          />
          <br />

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
                <Form.Item
                  style={{ margin: 0, width: "100%" }}
                  name="customerNotes"
                >
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
              <table
                cellSpacing="0"
                border="0"
                id="balance-table"
                style={{
                  background: "rgba(245, 157, 0, 0.10)",
                  width: "27.7rem",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{ verticalAlign: "middle", width: "20%" }}
                      className="text-align-right"
                    >
                      <FormattedMessage
                        id="label.amountPaid"
                        defaultMessage="Amount Paid"
                      />
                    </td>

                    <td className="text-align-right" style={{ width: "20%" }}>
                      0.00
                    </td>
                  </tr>

                  <tr>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      <FormattedMessage
                        id="label.amountUsedForPayments"
                        defaultMessage="Amount used for Payments"
                      />
                    </td>

                    <td
                      className="text-align-right"
                      style={{ width: "20%", paddingTop: "0.5rem" }}
                    >
                      0.00
                    </td>
                  </tr>

                  <tr>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      <FormattedMessage
                        id="label.amountRefunded"
                        defaultMessage="Amount Refunded"
                      />
                    </td>

                    <td
                      className="text-align-right"
                      style={{ width: "20%", paddingTop: "0.5rem" }}
                    >
                      <span>0</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      <FormattedMessage
                        id="label.amountInExcess"
                        defaultMessage="Amount In Excess"
                      />
                    </td>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      0
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="text-align-right"
                      style={{ paddingTop: "0.5rem" }}
                    >
                      <FormattedMessage
                        id="label.bankCharges"
                        defaultMessage="Bank Charges"
                      />
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
          <div className="page-actions-bar page-actions-bar-margin">
            <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              //   loading={loading}
            >
              Save
            </Button>
            <Button
              className="page-actions-btn"
              onClick={() =>
                navigate(from, { state: location.state, replace: true })
              }
            >
              {<FormattedMessage id="button.cancel" defaultMessage="Cancel" />}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default PaymentsMadeNew;
