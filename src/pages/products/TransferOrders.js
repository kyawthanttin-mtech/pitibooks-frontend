/* eslint-disable react/style-prop-object */
import React, { useState, useMemo } from "react";
import {
  Space,
  Button,
  Row,
  Dropdown,
  Divider,
  Modal,
  Col,
  Form,
  Input,
  Select,
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
  PDFPreviewModal,
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
  SupplierSearchModal,
  TransferOrderTemplate,
} from "../../components";
import { useReadQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import {
  TransferOrderQueries,
  PurchaseOrderMutations,
  TransferOrderMutations,
} from "../../graphql";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useHistoryState } from "../../utils/HelperFunctions";
import { useMutation } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { TransferOrderPDF } from "../../components/pdfs-and-templates";
const { GET_PAGINATE_TRANSFER_ORDER } = TransferOrderQueries;
const { CONFIRM_PURCHASE_ORDER, CANCEL_PURCHASE_ORDER } =
  PurchaseOrderMutations;
const { DELETE_TRANSFER_ORDER } = TransferOrderMutations;

// const draftActionItems = [
//   {
//     label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
//     key: "0",
//   },
//   {
//     label: (
//       <FormattedMessage
//         id="button.covertToBill"
//         defaultMessage="Convert to Bill"
//       />
//     ),
//     key: "1",
//   },
//   {
//     label: (
//       <FormattedMessage
//         id="button.confirmPurchaseOrder"
//         defaultMessage="Confirm Purchase Order"
//       />
//     ),
//     key: "2",
//   },
//   {
//     label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
//     key: "4",
//   },
// ];

// const confirmedActionItems = [
//   {
//     label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
//     key: "0",
//   },
//   {
//     label: (
//       <FormattedMessage
//         id="button.covertToBill"
//         defaultMessage="Convert to Bill"
//       />
//     ),
//     key: "1",
//   },
//   {
//     label: (
//       <FormattedMessage
//         id="button.cancelPurchaseOrder"
//         defaultMessage="Cancel Purchase Order"
//       />
//     ),
//     key: "3",
//   },
//   {
//     label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
//     key: "4",
//   },
// ];

// const cancelledActionItems = [
//   {
//     label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
//     key: "0",
//   },
//   {
//     label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
//     key: "4",
//   },
// ];

// const closedActionItems = [
//   {
//     label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
//     key: "0",
//   },
// ];

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

