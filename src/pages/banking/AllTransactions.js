import React, { useMemo, useState, useEffect } from "react";
import {
  CloseOutlined,
  CaretDownOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Button, Divider, Dropdown, Flex, Space } from "antd";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { PaginatedBankingTransactionTable } from "../../components";
import { BankingTransactionQueries, BankingQueries } from "../../graphql";
import { useHistoryState } from "../../utils/HelperFunctions";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useQuery, useReadQuery } from "@apollo/client";
import { openErrorNotification } from "../../utils/Notification";
import {
  OwnerDrawingsNew,
  TransferFromAnotherAccNew,
  TransferToAnotherAccNew,
  OwnerContributionNew,
  PaymentRefund,
  CreditNoteRefund,
  SupplierAdvance,
  CustomerAdvance,
  SupplierCreditRefund,
  ExpenseRefundNew,
  OtherIncome,
  TransferToAnotherAccEdit,
  TxnDetailColumn,
  TransferFromAnotherAccEdit,
  OwnerContributionEdit,
  ExpenseNew,
  ExpenseEdit,
  ExpenseRefundEdit,
} from "./";
import { render } from "@testing-library/react";
import OwnerDrawingsEdit from "./OwnerDrawingsEdit";
import { CustomerSearchModal } from "../../components";
const { GET_PAGINATE_BANKING_TRANSACTION } = BankingTransactionQueries;
const { GET_BANKING_ACCOUNTS } = BankingQueries;

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
            id="label.paymentRefund"
            defaultMessage="Payment Refund"
          />
        ),
      },
      {
        key: "1-4",
        label: (
          <FormattedMessage
            id="label.creditNoteRefund"
            defaultMessage="Credit Note Refund"
          />
        ),
      },
      {
        key: "1-5",
        label: (
          <FormattedMessage
            id="label.supplierAdvance"
            defaultMessage="Supplier Advance"
          />
        ),
      },
      {
        key: "1-6",
        label: <FormattedMessage id="label.expense" defaultMessage="Expense" />,
      },
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
            id="label.supplierCreditRefund"
            defaultMessage="Supplier Credit Refund"
          />
        ),
      },
      {
        key: "2-4",
        label: (
          <FormattedMessage
            id="label.supplierPaymentRefund"
            defaultMessage="Supplier Payment Refund"
          />
        ),
      },
      {
        key: "2-5",
        label: (
          <FormattedMessage
            id="label.customerAdvance"
            defaultMessage="Customer Advance"
          />
        ),
      },
      {
        key: "2-6",
        label: (
          <FormattedMessage
            id="label.otherIncome"
            defaultMessage="Other Income"
          />
        ),
      },
      {
        key: "2-7",
        label: (
          <FormattedMessage
            id="label.expenseRefund"
            defaultMessage="Expense Refund"
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
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allAccountsQueryRef,
    business,
    refetchAllAccounts,
    allPaymentModesQueryRef,
    allTaxesQueryRef,
    allTaxGroupsQueryRef,
  } = useOutletContext();
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
  const [ownerDrawingsModalOpen, setOwnerDrawingsModalOpen] = useState(false);
  const [ownerContributionNewModalOpen, setOwnerContributionNewModalOpen] =
    useState(false);
  const [ownerContributionEditModalOpen, setOwnerContributionEditModalOpen] =
    useState(false);
  const [paymentRefundModalOpen, setPaymentRefundModalOpen] = useState(false);
  const [creditNoteRefundModalOpen, setCreditNoteRefundModalOpen] =
    useState(false);
  const [supplierAdvanceModalOpen, setSupplierAdvanceModalOpen] =
    useState(false);
  const [customerAdvanceModalOpen, setCustomerAdvanceModalOpen] =
    useState(false);
  const [supplierCreditRefundModalOpen, setSupplierCreditRefundModalOpen] =
    useState(false);
  const [otherIncomeModalOpen, setOtherIncomeModalOpen] = useState(false);
  const [expenseRefundNewModalOpen, setExpenseRefundNewModalOpen] =
    useState(false);
  const [expenseRefundEditModalOpen, setExpenseRefundEditModalOpen] =
    useState(false);
  const [expenseNewModalOpen, setExpenseNewModalOpen] = useState(false);
  const [expenseEditModalOpen, setExpenseEditModalOpen] = useState(false);

  console.log("banking accounts", bankingAccounts);
  console.log("account id", accountId);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: paymentModeData } = useReadQuery(allPaymentModesQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

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

  const parseData = (data) => {
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
  };

  const parsePageInfo = (data) => {
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
  };

  const handleAccountChange = (key) => {
    const selectedFilter = bankingAccounts.find((acc) => acc.key === key);
    setSelectedAcc(selectedFilter);
    setSelectedRecord(null);
  };

  const getEditModalSetter = (transactionType) => {
    if (!transactionType) return () => {};
    switch (transactionType) {
      case "TransferToAnotherAccount":
        return setTransferToEditModalOpen;
      case "OwnerDrawings":
        return setOwnerDrawingsModalOpen;
      case "PaymentRefund":
        return setPaymentRefundModalOpen;
      case "CreditNoteRefund":
        return setCreditNoteRefundModalOpen;
      case "SupplierAdvance":
        return setSupplierAdvanceModalOpen;
      case "TransferFromAnotherAccounts":
        return setTransferFromEditModalOpen;
      case "OwnerContribution":
        return setOwnerContributionEditModalOpen;
      case "SupplierCreditRefund":
        return setSupplierCreditRefundModalOpen;
      case "CustomerAdvance":
        return setCustomerAdvanceModalOpen;
      case "OtherIncome":
        return setOtherIncomeModalOpen;
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
    {
      title: (
        <FormattedMessage
          id="label.transactionDetails"
          defaultMessage="Transaction Details"
        />
      ),
      key: "transactionDetails",
      dataIndex: "description",
    },
    {
      title: <FormattedMessage id="label.type" defaultMessage="Type" />,
      key: "transactionType",
      dataIndex: "transactionType",
    },
    {
      title: <FormattedMessage id="label.deposits" defaultMessage="Deposits" />,
      key: "deposits",
      dataIndex: "baseDebit",
      render: (_, record) =>
        record.isMoneyIn && (
          <>
            {record.currency?.symbol}{" "}
            <FormattedNumber
              value={record.amount}
              style="decimal"
              minimumFractionDigits={record.currency?.decimalPlaces}
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
        !record.isMoneyIn && (
          <>
            {record.currency?.symbol}{" "}
            <FormattedNumber
              value={record.amount}
              style="decimal"
              minimumFractionDigits={record.currency?.decimalPlaces}
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
      <TransferToAnotherAccNew
        modalOpen={transferToNewModalOpen}
        setModalOpen={setTransferToNewModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
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
      />
      <OwnerDrawingsNew
        modalOpen={ownerDrawingsModalOpen}
        setModalOpen={setOwnerDrawingsModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={equityAccounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
      />
      <OwnerDrawingsEdit
        modalOpen={ownerDrawingsModalOpen}
        setModalOpen={setOwnerDrawingsModalOpen}
        branches={branches}
        currencies={currencies}
        bankingAccounts={bankingAccounts}
        accounts={equityAccounts}
        allAccounts={accountData?.listAllAccount}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
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
      />
      <ExpenseRefundNew
        modalOpen={expenseRefundNewModalOpen}
        setModalOpen={setExpenseRefundNewModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedRecord={selectedRecord}
        allTax={allTax}
        selectedAcc={selectedAcc}
        paymentModes={paymentModes}
      />
      <ExpenseRefundEdit
        modalOpen={expenseRefundEditModalOpen}
        setModalOpen={setExpenseRefundEditModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        allTax={allTax}
        paymentModes={paymentModes}
        selectedAcc={selectedAcc}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
      />
      <SupplierAdvance
        modalOpen={supplierAdvanceModalOpen}
        setModalOpen={setSupplierAdvanceModalOpen}
        branches={branches}
        currencies={currencies}
        paymentModes={paymentModes}
        selectedRecord={selectedRecord}
      />
      <CustomerAdvance
        modalOpen={customerAdvanceModalOpen}
        setModalOpen={setCustomerAdvanceModalOpen}
        branches={branches}
        currencies={currencies}
        paymentModes={paymentModes}
        selectedRecord={selectedRecord}
      />
      <PaymentRefund
        modalOpen={paymentRefundModalOpen}
        setModalOpen={setPaymentRefundModalOpen}
        branches={branches}
        currencies={currencies}
        selectedRecord={selectedRecord}
      />
      <CreditNoteRefund
        modalOpen={creditNoteRefundModalOpen}
        setModalOpen={setCreditNoteRefundModalOpen}
        paymentModes={paymentModes}
      />
      <SupplierCreditRefund
        modalOpen={supplierCreditRefundModalOpen}
        setModalOpen={setSupplierCreditRefundModalOpen}
        paymentModes={paymentModes}
      />
      <OtherIncome
        modalOpen={otherIncomeModalOpen}
        setModalOpen={setOtherIncomeModalOpen}
        branches={branches}
        parsedData={bankingAccounts}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedRecord={selectedRecord}
        paymentModes={paymentModes}
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
                        setOwnerDrawingsModalOpen(true);
                      } else if (key === "1-3") {
                        setPaymentRefundModalOpen(true);
                      } else if (key === "1-4") {
                        setCreditNoteRefundModalOpen(true);
                      } else if (key === "1-5") {
                        setSupplierAdvanceModalOpen(true);
                      } else if (key === "1-6") {
                        setExpenseNewModalOpen(true);
                      } else if (key === "2-1") {
                        setTransferFromNewModalOpen(true);
                      } else if (key === "2-2") {
                        setOwnerContributionNewModalOpen(true);
                      } else if (key === "2-3") {
                        setSupplierCreditRefundModalOpen(true);
                      } else if (key === "2-5") {
                        setCustomerAdvanceModalOpen(true);
                      } else if (key === "2-6") {
                        setOtherIncomeModalOpen(true);
                      } else if (key === "2-7") {
                        setExpenseRefundNewModalOpen(true);
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
            <PaginatedBankingTransactionTable
              // loading={loading}
              accountId={selectedAcc.id}
              api={notiApi}
              columns={columns}
              gqlQuery={GET_PAGINATE_BANKING_TRANSACTION}
              // searchForm={searchForm}
              // searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_BANKING_TRANSACTION}
              searchTitle={
                <FormattedMessage
                  id="bill.search"
                  defaultMessage="Search Bills"
                />
              }
              // searchCriteria={searchCriteria}
              // setSearchCriteria={setSearchCriteria}
              parseData={parseData}
              parsePageInfo={parsePageInfo}
              showAddNew={true}
              // searchModalOpen={searchModalOpen}
              // setSearchModalOpen={setSearchModalOpen}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              setSelectedRowIndex={setSelectedRowIndex}
              selectedRowIndex={selectedRowIndex}
              // compactColumns={compactColumns}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </Flex>
        <TxnDetailColumn
          transactionRecord={selectedRecord}
          setTransactionRecord={setSelectedRecord}
          setTransactionRowIndex={setSelectedRowIndex}
          setEditModalOpen={getEditModalSetter(selectedRecord?.transactionType)}
        />
      </Flex>
    </>
  );
};

export default AllTransactions;
