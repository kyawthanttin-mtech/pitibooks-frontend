import React, {useState, useMemo} from "react";

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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./Profile.css";
import TextArea from "antd/es/input/TextArea";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  BusinessQueries,
  BusinessMutations,
  StateQueries,
  TownshipQueries,
  CurrencyQueries,
} from "../../graphql";

const { GET_BUSINESS } = BusinessQueries;
const { UPDATE_BUSINESS } = BusinessMutations;
const { GET_ALL_TOWNSHIPS } = TownshipQueries;
const { GET_ALL_STATES } = StateQueries;
const { GET_ALL_CURRENCIES } = CurrencyQueries;

const Profile = () => {
  const [formRef] = Form.useForm();
  const [notiApi] = useOutletContext();
  const [selectedState, setSelectedState] = useState(null);

  // Queries and mutations
  const { data, loading: queryLoading } = useQuery(GET_BUSINESS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: townshipData, loading: townshipLoading } = useQuery(
    GET_ALL_TOWNSHIPS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: stateData, loading: stateLoading } = useQuery(GET_ALL_STATES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: currencyData, loading: currencyLoading } = useQuery(GET_ALL_CURRENCIES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const [updateBusiness, { loading: updateLoading }] = useMutation(
    UPDATE_BUSINESS,
    {
      onCompleted() {
        openSuccessNotification(
          notiApi,
          <FormattedMessage
            id="business.updated"
            defaultMessage="Business Updated"
          />
        );
      },
      refetchQueries: [GET_BUSINESS],
    }
  );

  const loading =
    queryLoading ||
    stateLoading ||
    townshipLoading ||
    currencyLoading ||
    updateLoading;

  const handleSave = async () => {
    try {
      const values = await formRef.validateFields();
      // console.log("Field values:", values);
      await updateBusiness({
        variables: { input: values },
      });

    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  useMemo(() => {
    // console.log(data);
    const profile = data?.getBusiness;
    if (profile) {
      formRef.setFieldsValue({
        "name": profile.name,
        "country": profile.country,
        "stateId": profile.state.id,
        "townshipId": profile.township.id,
        "city": profile.city,
        "address": profile.address,
        "email": profile.email,
        "phone": profile.phone,
        "mobile": profile.mobile,
        "baseCurrencyId": profile.baseCurrency.id,
        "fiscalYear": profile.fiscalYear,
        "reportBasis": profile.reportBasis,
        "companyId": profile.companyId,
        "taxId": profile.taxId,
      });
      if (profile.state.id) {
        setSelectedState(profile.state);
      }
    }
  }, [formRef, data]);

  return (
    <>
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
            <div className="upload-logo">
              <Upload.Dragger className="upload-logo-dragger">
                <UploadOutlined />
                <p className="upload-dragger-text">
                  <FormattedMessage id="profile.logoDescription" defaultMessage="Upload Your Organization Logo" />
                </p>
              </Upload.Dragger>
            </div>
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
                label={<FormattedMessage id="profile.name" defaultMessage="Business Name" />}
                name="name"
                labelAlign="left"
                labelCol={{ span: 7 }}
                rules={[{ required: true, message: <FormattedMessage id="profile.name.required" defaultMessage="Enter the Business Name" /> }]}
              >
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col lg={8}>
              <Form.Item
                label={<FormattedMessage id="label.country" defaultMessage="Country" />}
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
                label={<FormattedMessage id="label.state" defaultMessage="State" />}
                name="stateId" labelAlign="left" labelCol={{ span: 7 }}>
                <Select
                  loading={loading}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => {
                    setSelectedState(
                      stateData?.listAllState.find((state) => state.id === value)
                    );
                    formRef.setFieldsValue({
                      "townshipId": null,
                    });
                  }}
                >
                  {stateData?.listAllState.map((state) => (
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
                label={<FormattedMessage id="label.city" defaultMessage="City" />} 
                name="city" labelAlign="left" labelCol={{ span: 7 }}>
                <Input></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item 
                label={<FormattedMessage id="label.township" defaultMessage="Township" />}
                name="townshipId" labelAlign="left" labelCol={{ span: 7 }}>
                <Select
                  loading={loading}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedState}
                >
                  {townshipData?.listAllTownship.map((township) => {
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
                label={<FormattedMessage id="label.address" defaultMessage="Address" />}
                name="address" labelAlign="left" labelCol={{ span: 7 }}>
                <TextArea rows="4"></TextArea>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item 
                label={<FormattedMessage id="label.email" defaultMessage="Email" />}
                name="email" labelAlign="left" labelCol={{ span: 7 }}>
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item 
                label={<FormattedMessage id="label.phone" defaultMessage="Phone" />}
                name="phone" labelAlign="left" labelCol={{ span: 7 }}>
                <Input></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item 
                label={<FormattedMessage id="label.mobile" defaultMessage="Mobile" />}
                name="mobile" labelAlign="left" labelCol={{ span: 7 }}>
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item
                label={<FormattedMessage id="profile.baseCurrency" defaultMessage="Base Currency" />}
                name="baseCurrencyId" labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Select
                  loading={loading}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {currencyData?.listAllCurrency.map((currency) => (
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
                label={<FormattedMessage id="profile.fiscalYear" defaultMessage="Fiscal Year" />}
                name="fiscalYear" labelAlign="left" labelCol={{ span: 7 }}>
                <Select showSearch allowClear>
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
                label={<FormattedMessage id="profile.reportBasis" defaultMessage="Report Basis" />}
                name="reportBasis" labelAlign="left"
                labelCol={{ span: 7 }}
              >
                <Radio.Group>
                  <Radio value="Accrual">
                    <FormattedMessage id="profile.reportBasisAccrual" defaultMessage="Accrual" />
                  </Radio>
                  <Radio value="Cash">
                    <FormattedMessage id="profile.reportBasisCash" defaultMessage="Cash" />
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Form.Item 
                label={<FormattedMessage id="profile.companyId" defaultMessage="Company ID" />}
                name="companyId" labelAlign="left" labelCol={{ span: 7 }}>
                <Input></Input>
              </Form.Item>
            </Col>
            <Col lg={8} offset={1}>
              <Form.Item 
                label={<FormattedMessage id="profile.taxId" defaultMessage="Tax ID" />}
                name="taxId" labelAlign="left" labelCol={{ span: 7 }}>
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
          <div className="page-actions-bar page-actions-bar-margin">
            <Button loading={loading} type="primary" htmlType="submit" className="page-actions-btn">
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
