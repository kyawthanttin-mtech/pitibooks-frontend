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

const { CREATE_CREDIT_NOTE } = CreditNoteMutations;

const { GET_WAREHOUSE } = WarehouseQueries;
const { GET_AVAILABLE_STOCKS } = StockQueries;

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

const CreditNotesNew = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([
    {
      key: 1,
      amount: 0,
      taxAmount: 0,
      discountAmount: 0,
      taxRate: 0,
      discount: 0,
      discountType: "P",
    },
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
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
    allShipmentPreferencesQueryRef,
    allProductVariantsQueryRef,
  } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [discountPreference, setDiscountPreference] = useState({
    key: "0",
    label: "At Transaction Level",
  });
  const [taxPreference, setTaxPreference] = useState({
    key: "0",
    label: "Tax Exclusive",
  });
  const [addProductsModalOpen, setAddPurchaseProductsModalOpen] =
    useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const client = useApolloClient();
  // const [tableKeyCounter, setTableKeyCounter] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(
    business.baseCurrency.id
  );
  const [discount, setDiscount] = useState(0);
  const [selectedDiscountType, setSelectedDiscountType] = useState("P");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [isAtTransactionLevel, setIsAtTransactionLevel] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Draft");
  const intl = useIntl();
  const [fileList, setFileList] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(
    business?.primaryBranch?.id
  );

  const initialValues = {
    currency: business.baseCurrency.id,
    paymentTerms: "DueOnReceipt",
    creditNoteDate: dayjs(),
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
  const { data: shipmentPreferenceData } = useReadQuery(
    allShipmentPreferencesQueryRef
  );
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
  const [createSupplierCredit, { loading: createLoading }] = useMutation(
    CREATE_CREDIT_NOTE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="creditNote.created"
            defaultMessage="New Credit Note Created"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = createLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const accounts = useMemo(() => {
    return accountData?.listAllAccount?.filter((acc) => acc.isActive === true);
  }, [accountData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter(
      (w) => w.isActive === true && w.branchId === selectedBranchId
    );
  }, [warehouseData, selectedBranchId]);

  const products = useMemo(() => {
    return productData?.listAllProduct?.filter((p) => p.isActive === true);
  }, [productData]);

  const productVariants = useMemo(() => {
    return productVariantData?.listAllProductVariant?.filter(
      (p) => p.isActive === true
    );
  }, [productVariantData]);

  const shipmentPreferences = useMemo(() => {
    return shipmentPreferenceData?.listAllShipmentPreference?.filter(
      (s) => s.isActive === true
    );
  }, [shipmentPreferenceData]);

  const taxes = useMemo(() => {
    return taxData?.listAllTax?.filter((tax) => tax.isActive === true);
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup?.filter(
      (tax) => tax.isActive === true
    );
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

  const onFinish = (values) => {
    console.log("values", values);
    let foundInvalid = false;
    const details = data.map((item) => {
      if (!(item.name || values[`product${item.key}`]) || item.amount === 0) {
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
        productId: detailProductId > 0 ? detailProductId : undefined,
        productType: detailProductId > 0 ? detailProductType : "I",
        name: item.id ? item.name : values[`product${item.key}`],
        detailAccountId: values[`account${item.key}`],
        detailQty: item.quantity || 0,
        detailUnitRate: item.rate || 0,
        detailTaxId,
        detailTaxType,
        detailDiscount: item.discount || 0,
        detailDiscountType: item.discountType ? item.discountType : "P",
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
      documentUrl: file.imageUrl,
    }));

    console.log("details", details);
    const input = {
      branchId: values.branch,
      customerId: selectedCustomer.id,
      referenceNumber: values.referenceNumber,
      creditNoteDate: values.creditNoteDate,
      notes: values.notes,
      currencyId: values.currency,
      exchangeRate: values.exchangeRate,
      creditNoteDiscount: isAtTransactionLevel ? discount : 0,
      creditNoteDiscountType: selectedDiscountType,
      creditNoteSubject: values.subject,
      adjustmentAmount: adjustment,
      isTaxInclusive: isTaxInclusive,
      creditNoteTaxId: 0,
      creditNoteTaxType: "I",
      currentStatus: saveStatus,
      documents: fileUrls,
      warehouseId: values.warehouse,
      details,
    };
    // console.log("Transactions", transactions);
    console.log("Input", input);
    createSupplierCredit({
      variables: { input },
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
    for (let i = keyToRemove; i < data.length; i++) {
      // shift the data of each row
      data[i - 1] = {
        ...data[i],
        key: i,
      };

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

    recalculateTotalAmount(
      data.slice(0, -1),
      isTaxInclusive,
      isAtTransactionLevel
    );
    setData(data.slice(0, -1));
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
    const fieldsToReset = data.map((record) => ({
      name: [`detailDiscount${record.key}`],
      value: null,
    }));
    form.setFields(fieldsToReset);
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
        newData.rate = selectedItem.salesPrice;
        newData.detailTax = selectedItem.purchaseTax?.id;
        newData.taxRate = selectedItem.purchaseTax?.rate;
        newData.currentQty = selectedItem.currentQty;
        newData.account = selectedItem.inventoryAccount?.id;
        newData.unit = selectedItem.unit;
        newData.inventoryAccountId= selectedItem.inventoryAccount?.id
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
      [`account${rowKey}`]: selectedItem.salesAccount?.id || null,
      [`rate${rowKey}`]: selectedItem.salesPrice,
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
          {record.id && (
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
                <CloseCircleOutlined
                  onClick={() =>
                    handleRemoveSelectedItem(record.id, record.key)
                  }
                />
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
               {record.inventoryAccountId > 0 &&
                (record.currentQty || record.currentQty === 0) ? (
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
            hidden={record.id}
            name={`product${record.key}`}
            rules={[
              {
                required: record.id ? false : true,
                message: (
                  <FormattedMessage
                    id="label.product.required"
                    defaultMessage="Select/Enter the Product"
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
                } else if (isNaN(value) || value.length > 20 || value < 0) {
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
                } else if (isNaN(value) || value.length > 20 || value < 0) {
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
      render: (_, record) => (
        <Form.Item
          name={`detailDiscount${record.key}`}
          rules={[
            () => ({
              validator(_, value) {
                if (!value) {
                  return Promise.resolve();
                } else if (isNaN(value) || value.length > 20 || value < 0) {
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
            id="creditNote.new"
            defaultMessage="New Credit Note"
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
        <div className="page-form-wrapper">
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
                    <FormattedMessage
                      id="label.branch"
                      defaultMessage="Branch"
                    />
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
                  <Select
                    showSearch
                    optionFilterProp="label"
                    onChange={(value) => {
                      setSelectedBranchId(value);
                      setSelectedWarehouse(null);
                      form.setFieldsValue({ warehouse: null });
                    }}
                  >
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
                      id="label.creditNoteDate"
                      defaultMessage="Credit Note Date"
                    />
                  }
                  name="creditNoteDate"
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
                    onChange={(date, dateString) =>
                      console.log(date, dateString)
                    }
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
                              } else if (
                                isNaN(value) ||
                                value.length > 20 ||
                                value < 0
                              ) {
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
                    disabled={!selectedBranchId}
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
                        onClick: ({ key }) =>
                          handleDiscountPreferenceChange(key),
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
                  dataSource={data}
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
                      <FormattedMessage
                        id="label.notes"
                        defaultMessage="Notes"
                      />
                    </label>
                    <Form.Item
                      style={{ margin: 0, width: "100%" }}
                      name="notes"
                    >
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
                <table
                  cellSpacing="0"
                  border="0"
                  width="100%"
                  id="balance-table"
                >
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
                                  } else if (
                                    isNaN(value) ||
                                    value.length > 20 ||
                                    value < 0
                                  ) {
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
                                handleDiscountChange(e.target.value)
                              }
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
                        <td
                          className="text-align-right"
                          style={{ width: "20%" }}
                        >
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
                          <FormattedMessage
                            id="label.tax"
                            defaultMessage="Tax"
                          />
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
            />
            <div className="page-actions-bar page-actions-bar-margin">
              <Button
                type="primary"
                htmlType="submit"
                className="page-actions-btn"
                loading={loading}
                onClick={() => setSaveStatus("Draft")}
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
                {
                  <FormattedMessage
                    id="button.cancel"
                    defaultMessage="Cancel"
                  />
                }
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default CreditNotesNew;
