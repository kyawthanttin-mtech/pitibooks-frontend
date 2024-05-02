import React from "react";
import "../App.css";
import { ConfigProvider, Form, Input, Button, notification } from "antd";
import { useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { UserMutations } from "../graphql";
import { openErrorNotification } from "../utils/Notification";
import Theme from "../config/Theme";

const { LOGIN } = UserMutations;

const LoginPage = () => {
  let navigate = useNavigate();
  let location = useLocation();
  let from = location.state?.from?.pathname || "/";
  const [api, contextHolder] = notification.useNotification();

  const [login, { loading }] = useMutation(LOGIN, {
    errorPolicy: "all",
    onCompleted(data) {
      localStorage.setItem("token", data.login.token);
      localStorage.setItem("name", data.login.name);
      localStorage.setItem("role", data.login.role);
      localStorage.setItem("module", data.login.modules);
      localStorage.setItem("businessName", data.login.businessName);
      localStorage.setItem("baseCurrencyId", data.login.baseCurrencyId);
      localStorage.setItem("baseCurrencyName", data.login.baseCurrencyName);
      localStorage.setItem("baseCurrencySymbol", data.login.baseCurrencySymbol);
      localStorage.setItem("fiscalYear", data.login.fiscalYear);
      localStorage.setItem("timezone", data.login.timezone);
      navigate(from, { replace: true });
    },
    onError(err) {
      openErrorNotification(api, err.message);
    },
  });

  const onFinish = (values) => {
    login({
      variables: {
        ...values,
      },
    });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: Theme.colorPrimary,
          colorInfo: Theme.colorInfo,
        },
      }}
    >
      {contextHolder}
      <Form
        name="login"
        className="login-form"
        labelCol={{
          lg: 5,
          xs: 5,
        }}
        wrapperCol={{
          lg: 13,
          xs: 13,
        }}
        style={{
          maxWidth: 600,
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          // initialValue="kyawthanttin"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          // initialValue="123456"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 5,
            lg: 13,
            xs: 13,
          }}
        >
          <Button type="primary" htmlType="submit" loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
};

export default LoginPage;
