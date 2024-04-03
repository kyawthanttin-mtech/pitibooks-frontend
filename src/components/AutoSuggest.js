import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import "./AutoSuggest.css";

const AutoSuggest = ({ items, onSelect, rowKey }) => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const getSuggestions = (inputValue) => {
    return items.filter(
      (item) =>
        item.productName.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };

  const renderSuggestion = (suggestion) => (
    <div className="item-details-select" key={suggestion.id}>
      <div className="item-details-select-list">
        <span>{suggestion.productName}</span>
        <span>Stock on Hand</span>
      </div>
      <div className="item-details-select-list">
        <span>SKU: {suggestion.sku}</span>
        <span className="stock-on-hand">{suggestion.stockOnHand}</span>
      </div>
    </div>
  );

  const onSuggestionSelected = (_, { suggestion }) => {
    onSelect(suggestion.id, rowKey);
  };

  const inputProps = {
    placeholder: "Type or click to select an item.",
    value,
    onChange: (_event, { newValue }) => setValue(newValue),
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={({ value }) =>
        setSuggestions(getSuggestions(value))
      }
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={(suggestion) => suggestion.productName}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      onSuggestionSelected={onSuggestionSelected}
      alwaysRenderSuggestions={true}
    />
  );
};

export default AutoSuggest;
