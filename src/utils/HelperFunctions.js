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
