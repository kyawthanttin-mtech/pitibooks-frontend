import React, { useState, useMemo } from "react";

import {
  Row,
  Upload,
  Col,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Flex,
  Modal,
  Space,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "./Profile.css";
import TextArea from "antd/es/input/TextArea";
import { useMutation, useReadQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { BusinessMutations } from "../../graphql";
import { ImageMutations } from "../../graphql";
const { UPLOAD_SINGLE_IMAGE, REMOVE_SINGLE_IMAGE } = ImageMutations;
const { UPDATE_BUSINESS } = BusinessMutations;

const Profile = () => {
  const [formRef] = Form.useForm();
  const {
    notiApi,
    msgApi,
    business,
    refetchBusiness,
    allCurrenciesQueryRef,
    allStatesQueryRef,
    allTownshipsQueryRef,
  } = useOutletContext();
  const [selectedState, setSelectedState] = useState(null);
  const [image, setImage] = useState({ logoUrl: business?.logoUrl });
  const [deleteModal, contextHolder] = Modal.useModal();

  // Queries and mutations
  const { data: stateData } = useReadQuery(allStatesQueryRef);
  const { data: townshipData } = useReadQuery(allTownshipsQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);

  const [updateBusiness, { loading: updateLoading }] = useMutation(
    UPDATE_BUSINESS,
    {
      async onCompleted() {
        await refetchBusiness();
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="business.updated"
            defaultMessage="Business Updated"
          />
        );
      },
    }
  );

  const [uploadImage, { loading: uploadLoading }] = useMutation(
    UPLOAD_SINGLE_IMAGE,
    {
      onCompleted() {},
    }
  );

  const [removeImage, { loading: removeLoading }] = useMutation(
    REMOVE_SINGLE_IMAGE,
    {
      onCompleted() {},
    }
  );

  const loading = updateLoading || uploadLoading || removeLoading;

  const handleSave = async () => {
    try {
      const values = await formRef.validateFields();
      const input = {
        ...values,
        logo_url: image?.logoUrl,
        stateId: values.stateId || 0,
        townshipId: values.townshipId || 0,
      };
      // console.log("Field values:", values);
      await updateBusiness({
        variables: { input },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  useMemo(() => {
    // console.log(data);
    const profile = business;
    if (profile) {
      formRef.setFieldsValue({
        name: profile.name,
        country: profile.country,
        stateId: profile.state.id || "",
        townshipId: profile.township.id || "",
        city: profile.city,
        address: profile.address,
        email: profile.email,
        phone: profile.phone,
        mobile: profile.mobile,
        baseCurrencyId: profile.baseCurrency.id,
        fiscalYear: profile.fiscalYear,
        reportBasis: profile.reportBasis,
        companyId: profile.companyId,
        taxId: profile.taxId,
      });
      if (profile.state.id) {
        setSelectedState(profile.state);
      }
    }
  }, [formRef, business]);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      openErrorNotification(notiApi, "You can only upload JPG/PNG file!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 1;
    if (!isLt5M) {
      openErrorNotification(notiApi, "Image must be smaller than 1MB!");
      return false;
    }
    return true;
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    console.log("sdfj", onSuccess, onError);
    try {
      const { data } = await uploadImage({
        variables: { file },
      });
      console.log("data", file);

      const newFile = {
        uid: file.uid,
        name: file.name,
        status: "done",
        logoUrl: data?.uploadSingleImage?.image_url,
      };

      setImage(newFile);
      msgApi.success(`Image Uploaded`);
      onSuccess(null, file);
    } catch (error) {
      openErrorNotification(notiApi, `Image upload failed: ${error.message}`);
      onError(error);
    }
  };

  const handleRemove = async () => {
    const imageUrl = image?.logoUrl;

    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.delete"
          defaultMessage="Are you sure to delete?"
        />
      ),
    });
    if (confirmed) {
      try {
        await removeImage({ variables: { imageUrl: imageUrl } });
        setImage(null);
        msgApi.success("Image Removed");
      } catch (error) {
        openErrorNotification(
          notiApi,
          `Failed to remove image: ${error.message}`
        );
      }
    }
  };

  console.log(image);

  return (
    <>
      {contextHolder}
      <div className="page-header">
        <Flex align="center" gap={"1rem"}>
          <p className="page-header-text">
            <FormattedMessage id="menu.profile" defaultMessage="Profile" />
          </p>
          {/* <span className="organization-id">ID: 836292040</span> */}
        </Flex>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <div className="upload-logo-section">
          {/* <p className="upload-logo-text">
            <FormattedMessage id="profile.logo" defaultMessage="Logo" />
          </p> */}
          <div className="upload-logo-container">
            {image && image?.logoUrl ? (
              <div
                className="upload-logo"
                style={{
                  height: "120px",
                  width: "250px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.3rem",
                }}
              >
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    height: "75%",
                    width: "100%",
                    borderBottom: "1px solid var(--border-color)",
                    padding: "5px",
                  }}
                >
                  <img
                    src={image?.logoUrl}
                    alt="Logo"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      background: "white",
                    }}
                  ></img>
                </Flex>
                <div style={{ textAlign: "right", padding: "5px 10px" }}>
                  <Space size="small">
                    {removeLoading && <LoadingOutlined />}
                    <DeleteOutlined
                      style={{ cursor: "pointer" }}
                      onClick={handleRemove}
                    />
                  </Space>
                </div>
              </div>
            ) : (
              <div
                style={{ height: "80px", width: "250px", borderRadius: "6px" }}
              >
                <Upload.Dragger
                  className="upload-logo-dragger"
                  beforeUpload={beforeUpload}
                  customRequest={handleUpload}
                  showUploadList={false}
                >
                  {removeLoading ? <LoadingOutlined /> : <UploadOutlined />}
                  <p className="upload-dragger-text">
                    <FormattedMessage
                      id="profile.logoDescription"
                      defaultMessage="Upload Your Organization Logo"
                    />
                  </p>
                </Upload.Dragger>
              </div>
            )}

            <div className="upload-logo-information">
              {/* <span className="logo-information">
                This logo will be displayed in transaction PDFs and email
                notifications.
              </span> */}
              <span className="logo-dimensions">
                Preferred Image Dimensions: 240 x 240 pixels @ 72 DPI
                <br /> Maximum File Size: 1MB
              </span>
            </div>
          </div>
        </div>
        <Form form={formRef} onFinish={handleSave}>
          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.businessName"
                    defaultMessage="Business Name"
                  />
                }
                name="name"
                labelAlign="left"
                labelCol={{ span: 7 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.name.required"
                        defaultMessage="Enter the Name"
                      />
                    ),
                  },
                ]}
              >
                <Input maxLength={100}></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.country"
                    defaultMessage="Country"
                  />
                }
                name="country"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select>
                  <Select.Option value="Myanmar">Myanmar</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage id="label.state" defaultMessage="State" />
                }
                name="stateId"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select
                  loading={loading}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => {
                    setSelectedState(
                      stateData?.listAllState?.find(
                        (state) => state.id === value
                      )
                    );
                    formRef.setFieldsValue({
                      townshipId: null,
                    });
                  }}
                >
                  {stateData?.listAllState?.map((state) => (
                    <Select.Option
                      key={state.id}
                      value={state.id}
                      label={state.stateNameEn}
                    >
                      {state.stateNameEn}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage id="label.city" defaultMessage="City" />
                }
                name="city"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Input maxLength={100}></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.township"
                    defaultMessage="Township"
                  />
                }
                name="townshipId"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select
                  loading={loading}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedState}
                >
                  {townshipData?.listAllTownship?.map((township) => {
                    if (township.stateCode === selectedState?.code) {
                      return (
                        <Select.Option
                          key={township.id}
                          value={township.id}
                          label={township.townshipNameEn}
                        >
                          {township.townshipNameEn}
                        </Select.Option>
                      );
                    }
                    return null;
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.address"
                    defaultMessage="Address"
                  />
                }
                name="address"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <TextArea maxLength={1000} rows="4"></TextArea>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage id="label.email" defaultMessage="Email" />
                }
                name="email"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Input maxLength={255}></Input>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage id="label.phone" defaultMessage="Phone" />
                }
                name="phone"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Input maxLength={20}></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage id="label.mobile" defaultMessage="Mobile" />
                }
                name="mobile"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Input maxLength={20}></Input>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.baseCurrency"
                    defaultMessage="Base Currency"
                  />
                }
                name="baseCurrencyId"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select
                  loading={loading}
                  // allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {currencyData?.listAllCurrency?.map((currency) => (
                    <Select.Option
                      key={currency.id}
                      value={currency.id}
                      label={currency.name}
                    >
                      {currency.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.fiscalYear"
                    defaultMessage="Fiscal Year"
                  />
                }
                name="fiscalYear"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select showSearch>
                  <Select.Option value="Jan">Jan-Dec</Select.Option>
                  <Select.Option value="Feb">Feb-Jan</Select.Option>
                  <Select.Option value="Mar">Mar-Feb</Select.Option>
                  <Select.Option value="Apr">Apr-Mar</Select.Option>
                  <Select.Option value="May">May-Apr</Select.Option>
                  <Select.Option value="Jun">Jun-May</Select.Option>
                  <Select.Option value="Jul">Jul-Jun</Select.Option>
                  <Select.Option value="Aug">Aug-Jul</Select.Option>
                  <Select.Option value="Sep">Sep-Aug</Select.Option>
                  <Select.Option value="Oct">Oct-Sep</Select.Option>
                  <Select.Option value="Nov">Nov-Oct</Select.Option>
                  <Select.Option value="Dec">Dec-Nov</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.reportBasis"
                    defaultMessage="Report Basis"
                  />
                }
                name="reportBasis"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Radio.Group>
                  <Radio value="Accrual">
                    <FormattedMessage
                      id="label.reportBasisAccrual"
                      defaultMessage="Accrual"
                    />
                  </Radio>
                  <Radio value="Cash">
                    <FormattedMessage
                      id="label.reportBasisCash"
                      defaultMessage="Cash"
                    />
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.companyId"
                    defaultMessage="Company ID"
                  />
                }
                name="companyId"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Input maxLength={100}></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage id="label.taxId" defaultMessage="Tax ID" />
                }
                name="taxId"
                labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Input maxLength={100}></Input>
              </Form.Item>
            </Col>
          </Row>
          <div className="page-actions-bar page-actions-bar-margin">
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
            >
              <FormattedMessage id="button.save" defaultMessage="Save" />
            </Button>
            {/* <Button loading={loading} className="page-actions-btn">
              <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
            </Button> */}
          </div>
        </Form>
      </div>
    </>
  );
};

export default Profile;