const TransferOrders = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
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
    "transferOrderSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "transferOrderCurrentPage",
    1
  );
  const [pdfModalOpen, setPDFModalOpen] = useState(false);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  //Mutations
  const [deleteTransferOrder, { loading: deleteLoading }] = useMutation(
    DELETE_TRANSFER_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transferOrder.deleted"
            defaultMessage="Transfer Order Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingTransferOrders = cache.readQuery({
          query: GET_PAGINATE_TRANSFER_ORDER,
        });
        const updatedTransferOrders =
          existingTransferOrders.paginateTransferOrder.edges.filter(
            ({ node }) => node.id !== data.deleteTransferOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_TRANSFER_ORDER,
          data: {
            paginateTransferOrder: {
              ...existingTransferOrders.paginateTransferOrder,
              edges: updatedTransferOrders,
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
          query: GET_PAGINATE_TRANSFER_ORDER,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.confirmPurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_TRANSFER_ORDER,
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
          query: GET_PAGINATE_TRANSFER_ORDER,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.cancelPurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_TRANSFER_ORDER,
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
    let transferOrders = [];
    data?.paginateTransferOrder?.edges.forEach(({ node }) => {
      if (node != null) {
        transferOrders.push({
          key: node.id,
          ...node,
        });
      }
    });
    return transferOrders ? transferOrders : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginatePurchaseOrder) {
      pageInfo = {
        hasNextPage: data.paginateTransferOrder.pageInfo.hasNextPage,
        endCursor: data.paginateTransferOrder.pageInfo.endCursor,
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
        await deleteTransferOrder({
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
      dataIndex: "transferDate",
      key: "transferDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: (
        <FormattedMessage
          id="label.transferOrderNumber"
          defaultMessage="Transfer Order #"
        />
      ),
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: <FormattedMessage id="label.reason" defaultMessage="Reason" />,
      dataIndex: "reason",
      key: "reason",
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
          id="label.quantityTransferred"
          defaultMessage="Quantity Transferred"
        />
      ),
      dataIndex: "quantityTransferred",
      key: "quantityTransferred",
    },
    {
      title: (
        <FormattedMessage
          id="label.sourceWarehouse"
          defaultMessage="Source Warehouse"
        />
      ),
      dataIndex: "sourceWarehouse",
      key: "sourceWarehouse",
      render: (_, record) => record?.sourceWarehouse?.name,
    },
    {
      title: (
        <FormattedMessage
          id="label.destinationWarehouse"
          defaultMessage="Destination Warehouse"
        />
      ),
      dataIndex: "destinationWarehouse",
      key: "destinationWarehouse",
      render: (_, record) => record?.destinationWarehouse?.name,
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
              <span>{record.sourceWarehouse?.name}</span>
              <span>
                {record.currency?.symbol}{" "}
                <FormattedNumber
                  value={record.totalTransferQty}
                  style="decimal"
                  minimumFractionDigits={record.currency?.decimalPlaces}
                />
              </span>
            </div>
            <div className="column-list-item">
              <span>
                <span style={{ color: "var(--dark-green)" }}>
                  {record.orderNumber}
                </span>
                <Divider type="vertical" />
                {dayjs(record.transferDate).format(REPORT_DATE_FORMAT)}
              </span>
              <span
                style={{
                  color: getStatusColor(record.currentStatus),
                }}
              >
                {record.currentStatus}
              </span>
            </div>
            {/* {record.referenceNumber && (
              <div className="column-list-item">
                <span>
                  <span style={{ color: "gray" }}>
                    {record.referenceNumber}
                  </span>
                </span>
              </div>
            )} */}
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
            label="Order #"
            name="orderNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col lg={12}>
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
                  value: "Confirmed",
                  label: "Confirmed",
                },
                {
                  value: "Closed",
                  label: "Closed",
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
        <TransferOrderPDF selectedRecord={selectedRecord} business={business} />
      </PDFPreviewModal>
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <div className="page-header-text">
              <FormattedMessage
                id="label.transferOrders"
                defaultMessage="Transfer Orders"
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
              <Button icon={<MoreOutlined />}></Button>
            </Space>
          </div>
          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            {searchCriteria && (
              <SearchCriteriaDisplay
                searchCriteria={searchCriteria}
                handleModalClear={handleModalClear}
              >
                {searchCriteria.orderNumber && (
                  <li>
                    Order Number contains <b>{searchCriteria.orderNumber}</b>
                  </li>
                )}

                {searchCriteria.currentStatus && (
                  <li>
                    Order Status is <b>{searchCriteria.currentStatus}</b>
                  </li>
                )}
              </SearchCriteriaDisplay>
            )}
            <PaginatedSelectionTable
              loading={loading}
              api={notiApi}
              columns={columns}
              compactColumns={compactColumns}
              gqlQuery={GET_PAGINATE_TRANSFER_ORDER}
              searchForm={searchForm}
              searchTitle={
                <FormattedMessage
                  id="transferOrder.search"
                  defaultMessage="Search Transfer Orders"
                />
              }
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_TRANSFER_ORDER}
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
                <span>{selectedRecord.orderNumber}</span>
              </div>
              <div className="content-column-header-row-actions">
                <AttachFiles
                  files={selectedRecord?.documents}
                  key={selectedRecord?.key}
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
              <div
                className="actions"
                onClick={() => handleEdit(selectedRecord, navigate, location)}
              >
                <EditOutlined />
                <FormattedMessage id="button.edit" defaultMessage="Edit" />
              </div>
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
                      navigate("/purchaseOrders/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          clonePO: selectedRecord,
                        },
                      });
                      // } else if (key === "1") {
                      //   navigate("/bills/new", {
                      //     state: {
                      //       ...location.state,
                      //       from: { pathname: location.pathname },
                      //       convertPO: selectedRecord,
                      //     },
                      //   });
                      // } else if (key === "2") {
                      //   //confirm PO
                      //   handleConfirmPurchaseOrder(selectedRecord.id);
                      // } else if (key === "3") {
                      //   //cancel PO
                      //   handleCancelPurchaseOrder(selectedRecord.id);
                    } else if (key === "1") handleDelete(selectedRecord.id);
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
                  <span>Order Status: </span>
                  <span
                    style={{
                      color: getStatusColor(selectedRecord.currentStatus),
                    }}
                  >
                    {selectedRecord.currentStatus}
                  </span>
                </div>
              </div>
              <TransferOrderTemplate selectedRecord={selectedRecord} />
            </div>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="transfer_orders"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TransferOrders;
