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
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import {
  useReadQuery,
  useMutation,
  useApolloClient,
  useQuery,
  gql,
} from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import {
  CustomerSearchModal,
  AddPurchaseProductsModal,
  UploadAttachment,
} from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import { ReactComponent as TaxOutlined } from "../../assets/icons/TaxOutlined.svg";
import { ReactComponent as PercentageOutlined } from "../../assets/icons/PercentageOutlined.svg";
import {
  CreditNoteMutations,
  WarehouseQueries,
  StockQueries,
} from "../../graphql";
import {
  calculateItemDiscountAndTax,
  calculateDiscountAmount,
} from "../../utils/HelperFunctions";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { UPDATE_CREDIT_NOTE } = CreditNoteMutations;

const { GET_AVAILABLE_STOCKS } = StockQueries;

const discountPreferences = [
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

const CreditNotesEdit = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.record;
  const [data, setData] = useState(
    record?.details?.map((detail, index) => ({
      key: index + 1,
      detailId: detail.id,
      name: detail.name,
      amount: detail.detailTotalAmount,
      rate: detail.detailUnitRate,
      taxAmount: detail.detailTaxAmount,
      discountAmount: detail.detailDiscountAmount,
      taxRate: detail.detailTax?.rate,
      discount: detail.detailDiscount,
      discountType: detail.detailDiscountType,
      id: detail.productType + detail.productId,
      detailDiscountType: detail.detailDiscountType,
      quantity: detail.detailQty,
    }))
  );

  const {
    notiApi,
    msgApi,
    business,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allTaxesQueryRef,
    allTaxGroupsQueryRef,
    allAccountsQueryRef,
    allWarehousesQueryRef,
    allProductsQueryRef,
    allProductVariantsQueryRef,
  } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(
    record.customer?.id ? record.customer : ""
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState(
    record?.warehouse?.id > 0 ? record?.warehouse?.id : null
  );
  const [discountPreference, setDiscountPreference] = useState(
    record?.orderDiscount > 0
      ? {
          key: "0",
          label: "At Transaction Level",
        }
      : { key: "1", label: "At Line Item Level" }
  );
  const [taxPreference, setTaxPreference] = useState(
    record?.isTaxInclusive
      ? { key: "1", label: "Tax Inclusive" }
      : {
          key: "0",
          label: "Tax Exclusive",
        }
  );
  const [addProductsModalOpen, setAddPurchaseProductsModalOpen] =
    useState(false);
  const [subTotal, setSubTotal] = useState(record?.creditNoteSubtotal);
  const [totalTaxAmount, setTotalTaxAmount] = useState(
    record?.creditNoteTotalTaxAmount
  );
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(
    record?.creditNoteTotalDiscountAmount
  );
  const [totalAmount, setTotalAmount] = useState(record?.creditNoteTotalAmount);
  const [adjustment, setAdjustment] = useState(record?.adjustmentAmount);
  // const [tableKeyCounter, setTableKeyCounter] = useState(
  //   record?.details.length
  // );
  const [selectedCurrency, setSelectedCurrency] = useState(
    business.baseCurrency.id
  );
  const [discount, setDiscount] = useState(0);
  const [selectedDiscountType, setSelectedDiscountType] = useState(
    record?.creditNoteDiscountType
  );
  const [discountAmount, setDiscountAmount] = useState(
    record?.creditNoteDiscountAmount || 0
  );
  const [isTaxInclusive, setIsTaxInclusive] = useState(record?.isTaxInclusive);
  const [isAtTransactionLevel, setIsAtTransactionLevel] = useState(
    discountPreference.key === "0"
  );
  const [saveStatus, setSaveStatus] = useState("Draft");
  const [fileList, setFileList] = useState(null);

  const initialValues = {
    currency: business.baseCurrency.id,
    paymentTerms: "DueOnReceipt",
    date: dayjs(),
    branch: business.primaryBranch.id,
  };

  // Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);
  const { data: productData } = useReadQuery(allProductsQueryRef);
  const { data: productVariantData } = useReadQuery(allProductVariantsQueryRef);

  const { loading: stockLoading, data: stockData } = useQuery(
    GET_AVAILABLE_STOCKS,
    {
      skip: !selectedWarehouse,
      variables: { warehouseId: selectedWarehouse },
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );
  // Mutations
  const [updateCreditNote, { loading: updateLoading }] = useMutation(
    UPDATE_CREDIT_NOTE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="creditNote.updated"
            defaultMessage="Credit Note Updated"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = updateLoading;

  useMemo(() => {
    // const taxId = record?.supplierTaxType + record?.supplierTaxId;
    const parsedRecord = record
      ? {
          customerName: record?.customerName,
          branch: record?.branch?.id,
          referenceNumber: record?.referenceNumber,
          creditDate: dayjs(record?.creditNoteDate),
          currency: record?.currency?.id,
          exchangeRate: record?.exchangeRate,
          warehouse: record?.warehouse?.id,
          notes: record?.notes,
          discount: record?.creditNoteDiscount,
          adjustment: record?.adjustmentAmount || null,
          subject: record?.creditNoteSubject,
          creditNumber: record?.creditNoteNumber,
          // Map transactions to form fields
          ...record?.details.reduce((acc, d, index) => {
            acc[`account${index + 1}`] = d.detailAccount?.id || null;
            acc[`quantity${index + 1}`] = d.detailQty;
            acc[`rate${index + 1}`] = d.detailUnitRate;
            acc[`detailDiscount${index + 1}`] = d.detailDiscount;
            acc[`detailTax${index + 1}`] =
              d.detailTax?.id !== "I0" ? d.detailTax?.id : null;
            acc[`detailDiscountType${index + 1}`] = d.detailDiscountType;
            return acc;
          }, {}),
        }
      : {};

    form.setFieldsValue(parsedRecord);
  }, [form, record]);

  const branches = useMemo(() => {
    return branchData?.listAllBranch;
  }, [branchData]);

  const accounts = useMemo(() => {
    return accountData?.listAllAccount;
  }, [accountData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency;
  }, [currencyData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse;
  }, [warehouseData]);

  const products = useMemo(() => {
    return productData?.listAllProduct;
  }, [productData]);

  const productVariants = useMemo(() => {
    return productVariantData?.listAllProductVariant?.filter(
      (p) => p.isActive === true
    );
  }, [productVariantData]);

  const taxes = useMemo(() => {
    return taxData?.listAllTax;
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup;
  }, [taxGroupData]);

  const allProducts = useMemo(() => {
    const productsWithS = products
      ? products.map((product) => ({ ...product, id: "S" + product.id }))
      : [];

    const productsWithV = productVariants
      ? productVariants.map((variant) => ({ ...variant, id: "V" + variant.id }))
      : [];

    return [...productsWithS, ...productsWithV];
  }, [products, productVariants]);

  const stocks = useMemo(() => {
    return stockData?.getAvailableStocks;
  }, [stockData]);

  const productStocks = useMemo(() => {
    return allProducts?.map((product) => {
      const stock = stocks?.find((stockItem) => {
        const stockId = stockItem.productType + stockItem.productId;
        return stockId === product.id;
      });
      return {
        ...product,
        currentQty: stock ? stock.currentQty : 0,
        unit: stock?.product?.productUnit || null,
      };
    });
  }, [allProducts, stocks]);

  useEffect(() => {
    if (selectedWarehouse) {
      setData((prevData) => {
        return prevData.map((item) => {
          const matchingProductStock = productStocks.find(
            (product) => product.id === item.id
          );
          return {
            ...item,
            currentQty: matchingProductStock
              ? matchingProductStock.currentQty
              : 0,
            unit: matchingProductStock ? matchingProductStock.unit : item.unit,
          };
        });
      });
    }
  }, [selectedWarehouse, productStocks]);

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

  const decimalPlaces = currencies.find(
    (c) => c.id === selectedCurrency
  ).decimalPlaces;

  const onFinish = async (values) => {
    console.log("values", values);
    let foundInvalid = false;
    const details = data.map((item) => {
      if ((!item.name || item.amount === 0) && !item.isDeletedItem) {
        foundInvalid = true;
      }
      const taxId = values[`detailTax${item.key}`];
      const tax = allTax.find((taxGroup) =>
        taxGroup.taxes.some((tax) => tax.id === taxId)
      );
      const detailTaxType = tax && tax.title === "Tax Group" ? "G" : "I";
      const detailTaxId = taxId ? parseInt(taxId?.replace(/[IG]/, ""), 10) : 0;
      const productId = item.id;
      const detailProductType = productId ? Array.from(productId)[0] : "S";
      let detailProductId = productId
        ? parseInt(productId?.replace(/[SGCV]/, ""), 10)
        : 0;
      if (isNaN(detailProductId)) detailProductId = 0;
      return {
        detailId: item.detailId || 0,
        productId: detailProductId,
        productType: detailProductType,
        // batchNumber
        name: item.name || values[`product${item.key}`],
        detailAccountId: values[`account${item.key}`],
        detailQty: item.quantity || 0,
        detailUnitRate: item.rate || 0,
        detailTaxId,
        detailTaxType,
        detailDiscount: item.discount || 0,
        detailDiscountType: item.discountType ? item.discountType : "P",
        isDeletedItem: item.isDeletedItem || false,
      };
    });

    if (details.length === 0 || foundInvalid) {
      intl.formatMessage({
        id: "validation.invalidProductDetails",
        defaultMessage: "Invalid Product Details",
      });
      return;
    }

    const fileUrls = fileList?.map((file) => ({
      documentUrl: file.imageUrl || file.documentUrl,
      isDeletedItem: file.isDeletedItem,
      id: file.id,
    }));

    console.log("details", details);
    const input = {
      branchId: values.branch,
      customerId: selectedCustomer.id,
      referenceNumber: values.referenceNumber,
      creditNoteDate: values.creditDate,
      notes: values.notes,
      currencyId: values.currency,
      exchangeRate: values.exchangeRate,
      creditNoteDiscount: isAtTransactionLevel ? discount : 0,
      creditNoteDiscountType: selectedDiscountType,
      adjustmentAmount: adjustment,
      isTaxInclusive: isTaxInclusive,
      creditNoteTaxId: 0,
      creditNoteTaxType: "I",
      currentStatus: saveStatus,
      documents: fileUrls,
      warehouseId: values.warehouse,
      details,
    };
    console.log("Input", input);
    await updateCreditNote({
      variables: { id: record.id, input },
      update(cache, { data: { updateCreditNote } }) {
        cache.modify({
          fields: {
            paginateCreditNote(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) => x.node.__ref === "CreditNote:" + updateCreditNote.id
              );
              if (index >= 0) {
                const newCreditNote = cache.writeFragment({
                  data: updateCreditNote,
                  fragment: gql`
                    fragment NewCreditNote on CreditNote {
                      id
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newCreditNote;
                return paginationCopy;
              } else {
                return pagination;
              }
            },
          },
        });
      },
    });
  };

  const handleAddRow = () => {
    const newRowKey = data.length + 1;
    setData([
      ...data,
      {
        key: newRowKey,
        amount: 0,
        taxAmount: 0,
        discountAmount: 0,
        taxRate: 0,
        discount: 0,
        discountType: "P",
      },
    ]);
  };

  const handleRemoveRow = (keyToRemove) => {
    let newData = [...data];

    // If the item to be removed doesn't have detailId
    if (!newData[keyToRemove - 1].detailId) {
      for (let i = keyToRemove - 1; i < newData.length - 1; i++) {
        // Shift the data of each row
        newData[i] = { ...newData[i + 1], key: i + 1 };

        const nextRowValues = form.getFieldsValue([
          `product${i + 1}`,
          `account${i + 1}`,
          `detailDiscount${i + 1}`,
          `quantity${i + 1}`,
          `rate${i + 1}`,
          `detailTax${i + 1}`,
        ]);

        // shift the form values to the current row
        form.setFieldsValue({
          [`product${i}`]: nextRowValues[`product${i + 1}`],
          [`account${i}`]: nextRowValues[`account${i + 1}`],
          [`detailDiscount${i}`]: nextRowValues[`detailDiscount${i + 1}`],
          [`quantity${i}`]: nextRowValues[`quantity${i + 1}`],
          [`rate${i}`]: nextRowValues[`rate${i + 1}`],
          [`detailTax${i}`]: nextRowValues[`detailTax${i + 1}`],
        });
      }

      // clear the form values of the last row
      form.setFieldsValue({
        [`product${data.length}`]: null,
        [`account${data.length}`]: null,
        [`detailDiscount${data.length}`]: null,
        [`quantity${data.length}`]: null,
        [`rate${data.length}`]: null,
        [`detailTax${data.length}`]: null,
      });

      newData.pop();
    } else {
      // If the item has detailId mark it as deleted
      newData[keyToRemove - 1] = {
        ...newData[keyToRemove - 1],
        isDeletedItem: true,
        amount: 0,
        discount: 0,
        discountAmount: 0,
        quantity: 0,
        rate: 0,
        taxAmount: 0,
        taxRate: 0,
        id: null,
        discountType: "P",
        detailTax: null,
      };
    }
    setData(newData);
    recalculateTotalAmount(newData, isTaxInclusive, isAtTransactionLevel);
  };

  const handleModalRowSelect = (record) => {
    setSelectedCustomer(record);
    form.setFieldsValue({ customerName: record.name });
  };

  const handleTaxPreferenceChange = (key) => {
    const taxPreference = taxPreferences.find((option) => option.key === key);
    setTaxPreference(taxPreference);
    setIsTaxInclusive(key === "1");
    recalculateTotalAmount(data, key === "1", isAtTransactionLevel);
  };

  const handleDiscountPreferenceChange = (key) => {
    const discountPreference = discountPreferences.find(
      (option) => option.key === key
    );
    setDiscountPreference(discountPreference);
    setIsAtTransactionLevel(key === "0");
    recalculateTotalAmount(data, isTaxInclusive, key === "0");
  };

  const handleAddProductsInBulk = (selectedItemsBulk) => {
    let newData = [...data];

    // Filter existing items from the selected bulk items
    const existingItems = data.filter((dataItem) =>
      selectedItemsBulk.some((selectedItem) => selectedItem.id === dataItem.id)
    );

    // Update quantity for existing items
    existingItems.forEach((existingItem) => {
      const matchingSelectedItem = selectedItemsBulk.find(
        (selectedItem) => selectedItem.id === existingItem.id
      );
      form.setFieldsValue({
        [`quantity${existingItem.key}`]:
          existingItem.quantity + matchingSelectedItem.quantity,
      });
    });

    // Update data with new quantities for existing items
    if (existingItems.length > 0) {
      newData = data.map((dataItem) => {
        const matchingSelectedItem = selectedItemsBulk.find(
          (selectedItem) => selectedItem.id === dataItem.id
        );

        if (matchingSelectedItem) {
          const newQuantity = dataItem.quantity + matchingSelectedItem.quantity;
          const [amount, discountAmount, taxAmount] = calculateItemAmount({
            ...dataItem,
            quantity: newQuantity,
          });
          return {
            ...dataItem,
            quantity: newQuantity,
            amount,
            discountAmount,
            taxAmount,
          };
        }

        return dataItem;
      });
    }

    // Filter non-existing items from the selected bulk items
    const nonExistingItems = selectedItemsBulk.filter(
      (selectedItem) =>
        !data.some((dataItem) => dataItem.id === selectedItem.id)
    );

    if (nonExistingItems.length > 0) {
      const maxKey = Math.max(...data.map((dataItem) => dataItem.key), 0);

      nonExistingItems.forEach((selectedItem, index) => {
        const newRowKey = maxKey + 1 + index;
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...selectedItem,
        });
        const newDataItem = {
          key: newRowKey,
          ...selectedItem,
          amount,
          discountAmount,
          taxAmount,
        };

        // Add the new data item to the existing data array
        newData = [...newData, newDataItem];

        // Set the form fields for the new data item
        form.setFieldsValue({
          [`product${newRowKey}`]: selectedItem.id,
          [`account${newRowKey}`]: selectedItem.account || null,
          [`rate${newRowKey}`]: selectedItem.rate,
          [`detailTax${newRowKey}`]:
            selectedItem.detailTax !== "I0" ? selectedItem.detailTax : null,
          [`quantity${newRowKey}`]: selectedItem.quantity,
        });
      });
    }

    // Update state and recalculate total amount if new data is added
    if (newData.length > 0) {
      setData(newData);
      recalculateTotalAmount(newData, isTaxInclusive, isAtTransactionLevel);
    }
  };

  const handleSelectItem = (value, rowKey) => {
    const selectedItem = productStocks?.find((product) => product.id === value);
    const dataIndex = data.findIndex((dataItem) => dataItem.key === rowKey);
    if (dataIndex !== -1) {
      const oldData = data[dataIndex];
      let newData = {
        key: rowKey,
        name: value,
        quantity: oldData.quantity || 1,
        ...oldData,
      };
      if (selectedItem && selectedItem.id) {
        // cancel if selected item is already in the list
        const foundIndex = data.findIndex(
          (dataItem) => dataItem.id === selectedItem.id
        );
        if (foundIndex !== -1) {
          form.setFieldsValue({ [`product${rowKey}`]: null });
          openErrorNotification(
            notiApi,
            intl.formatMessage({
              id: "error.productIsAlreadyAdded",
              defaultMessage: "Product is already added",
            })
          );
          return;
        }
        newData.id = selectedItem.id;
        newData.name = selectedItem.name;
        newData.sku = selectedItem.sku;
        newData.rate = selectedItem.purchasePrice;
        newData.detailTax = selectedItem.purchaseTax?.id;
        newData.taxRate = selectedItem.purchaseTax?.rate;
        newData.currentQty = selectedItem.currentQty;
        newData.account = selectedItem.inventoryAccount?.id;
        newData.unit = selectedItem.unit;
      }
      const [amount, discountAmount, taxAmount] = calculateItemAmount(newData);
      newData.amount = amount;
      newData.discountAmount = discountAmount;
      newData.taxAmount = taxAmount;
      console.log(newData);
      const updatedData = [...data];
      updatedData[dataIndex] = newData;
      recalculateTotalAmount(updatedData, isTaxInclusive, isAtTransactionLevel);
      setData(updatedData);
    }

    form.setFieldsValue({
      [`account${rowKey}`]: selectedItem.inventoryAccount?.id || null,
      [`rate${rowKey}`]: selectedItem.purchasePrice,
      [`detailTax${rowKey}`]:
        selectedItem.purchaseTax.id !== "I0"
          ? selectedItem.purchaseTax.id
          : null,
      [`quantity${rowKey}`]: 1,
    });
  };

  const handleRemoveSelectedItem = (idToRemove, rowKey) => {
    const updatedData = data.map((dataItem) => {
      if (dataItem.id === idToRemove) {
        return { key: dataItem.key, amount: 0 };
      }
      return dataItem;
    });
    recalculateTotalAmount(updatedData, isTaxInclusive, isAtTransactionLevel);
    setData(updatedData);
    form.setFieldsValue({
      [`product${rowKey}`]: "",
      [`account${rowKey}`]: "",
      [`quantity${rowKey}`]: "",
      [`rate${rowKey}`]: "",
      [`detailTax${rowKey}`]: "",
    });
  };

  const calculateItemAmount = (item) => {
    let itemDiscount = parseFloat(item.discount) || 0;
    if (isAtTransactionLevel) {
      itemDiscount = 0;
    }

    const [amount, discountAmount, taxAmount] = calculateItemDiscountAndTax(
      parseFloat(item.quantity) || 0,
      parseFloat(item.rate) || 0,
      itemDiscount,
      item.discountType || "P",
      parseFloat(item.taxRate) || 0,
      isTaxInclusive,
      decimalPlaces
    );
    const newTotalTaxAmount = totalTaxAmount - item.taxAmount + taxAmount;
    const newSubTotal = subTotal - item.amount + amount;
    setTotalDiscountAmount(
      totalDiscountAmount - item.discountAmount + discountAmount
    );
    setTotalTaxAmount(newTotalTaxAmount);
    setSubTotal(newSubTotal);
    calculateTotalAmount(newSubTotal, newTotalTaxAmount, isAtTransactionLevel);
    return [amount, discountAmount, taxAmount];
  };

  const calculateTotalAmount = (
    newSubTotal,
    newTotalTaxAmount,
    isAtTransactionLevel
  ) => {
    // discount at transaction level
    if (isAtTransactionLevel) {
      const newDiscountAmount = calculateDiscountAmount(
        newSubTotal,
        discount,
        selectedDiscountType,
        decimalPlaces
      );
      setDiscountAmount(newDiscountAmount);
      setTotalAmount(newSubTotal + newTotalTaxAmount - newDiscountAmount);
    } else {
      setTotalAmount(newSubTotal + newTotalTaxAmount);
    }
  };

  const recalculateTotalAmount = (
    data,
    isTaxInclusive,
    isAtTransactionLevel
  ) => {
    // recalculate subtotal
    let subTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;
    let newData = [];
    data.forEach((item) => {
      let itemDiscount = parseFloat(item.discount) || 0;
      if (isAtTransactionLevel) {
        itemDiscount = 0;
      }
      const [amount, discountAmount, taxAmount] = calculateItemDiscountAndTax(
        parseFloat(item.quantity) || 0,
        parseFloat(item.rate) || 0,
        itemDiscount,
        item.discountType || "P",
        parseFloat(item.taxRate) || 0,
        isTaxInclusive,
        decimalPlaces
      );
      newData.push({ ...item, amount, discountAmount, taxAmount });
      subTotal += amount;
      totalDiscountAmount += discountAmount;
      totalTaxAmount += taxAmount;
    });
    setData(newData);
    setSubTotal(subTotal);
    setTotalDiscountAmount(totalDiscountAmount);
    setTotalTaxAmount(totalTaxAmount);
    calculateTotalAmount(subTotal, totalTaxAmount, isAtTransactionLevel);
  };

  const handleDiscountChange = (value) => {
    const newDiscount = parseFloat(value) || 0;
    const newDiscountAmount = calculateDiscountAmount(
      subTotal,
      newDiscount,
      selectedDiscountType,
      decimalPlaces
    );
    setDiscount(newDiscount);
    setDiscountAmount(newDiscountAmount);
    setTotalAmount(totalAmount + discountAmount - newDiscountAmount);
  };

  const handleDiscountTypeChange = (value) => {
    const type = value === "P" ? "P" : "A";
    const newDiscountAmount = calculateDiscountAmount(
      subTotal,
      discount,
      type,
      decimalPlaces
    );
    setSelectedDiscountType(type);
    setDiscountAmount(newDiscountAmount);
    setTotalAmount(totalAmount + discountAmount - newDiscountAmount);
  };

  const handleQuantityChange = (value, rowKey) => {
    const updatedData = data.map((item) => {
      if (item.key === rowKey) {
        const quantity = parseFloat(value) || 0;
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...item,
          quantity,
        });
        return { ...item, quantity, amount, discountAmount, taxAmount };
      }
      return item;
    });
    setData(updatedData);
  };

  const handleRateChange = (value, rowKey) => {
    const updatedData = data.map((item) => {
      if (item.key === rowKey) {
        const rate = parseFloat(value) || 0;
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...item,
          rate,
        });
        return { ...item, rate, amount, discountAmount, taxAmount };
      }
      return item;
    });
    setData(updatedData);
  };

  const handleDetailDiscountChange = (value, rowKey) => {
    const updatedData = data.map((item) => {
      if (item.key === rowKey) {
        const discount = parseFloat(value) || 0;
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...item,
          discount,
        });
        return { ...item, discount, amount, discountAmount, taxAmount };
      }
      return item;
    });
    setData(updatedData);
  };

  const handleDetailDiscountTypeChange = (value, rowKey) => {
    const updatedData = data.map((item) => {
      if (item.key === rowKey) {
        const discountType = value || "P";
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...item,
          discountType,
        });
        return { ...item, discountType, amount, discountAmount, taxAmount };
      }
      return item;
    });
    setData(updatedData);
  };

  const handleDetailTaxChange = (value, rowKey) => {
    const updatedData = data.map((item) => {
      if (item.key === rowKey) {
        let taxRate = 0;
        if (value) {
          const taxId = value;
          const tax = allTax.find((taxGroup) =>
            taxGroup.taxes.some((tax) => tax.id === taxId)
          );
          const detailTaxType = tax && tax.title === "Tax Group" ? "G" : "I";
          const detailTaxId = taxId
            ? parseInt(taxId?.replace(/[IG]/, ""), 10)
            : 0;
          if (detailTaxType === "I") {
            taxRate = taxes.find((t) => t.id === detailTaxId).rate;
          } else {
            taxRate = taxGroups.find((t) => t.id === detailTaxId).rate;
          }
        }
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...item,
          taxRate,
        });
        return { ...item, taxRate, amount, discountAmount, taxAmount };
      }
      return item;
    });
    setData(updatedData);
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
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text, record) => (
        <>
          {text && (
            <Flex
              vertical
              style={{
                marginBottom: "24px",
                paddingRight: "0.5rem",
                minWidth: "220px",
              }}
            >
              <Flex justify="space-between">
                {text}
                {!record.detailId && (
                  <CloseCircleOutlined
                    onClick={() =>
                      handleRemoveSelectedItem(record.id, record.key)
                    }
                  />
                )}
              </Flex>
              <div>
                {record.sku ? (
                  <>
                    <span style={{ fontSize: "var(--small-text)" }}>
                      SKU: {record.sku}{" "}
                    </span>
                    <Divider type="vertical" />
                  </>
                ) : (
                  <div></div>
                )}
                {record.currentQty || record.currentQty === 0 ? (
                  <span
                    style={{
                      fontSize: "var(--small-text)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Stock on Hand :{" "}
                    <FormattedNumber
                      value={record.currentQty}
                      style="decimal"
                      minimumFractionDigits={record.unit?.precision}
                    />{" "}
                    {record.unit && record.unit.abbreviation}
                  </span>
                ) : (
                  <div></div>
                )}
              </div>
            </Flex>
          )}
          <Form.Item
            hidden={text}
            name={`product${record.key}`}
            rules={[
              {
                required: text ? false : true,
                message: (
                  <FormattedMessage
                    id="label.product.required"
                    defaultMessage="Select the Product"
                  />
                ),
              },
            ]}
          >
            <AutoComplete
              loading={stockLoading}
              className="custom-select"
              style={{
                minWidth: "250px",
              }}
              placeholder="Type or click to select a product."
              optionFilterProp="label"
              filterOption={(inputValue, option) =>
                option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
              }
              onSelect={(value) => handleSelectItem(value, record.key)}
            >
              {productStocks?.map((option) => (
                <AutoComplete.Option
                  value={option.id}
                  key={option.id}
                  label={option.name}
                >
                  <div className="item-details-select" key={option.id}>
                    <div className="item-details-select-list">
                      <span>{option.name}</span>
                      <span>Stock on Hand</span>
                    </div>
                    <div className="item-details-select-list">
                      <span>SKU: {option.sku}</span>
                      <span
                        className="stock-on-hand"
                        style={{
                          color:
                            option.currentQty === 0
                              ? "red"
                              : "var(--light-green)",
                        }}
                      >
                        {" "}
                        <FormattedNumber
                          value={option.currentQty}
                          style="decimal"
                          minimumFractionDigits={option.unit?.precision}
                        />{" "}
                        {option.unit && option.unit.abbreviation}
                      </span>
                    </div>
                  </div>
                </AutoComplete.Option>
              ))}
            </AutoComplete>
            {/* <AutoSuggest
              items={items}
              onSelect={handleSelectItem}
              rowKey={record.key}
            /> */}
          </Form.Item>
        </>
      ),
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      width: "10%",
      render: (_, record) => (
        <Form.Item
          name={`account${record.key}`}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="label.account.required"
                  defaultMessage="Select the Account"
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
        <Form.Item
          name={`quantity${record.key}`}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="label.quantity.required"
                  defaultMessage="Enter the Quantity"
                />
              ),
            },
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
            maxLength={15}
            value={text ? text : "1.00"}
            className="text-align-right "
            onBlur={(e) => handleQuantityChange(e.target.value, record.key)}
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
        <Form.Item
          name={`rate${record.key}`}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="label.rate.required"
                  defaultMessage="Enter the Rate"
                />
              ),
            },
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
            maxLength={15}
            value={text ? text : "1.00"}
            className="text-align-right "
            onBlur={(e) => handleRateChange(e.target.value, record.key)}
          />
        </Form.Item>
      ),
    },
    {
      title: "Discount",
      dataIndex: "detailDiscount",
      key: "detailDiscount",
      width: "10%",
      hidden: discountPreference.key === "0",
      render: (text, record) => (
        <Form.Item
          name={`detailDiscount${record.key}`}
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
            maxLength={15}
            onBlur={(e) =>
              handleDetailDiscountChange(e.target.value, record.key)
            }
            addonAfter={
              <Form.Item noStyle name={`detailDiscountType${record.key}`}>
                <Select
                  onChange={(value) =>
                    handleDetailDiscountTypeChange(value, record.key)
                  }
                  defaultValue="P"
                >
                  <Select.Option value="P">%</Select.Option>
                  <Select.Option value="A">
                    {currencies.find((c) => c.id === selectedCurrency).symbol}
                  </Select.Option>
                </Select>
              </Form.Item>
            }
          />
        </Form.Item>
      ),
    },
    {
      title: "Tax",
      dataIndex: "detailTax",
      key: "detailTax",
      width: "10%",
      render: (_, record) => (
        <Form.Item name={`detailTax${record.key}`}>
          <Select
            onChange={(value) => handleDetailTaxChange(value, record.key)}
            showSearch
            allowClear
            loading={loading}
            optionFilterProp="label"
          >
            {allTax?.map((taxGroup) => (
              <Select.OptGroup key={taxGroup.title} label={taxGroup.title}>
                {taxGroup.taxes.map((tax) => (
                  <Select.Option key={tax.id} value={tax.id} label={tax.name}>
                    {tax.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
        </Form.Item>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
      render: (text) => (
        <div
          style={{
            marginBottom: "24px",
            textAlign: "right",
            paddingRight: "1rem",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      render: (_, record) => (
        <Flex justify="center" align="center" style={{ marginBottom: "24px" }}>
          <span>
            {" "}
            <CloseCircleOutlined
              style={{ color: "red" }}
              onClick={() => handleRemoveRow(record.key)}
            />
          </span>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <CustomerSearchModal
        modalOpen={searchModalOpen}
        setModalOpen={setSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />
      <AddPurchaseProductsModal
        products={productStocks}
        data={data}
        account="sales"
        setData={handleAddProductsInBulk}
        isOpen={addProductsModalOpen}
        setIsOpen={setAddPurchaseProductsModalOpen}
        onCancel={() => setAddPurchaseProductsModalOpen(false)}
        form={form}
      />
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="creditNote.edit"
            defaultMessage="Edit Credit Note"
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
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.customer"
                    defaultMessage="Customer"
                  />
                }
                name="customerName"
                shouldUpdate
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.customerName.required"
                        defaultMessage="Select the Customer"
                      />
                    ),
                  },
                ]}
              >
                <Input
                  readOnly
                  onClick={setSearchModalOpen}
                  className="search-input"
                  suffix={
                    <>
                      {selectedCustomer && (
                        <CloseOutlined
                          style={{ height: 11, width: 11, cursor: "pointer" }}
                          onClick={() => {
                            setSelectedCustomer(null);
                            form.resetFields(["customerName"]);
                          }}
                        />
                      )}

                      <Button
                        style={{ width: "2.5rem" }}
                        type="primary"
                        icon={<SearchOutlined />}
                        className="search-btn"
                        onClick={setSearchModalOpen}
                      />
                    </>
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage id="label.branch" defaultMessage="Branch" />
                }
                name="branch"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
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
            </Col>
            <Col span={12}></Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.creditDate"
                    defaultMessage="Customer Credit Date"
                  />
                }
                name="creditDate"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
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
                  format={REPORT_DATE_FORMAT}
                ></DatePicker>
              </Form.Item>
            </Col>
            <Col span={12}>
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
                wrapperCol={{ span: 12 }}
              >
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.currency"
                    defaultMessage="Currency"
                  />
                }
                name="currency"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
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
                <Select
                  onChange={(value) => setSelectedCurrency(value)}
                  showSearch
                  optionFilterProp="label"
                >
                  {currencies.map((currency) => (
                    <Select.Option
                      key={currency.id}
                      value={currency.id}
                      label={currency.name + currency.symbol}
                    >
                      {currency.name} ({currency.symbol})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.subject"
                    defaultMessage="Subject"
                  />
                }
                name="subject"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
              >
                <TextArea rows={4} maxLength={250}></TextArea>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.currency !== currentValues.currency
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("currency") &&
                  getFieldValue("currency") !== business.baseCurrency.id ? (
                    <Form.Item
                      label={
                        <FormattedMessage
                          id="label.exchangeRate"
                          defaultMessage="Exchange Rate"
                        />
                      }
                      name="exchangeRate"
                      labelAlign="left"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 12 }}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="label.exchangeRate.required"
                              defaultMessage="Enter the Exchange Rate"
                            />
                          ),
                        },

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
                      <Input />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>
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
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.warehouse.required"
                        defaultMessage="Select the Warehouse"
                      />
                    ),
                  },
                ]}
              >
                <Select
                  placeholder="Select Warehouse"
                  showSearch
                  // allowClear
                  loading={stockLoading}
                  onChange={(value) => setSelectedWarehouse(value)}
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
                    items: discountPreferences?.map((item) => ({
                      ...item,
                      onClick: ({ key }) => handleDiscountPreferenceChange(key),
                    })),
                    selectable: true,
                    selectedKeys: [discountPreference.key],
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
                      {discountPreference.label}
                      <DownOutlined />
                    </Space>
                  </div>
                </Dropdown>
              </Form.Item>
            </Space>
          </Flex>
          {selectedWarehouse && (
            <>
              <Table
                loading={stockLoading}
                columns={columns}
                dataSource={data.filter((item) => !item.isDeletedItem)}
                pagination={false}
                className="item-details-table"
              />
              <br />
              <Button
                icon={<PlusCircleFilled className="plus-circle-icon" />}
                onClick={handleAddRow}
                className="add-row-item-btn"
              >
                <span>
                  <FormattedMessage
                    id="button.addNewRow"
                    defaultMessage="Add New Row"
                  />
                </span>
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<PlusCircleFilled className="plus-circle-icon" />}
                className="add-row-item-btn"
                onClick={() => setAddPurchaseProductsModalOpen(true)}
              >
                <span>
                  <FormattedMessage
                    id="button.addProductsInBulk"
                    defaultMessage="Add Products in Bulk"
                  />
                </span>
              </Button>
            </>
          )}
          <Row className="new-manual-journal-table-footer">
            <Col span={8}>
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "normal",
                }}
              >
                <div style={{ width: "100%" }}>
                  <label>
                    <FormattedMessage id="label.notes" defaultMessage="Notes" />
                  </label>
                  <Form.Item style={{ margin: 0, width: "100%" }} name="notes">
                    <TextArea rows={4}></TextArea>
                  </Form.Item>
                </div>
              </div>
            </Col>
            <Col
              span={12}
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
                      {subTotal.toFixed(decimalPlaces)}
                    </td>
                  </tr>
                  {discountPreference.key === "0" && (
                    <tr>
                      <td>
                        <FormattedMessage
                          id="label.discount"
                          defaultMessage="Discount"
                        />
                      </td>
                      <td style={{ width: "20%" }} offset={10}>
                        <Form.Item
                          name="discount"
                          style={{ margin: 0 }}
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
                            onBlur={(e) => handleDiscountChange(e.target.value)}
                            addonAfter={
                              <Select
                                onChange={(value) =>
                                  handleDiscountTypeChange(value)
                                }
                                value={selectedDiscountType}
                              >
                                <Select.Option value="P">%</Select.Option>
                                <Select.Option value="A">
                                  {
                                    currencies.find(
                                      (c) => c.id === selectedCurrency
                                    ).symbol
                                  }
                                </Select.Option>
                              </Select>
                            }
                          />
                        </Form.Item>
                      </td>
                      <td className="text-align-right" style={{ width: "20%" }}>
                        <span
                          style={{
                            color:
                              Math.sign(discountAmount) === 1
                                ? "var(--red)"
                                : "",
                          }}
                        >
                          {Math.sign(discountAmount) === 1 && "-"}
                          {discountAmount.toFixed(decimalPlaces)}
                        </span>
                      </td>
                    </tr>
                  )}
                  {totalTaxAmount > 0 && (
                    <tr>
                      <td style={{ verticalAlign: "middle", width: "20%" }}>
                        <FormattedMessage id="label.tax" defaultMessage="Tax" />
                        {isTaxInclusive && " (Inclusive)"}
                      </td>

                      <td
                        className="text-align-right"
                        style={{ width: "20%" }}
                        colSpan={2}
                      >
                        {totalTaxAmount.toFixed(decimalPlaces)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>Adjustment</td>
                    <td style={{ width: "20%" }} offset={10}>
                      <Form.Item
                        name="adjustment"
                        style={{ margin: 0 }}
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
                          onBlur={(e) =>
                            setAdjustment(parseFloat(e.target.value) || 0)
                          }
                        ></Input>
                      </Form.Item>
                    </td>
                    <td className="text-align-right" style={{ width: "20%" }}>
                      <span
                        style={{
                          color:
                            Math.sign(adjustment) === -1 ? "var(--red)" : "",
                        }}
                      >
                        {adjustment.toFixed(decimalPlaces)}
                      </span>
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
                      {isTaxInclusive
                        ? (totalAmount + adjustment - totalTaxAmount).toFixed(
                            decimalPlaces
                          )
                        : (totalAmount + adjustment).toFixed(decimalPlaces)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <UploadAttachment
            onCustomFileListChange={(customFileList) =>
              setFileList(customFileList)
            }
            files={record?.documents}
          />
          <div className="page-actions-bar page-actions-bar-margin">
          <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              loading={loading}
              onClick={() => setSaveStatus("Draft")}
              disabled={record?.currentStatus !== "Draft"}
            >
              {
                <FormattedMessage
                  id="button.saveAsDraft"
                  defaultMessage="Save As Draft"
                />
              }
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              loading={loading}
              onClick={() => setSaveStatus("Confirmed")}
              disabled={
                record?.currentStatus !== "Draft" &&
                record?.currentStatus !== "Confirmed"
              }
            >
              {
                <FormattedMessage
                  id="button.saveAndConfirm"
                  defaultMessage="Save And Confirm"
                />
              }
            </Button>
            <Button
              className="page-actions-btn"
              loading={loading}
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

export default CreditNotesEdit;
