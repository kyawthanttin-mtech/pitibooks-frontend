import React, { useState } from "react";
import { Form, Checkbox, Button, message } from "antd";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { TaxMutations } from "../../graphql";
const { UPDATE_TAX_SETTING } = TaxMutations;

const TaxSettings = () => {
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [isTaxExclusive, setIsTaxExclusive] = useState(false);
  const [notiApi] = useOutletContext();
  const [updateTaxSetting, { loading }] = useMutation(UPDATE_TAX_SETTING, {
    onCompleted: () => {
      openSuccessNotification(notiApi, "Tax Settings Saved");
    },
  });

  const handleSubmit = async () => {
    try {
      await updateTaxSetting({
        variables: {
          input: {
            isTaxInclusive: isTaxInclusive,
            isTaxExclusive: isTaxExclusive,
          },
        },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  return (
    <>
      <div className="content-header page-header">
        <p className="page-header-text">Tax Settings</p>
      </div>
      <div className="content-body page-content settings-content">
        <Form className="settings-form">
          <Form.Item className="settings-form-item">
            <Checkbox
              checked={isTaxInclusive}
              onChange={(e) => setIsTaxInclusive(e.target.checked)}
            >
              Tax Inclusive
            </Checkbox>
            <p>
              TDS or the Tax Deducted at Source, can be associated with the
              customers, vendors or both customers and vendors in Zoho
              Inventory. You can enable TDS for a particular contact in the
              contact's create or edit page.
            </p>
          </Form.Item>
          <Form.Item className="settings-form-item">
            <Checkbox
              checked={isTaxExclusive}
              onChange={(e) => setIsTaxExclusive(e.target.checked)}
            >
              Tax Exclusive
            </Checkbox>
            <p>
              TDS or the Tax Deducted at Source, can be associated with the
              customers, vendors or both customers and vendors in Zoho
              Inventory. You can enable TDS for a particular contact in the
              contact's create or edit page.
            </p>
          </Form.Item>
          <div className="page-actions-bar">
            <Button
              type="primary"
              htmlType="button"
              className="page-actions-btn"
              onClick={handleSubmit}
              loading={loading}
            >
              Save
            </Button>
            <Button className="page-actions-btn">Cancel</Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default TaxSettings;
