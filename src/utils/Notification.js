import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

export const openErrorNotification = (api, msg) => {
    const key = `open${Date.now()}`;
    let message = msg;
    if (message.toLowerCase().includes("status code 401")) {
        message = "Token expired. Please logout and login again.";
    }
    api.open({
        message: <FormattedMessage id='notification.error' defaultMessage='Error' />,
        description: message,
        key,
        icon: <ExclamationCircleOutlined />,
        duration: 15,
    });
}

export const openSuccessNotification = (api, msg) => {
    const key = `open${Date.now()}`;
    api.open({
        message: <FormattedMessage id='notification.success' defaultMessage='Success' />,
        description: msg,
        key,
        icon: <CheckCircleOutlined />,
        duration: 5,
    });
}

export const openSuccessMessage = (api, msg) => {
    const key = `open${Date.now()}`;
    api.open({
        type: 'success',
        content: msg,
        key,
        duration: 5,
    });
}