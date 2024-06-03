import React, { useState, useMemo } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
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
import { useReadQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import {
  SupplierSearchModal,
  AddPurchaseProductsModal,
} from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { ReactComponent as TaxOutlined } from "../../assets/icons/TaxOutlined.svg";
import { ReactComponent as PercentageOutlined } from "../../assets/icons/PercentageOutlined.svg";
import { PurchaseOrderMutations, WarehouseQueries } from "../../graphql";
import {
  calculateItemDiscountAndTax,
  calculateDiscountAmount,
} from "../../utils/HelperFunctions";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { CREATE_PURCHASE_ORDER } = PurchaseOrderMutations;

const { GET_WAREHOUSE } = WarehouseQueries;

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

const PurchaseOrdersNew = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.clonePO;
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
  const [data, setData] = useState(
    record
      ? record.details?.map((detail, index) => ({
          key: index + 1,
          name: detail.name,
          amount: detail.detailTotalAmount,
          taxAmount: detail.detailTaxAmount,
          discountAmount: detail.detailDiscountAmount,
          taxRate: detail.detailTax.rate,
          discount: detail.detailDiscount,
          discountType: detail.detailDiscountType,
          id: detail.productType + detail.productId,
          detailDiscountType: detail.detailDiscountType,
          quantity: detail.detailQty,
          rate: detail.detailUnitRate,
        }))
      : [
          {
            key: 1,
            amount: 0,
            taxAmount: 0,
            discountAmount: 0,
            taxRate: 0,
            discount: 0,
            discountType: "P",
          },
        ]
  );
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(
    record?.supplier?.id ? record.supplier : null
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState(
    record?.warehouse?.id > 0 ? record.warehouse.id : null
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
    record?.isDetailTaxInclusive
      ? { key: "1", label: "Tax Inclusive" }
      : {
          key: "0",
          label: "Tax Exclusive",
        }
  );
  const [addProductsModalOpen, setAddPurchaseProductsModalOpen] =
    useState(false);
  const [subTotal, setSubTotal] = useState(record?.orderSubtotal || 0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(
    record?.orderTotalTaxAmount || 0
  );
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(
    record?.orderTotalDiscountAmount || 0
  );
  const [totalAmount, setTotalAmount] = useState(
    (record?.orderTotalAmount || 0) - (record?.adjustmentAmount || 0)
  );
  const [adjustment, setAdjustment] = useState(record?.adjustmentAmount || 0);
  const client = useApolloClient();
  const [tableKeyCounter, setTableKeyCounter] = useState(
    record?.details?.length || 1
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    record?.currency.id || business.baseCurrency.id
  );
  const [discount, setDiscount] = useState(0);
  const [selectedDiscountType, setSelectedDiscountType] = useState(
    record?.orderDiscountType || "P"
  );
  const [discountAmount, setDiscountAmount] = useState(
    record?.orderDiscountAmount || 0
  );
  const [isTaxInclusive, setIsTaxInclusive] = useState(
    record?.isDetailTaxInclusive || false
  );
  const [isAtTransactionLevel, setIsAtTransactionLevel] = useState(
    discountPreference.key === "0"
  );
  const [saveStatus, setSaveStatus] = useState("Draft");

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

  // Mutations
  const [createPO, { loading: createLoading }] = useMutation(
    CREATE_PURCHASE_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
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
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

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

  useMemo(() => {
    // const taxId = record?.supplierTaxType + record?.supplierTaxId;
    const parsedRecord = record
      ? {
          supplierName: record?.supplierName,
          branch: record?.branch?.id,
          referenceNumber: record?.referenceNumber,
          date: dayjs(record?.orderDate),
          deliveryDate: dayjs(record?.expectedDeliveryDate),
          deliveryWarehouse:
            record?.deliveryWarehouseId === 0
              ? null
              : record?.deliveryWarehouseId,
          deliveryAddress: record?.deliveryAddress,
          shipmentPreference:
            record?.shipmentPreference.id === 0
              ? null
              : record?.shipmentPreference.id,
          paymentTerms: record?.orderPaymentTerms,
          customDays: record?.orderPaymentTermsCustomDays,
          currency: record?.currency?.id,
          exchangeRate: record?.exchangeRate,
          warehouse: record?.warehouse.id,
          customerNotes: record?.notes,
          discount: record?.orderDiscount,
          adjustment: record?.adjustmentAmount || null,
          // Map transactions to form fields
          ...record?.details?.reduce((acc, d, index) => {
            acc[`account${index + 1}`] = d.detailAccount.id || null;
            acc[`quantity${index + 1}`] = d.detailQty;
            acc[`rate${index + 1}`] = d.detailUnitRate;
            acc[`detailDiscount${index + 1}`] = d.detailDiscount;
            acc[`detailTax${index + 1}`] =
              d.detailTax?.id !== "I0" ? d.detailTax?.id : null;
            acc[`detailDiscountType${index + 1}`] = d.detailDiscountType;
            return acc;
          }, {}),
        }
      : {
          currency: business.baseCurrency.id,
          paymentTerms: "DueOnReceipt",
          date: dayjs(),
          branch: business.primaryBranch.id,
        };

    form.setFieldsValue(parsedRecord);
  }, [form, record, business]);

  const onFinish = (values) => {
    console.log("values", values);
    let foundInvalid = false;
    console.log(data);
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
      };
    });

    if (details.length === 0 || foundInvalid) {
      openErrorNotification(
        notiApi,
        intl.formatMessage({
          id: "validation.invalidProductDetails",
          defaultMessage: "Invalid Product Details",
        })
      );
      return;
    }

    console.log("details", details);
    const input = {
      branchId: values.branch,
      supplierId: selectedSupplier.id,
      referenceNumber: values.referenceNumber,
      orderDate: values.date,
      expectedDeliveryDate: values.deliveryDate,
      orderPaymentTerms: values.paymentTerms,
      orderPaymentTermsCustomDays: values.customDays ? values.customDays : 0,
      deliveryWarehouseId: values.deliveryWarehouse || 0,
      deliveryAddress: values.deliveryAddress,
      shipmentPreferenceId: values.shipmentPreference || 0,
      notes: values.customerNotes,
      currencyId: values.currency,
      exchangeRate: values.exchangeRate || 0,
      orderDiscount: isAtTransactionLevel ? discount : 0,
      orderDiscountType: selectedDiscountType,
      adjustmentAmount: adjustment,
      isDetailTaxInclusive: isTaxInclusive,

      orderTaxId: 0,
      orderTaxType: "I",
      currentStatus: saveStatus,
      // documents:
      warehouseId: values.warehouse,
      details,
    };
    // console.log("Transactions", transactions);
    console.log("Input", input);
    createPO({
      variables: { input },
    });
  };

  const handleAddRow = () => {
    const newRowKey = tableKeyCounter + 1;
    setTableKeyCounter(tableKeyCounter + 1);
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
    const newData = data.filter((item) => item.key !== keyToRemove);
    recalculateTotalAmount(newData, isTaxInclusive, isAtTransactionLevel);
    setData(newData);
    form.setFieldsValue({
      [`product${keyToRemove}`]: "",
      [`account${keyToRemove}`]: "",
      [`quantity${keyToRemove}`]: "",
      [`rate${keyToRemove}`]: "",
      [`detailTax${keyToRemove}`]: "",
    });
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
    let newData = [];
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

    if (existingItems.length > 0) {
      const updatedData = data.map((dataItem) => {
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
      newData = updatedData;
    }

    const nonExistingItems = selectedItemsBulk.filter(
      (selectedItem) =>
        !data.some((dataItem) => dataItem.id === selectedItem.id)
    );
    console.log("non existing items", nonExistingItems);
    if (nonExistingItems.length > 0) {
      // const maxKey = Math.max(...data.map((dataItem) => dataItem.key));
      let newRowKey = tableKeyCounter;

      selectedItemsBulk.forEach((selectedItem, index) => {
        newRowKey++;
        const [amount, discountAmount, taxAmount] = calculateItemAmount({
          ...selectedItem,
        });
        const newDataItem = {
          ...selectedItem,
          key: newRowKey,
          amount,
          discountAmount,
          taxAmount,
        };

        // Add the new data item to the existing data array
        newData = [...newData, newDataItem];

        // Set the form fields for the new data item
        form.setFieldsValue({
          [`product${newRowKey}`]: selectedItem.id,
          [`account${newRowKey}`]: selectedItem.account,
          [`rate${newRowKey}`]: selectedItem.rate,
          [`detailTax${newRowKey}`]: selectedItem.detailTax,
          [`quantity${newRowKey}`]: selectedItem.quantity,
        });
      });
    }
    if (newData.length > 0) {
      recalculateTotalAmount(newData, isTaxInclusive, isAtTransactionLevel);
    }
  };

  const handleSelectItem = (value, rowKey) => {
    const selectedItem = allProducts?.find((product) => product.id === value);
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
        newData.stockOnHand = selectedItem.stockOnHand;
        newData.account = selectedItem.inventoryAccount?.id;
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
    console.log("account id", selectedItem.inventoryAccount?.id);
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
            <div style={{ marginBottom: "24px", paddingInline: "0.5rem" }}>
              <Flex justify="space-between">
                {text}
                <CloseCircleOutlined
                  onClick={() =>
                    handleRemoveSelectedItem(record.id, record.key)
                  }
                />
              </Flex>
              <div>SKU: {record.sku}</div>
            </div>
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
              className="custom-select"
              style={{
                width: 200,
              }}
              placeholder="Type or click to select a product."
              optionFilterProp="label"
              filterOption={(inputValue, option) =>
                option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
              }
              onSelect={(value) => handleSelectItem(value, record.key)}
            >
              {allProducts?.map((option) => (
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
                      <span className="stock-on-hand">
                        {option.stockOnHand}
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
      render: (_, record) => (
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
          <CloseCircleOutlined
            style={{ color: "red" }}
            onClick={() => handleRemoveRow(record.key)}
          />
        </Flex>
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
        products={allProducts}
        data={data}
        setData={handleAddProductsInBulk}
        isOpen={addProductsModalOpen}
        setIsOpen={setAddPurchaseProductsModalOpen}
        onCancel={() => setAddPurchaseProductsModalOpen(false)}
        form={form}
      />
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="purchaseOrder.new"
            defaultMessage="New Purchase Order"
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
        <Form form={form} onFinish={onFinish}>
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.supplier"
                    defaultMessage="Supplier"
                  />
                }
                name="supplierName"
                shouldUpdate
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.supplierName.required"
                        defaultMessage="Select the Supplier"
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
                      {selectedSupplier && (
                        <CloseOutlined
                          style={{ height: 11, width: 11, cursor: "pointer" }}
                          onClick={() => {
                            setSelectedSupplier(null);
                            form.resetFields(["supplierName"]);
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
                  <FormattedMessage id="label.date" defaultMessage="Date" />
                }
                name="date"
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

              <Form.Item
                label={
                  <FormattedMessage
                    id="label.deliveryDate"
                    defaultMessage="Expected Delivery Date"
                  />
                }
                name="deliveryDate"
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
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.shipmentPreference"
                    defaultMessage="Shipment Preference"
                  />
                }
                name="shipmentPreference"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
              >
                <Select
                  // placeholder="Select or type to add"
                  showSearch
                  allowClear
                  loading={loading}
                  optionFilterProp="label"
                >
                  {shipmentPreferences?.map((s) => (
                    <Select.Option key={s.id} value={s.id} label={s.name}>
                      {s.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.deliveryAddress"
                    defaultMessage="Delivery Address"
                  />
                }
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                labelAlign="left"
                name="deliveryWarehouse"
              >
                <Select
                  // placeholder="Select or type to add"
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
                labelCol={{ span: 8 }}
                wrapperCol={{ offset: 8, span: 12 }}
                labelAlign="left"
                name="deliveryAddress"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paymentTerms"
                    defaultMessage="Payment Terms"
                  />
                }
                name="paymentTerms"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
              >
                <Select
                  // placeholder="Select or type to add"
                  showSearch
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
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.paymentTerms !== currentValues.paymentTerms
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("paymentTerms") &&
                  getFieldValue("paymentTerms") === "Custom" ? (
                    <Form.Item
                      label={
                        <FormattedMessage
                          id="label.customDays"
                          defaultMessage="Custom Day(s)"
                        />
                      }
                      name="customDays"
                      labelAlign="left"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 12 }}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="label.customDays.required"
                              defaultMessage="Enter the Custom Day(s)"
                            />
                          ),
                        },
                      ]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                  ) : null
                }
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
                  loading={loading}
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
                <FormattedMessage
                  id="button.addNewRow"
                  defaultMessage="Add New Row"
                />
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<PlusCircleFilled className="plus-circle-icon" />}
                className="add-row-item-btn"
                onClick={() => setAddPurchaseProductsModalOpen(true)}
              >
                <FormattedMessage
                  id="button.addProductsInBulk"
                  defaultMessage="Add Products in Bulk"
                />
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
              {<FormattedMessage id="button.cancel" defaultMessage="Cancel" />}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default PurchaseOrdersNew;
