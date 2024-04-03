import React from "react";
import { PlusCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const MenuItemWithPlus = ({ label, path }) => {
  const navigate = useNavigate();
  return (
    <div className="menu-item-add-new">
      {label}
      <PlusCircleFilled
        onClick={(event) => {
          event.stopPropagation();
          navigate(path);
        }}
      />
    </div>
  );
};

export default MenuItemWithPlus;
