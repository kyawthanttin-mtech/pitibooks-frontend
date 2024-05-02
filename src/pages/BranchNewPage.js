import React from 'react';
import { Form, Input, Button, Layout, Space } from 'antd';
import { useMutation } from '@apollo/client';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { BranchMutations } from '../graphql';
import {openErrorNotification, openSuccessNotification} from '../utils/Notification';

const { CREATE_BRANCH } = BranchMutations;

const BranchNewPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [notiApi] = useOutletContext();

    const [create, {loading} ] = useMutation(CREATE_BRANCH, { 
        errorPolicy: 'all', 
        onCompleted(data) {
            openSuccessNotification(notiApi, "Branch Created");
            navigate(from, { state: location.state, replace: true });
        }, 
        onError(err) {
            openErrorNotification(notiApi, err.message);
        },
    });

    const onFinish = values => {
        create({ 
            variables: { 
                input: {
                    name: values["name"],
                    city: values["city"],
                }
            }});
    };

    return (
        <Layout style={{height: '100%'}}>
            <Layout.Content>
                <Form
                    form={form}
                    className='form'
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
                        label= {<FormattedMessage id="branch.name" defaultMessage="Name" />}
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: <FormattedMessage id="branch.name.required" defaultMessage="Enter the Branch Name" />
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label= {<FormattedMessage id="branch.city" defaultMessage="City" />}
                        name="city"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        wrapperCol={{
                            offset: 5,
                            lg: 13,
                            xs: 13,
                        }}
                    >
                    </Form.Item>
                </Form>
            </Layout.Content>
            <Layout.Footer>
                <Space>
                    <Button type="primary" loading={loading} onClick={form.submit}>
                        <FormattedMessage id="button.save" defaultMessage="Save" />
                    </Button>
                    <Button loading={loading} onClick={() => navigate(from, { state: location.state, replace: true })}>
                        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
                    </Button>
                </Space>
            </Layout.Footer>
        </Layout>
    );
};

export default BranchNewPage;