/* eslint-disable react/style-prop-object */
import React, { useState, useMemo } from "react";
import {
  Space,
  Button,
  Table,
  Row,
  Dropdown,
  Divider,
  Modal,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  CloseOutlined,
  EditOutlined,
  FilePdfOutlined,
  CaretDownFilled,
  PrinterOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  AttachFiles,
  CommentColumn,
  InventoryAdjustmentsTemplate,
  PDFPreviewModal,
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
  SupplierSearchModal,
} from "../../components";
import { useReadQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import {
  PurchaseOrderMutations,
  InventoryAdjustmentQueries,
  InventoryAdjustmentMutations,
} from "../../graphql";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useHistoryState } from "../../utils/HelperFunctions";
import { useMutation } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { InventoryAdjustmentPDF } from "../../components/pdfs-and-templates";
const { GET_PAGINATE_INVENTORY_ADJUSTMENT } = InventoryAdjustmentQueries;
const { CONFIRM_PURCHASE_ORDER, CANCEL_PURCHASE_ORDER } =
  PurchaseOrderMutations;
const { DELETE_INVENTORY_ADJUSTMENT } = InventoryAdjustmentMutations;

const actionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "1",
  },
];

const InventoryAdjustments = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allWarehousesQueryRef,
    business,
  } = useOutletContext();
  const [deleteModal, contextHolder] = Modal.useModal();
  const [searchFormRef] = Form.useForm();
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "adjustmentSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "adjustmentCurrentPage",
    1
  );
  const [pdfModalOpen, setPDFModalOpen] = useState(false);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  //Mutations
  const [deleteInventoryAdjustment, { loading: deleteLoading }] = useMutation(
    DELETE_INVENTORY_ADJUSTMENT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="inventoryAdjustment.deleted"
            defaultMessage="Adjustment Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingInventoryAdjustments = cache.readQuery({
          query: GET_PAGINATE_INVENTORY_ADJUSTMENT,
        });
        const updatedInventoryAdjustments =
          existingInventoryAdjustments.paginateInventoryAdjustment.edges.filter(
            ({ node }) => node.id !== data.deleteInventoryAdjustment.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_INVENTORY_ADJUSTMENT,
          data: {
            paginateInventoryAdjustment: {
              ...existingInventoryAdjustments.paginateInventoryAdjustment,
              edges: updatedInventoryAdjustments,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [confirmPO, { loading: confirmLoading }] = useMutation(
    CONFIRM_PURCHASE_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="purchaseOrder.confirmed"
            defaultMessage="Purchase Order Confirmed"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingPurchaseOrders = cache.readQuery({
          query: GET_PAGINATE_INVENTORY_ADJUSTMENT,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.confirmPurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_INVENTORY_ADJUSTMENT,
          data: {
            paginatePurchaseOrder: {
              ...existingPurchaseOrders.paginatePurchaseOrder,
              edges: updatedPurchaseOrders,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [cancelPO, { loading: cancelLoading }] = useMutation(
    CANCEL_PURCHASE_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="purchaseOrder.cancelled"
            defaultMessage="Purchase Order Cancelled"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingPurchaseOrders = cache.readQuery({
          query: GET_PAGINATE_INVENTORY_ADJUSTMENT,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.cancelPurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_INVENTORY_ADJUSTMENT,
          data: {
            paginatePurchaseOrder: {
              ...existingPurchaseOrders.paginatePurchaseOrder,
              edges: updatedPurchaseOrders,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const loading = deleteLoading || confirmLoading || cancelLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const parseData = (data) => {
    let inventoryAdjustments = [];
    data?.paginateInventoryAdjustment?.edges.forEach(({ node }) => {
      if (node != null) {
        inventoryAdjustments.push({
          key: node.id,
          ...node,
        });
      }
    });
    return inventoryAdjustments ? inventoryAdjustments : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginatePurchaseOrder) {
      pageInfo = {
        hasNextPage: data.paginateInventoryAdjustment.pageInfo.hasNextPage,
        endCursor: data.paginateInventoryAdjustment.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const getStatusColor = (status) => {
    let color = "";

    if (status === "Draft") {
      color = "gray";
    } else if (status === "Closed") {
      color = "var(--primary-color)";
    } else {
      color = "var(--blue)";
    }

    return color;
  };

  const toggleContent = () => {
    setContentExpanded(!isContentExpanded);
    setCaretRotation(caretRotation === 0 ? 90 : 0);
  };

  const handleEdit = (record, navigate, location) => {
    // console.log("edit record", record);
    navigate("edit", {
      state: {
        ...location.state,
        from: { pathname: location.pathname },
        record,
      },
    });
  };

  const handleConfirmPurchaseOrder = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.confirmPurchaseOrder"
          defaultMessage="Are you sure to confirm purchase order?"
        />
      ),
    });
    if (confirmed) {
      try {
        await confirmPO({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleCancelPurchaseOrder = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.cancelPurchaseOrder"
          defaultMessage="Are you sure to cancel purchase order?"
        />
      ),
    });
    if (confirmed) {
      try {
        await cancelPO({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.delete"
          defaultMessage="Are you sure to delete?"
        />
      ),
    });
    if (confirmed) {
      try {
        await deleteInventoryAdjustment({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    searchFormRef.setFieldsValue({
      supplierId: record.id,
      supplierName: record.name,
    });
  };

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "date",
      key: "date",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: <FormattedMessage id="label.reason" defaultMessage="Reason" />,
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: (
        <FormattedMessage id="label.description" defaultMessage="Description" />
      ),
      dataIndex: "description",
      key: "description",
    },
    {
      title: <FormattedMessage id="label.status" defaultMessage="Status" />,
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (text) => (
        <span style={{ color: getStatusColor(text) }}>{text}</span>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="label.referenceNumber"
          defaultMessage="Reference Number"
        />
      ),
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },

    {
      title: <FormattedMessage id="label.type" defaultMessage="Type" />,
      dataIndex: "type",
      key: "type",
    },
    {
      title: (
        <FormattedMessage
          id="label.warehouseName"
          defaultMessage="Warehouse Name"
        />
      ),
      dataIndex: "warehouseName",
      key: "warehouseName",
      render: (_, record) => record?.warehouse?.name,
    },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        />
      ),
      dataIndex: "search",
      key: "search",
    },
  ];

  const compactColumns = [
    {
      title: "",
      dataIndex: "column",
      render: (text, record) => {
        return (
          <div>
            <div className="column-list-item">
              <span>{record.referenceNumber}</span>
            </div>
            <div className="column-list-item">
              <span>{record.reason}</span>
              <span
                style={{
                  color: getStatusColor(record.currentStatus),
                }}
              >
                {record.currentStatus}
              </span>
            </div>
            <div className="column-list-item">
              <span> {dayjs(record.date).format(REPORT_DATE_FORMAT)}</span>
            </div>
          </div>
        );
      },
    },
  ];

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col lg={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.dateRange"
                defaultMessage="Date Range"
              />
            }
            name="dateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startDate: value && value[0],
                  endDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields(["startDate", "endDate"])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item
            label="Status"
            name="currentStatus"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Select
              options={[
                {
                  value: "Draft",
                  label: "Draft",
                },
                {
                  value: "Adjusted",
                  label: "Adjusted",
                },
              ]}
            ></Select>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branchId"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
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
        </Col>
        <Col lg={12}>
          <Form.Item
            label="Reference #"
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage
                id="label.warehouse"
                defaultMessage="Warehouse"
              />
            }
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
            labelAlign="left"
            name="warehouseId"
          >
            <Select
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
          <Form.Item
            label="Adjustment Type"
            name="adjustmentType"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Select
              options={[
                {
                  value: "Quantity",
                  label: "Quantity",
                },
                {
                  value: "Value",
                  label: "Value",
                },
              ]}
            ></Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      <SupplierSearchModal
        modalOpen={supplierSearchModalOpen}
        setModalOpen={setSupplierSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />
      <PDFPreviewModal modalOpen={pdfModalOpen} setModalOpen={setPDFModalOpen}>
        <InventoryAdjustmentPDF
          selectedRecord={selectedRecord}
          business={business}
        />
      </PDFPreviewModal>
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <div className="page-header-text">
              <FormattedMessage
                id="label.inventoryAdjustments"
                defaultMessage="Inventory Adjustments"
              />
            </div>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate("new", {
                    state: {
                      ...location.state,
                      from: { pathname: location.pathname },
                      clonePO: null,
                    },
                  })
                }
              >
                {!selectedRecord && (
                  <span>
                    <FormattedMessage id="button.new" defaultMessage="New" />
                  </span>
                )}
              </Button>
            </Space>
          </div>
          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            {searchCriteria && (
              <SearchCriteriaDisplay
                searchCriteria={searchCriteria}
                handleModalClear={handleModalClear}
              >
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {searchCriteria.startDate && searchCriteria.endDate && (
                  <li>
                    Date between{" "}
                    <b>
                      {dayjs(searchCriteria.startDate).format(
                        REPORT_DATE_FORMAT
                      )}{" "}
                      and{" "}
                      {dayjs(searchCriteria.endDate).format(REPORT_DATE_FORMAT)}
                    </b>
                  </li>
                )}{" "}
                {searchCriteria.currentStatus && (
                  <li>
                    Adjustment Status is <b>{searchCriteria.currentStatus}</b>
                  </li>
                )}
                {searchCriteria.warehouseId && (
                  <li>
                    Warehouse is{" "}
                    <b>
                      {
                        warehouses?.find(
                          (x) => x.id === searchCriteria.warehouseId
                        ).name
                      }
                    </b>
                  </li>
                )}
                {searchCriteria.branchId && (
                  <li>
                    Branch is{" "}
                    <b>
                      {
                        branches?.find((x) => x.id === searchCriteria.branchId)
                          .name
                      }
                    </b>
                  </li>
                )}
                {searchCriteria.adjustmentType && (
                  <li>
                    Adjustment Type is <b>{searchCriteria.adjustmentType}</b>
                  </li>
                )}
              </SearchCriteriaDisplay>
            )}
            <PaginatedSelectionTable
              loading={loading}
              api={notiApi}
              columns={columns}
              compactColumns={compactColumns}
              gqlQuery={GET_PAGINATE_INVENTORY_ADJUSTMENT}
              searchForm={searchForm}
              searchTitle={
                <FormattedMessage
                  id="inventoryAdjustment.search"
                  defaultMessage="Search Adjustments"
                />
              }
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_INVENTORY_ADJUSTMENT}
              parseData={parseData}
              parsePageInfo={parsePageInfo}
              showAddNew={true}
              searchModalOpen={searchModalOpen}
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
              setSearchModalOpen={setSearchModalOpen}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              setSelectedRowIndex={setSelectedRowIndex}
              selectedRowIndex={selectedRowIndex}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branch?.name}</span>
                <span>Adjustment Details</span>
              </div>
              <div className="content-column-header-row-actions">
                <AttachFiles
                  files={selectedRecord?.documents}
                  key={selectedRecord?.key}
                  referenceType="inventory_adjustments"
                  referenceId={selectedRecord.id}
                />
                <div style={{ borderRight: "1px solid var(--border-color)" }}>
                  <Button
                    type="text"
                    icon={<CommentOutlined />}
                    onClick={setCmtColumnOpen}
                  >
                    <span>
                      <FormattedMessage
                        id="button.commentsAndHistory"
                        defaultMessage="Comments & History"
                      />
                    </span>
                  </Button>
                </div>
                <div>
                  <Button
                    icon={<CloseOutlined />}
                    type="text"
                    onClick={() => {
                      setSelectedRecord(null);
                      setSelectedRowIndex(0);
                    }}
                  />
                </div>
              </div>
            </Row>
            <Row className="content-column-action-row">
              {selectedRecord.adjustmentType === "Quantity" && (
                <div
                  className="actions"
                  onClick={() => handleEdit(selectedRecord, navigate, location)}
                >
                  <EditOutlined />
                  <FormattedMessage id="button.edit" defaultMessage="Edit" />
                </div>
              )}
              {selectedRecord.currentStatus === "Draft" && (
                <div className="actions">
                  <FormattedMessage
                    id="button.ConvertToAdjusted"
                    defaultMessage="Convert to Adjusted"
                  />
                </div>
              )}
              <div onClick={() => setPDFModalOpen(true)}>
                <FilePdfOutlined />
                <FormattedMessage
                  id="button.pdf/print"
                  defaultMessage="PDF/Print"
                />
              </div>

              <Dropdown
                menu={{
                  onClick: ({ key }) => {
                    if (key === "0") {
                      //nothing
                    } else if (key === "1") {
                      handleDelete(selectedRecord.id);
                    }
                  },
                  items: actionItems,
                }}
                trigger={["click"]}
              >
                <div style={{ fontSize: "1.1rem" }}>
                  <MoreOutlined />
                </div>
              </Dropdown>
            </Row>
            <div className="content-column-full-row">
              <div className="toggle-pdf-view">
                <div>
                  <span>Adjustment Status: </span>
                  <span
                    style={{
                      color: getStatusColor(selectedRecord.currentStatus),
                    }}
                  >
                    {selectedRecord.currentStatus}
                  </span>
                </div>
              </div>
              <InventoryAdjustmentsTemplate selectedRecord={selectedRecord} />
            </div>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="inventory_adjustments"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default InventoryAdjustments;
