import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import "./ProductGroupsNew.css";
import EditableCell from "../../components/EditableCell";
import UploadImage from "../../components/UploadImage";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Row,
  Space,
  Table,
  Input,
  Form,
  Modal,
  Col,
  Radio,
  Select,
  Tag,
  Flex,
} from "antd";
import {
  CloseOutlined,
  RightOutlined,
  CheckCircleFilled,
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

const dummyProductVariations = [
  {
    name: "Size",
    id: "Size",
    values: [
      {
        value: "Small",
        id: "SizeSmall0",
      },
    ],
  },
  {
    name: "Color",
    id: "Color",
    values: [
      { value: "White", id: "ColorWhite0" },
      { value: "Black", id: "ColorBlack1" },
    ],
  },
];

const dummyCombination = [
  {
    id: 0,
    productName: "Small / White",
    costPrice: "458.00",
    sellingPrice: "33434.00",
    sku: "8378473",
    barcode: "93874398",
  },
  {
    id: 1,
    productName: "Small / Black",
    costPrice: "343.00",
    sellingPrice: "93939.00",
    sku: "3943948",
    barcode: "3989348",
  },
];

const ProductGroupsNew = () => {
  const [productGroupName, setProductGroupName] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productVariations, setProductVariations] = useState(
    dummyProductVariations
  );
  const [combinationPairs, setCombinationPairs] = useState(dummyCombination);
  const [combinationPairsUpdated, setCombinationPairsUpdated] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editIndex, setEditIndex] = useState();
  const [createFormRef] = Form.useForm();
  const [createProductFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const navigate = useNavigate();
  const defaultPrice = "0.00";

  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      width: "30%",
      render: (text, record, index) => (
        <div
          style={{ height: "2.5rem", display: "flex", alignItems: "center" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text, record, index) => (
        <EditableCell
          id={record.id}
          rowIndex={index}
          name="sku"
          value={text}
          onChange={(value) => handleCellEdit(value, "sku", index)}
        />
      ),
    },
    {
      title: "Cost Price (MMK)",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (text, record, index) => (
        <EditableCell
          id={record.id}
          rowIndex={index}
          name="costPrice"
          value={text}
          onChange={(value) => handleCellEdit(value, "costPrice", index)}
          validationRules={[
            {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "",
            },
          ]}
          textAlign="right"
        />
      ),
    },
    {
      title: "Selling Price (MMK)",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (text, record, index) => (
        <EditableCell
          id={record.id}
          rowIndex={index}
          name="sellingPrice"
          value={text}
          onChange={(value) => handleCellEdit(value, "sellingPrice", index)}
          validationRules={[
            {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "",
            },
          ]}
          textAlign="right"
        />
      ),
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      render: (text, record, index) => (
        <EditableCell
          id={record.id}
          rowIndex={index}
          name="barcode"
          value={text}
          onChange={(value) => handleCellEdit(value, "barcode", index)}
        />
      ),
    },
  ];

  const handleCellEdit = useCallback(
    (value, key, index) => {
      const updatedCombinationPairs = [...combinationPairs];
      if (key === "costPrice" || key === "sellingPrice") {
        const isValidNumber = /^\d+(\.\d{1,2})?$/.test(value);
        updatedCombinationPairs[index][key] = isValidNumber
          ? parseFloat(value).toFixed(2)
          : defaultPrice;
      } else {
        updatedCombinationPairs[index][key] = value;
      }
      setCombinationPairs(updatedCombinationPairs);
      console.log("Updated Combinations", updatedCombinationPairs);
      console.log("Combinations", combinationPairs);
    },
    [combinationPairs]
  );

  const handleCreateVariation = () => {
    const { variation, options } = createFormRef.getFieldsValue();
    const newVariation = {
      name: variation,
      id: variation,
      values: options.map((value, index) => ({
        value,
        id: `${variation}${value}${index}`,
      })),
    };

    setProductVariations([...productVariations, newVariation]);
    setCreateModalOpen(false);
    setCombinationPairsUpdated(true);

    createFormRef.resetFields();
  };
  console.log("Variants", productVariations);
  console.log("Edit Record", editRecord);

  //Perform when editoutlined is clicked
  const handleEditClick = (record, index) => {
    setEditIndex(index);
    setEditModalOpen(true);
    setEditRecord(record);
  };

  //Populate editFormRef
  if (editRecord && editFormRef && editRecord) {
    const initialOptions = Array.from(
      { length: editRecord.values.length },
      (_, index) => {
        return editRecord.values[index]?.value || "";
      }
    );

    editFormRef.setFieldsValue({
      variation: editRecord.name,
      options: initialOptions,
    });
    console.log("POPULATING");
  }

  const handleEditVariation = () => {
    const { variation, options } = editFormRef.getFieldsValue();
    const updatedVariation = {
      name: variation,
      id: variation,
      values: options.map((value, index) => ({
        value,
        id: `${variation}${value}${index}`,
      })),
    };

    const updatedVariations = [...productVariations];
    updatedVariations[editIndex] = updatedVariation;
    setProductVariations(updatedVariations);
    setCombinationPairsUpdated(true);

    setEditModalOpen(false);
    setEditRecord();
    editFormRef.resetFields();
  };

  const handleRemoveVariation = (index) => {
    const updatedVariations = [...productVariations];
    const removedVariation = updatedVariations.splice(index, 1)[0];

    // Remove the corresponding combinations in combinationPairs
    const updatedCombinationPairs = combinationPairs.filter(
      (combination) =>
        !removedVariation.values.some((value) =>
          combination.productName.includes(value.value)
        )
    );

    setProductVariations(updatedVariations);
    setCombinationPairs(updatedCombinationPairs);
    setCombinationPairsUpdated(true);
  };

  const generateCombinations = useMemo(() => {
    const combinations = [];

    const combine = (index, currentCombination) => {
      if (index === productVariations.length) {
        combinations.push(currentCombination);
        return;
      }

      const currentVariation = productVariations[index];

      currentVariation.values.forEach((value) => {
        combine(index + 1, [
          ...currentCombination,
          { value: value.value, id: value.id },
        ]);
      });
    };

    combine(0, []);

    return combinations.map((combination, index) => {
      const combinationObj = {
        key: index,
        productName: combination.map((c) => c.value).join(" / "),
        id: index,
      };

      if (productGroupName.trim() !== "" && productVariations.length > 0) {
        combinationObj.productName = `${productGroupName} - ${combinationObj.productName}`;
      }

      const matchingCombination = combinationPairs.find((cp) =>
        combination.every((c) => cp.productName.includes(c.value))
      );

      if (matchingCombination) {
        combinationObj.costPrice = matchingCombination.costPrice;
        combinationObj.sellingPrice = matchingCombination.sellingPrice;
        combinationObj.sku = matchingCombination.sku;
        combinationObj.barcode = matchingCombination.barcode;
      } else {
        combinationObj.costPrice = defaultPrice;
        combinationObj.sellingPrice = defaultPrice;
        combinationObj.sku = "";
        combinationObj.barcode = "";
      }

      return combinationObj;
    });
  }, [productVariations, productGroupName, combinationPairs]);

  // Set/Update combinationPairs
  useEffect(() => {
    if (combinationPairsUpdated) {
      setCombinationPairs(generateCombinations);
      setCombinationPairsUpdated(false);
    }
    console.log("Event Triggered");
  }, [combinationPairsUpdated, generateCombinations]);

  const createForm = (
    <Form form={createFormRef} onFinish={handleCreateVariation}>
      <Form.Item
        labelCol={{ span: 7 }}
        label="Option Name"
        labelAlign="left"
        shouldUpdate
        name="variation"
        id="variation.name"
        rules={[
          {
            required: true,
            message: "Enter the Variation Name",
          },
        ]}
      >
        <Input placeholder="eg.Size" />
      </Form.Item>

      <Form.List name="options" initialValue={[""]} label="Option Values">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item key={field.key}>
                <Form.Item
                  style={{ margin: 0 }}
                  {...field}
                  label={field.key < 1 && "Option Values"}
                  shouldUpdate
                  name={[field.name]}
                  id={field.key}
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  wrapperCol={field.key > 0 && { offset: 7 }}
                  rules={[
                    {
                      required: true,
                      message: `Enter Option ${index + 1}`,
                    },
                  ]}
                >
                  <Input
                    placeholder={`Value ${index + 1}`}
                    suffix={
                      index > 0 && (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      )
                    }
                  />
                </Form.Item>
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{
                  width: "100%",
                }}
                icon={<PlusOutlined />}
              >
                Add Option Value
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
  const editForm = (
    <Form
      form={editFormRef}
      onFinish={(values) => {
        handleEditVariation(values);
      }}
    >
      <Form.Item
        label="Option Name"
        labelCol={{ span: 7 }}
        labelAlign="left"
        shouldUpdate
        name="variation"
        id="variation.name"
        rules={[
          {
            required: true,
            message: "Enter the Variation Name",
          },
        ]}
      >
        <Input placeholder="eg.Size" />
      </Form.Item>

      <Form.List name="options" initialValue={[""]} label="Option Values">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item key={field.key}>
                <Form.Item
                  style={{ margin: 0 }}
                  {...field}
                  label={field.key < 1 && "Option Values"}
                  shouldUpdate
                  name={[field.name]}
                  id={field.key}
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  wrapperCol={field.key > 0 && { offset: 7 }}
                  rules={[
                    {
                      required: true,
                      message: `Enter Option ${index + 1}`,
                    },
                  ]}
                >
                  <Input
                    placeholder={`Value ${index + 1}`}
                    suffix={
                      index > 0 && (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      )
                    }
                  />
                </Form.Item>
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{
                  width: "100%",
                }}
                icon={<PlusOutlined />}
              >
                Add Option Value
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );

  const unitOptions = [
    "box",
    "cm",
    "dz",
    "ft",
    "gm",
    "kg",
    "km",
    "lb",
    "mg",
    "ml",
    "m",
    "pcs",
  ];

  const taxOptionGroups = [
    {
      title: "Tax",
      options: ["Commercial Tax [5%]", "Consumer Tax [5%]", "Tax 1 [2%]"],
    },
    {
      title: "Tax Group",
      options: ["Group Tax [17.7%]", "Group Tax 2 [12.35%]"],
    },
  ];

  const accountOptionGroups = [
    {
      title: "Income",
      options: [
        "Discount",
        "General Income",
        "Interest Income",
        "Latefree Income",
        "Sales",
        "Shipping Charge",
      ],
    },
  ];

  const purchaseOptionGroups = [
    {
      title: "Expense",
      options: [
        "Salaries and employee wages",
        "Telephone Accessories",
        "Telephone Expense",
        "Travel Expense",
        "Uncatagorized",
      ],
    },
    {
      title: "Cost of Goods Sold",
      options: ["Cost of Goods Sold"],
    },
  ];

  const productNewForm = (
    <Form className="product-new-form" form={createProductFormRef}>
      <Row>
        <Col lg={14}>
          <Row>
            <Col lg={18}>
              <Form.Item label="Type" labelCol={{ span: 5 }} labelAlign="left">
                <Radio.Group defaultValue="goods">
                  <Radio value="goods"> Goods </Radio>
                  <Radio value="service"> Service </Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="productGroupName"
                label="Product Group Name"
                labelCol={{ span: 5 }}
                labelAlign="left"
              >
                <Input
                  onBlur={(e) => {
                    const trimmedValue = e.target.value.trim();
                    if (
                      trimmedValue !== "" &&
                      trimmedValue !== productGroupName &&
                      productVariations.length > 0
                    ) {
                      setProductGroupName(trimmedValue);
                      setCombinationPairsUpdated(true);
                    } else if (productVariations.length < 1) {
                      setProductGroupName(trimmedValue);
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                labelCol={{ span: 5 }}
                labelAlign="left"
              >
                <Input.TextArea rows={4}></Input.TextArea>
              </Form.Item>
            </Col>
          </Row>
          <br />
          <br />
        </Col>
        <Col lg={5}>
          <UploadImage />
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <Form.Item label="Unit" labelCol={{ span: 8 }} labelAlign="left">
            <Select placeholder="Select or type to add" showSearch allowClear>
              {unitOptions.map((option) => (
                <Select.Option value={option} key={option}></Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <Form.Item label="Tax" labelCol={{ span: 8 }} labelAlign="left">
            <Select placeholder="Select or type to add" showSearch allowClear>
              {taxOptionGroups.map((group) => (
                <Select.OptGroup key={group.title} label={group.title}>
                  {group.options.map((option) => (
                    <Select.Option key={option}>{option}</Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Supplier" labelCol={{ span: 8 }} labelAlign="left">
            <Select
              placeholder="Select a Supplier"
              showSearch
              allowClear
            ></Select>
          </Form.Item>
          <Form.Item label="Category" labelCol={{ span: 8 }} labelAlign="left">
            <Select
              placeholder="Select Category"
              showSearch
              allowClear
            ></Select>
          </Form.Item>
        </Col>
        <Col lg={7} offset={1}>
          <Form.Item
            label="Sales Account"
            labelCol={{ span: 8 }}
            labelAlign="left"
          >
            <Select defaultValue={accountOptionGroups[0].options[4]}>
              {accountOptionGroups.map((group) => (
                <Select.OptGroup key={group.title} label={group.title}>
                  {group.options.map((option) => (
                    <Select.Option key={option}>{option}</Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Purchase Account"
            labelAlign="left"
            labelCol={{ span: 8 }}
          >
            <Select></Select>
          </Form.Item>
          <Form.Item
            label="Inventory Account"
            labelCol={{ span: 8 }}
            labelAlign="left"
          >
            <Select></Select>
          </Form.Item>
        </Col>
      </Row>
      <div className="page-actions-bar page-actions-bar-margin">
        <Button
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          onClick={() =>
            navigate("/openingStock", {
              state: { combinationPairs },
            })
          }
        >
          Save and Next
        </Button>
        <Button
          className="page-actions-btn"
          //   onClick={() =>
          //     navigate(from, { state: location.state, replace: true })
          //   }
        >
          Cancel
        </Button>
      </div>
    </Form>
  );

  return (
    <>
      <Modal
        title="Variants"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={createFormRef.submit}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
      >
        {createForm}
      </Modal>
      <Modal
        title="Variants"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={editFormRef.submit}
        okText={<FormattedMessage id="button.search" defaultMessage="Search" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
      >
        {editForm}
      </Modal>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">New Product Group</p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() => {
            // setSelectedProductRecord(null);
            // setSelectedProductRowIndex(0);
          }}
        />
      </div>
      <div className="page-content page-content-with-form-buttons product-new-page-content">
        <Row className="product-new-top-band">
          <Space size="large">
            <Space>
              <CheckCircleFilled />
              <span>General</span>
            </Space>
            <RightOutlined />
            <span>Opening Stock</span>
          </Space>
        </Row>
        {productNewForm}
        <br />
        <div className="product-variants-container">
          <p>Variants</p>
          <Flex gap="1rem">
            {productVariations.map((variant, index) => (
              <div
                className="product-variants"
                key={variant.name}
                onClick={() => handleEditClick(variant, index)}
              >
                <div className="product-variant-header">
                  <div className="product-variant-name">{variant.name}</div>
                  <DeleteOutlined
                    className="product-variant-delete-icon"
                    style={{
                      fontSize: "1rem",
                      color: "red",
                      cursor: "pointer",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveVariation(index);
                    }}
                  />
                </div>
                <div className="product-variant-values-container">
                  {variant.values.map((values) => (
                    <Tag key={values.id}>{values.value}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </Flex>
          <Space>
            <PlusCircleFilled style={{ color: "var(--primary-color)" }} />
            <a
              onClick={(event) => {
                setCreateModalOpen(true);
              }}
              className="add-variant"
            >
              Add Variants
            </a>
          </Space>
        </div>
        <Table
          dataSource={combinationPairs}
          columns={columns}
          pagination={false}
          rowKey={(record) => record.variant}
          className="product-variant-table"
        />
      </div>
    </>
  );
};

export default ProductGroupsNew;
