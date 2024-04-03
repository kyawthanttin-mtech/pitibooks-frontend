import React, { useEffect } from "react";
import { Input, Form } from "antd";
import { v4 as uuidv4 } from "uuid";

const EditableCell = ({
  value,
  onChange,
  id,
  name,
  rowIndex,
  validationRules,
  textAlign,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ editableCell: value });
  }, [form, value]);

  const handleInputChange = (event) => {
    form.setFieldsValue({ editableCell: event.target.value });
  };

  const handleSubmit = () => {
    const updatedValue = form.getFieldValue("editableCell");
    console.log("UPDATED VALUEEE", updatedValue);
    onChange(updatedValue);
  };

  const randomString = uuidv4();
  const fieldName = `editableCell_${id}_${randomString}`;
  // const fieldName = `editablecell_${id}_${name}`;
  // const fieldName = "editableCell";

  return (
    <Form form={form}>
      <Form.Item
        style={{
          width: "100%",
          display: "block",
          margin: "auto",
          borderRadius: "0.3rem",
        }}
        rules={validationRules}
        name={fieldName}
      >
        <Input
          defaultValue={value}
          style={{
            padding: "0.5rem",
            textAlign: textAlign,
          }}
          onChange={handleInputChange}
          onBlur={handleSubmit}
          onPressEnter={handleSubmit}
        />
      </Form.Item>
    </Form>
  );
};

export default EditableCell;
