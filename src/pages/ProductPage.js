import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Table,
  Input,
  Form,
  Button,
  Modal,
  Row,
  Col,
  Radio,
  Select,
  Tag,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import EditableCell from "../components/EditableCell";
import UploadImage from "../components/UploadImage";
import TextArea from "antd/es/input/TextArea";

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
    variant: "Small / White",
    price: "458.00",
    sku: "8378473",
    barcode: "93874398",
  },
  {
    id: 1,
    variant: "Small / Black",
    price: "343.00",
    sku: "3943948",
    barcode: "3989348",
  },
];

const ProductVariations = () => {
  const [itemGroupName, setItemGroupName] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rowActionModalOpen, setRowActionModalOpen] = useState(false);
  const [productVariations, setProductVariations] = useState(
    dummyProductVariations
  );
  const [combinationPairs, setCombinationPairs] = useState(dummyCombination);
  const [combinationPairsUpdated, setCombinationPairsUpdated] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editIndex, setEditIndex] = useState();
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [rowActionFormRef] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`Render count: ${renderCount.current}`);
  });

  const defaultPrice = "0.00";

  const columns = [
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record, index) => (
        <EditableCell
          id={record.id}
          rowIndex={index}
          name="price"
          value={text}
          onChange={(value) => handleCellEdit(value, "price", index)}
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
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      editable: true,
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
    {
      width: "3%",
      render: (_, record, index) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                setRowActionModalOpen(true);
                setSelectedRecord(record);
              }}
            />
          </>
        );
      },
    },
  ];

  const handleCellEdit = useCallback(
    (value, key, index) => {
      const updatedCombinationPairs = [...combinationPairs];
      if (key === "price") {
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
    // setIsEditing(true);
    setEditIndex(index);
    setEditModalOpen(true);
    setEditRecord(record);
    // console.log(isEditing);
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
          combination.variant.includes(value.value)
        )
    );

    setProductVariations(updatedVariations);
    setCombinationPairs(updatedCombinationPairs);
    setCombinationPairsUpdated(true);
  };

  console.log("Selected Record :", selectedRecord);

  const handleRowActionSubmit = () => {
    const { price, sku, barcode } = rowActionFormRef.getFieldsValue();
    const fixedPrice = parseFloat(price).toFixed(2);

    const updatedVariations = combinationPairs.map((variation) => {
      if (selectedRecord.id === variation.id) {
        return {
          ...variation,
          price: price ? fixedPrice : defaultPrice,
          sku,
          barcode,
        };
      }
      console.log("Updatedddd");
      return variation;
    });

    setCombinationPairs(updatedVariations);
    console.log("Updated Variation", updatedVariations);
    setRowActionModalOpen(false);
  };

  //Populate rowActionFormRef
  if (rowActionModalOpen && rowActionFormRef && selectedRecord) {
    rowActionFormRef.resetFields();
    rowActionFormRef.setFieldsValue({
      price: selectedRecord.price ? selectedRecord.price : defaultPrice,
      sku: selectedRecord.sku ? selectedRecord.sku : "",
      barcode: selectedRecord.barcode ? selectedRecord.barcode : "",
    });
  }

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
        variant: combination.map((c) => c.value).join(" / "),
        id: index,
      };

      if (itemGroupName.trim() !== "" && productVariations.length > 0) {
        combinationObj.variant = `${itemGroupName} - ${combinationObj.variant}`;
      }

      const matchingCombination = combinationPairs.find((cp) =>
        combination.every((c) => cp.variant.includes(c.value))
      );

      if (matchingCombination) {
        combinationObj.price = matchingCombination.price;
        combinationObj.sku = matchingCombination.sku;
        combinationObj.barcode = matchingCombination.barcode;
      } else {
        combinationObj.price = defaultPrice;
        combinationObj.sku = "";
        combinationObj.barcode = "";
      }

      return combinationObj;
    });
  }, [productVariations, itemGroupName, combinationPairs]);

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
      <label>Option Name</label>
      <Form.Item
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
            <label>Option Values</label>
            {fields.map((field, index) => (
              <Form.Item key={field.key}>
                <Form.Item
                  {...field}
                  shouldUpdate
                  name={[field.name]}
                  id={field.key}
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  style={{ marginBottom: 0 }}
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

      {/* <Form.Item>
        <Button type="primary" htmlType="submit" style={{ float: "right" }}>
          Add
        </Button>
      </Form.Item> */}
    </Form>
  );
  const editForm = (
    <Form
      form={editFormRef}
      onFinish={(values) => {
        handleEditVariation(values);
        // setIsEditing(false);
      }}
    >
      <label>Option Name</label>
      <Form.Item
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
            <label>Option Values</label>
            {fields.map((field, index) => (
              <Form.Item key={field.key}>
                <Form.Item
                  {...field}
                  shouldUpdate
                  name={[field.name]}
                  id={field.key}
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  style={{ marginBottom: 0 }}
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
      {/* <Form.Item>
        <Button
          type="primary"
          onClick={editFormRef.submit}
          style={{ float: "right" }}
        >
          Save
        </Button>
      </Form.Item> */}
    </Form>
  );

  const rowActionForm = (
    <Form form={rowActionFormRef} onFinish={handleRowActionSubmit}>
      <div style={{ marginTop: "1.7rem" }}>
        <label htmlFor="price">Price</label>
        <Form.Item
          style={{ width: "48%" }}
          name="price"
          id="variant.price"
          validateTrigger="onChange"
          rules={[
            {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/, // Allow integers or floats with up to 2 decimal places
              message: "Please enter valid numbers only!",
            },
          ]}
        >
          <Input
            placeholder={defaultPrice}
            name="price"
            style={{ height: "2.5rem", marginTop: "0.7rem" }}
          />
        </Form.Item>
      </div>
      <h3>Inventory</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ width: "48%" }}>
          <label htmlFor="sku">SKU (Stock Keeping Unit)</label>
          <Form.Item name="sku" id="variant.sku">
            <Input
              style={{ height: "2.5rem", marginTop: "0.7rem" }}
              name="sku"
            />
          </Form.Item>
        </div>
        <div style={{ width: "48%" }}>
          <label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</label>
          <Form.Item name="barcode" id="variant.barcode">
            <Input
              style={{ height: "2.5rem", marginTop: "0.7rem" }}
              name="barcode"
            />
          </Form.Item>
        </div>
      </div>
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

  return (
    <>
      <Modal
        title="Variants"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={createFormRef.submit}
        okText="Save"
      >
        {createForm}
      </Modal>
      <Modal
        title="Variants"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={editFormRef.submit}
        okText="Save"
      >
        {editForm}
      </Modal>
      <Modal
        width="40rem"
        title={`Edit ${selectedRecord && selectedRecord.variant}`}
        open={rowActionModalOpen}
        onCancel={() => setRowActionModalOpen(false)}
        onOk={rowActionFormRef.submit}
        okText="Save"
      >
        {rowActionForm}
      </Modal>
      <Form className="primary-info">
        <Row>
          <Col lg={14}>
            <Row>
              <Col lg={18}>
                <Form.Item
                  label="Type"
                  labelCol={{ span: 5 }}
                  labelAlign="left"
                >
                  <Radio.Group>
                    <Radio value="goods"> Goods </Radio>
                    <Radio value="service"> Service </Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="itemGroupName"
                  label="Item Group Name"
                  labelCol={{ span: 5 }}
                  labelAlign="left"
                >
                  <Input
                    onBlur={(e) => {
                      const trimmedValue = e.target.value.trim();
                      if (
                        trimmedValue !== "" &&
                        trimmedValue !== itemGroupName &&
                        productVariations.length > 0
                      ) {
                        setItemGroupName(trimmedValue);
                        setCombinationPairsUpdated(true);
                      } else if (productVariations.length < 1) {
                        setItemGroupName(trimmedValue);
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
                  <TextArea rows={4}></TextArea>
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
          <Col lg={6}>
            <Form.Item
              label="Unit"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              labelAlign="left"
            >
              <Select placeholder="Select or type to add" showSearch allowClear>
                {unitOptions.map((option) => (
                  <Select.Option value={option} key={option}></Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item
              label="Tax"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
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
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <Form.Item
              label="Sales Account"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
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
          </Col>
          <Col lg={6}>
            <Form.Item
              label="Purchase Account"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Select defaultValue={purchaseOptionGroups[1].options[0]}>
                {purchaseOptionGroups.map((group) => (
                  <Select.OptGroup key={group.title} label={group.title}>
                    {group.options.map((option) => (
                      <Select.Option key={option}>{option}</Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <br />
      <a onClick={() => setCreateModalOpen(true)} style={{ float: "right" }}>
        Create New Variation
      </a>
      <div style={{ display: "flex" }}>
        {/* <Col lg={7}>
          <Collapse accordion style={{ marginBottom: "1rem" }} bordered={false}>
            <Collapse.Panel header="Variants">
              {isEditing ? editForm : createForm}
            </Collapse.Panel>
          </Collapse>
        </Col> */}
        {/* <Col lg={7}> */}
        {productVariations.map((variant, index) => (
          <div className="variants" key={variant.name}>
            <div className="variant-header">
              <div className="variant-name">{variant.name}</div>
              <div className="edit-remove-icons">
                <EditOutlined
                  style={{
                    fontSize: "1rem",
                    color: "var(--primary-color)",
                    marginRight: "0.5rem",
                  }}
                  onClick={() => handleEditClick(variant, index)}
                />
                <DeleteOutlined
                  style={{
                    fontSize: "1rem",
                    color: "red",
                    cursor: "pointer",
                  }}
                  onClick={() => handleRemoveVariation(index)}
                />
              </div>
            </div>
            <div className="variant-values-container">
              {variant.values.map((values) => (
                <Tag key={values.id} className="variant-values">
                  {values.value}
                </Tag>
              ))}
              {/* <Input
                  style={{
                    width: "4rem",
                    height: "1.5rem",
                    borderRadius: "0",
                  }}
                  key={index}
                  ref={inputRef}
                  type="text"
                  size="small"
                  style={tagInputStyle}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                ></Input>
                <Tag
                  key={index}
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setTagInputOpen(true);
                  }}
                >
                  New
                </Tag> */}
            </div>
          </div>
        ))}
        {/* </Col> */}
      </div>
      <Table
        bordered
        dataSource={combinationPairs}
        columns={columns}
        pagination={false}
        rowKey={(record) => record.variant}
      />
    </>
  );
};

export default ProductVariations;
