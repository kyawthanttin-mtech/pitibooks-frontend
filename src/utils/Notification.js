import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

export const openErrorNotification = (api, msg) => {
    const key = `open${Date.now()}`;
    api.open({
        message: <FormattedMessage id='notification.error' defaultMessage='Error' />,
        description: msg,
        key,
        icon: <ExclamationCircleOutlined />,
        duration: 0,
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