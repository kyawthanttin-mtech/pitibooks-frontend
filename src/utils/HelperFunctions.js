import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useHistoryState(key, initialValue) {
  const navigate = useNavigate();
  const location = useLocation();
  const [rawState, rawSetState] = useState(() => {
    const value = location.state?.[key];
    return value ?? initialValue;
  });
  function setState(value) {
    navigate(location.pathname, {
      state: {
        ...location.state,
        [key]: value,
      },
      replace: true,
    });
    rawSetState(value);
  }
  return [rawState, setState];
}

export function paginateArray(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

export function convertTransactionType(type) {
  switch (type) {
    case "JN":
      return "Journal";
    case "IV":
      return "Invoice";
    case "CP":
      return "CustomerPayment";
    case "CN":
      return "CreditNote";
    case "CNR":
      return "CreditNoteRefund";
    case "EP":
      return "Expense";
    case "BL":
      return "Bill";
    case "SP":
      return "SupplierPayment";
    case "BP":
      return "BillPayment";
    case "IVT":
      return "Inventory";
    case "IVA":
      return "InventoryAdjustment";
    case "WO":
      return "WriteOff";
    case "ACP":
      return "AdvanceCustomerPayment";
    case "ASP":
      return "AdvanceSupplierPayment";
    case "COB":
      return "CustomerOpeningBalance";
    case "SOB":
      return "SupplierOpeningBalance";
    case "OB":
      return "OpeningBalance";
    case "SC":
      return "SupplierCredit";
    case "AC":
      return "AccountTransfer";
    case "AD":
      return "AccountDeposit";
    case "OD":
      return "OwnerDrawing";
    case "OC":
      return "OwnerContribution";
    case "OI":
      return "Income";
    default:
      return "";
  }
}

export function calculateTaxAmount(
  subTotal,
  taxRate,
  isTaxInclusive,
  decimalPlaces = 2
) {
  let taxAmount = 0;
  if (isTaxInclusive) {
    taxAmount = (subTotal / (taxRate + 100)) * taxRate;
  } else {
    taxAmount = (subTotal / 100) * taxRate;
  }
  return parseFloat(taxAmount.toFixed(decimalPlaces));
}

export function calculateDiscountAmount(
  subTotal,
  discount,
  discountType,
  decimalPlaces = 2
) {
  let discountAmount = 0;
  if (discount > 0 && discountType != null) {
    if (discountType === "P") {
      discountAmount = (subTotal / 100) * discount;
    } else {
      discountAmount = discount || 0;
    }
  }
  return parseFloat(discountAmount.toFixed(decimalPlaces));
}

export function calculateItemDiscountAndTax(
  qty,
  unitRate,
  discount,
  discountType,
  taxRate,
  isTaxInclusive,
  decimalPlaces = 2
) {
  // calculate detail subtotal
  let detailAmount = qty * unitRate;
  // calculate discount amount
  let discountAmount = 0;
  if (discount > 0 && discountType != null) {
    discountAmount = calculateDiscountAmount(
      detailAmount,
      discount,
      discountType,
      decimalPlaces
    );
  }
  // calculate subtotal amount
  let totalAmount = qty * unitRate - discountAmount;
  // calculate tax amount
  let taxAmount = 0;
  if (taxRate > 0) {
    taxAmount = calculateTaxAmount(
      totalAmount,
      taxRate,
      isTaxInclusive,
      decimalPlaces
    );
  }
  return [
    parseFloat(totalAmount.toFixed(decimalPlaces)),
    discountAmount,
    taxAmount,
  ];
}
