/* eslint-disable react/style-prop-object */
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  CloseOutlined,
  CaretDownOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Dropdown,
  Flex,
  Space,
  Form,
  Tooltip,
  Row,
  Table,
  Modal,
} from "antd";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import {
  BankingTransactionQueries,
  BankingTransactionMutations,
} from "../../graphql";
import { paginateArray, useHistoryState } from "../../utils/HelperFunctions";
import dayjs from "dayjs";
import { QUERY_DATA_LIMIT, REPORT_DATE_FORMAT } from "../../config/Constants";
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useReadQuery,
} from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import {
  OwnerDrawingsNew,
  TransferFromAnotherAccNew,
  TransferToAnotherAccNew,
  OwnerContributionNew,
  PaymentRefund,
  CreditNoteRefund,
  SupplierAdvanceNew,
  SupplierCreditRefund,
  ExpenseRefundNew,
  OtherIncomeNew,
  OtherIncomeEdit,
  TransferToAnotherAccEdit,
  TxnDetailColumn,
  TransferFromAnotherAccEdit,
  OwnerContributionEdit,
  ExpenseNew,
  ExpenseEdit,
  ExpenseRefundEdit,
  SupplierAdvanceEdit,
  CustomerAdvanceNew,
  CustomerAdvanceEdit,
  InterestIncomeNew,
  InterestIncomeEdit,
} from ".";
import OwnerDrawingsEdit from "./OwnerDrawingsEdit";
const { GET_PAGINATE_BANKING_TRANSACTION } = BankingTransactionQueries;
const { DELETE_BANKING_TRANSACTION } = BankingTransactionMutations;

const addTransactionItems = [
  {
    label: <FormattedMessage id="label.moneyOut" defaultMessage="Money Out" />,
    type: "group",
    key: "1",
    children: [
      {
        key: "1-1",
        label: (
          <FormattedMessage
            id="label.transferToAnotherAccount"
            defaultMessage="Transfer To Another Account"
          />
        ),
      },
      {
        key: "1-2",
        label: (
          <FormattedMessage
            id="label.ownerDrawings"
            defaultMessage="Owner Drawings"
          />
        ),
      },
      {
        key: "1-3",
        label: (
          <FormattedMessage
            id="label.supplierAdvance"
            defaultMessage="Supplier Advance"
          />
        ),
      },
      // {
      //   key: "1-4",
      //   label: <FormattedMessage id="label.expense" defaultMessage="Expense" />,
      // },
    ],
  },
  {
    label: <FormattedMessage id="label.moneyIn" defaultMessage="Money In" />,
    type: "group",
    key: "2",
    children: [
      {
        key: "2-1",
        label: (
          <FormattedMessage
            id="label.transferFromAnotherAccount"
            defaultMessage="Transfer From Another Account"
          />
        ),
      },
      {
        key: "2-2",
        label: (
          <FormattedMessage
            id="label.ownerContribution"
            defaultMessage="Owner's Contribution"
          />
        ),
      },
      {
        key: "2-3",
        label: (
          <FormattedMessage
            id="label.customerAdvance"
            defaultMessage="Customer Advance"
          />
        ),
      },
      {
        key: "2-4",
        label: (
          <FormattedMessage
            id="label.otherIncome"
            defaultMessage="Other Income"
          />
        ),
      },
      {
        key: "2-5",
        label: (
          <FormattedMessage
            id="label.interestIncome"
            defaultMessage="Interest Income"
          />
        ),
      },
    ],
  },
];

const AllTransactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const accountId = location.state?.accountId;
  const bankingAccounts = location.state?.bankingAccounts;
  const intl = useIntl();
  const [deleteModal, contextHolder] = Modal.useModal();
  const {
    notiApi,
    msgApi,
    business,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allAccountsQueryRef,
    allPaymentModesQueryRef,
    allTaxesQueryRef,
    allTaxGroupsQueryRef,
  } = useOutletContext();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "bankingSearchCriteria",
    null
  );
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchFormRef] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [currentPage, setCurrentPage] = useHistoryState("billCurrentPage", 1);
  const [selectedAcc, setSelectedAcc] = useState(accountId);
  const [transferToNewModalOpen, setTransferToNewModalOpen] = useState(false);
  const [transferToEditModalOpen, setTransferToEditModalOpen] = useState(false);
  const [transferFromNewModalOpen, setTransferFromNewModalOpen] =
    useState(false);
  const [transferFromEditModalOpen, setTransferFromEditModalOpen] =
    useState(false);
  const [ownerDrawingsNewModalOpen, setOwnerDrawingsNewModalOpen] =
    useState(false);
  const [ownerDrawingsEditModalOpen, setOwnerDrawingsEditModalOpen] =
    useState(false);
  const [ownerContributionNewModalOpen, setOwnerContributionNewModalOpen] =
    useState(false);
  const [ownerContributionEditModalOpen, setOwnerContributionEditModalOpen] =
    useState(false);
  const [paymentRefundModalOpen, setPaymentRefundModalOpen] = useState(false);
  const [creditNoteRefundModalOpen, setCreditNoteRefundModalOpen] =
    useState(false);
  const [supplierAdvanceNewModalOpen, setSupplierAdvanceNewModalOpen] =
    useState(false);
  const [supplierAdvanceEditModalOpen, setSupplierAdvanceEditModalOpen] =
    useState(false);
  const [customerAdvanceNewModalOpen, setCustomerAdvanceNewModalOpen] =
    useState(false);
  const [customerAdvanceEditModalOpen, setCustomerAdvanceEditModalOpen] =
    useState(false);
  const [supplierCreditRefundModalOpen, setSupplierCreditRefundModalOpen] =
    useState(false);
  const [otherIncomeNewModalOpen, setOtherIncomeNewModalOpen] = useState(false);
  const [otherIncomeEditModalOpen, setOtherIncomeEditModalOpen] =
    useState(false);
  const [interestIncomeNewModalOpen, setInterestIncomeNewModalOpen] =
    useState(false);
  const [interestIncomeEditModalOpen, setInterestIncomeEditModalOpen] =
    useState(false);
  const [expenseRefundNewModalOpen, setExpenseRefundNewModalOpen] =
    useState(false);
  const [expenseRefundEditModalOpen, setExpenseRefundEditModalOpen] =
    useState(false);
  const [expenseNewModalOpen, setExpenseNewModalOpen] = useState(false);
  const [expenseEditModalOpen, setExpenseEditModalOpen] = useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: paymentModeData } = useReadQuery(allPaymentModesQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

  //Mutations
  const [deleteTransaction, { loading: deleteLoading }] = useMutation(
    DELETE_BANKING_TRANSACTION,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transaction.deleted"
            defaultMessage="Transaction Deleted"
          />
        );
        setSelectedRecord(null);
        setSelectedRowIndex(0);
        refetch();
      },
    }
  );

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const paymentModes = useMemo(() => {
    return paymentModeData?.listAllPaymentMode?.filter(
      (p) => p.isActive === true
    );
  }, [paymentModeData]);

  const taxes = useMemo(() => {
    return taxData?.listAllTax?.filter((tax) => tax.isActive === true);
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup?.filter(
      (tax) => tax.isActive === true
    );
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

  const accounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter(
        (account) =>
          account.detailType === "Cash" ||
          account.detailType === "Bank" ||
          account.detailType === "OtherAsset" ||
          account.detailType === "OtherCurrentAsset" ||
          account.detailType === "Equity"
      )
      .reduce((acc, account) => {
        const { detailType } = account;
        if (!acc[detailType]) {
          acc[detailType] = { detailType, accounts: [] };
        }
        acc[detailType].accounts.push(account);
        return acc;
      }, {});

    return Object.values(groupedAccounts);
  }, [accountData]);

  const equityAccounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter((account) => account.detailType === "Equity")
      .reduce((acc, account) => {
        const { detailType } = account;
        if (!acc[detailType]) {
          acc[detailType] = { detailType, accounts: [] };
        }
        acc[detailType].accounts.push(account);
        return acc;
      }, {});

    return Object.values(groupedAccounts);
  }, [accountData]);

  useMemo(() => {
    if (accountId && bankingAccounts) {
      const matchingAccount = bankingAccounts.find(
        (account) => account.id === accountId
      );
      if (matchingAccount) {
        setSelectedAcc(matchingAccount);
      }
    }
  }, [accountId, bankingAccounts]);

  //================================================== Paginated Table
  const parseData = useCallback((data) => {
    let txns = [];
    data?.paginateBankingTransaction?.edges.forEach(({ node }) => {
      if (node != null) {
        txns.push({
          key: node.id,
          ...node,
        });
      }
    });
    return txns ? txns : [];
  }, []);

  const parsePageInfo = useCallback((data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateBankingTransaction) {
      pageInfo = {
        hasNextPage: data.paginateBankingTransaction.pageInfo.hasNextPage,
        endCursor: data.paginateBankingTransaction.pageInfo.endCursor,
      };
    }

    return pageInfo;
  }, []);

  const handleRefetch = async () => {
    try {
      await refetch();
      setCurrentPage(1);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = async () => {
    if (currentPage === totalPages) {
      try {
        await fetchMore({
          variables: {
            limit: QUERY_DATA_LIMIT,
            after: parsePageInfo(data).endCursor,
          },
        });
        setCurrentPage(currentPage + 1);
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleModalSearch = async () => {
    try {
      const searchValues = searchFormRef.getFieldsValue();
      console.log("search values", searchValues);

      const hasValues = Object.values(searchValues).some(
        (value) => value !== undefined && value !== "" && value !== null
      );

      if (!hasValues) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "error.atLeastOneSearchCriteria",
            defaultMessage: "Please fill in at least one search criteria",
          })
        );
        return;
      }

      await search({
        variables: searchValues,
      });
      setCurrentPage(1);
      setSearchCriteria(searchFormRef.getFieldsValue());
      setSearchModalOpen(false);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleModalCancel = () => {
    setSearchModalOpen(false);
  };

  const [search, { loading: searchLoading, data: searchData }] = useLazyQuery(
    GET_PAGINATE_BANKING_TRANSACTION,
    {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );

  const {
    data,
    loading: queryLoading,
    fetchMore,
    refetch,
  } = useQuery(GET_PAGINATE_BANKING_TRANSACTION, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      accountId: selectedAcc?.id,
      limit: QUERY_DATA_LIMIT,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const allData = useMemo(() => parseData(data), [data, parseData]);
  const searchResults = useMemo(
    () => parseData(searchData),
    [parseData, searchData]
  );
  const pageInfo = useMemo(() => parsePageInfo(data), [data, parsePageInfo]);
  const searchPageInfo = useMemo(
    () => parsePageInfo(searchData),
    [searchData, parsePageInfo]
  );

  const totalPages = searchCriteria
    ? Math.ceil(searchResults.length / QUERY_DATA_LIMIT)
    : Math.ceil(allData.length / QUERY_DATA_LIMIT);
  let hasPreviousPage = currentPage > 1 ? true : false;
  let hasNextPage = false;
  let refetchEnabled = true;
  if (currentPage === totalPages) {
    hasNextPage = searchCriteria
      ? searchPageInfo.hasNextPage
      : pageInfo.hasNextPage;
  } else if (currentPage < totalPages) {
    hasNextPage = true;
  }

  const pageData = paginateArray(allData, QUERY_DATA_LIMIT, currentPage);

  const searchPageData = paginateArray(
    searchResults,
    QUERY_DATA_LIMIT,
    currentPage
  );

  const loading = queryLoading || searchLoading || deleteLoading;
  //==================================================

  const handleAccountChange = (key) => {
    const selectedFilter = bankingAccounts.find((acc) => acc.key === key);
    setSelectedAcc(selectedFilter);
    console.log(selectedFilter)
    setSelectedRecord(null);
    setSelectedRowIndex(0);
  };

  const handleDelete = async (id) => {
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
        await deleteTransaction({
          variables: {
            id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const getEditModalSetter = (transactionType) => {
    if (!transactionType) return () => {};
    switch (transactionType) {
      case "TransferToAnotherAccount":
        return setTransferToEditModalOpen;
      case "OwnerDrawings":
        return setOwnerDrawingsEditModalOpen;
      case "PaymentRefund":
        return setPaymentRefundModalOpen;
      case "CreditNoteRefund":
        return setCreditNoteRefundModalOpen;
      case "SupplierAdvance":
        return setSupplierAdvanceEditModalOpen;
      case "TransferFromAnotherAccounts":
        return setTransferFromEditModalOpen;
      case "OwnerContribution":
        return setOwnerContributionEditModalOpen;
      case "SupplierCreditRefund":
        return setSupplierCreditRefundModalOpen;
      case "CustomerAdvance":
        return setCustomerAdvanceEditModalOpen;
      case "OtherIncome":
        return setOtherIncomeEditModalOpen;
      case "InterestIncome":
        return setInterestIncomeEditModalOpen;
      case "ExpenseRefund":
        return setExpenseRefundEditModalOpen;
      case "Expense":
        return setExpenseEditModalOpen;
      default:
        return () => {};
    }
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      key: "transactionDate",
      dataIndex: "transactionDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      key: "branch",
      dataIndex: "branch",
      render: (_, record) => record.branch?.name,
    },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="label.transactionDetails"
    //       defaultMessage="Transaction Details"
    //     />
    //   ),
    //   key: "transactionDetails",
    //   dataIndex: "description",
    // },
    {
      title: <FormattedMessage id="label.type" defaultMessage="Type" />,
      key: "transactionType",
      dataIndex: "transactionType",
      render: (_, record) => (
        <>
          <div>{record.transactionType.split(/(?=[A-Z])/).join(" ")}</div>
          <div
            style={{
              fontSize: "var(--small-text)",
            }}
          >
            {record?.fromAccount?.id !== selectedAcc?.id
              ? `From Account: ${record.fromAccount?.name}`
              : `To Account: ${record.toAccount?.name}`}
          </div>
        </>
      ),
    },
    {
      title: <FormattedMessage id="label.deposits" defaultMessage="Deposits" />,
      key: "deposits",
      dataIndex: "baseDebit",
      render: (_, record) => 
        record.toAccount?.id === selectedAcc?.id && (
          <>
            {record.toAccount?.currency?.symbol}{" "}
            <FormattedNumber
              value={
                record.toAccount?.currency?.id !== record.currency?.id 
                  ? record.toAccount?.currency?.id === business.baseCurrency.id 
                    ? (record.exchangeRate !== 0 ? record.amount * record.exchangeRate : 0)
                    : (record.exchangeRate !== 0 ? record.amount / record.exchangeRate : 0)
                  : record.amount
              }
              style="decimal"
              minimumFractionDigits={record.currency?.decimalPlaces ?? 2}
            />
          </>
        ),
    },
    {
      title: (
        <FormattedMessage id="label.withdrawals" defaultMessage="Withdrawals" />
      ),
      key: "withdrawals",
      dataIndex: "baseCredit",
      render: (_, record) =>
        record.fromAccount?.id === selectedAcc?.id && (
          <>
            {record.fromAccount?.currency?.symbol}{" "}
            <FormattedNumber
              value={
                record.fromAccount?.currency?.id !== record.currency?.id 
                  ? record.fromAccount?.currency?.id === business.baseCurrency.id 
                    ? (record.exchangeRate !== 0 ? (record.amount + record.bankCharges) * record.exchangeRate : 0)
                    : (record.exchangeRate !== 0 ? (record.amount + record.bankCharges) / record.exchangeRate : 0)
                  : record.amount + record.bankCharges
              }
              style="decimal"
              minimumFractionDigits={record.currency?.decimalPlaces ?? 2}
            />
          </>
        ),
    },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="label.runningBalance"
    //       defaultMessage="Running Balance"
    //     />
    //   ),
    //   key: "runningBalance",
    //   dataIndex: "baseClosingBalance",
    // },
  ];

  return (
    <>
      {contextHolder}
      <TransferToAnotherAccNew
        modalOpen={transferToNewModalOpen}
        setModalOpen={setTransferToNewModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        refetch={refetch}
      />
      <TransferToAnotherAccEdit
        modalOpen={transferToEditModalOpen}
        setModalOpen={setTransferToEditModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <TransferFromAnotherAccNew
        modalOpen={transferFromNewModalOpen}
        setModalOpen={setTransferFromNewModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        refetch={refetch}
      />
      <TransferFromAnotherAccEdit
        modalOpen={transferFromEditModalOpen}
        setModalOpen={setTransferFromEditModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <OwnerDrawingsNew
        modalOpen={ownerDrawingsNewModalOpen}
        setModalOpen={setOwnerDrawingsNewModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={equityAccounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        refetch={refetch}
      />
      <OwnerDrawingsEdit
        modalOpen={ownerDrawingsEditModalOpen}
        setModalOpen={setOwnerDrawingsEditModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={equityAccounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <OwnerContributionNew
        modalOpen={ownerContributionNewModalOpen}
        setModalOpen={setOwnerContributionNewModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={equityAccounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        refetch={refetch}
      />
      <OwnerContributionEdit
        modalOpen={ownerContributionEditModalOpen}
        setModalOpen={setOwnerContributionEditModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={equityAccounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <ExpenseNew
        modalOpen={expenseNewModalOpen}
        setModalOpen={setExpenseNewModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        allTax={allTax}
        refetch={refetch}
      />
      <ExpenseEdit
        modalOpen={expenseEditModalOpen}
        setModalOpen={setExpenseEditModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        allTax={allTax}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />

      <SupplierAdvanceNew
        modalOpen={supplierAdvanceNewModalOpen}
        setModalOpen={setSupplierAdvanceNewModalOpen}
        branches={branches}
        currencies={currencies}
        paymentModes={paymentModes}
        selectedAcc={selectedAcc}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        refetch={refetch}
      />
      <SupplierAdvanceEdit
        modalOpen={supplierAdvanceEditModalOpen}
        setModalOpen={setSupplierAdvanceEditModalOpen}
        branches={branches}
        currencies={currencies}
        paymentModes={paymentModes}
        selectedAcc={selectedAcc}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <CustomerAdvanceNew
        modalOpen={customerAdvanceNewModalOpen}
        setModalOpen={setCustomerAdvanceNewModalOpen}
        branches={branches}
        currencies={currencies}
        paymentModes={paymentModes}
        selectedAcc={selectedAcc}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        refetch={refetch}
      />
      <CustomerAdvanceEdit
        modalOpen={customerAdvanceEditModalOpen}
        setModalOpen={setCustomerAdvanceEditModalOpen}
        branches={branches}
        currencies={currencies}
        paymentModes={paymentModes}
        selectedAcc={selectedAcc}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <OtherIncomeNew
        modalOpen={otherIncomeNewModalOpen}
        setModalOpen={setOtherIncomeNewModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        selectedAcc={selectedAcc}
        paymentModes={paymentModes}
        refetch={refetch}
      />
      <OtherIncomeEdit
        modalOpen={otherIncomeEditModalOpen}
        setModalOpen={setOtherIncomeEditModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        selectedAcc={selectedAcc}
        paymentModes={paymentModes}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <InterestIncomeNew
        modalOpen={interestIncomeNewModalOpen}
        setModalOpen={setInterestIncomeNewModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        selectedAcc={selectedAcc}
        paymentModes={paymentModes}
        refetch={refetch}
      />
      <InterestIncomeEdit
        modalOpen={interestIncomeEditModalOpen}
        setModalOpen={setInterestIncomeEditModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        bankingAccounts={bankingAccounts}
        selectedAcc={selectedAcc}
        paymentModes={paymentModes}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        setSelectedRowIndex={setSelectedRowIndex}
        refetch={refetch}
      />
      <Flex justify="space-between">
        <Flex vertical flex="1">
          <div className="page-header">
            {/* <FormattedMessage
            id="label.allTransactions"
            defaultMessage="All Transactions"
          /> */}
            <Dropdown
              // onChange={(value) => console.log("value")}
              trigger="click"
              menu={{
                items: bankingAccounts?.map((item) => ({
                  label: item.name,
                  key: item.key,
                  onClick: ({ key }) => handleAccountChange(key),
                })),
                selectable: true,
                selectedKeys: [selectedAcc?.key],
              }}
            >
              <div
                className="page-header-text"
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  fontWeight: "500",
                  marginBlock: "1.5rem",
                  maxWidth: "14rem",
                }}
              >
                <Space>
                  {selectedAcc?.name}
                  <DownOutlined
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--primary-color)",
                    }}
                  />
                </Space>
              </div>
            </Dropdown>
            <div>
              <Button type="primary">
                <Dropdown
                  trigger="click"
                  // key={record.key}
                  menu={{
                    onClick: ({ key }) => {
                      if (key === "1-1") {
                        setTransferToNewModalOpen(true);
                      } else if (key === "1-2") {
                        setOwnerDrawingsNewModalOpen(true);
                      } else if (key === "1-3") {
                        setSupplierAdvanceNewModalOpen(true);
                      } else if (key === "1-4") {
                        setExpenseNewModalOpen(true);
                      } else if (key === "2-1") {
                        setTransferFromNewModalOpen(true);
                      } else if (key === "2-2") {
                        setOwnerContributionNewModalOpen(true);
                      } else if (key === "2-3") {
                        setCustomerAdvanceNewModalOpen(true);
                      } else if (key === "2-4") {
                        setOtherIncomeNewModalOpen(true);
                      } else if (key === "2-5") {
                        setInterestIncomeNewModalOpen(true);
                      }
                    },
                    items: addTransactionItems,
                  }}
                >
                  <div style={{ height: "2rem" }}>
                    Add Transaction <CaretDownOutlined />
                  </div>
                </Dropdown>
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<CloseOutlined />}
                type="text"
                onClick={() => {
                  navigate(from, { state: location.state, replace: true });
                }}
              />
            </div>
          </div>

          <div className="page-content">
            <>
              <Modal
                width="65.5rem"
                // title={searchTitle}
                okText={
                  <FormattedMessage
                    id="button.search"
                    defaultMessage="Search"
                  />
                }
                cancelText={
                  <FormattedMessage
                    id="button.cancel"
                    defaultMessage="Cancel"
                  />
                }
                open={searchModalOpen}
                onOk={handleModalSearch}
                onCancel={handleModalCancel}
                okButtonProps={loading}
              >
                {/* {searchForm} */}
              </Modal>
              <Table
                className={"main-table"}
                rowKey={(record) => record.id}
                loading={loading}
                columns={columns}
                dataSource={searchCriteria ? searchPageData : pageData}
                pagination={false}
                rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      setSelectedRecord(record);
                      setSelectedRowIndex(record.id);
                    },
                  };
                }}
              />
              <Row style={{ justifyContent: "space-between", marginBottom: 5 }}>
                <div></div>
                <Space style={{ padding: "0.5rem 1.5rem 0 0" }}>
                  <Tooltip
                    title={
                      <FormattedMessage
                        id="button.refetch"
                        defaultMessage="Refetch"
                      />
                    }
                  >
                    <Button
                      icon={<SyncOutlined />}
                      loading={loading}
                      disabled={!refetchEnabled}
                      onClick={handleRefetch}
                    />
                  </Tooltip>
                  <Tooltip
                    title={
                      <FormattedMessage
                        id="button.previous"
                        defaultMessage="Previous"
                      />
                    }
                  >
                    <Button
                      icon={<LeftOutlined />}
                      loading={loading}
                      disabled={!hasPreviousPage}
                      onClick={handlePrevious}
                    />
                  </Tooltip>
                  <Tooltip
                    title={
                      <FormattedMessage
                        id="button.next"
                        defaultMessage="Next"
                      />
                    }
                  >
                    <Button
                      icon={<RightOutlined />}
                      loading={loading}
                      disabled={!hasNextPage}
                      onClick={handleNext}
                    />
                  </Tooltip>
                </Space>
              </Row>
            </>
          </div>
        </Flex>
        <TxnDetailColumn
          business={business}
          selectedAccount={selectedAcc}
          transactionRecord={selectedRecord}
          setTransactionRecord={setSelectedRecord}
          setTransactionRowIndex={setSelectedRowIndex}
          setEditModalOpen={getEditModalSetter(selectedRecord?.transactionType)}
          onDelete={handleDelete}
        />
      </Flex>
    </>
  );
};

export default AllTransactions;
