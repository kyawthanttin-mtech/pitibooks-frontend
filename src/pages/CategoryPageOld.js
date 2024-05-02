/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useMemo} from 'react';
import { SettingOutlined, PlusOutlined, EditOutlined, EnterOutlined, SearchOutlined, CloseOutlined, MoreOutlined, DeleteOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Empty, Form, Input, Modal, Row, Select, Space, Table, Tag, Tooltip, Checkbox, Statistic } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { CategoryQueries, CategoryMutations } from '../graphql';
import { openErrorNotification } from '../utils/Notification';
import Theme from '../config/Theme';

const { GET_CATEGORIES, GET_CATEGORY_NAMES } = CategoryQueries;
const { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } = CategoryMutations;

const actionItems = [
    {
      label: <FormattedMessage id="button.edit" defaultMessage="Edit" />,
      icon: <EditOutlined />,
      key: "1",
    },
    {
        label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
        icon: <DeleteOutlined />,
        key: "2",
    },
];
  
const CategoryPage = () => {
    const [createFormRef] = Form.useForm();
    const [editFormRef] = Form.useForm();
    const [searchFormRef] = Form.useForm();
    const [notiApi] = useOutletContext();
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModal, contextHolder] = Modal.useModal();
    const subCategoryChecked = Form.useWatch('subCategory', editFormRef);
    const selectedCategoryType = Form.useWatch('type', editFormRef);

    const compactColumns = [
        {
            title: '',
            dataIndex: 'name',
            render: (_, record) => {
                return (<div className='table-list-item'>
                    <div className='table-list-item-title'>{record.name}</div>
                    <span className='table-list-item-description'>{record.detailType}</span>
                </div>)
            }
        }
    ]
    const columns = [
        {
          title: <FormattedMessage id="account.name" defaultMessage="Category Name" />,
          dataIndex: 'name',
          key: 'name',
          render: (_, record) => {
            if (record.level) {
                return <span style={{marginLeft: 8*record.level}} ><EnterOutlined rotate={90} /> {record.name}</span>
            } else {
                return record.name
            }
          }
        },
        {
          title: <FormattedMessage id="account.code" defaultMessage="Category Code" />,
          dataIndex: 'code',
          key: 'code',
        },
        {
          title: <FormattedMessage id="account.type" defaultMessage="Category Type" />,
          dataIndex: 'detailType',
          key: 'detailType',
        },
        {
            title: <FormattedMessage id="account.parentCategory" defaultMessage="Parent Category" />,
            dataIndex: 'parentCategory',
            key: 'parentCategory',
            render: (_, record) => record.parentCategory.name,
        },
        {
            title: '',
            dataIndex: 'action',
            render: (_, record) =>
                <Dropdown key={record.key} menu={{
                    items: actionItems, 
                    onClick: ({ key, domEvent }) => {
                        domEvent.stopPropagation();
                        if (key === '1') handleEdit(record);
                        // else if (key === '2')handleCloseTask
                    }}}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <SettingOutlined />
                    </div>
                </Dropdown>
          },
    ];

    const handleSearchModalCancel = () => {
        setSearchModalOpen(false);
    }

    const handleSearchModalClear = () => {
        setSearchShown(false);
        refetch({name: '', code: ''});
        searchFormRef.resetFields();
        setSearchModalOpen(false);
    }

    const handleSearchModalOk = () => {
        setSearchShown(true);
        refetch({name: searchFormRef.getFieldValue("name"), code: searchFormRef.getFieldValue("code")});
        setSearchModalOpen(false);
    }

    const handleCreateModalCancel = () => {
        setCreateModalOpen(false);
    }

    const handleCreateModalOk = async () => {
        try {
            await createCategory({
                variables: { 
                    input: {
                        name: createFormRef.getFieldValue("name"),
                        detailType: createFormRef.getFieldValue("type"),
                        mainType: getMainCategoryType(createFormRef.getFieldValue("type")),
                        code: createFormRef.getFieldValue("code"),
                        description: createFormRef.getFieldValue("description"),
                        parentCategoryId: 0,
                        isActive: true
                    }
                }
            });
            createFormRef.resetFields();
            setCreateModalOpen(false);
        } catch (err) {
            openErrorNotification(notiApi, err.message);
        }
    }

    const handleEdit = (record) => {
        setEditRecord(record);
        editFormRef.resetFields();
        editFormRef.setFieldsValue({
            id: record.id,
            isActive: record.isActive,
            name: record.name,
            type: record.detailType,
            code: record.code,
            description: record.description,
        });
        if (record.parentCategory.id && record.parentCategory.id > 0) {
            editFormRef.setFieldsValue({
                subCategory: true,
                parentCategory: record.parentCategory.id
            })
        }
        setEditModalOpen(true);
    }

    const handleEditModalCancel = () => {
        setEditModalOpen(false);
    }

    const handleEditModalOk = async () => {
        try {
            await updateCategory({
                variables: { 
                    id: editFormRef.getFieldValue("id"),
                    input: {
                        name: editFormRef.getFieldValue("name"),
                        detailType: editFormRef.getFieldValue("type"),
                        mainType: getMainCategoryType(editFormRef.getFieldValue("type")),
                        code: editFormRef.getFieldValue("code"),
                        description: editFormRef.getFieldValue("description"),
                        parentCategoryId: editFormRef.getFieldValue("parentCategory") && subCategoryChecked ? editFormRef.getFieldValue("parentCategory") : 0,
                        isActive: editFormRef.getFieldValue("isActive")
                    }
                }
            });
            setEditModalOpen(false);
        } catch (err) {
            openErrorNotification(notiApi, err.message);
        }
    }

    const [createCategory, {loading: createLoading}] = useMutation(CREATE_CATEGORY, {
        errorPolicy: 'all',
        refetchQueries: [ GET_CATEGORIES, GET_CATEGORY_NAMES ]
    });

    const [updateCategory, {loading: updateLoading}] = useMutation(UPDATE_CATEGORY, {
        errorPolicy: 'all',
        refetchQueries: [ GET_CATEGORIES, GET_CATEGORY_NAMES ],
        onCompleted: (data) => {
            if (selectedRecord && selectedRecord.id === data.updateCategory.id) {
                setSelectedRecord(data.updateCategory);
            }
        }
    });

    const [deleteCategory, {loading: deleteLoading}] = useMutation(DELETE_CATEGORY, {
        errorPolicy: 'all',
        refetchQueries: [ GET_CATEGORIES, GET_CATEGORY_NAMES ]
    });

    const [markCategoryActive, {loading: markLoading}] = useMutation(MARK_CATEGORY_ACTIVE, {
        errorPolicy: 'all',
        refetchQueries: [ GET_CATEGORIES, GET_CATEGORY_NAMES ]
    });
    
    const { data, loading: queryLoading, refetch } = useQuery(GET_CATEGORIES, {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
        onError(err) {
            openErrorNotification(notiApi, err.message);
        },
    });

    const { data: accountNames, loading: accountQueryLoading } = useQuery(GET_CATEGORY_NAMES, {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
        onError(err) {
            openErrorNotification(notiApi, err.message);
        },
    });

    const queryData = useMemo(() => {
        let queryData = data?.accounts? data?.accounts : [];
        if (datafilter !== 'All') {
            if (datafilter === 'Active' || datafilter === 'Inactive') {
                queryData = queryData.filter((x) => x.isActive === (datafilter === 'Active' ? true : false))
            } else {
                queryData = queryData.filter((x) => x.mainType === datafilter)
            }
        }
        
        if (!searchShown) {
            let tempData = queryData.filter((x) => x.parentCategory.id === 0);
            let queryLoopTimes = 0;
            while (queryData.length !== tempData.length && queryLoopTimes < 10) {
                // eslint-disable-next-line no-loop-func
                queryData.forEach((x) => {
                    if (x.parentCategory.id > 0) {
                        const found = tempData.findIndex((y) => y.id === x.id) >= 0 ? true : false;
                        const index = tempData.findIndex((y) => y.id === x.parentCategory.id);
                        if (!found && index >= 0) {
                            tempData.splice(index + 1, 0, {...x, level: queryLoopTimes+1});
                        }
                    }
                });
                queryLoopTimes++;
            }
            queryData = tempData;
        }
        return queryData;
    }, [data?.accounts, datafilter, searchShown])

    const accountOptions = useMemo(() => {
        if (accountNames?.accounts && editRecord && selectedCategoryType) {
            let accountsToBeShown = accountNames.accounts.filter((x) => x.id !== editRecord.id && x.parentCategory.id !== editRecord.id && x.detailType === selectedCategoryType && x.isActive === true);
            let names = accountNames.accounts.filter((x) => x.id !== editRecord.id && x.parentCategory.id !== editRecord.id && x.parentCategory.id === 0 && x.detailType === selectedCategoryType && x.isActive === true);
            let loopTimes = 0;
            while (accountsToBeShown.length !== names.length && loopTimes < 10) {
                // eslint-disable-next-line no-loop-func
                accountsToBeShown.forEach((x) => {
                    if (x.parentCategory.id > 0) {
                        const found = names.findIndex((y) => y.id === x.id) >= 0 ? true : false;
                        const index = names.findIndex((y) => y.id === x.parentCategory.id);
                        if (!found && index >= 0) {
                            names.splice(index + 1, 0, {...x, name: '-'.repeat(loopTimes+1) + ' '+ x.name});
                        }
                    }
                });
                loopTimes++; 
            }

            return [{
                label: editRecord.detailType,
                options: names.map(x => ({label: x.name, value: x.id}))
            }]
        } else {
            return [];
        }
    }, [accountNames, editRecord, selectedCategoryType]);

    const loading = queryLoading || accountQueryLoading || createLoading || updateLoading || deleteLoading || markLoading;

    const createForm = (
        <Form form={createFormRef} onFinish={handleCreateModalOk} autoComplete="off" initialValues={{type: "Other Asset"}}
            labelCol={{
                lg: 7,
                xs: 7,
            }}
            wrapperCol={{
                lg: 11,
                xs: 11,
            }}
            style={{
                maxWidth: 600,
            }}>
            <Form.Item
                label= {<FormattedMessage id="account.type" defaultMessage="Category Type" />}
                name="type"
            >
                <Select options={accountTypeOptions} />
            </Form.Item>
            <Form.Item
                label= {<FormattedMessage id="account.name" defaultMessage="Category Name" />}
                name="name"
                rules={[
                    {
                        required: true,
                        message: <FormattedMessage id="account.name.required" defaultMessage="Enter the Category Name" />,
                    },
                ]}
            >
                <Input maxLength={100} />
            </Form.Item>
            <Form.Item
                label= {<FormattedMessage id="account.code" defaultMessage="Category Code" />}
                name="code"
            >
                <Input maxLength={100} />
            </Form.Item>
            <Form.Item
                label= {<FormattedMessage id="account.description" defaultMessage="Category Description" />}
                name="description"
            >
                <Input.TextArea placeholder="Max. 500 characters"  maxLength={500} />
            </Form.Item>
        </Form>
    );

    const editForm = (
        <Form form={editFormRef} onFinish={handleEditModalOk} autoComplete="off"
            labelCol={{
                lg: 7,
                xs: 7,
            }}
            wrapperCol={{
                lg: 11,
                xs: 11,
            }}
            style={{
                maxWidth: 600,
            }}>
            <Form.Item
                hidden={true}
                name="id"
            >
                <Input maxLength={100} />
            </Form.Item>
            <Form.Item
                hidden={true}
                name="isActive"
            >
                <Checkbox />
            </Form.Item>
            <Form.Item
                shouldUpdate
                label= {<FormattedMessage id="account.type" defaultMessage="Category Type" />}
                name="type"
            >
                <Select onChange={() => editFormRef.resetFields(['subCategory', 'parentCategory'])} options={accountTypeOptions} />
            </Form.Item>
            <Form.Item
                label= {<FormattedMessage id="account.name" defaultMessage="Category Name" />}
                name="name"
                rules={[
                    {
                        required: true,
                        message: <FormattedMessage id="account.name.required" defaultMessage="Enter the Category Name" />,
                    },
                ]}
            >
                <Input maxLength={100} />
            </Form.Item>
            <Form.Item
                shouldUpdate
                name="subCategory"
                valuePropName="checked"
                wrapperCol={{offset: 7, span: 11}}
            >
                <Checkbox>
                    <FormattedMessage id="account.subCategoryChecked" defaultMessage="Make this a sub-account" />
                </Checkbox>
            </Form.Item>
            {subCategoryChecked && <Form.Item
                name="parentCategory"
                label= {<FormattedMessage id="account.parentCategory" defaultMessage="Parent Category" />}
                rules={[
                    {
                        required: true,
                        message: <FormattedMessage id="account.parentCategory.required" defaultMessage="Select the Parent Category" />,
                    },
                    ]}
            >
                <Select options={accountOptions ? accountOptions : []} />
            </Form.Item>}
            <Form.Item
                label= {<FormattedMessage id="account.code" defaultMessage="Category Code" />}
                name="code"
            >
                <Input maxLength={100} />
            </Form.Item>
            <Form.Item
                label= {<FormattedMessage id="account.description" defaultMessage="Category Description" />}
                name="description"
            >
                <Input.TextArea placeholder="Max. 500 characters"  maxLength={500} />
            </Form.Item>
        </Form>
    );

    const searchForm = (
        <Form form={searchFormRef}>
            <Form.Item
                label= {<FormattedMessage id="account.name" defaultMessage="Category Name" />}
                name="name"
            >
                <Input maxLength={100} allowClear={true} />
            </Form.Item>
            <Form.Item
                label= {<FormattedMessage id="account.code" defaultMessage="Category Code" />}
                name="code"
            >
                <Input maxLength={100} allowClear={true} />
            </Form.Item>
        </Form>
    );

    return (
        <div className={selectedRecord ? 'main-content' : ''}>
            {contextHolder}
            <Modal
                title={<FormattedMessage id="modal.search" defaultMessage="Search Panel" />}
                closeIcon={true}
                style={{
                    top: 65,
                }}
                open={searchModalOpen}
                onOk={handleSearchModalOk}
                onCancel={handleSearchModalCancel}
                footer={[
                    <Button key="submit" type="primary" loading={loading} onClick={handleSearchModalOk}>
                      <FormattedMessage id="button.search" defaultMessage="Search" />
                    </Button>,
                    <Button key="clear" loading={loading} onClick={handleSearchModalClear}>
                        <FormattedMessage id="button.clear" defaultMessage="Clear" />
                    </Button>,
                ]}
            >
                {searchForm}
            </Modal>
            <Modal
                title={<FormattedMessage id="account.create" defaultMessage="Create Category" />}
                closeIcon={true}
                style={{
                    top: 65,
                }}
                open={createModalOpen}
                onOk={createFormRef.submit}
                onCancel={handleCreateModalCancel}
                footer={[
                    <Button key="submit" type="primary" loading={loading} onClick={createFormRef.submit}>
                      <FormattedMessage id="button.save" defaultMessage="Save" />
                    </Button>,
                    <Button key="cancel" loading={loading} onClick={handleCreateModalCancel}>
                        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
                    </Button>,
                ]}
            >
                {createForm}
            </Modal>
            <Modal
                title={<FormattedMessage id="account.edit" defaultMessage="Edit Category" />}
                closeIcon={true}
                style={{
                    top: 65,
                }}
                open={editModalOpen}
                onOk={editFormRef.submit}
                onCancel={handleEditModalCancel}
                footer={[
                    <Button key="submit" type="primary" loading={loading} onClick={editFormRef.submit}>
                      <FormattedMessage id="button.save" defaultMessage="Save" />
                    </Button>,
                    <Button key="cancel" loading={loading} onClick={handleEditModalCancel}>
                        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
                    </Button>,
                ]}
            >
                {editForm}
            </Modal>
                <div className={selectedRecord ? 'list-column' : ''}>
                    <Row className='list-column-header-row'>
                        <Space>
                            <Select className='filter-select' bordered={false} defaultValue='All' onChange={(val) => setDataFilter(val)}
                                options={[
                                    {value:'All', label:<FormattedMessage id="account.filter.all" defaultMessage="All Categorys" />},
                                    {value:'Active', label:<FormattedMessage id="account.filter.active" defaultMessage="Active Categorys" />},
                                    {value:'Inactive', label:<FormattedMessage id="account.filter.inactive" defaultMessage="Inactive Categorys" />},
                                    {value:'Asset', label:<FormattedMessage id="account.filter.asset" defaultMessage="Asset Categorys" />},
                                    {value:'Liability', label:<FormattedMessage id="account.filter.liability" defaultMessage="Liability Categorys" />},
                                    {value:'Equity', label:<FormattedMessage id="account.filter.equity" defaultMessage="Equity Categorys" />},
                                    {value:'Income', label:<FormattedMessage id="account.filter.income" defaultMessage="Income Categorys" />},
                                    {value:'Expense', label:<FormattedMessage id="account.filter.expense" defaultMessage="Expense Categorys" />},
                                ]} />
                            <Tooltip title={<FormattedMessage id="button.search" defaultMessage="Search" />}>
                                <Button
                                    icon={<SearchOutlined />}
                                    loading={loading}
                                    onClick={() => setSearchModalOpen(true)}
                                />
                            </Tooltip>
                        </Space>
                        <Space>
                            <Button type='primary' icon={<PlusOutlined />} loading={loading}
                                onClick={() => setCreateModalOpen(true) }>
                                <FormattedMessage id="button.new" defaultMessage="New" />
                            </Button>
                        </Space>
                    </Row>
                    <Row className='list-column-full-row'>
                        <Table 
                            className='full-width'
                            columns={selectedRecord ? compactColumns : columns} 
                            showHeader={!selectedRecord}
                            pagination={false} loading={loading}
                            dataSource={queryData}
                            rowKey="id"
                            rowSelection={{selectedRowKeys: [selectedRowIndex]}}
                            onRow={(record) => { return {onClick: () => 
                                {
                                    setEditRecord(record);
                                    setSelectedRecord(record);
                                    setSelectedRowIndex(record.id);
                                }}}
                            }
                        />
                    </Row>
                </div>
                {selectedRecord &&
                    <div className='content-column'>
                        <Row className='content-column-header-row' style={{backgroundColor: 'white', justifyContent: 'space-between'}}>
                            <div className='content-title-block'>
                                <div style={{display:'flex', flexDirection: 'row'}} >
                                    <div className='content-title-sub'>{selectedRecord.detailType}</div>
                                    {!selectedRecord.isActive && <Tag color="magenta"><FormattedMessage id='status.inactive' defaultMessage='Inactive' /></Tag>}
                                </div>
                                <div className='content-title-main'>{selectedRecord.name}</div>
                            </div>
                            <Button icon={<CloseOutlined />} type='text' loading={loading}
                                onClick={() => {setSelectedRecord(null); setSelectedRowIndex(0);}} />
                        </Row>
                        <Row className='content-column-action-row'>
                            <Dropdown.Button trigger={['click']} type='text' icon={<MoreOutlined />} loading={loading}
                                onClick={() => handleEdit(selectedRecord)}
                                menu={{ 
                                    items: [
                                        { label: selectedRecord?.isActive ? <FormattedMessage id='button.markAsInactive' defaultMessage='Mark as Inactive' /> : <FormattedMessage id='button.markAsActive' defaultMessage='Mark as Active' />, key:'1', icon: selectedRecord?.isActive ? <MinusCircleOutlined /> : <PlusCircleOutlined /> },
                                        { label: <FormattedMessage id='button.delete' defaultMessage='Delete' />, key:'2', icon: <DeleteOutlined /> }
                                    ],
                                    onClick: async ({key}) => {
                                        if (key === '1') {
                                            try {
                                                await markCategoryActive({
                                                    variables: { 
                                                        id: selectedRecord.id,
                                                        isActive: !selectedRecord.isActive,
                                                    }
                                                });
                                                setSelectedRecord({
                                                    ...selectedRecord,
                                                    isActive: !selectedRecord.isActive,
                                                });
                                            } catch (err) {
                                                openErrorNotification(notiApi, err.message);
                                            }
                                        } else if (key === '2') {
                                            const confirmed = await deleteModal.confirm({content: <FormattedMessage id='confirm.delete' defaultMessage='Are you sure to delete?' />})
                                            if (confirmed) {
                                                try {
                                                    await deleteCategory({
                                                        variables: {
                                                            id: selectedRecord.id,
                                                        }
                                                    });
                                                    setSelectedRecord(null);
                                                    setSelectedRowIndex(0);
                                                } catch (err) {
                                                    openErrorNotification(notiApi, err.message);
                                                }
                                            }
                                        }
                                    }
                                }} >
                                <EditOutlined />  <FormattedMessage id='button.edit' defaultMessage='Edit' />
                            </Dropdown.Button>
                        </Row>
                        <Row className='content-column-brief-row' style={{backgroundColor: 'white'}}>
                            <div className='content-title-block'>
                                <Statistic 
                                    title={<FormattedMessage id='account.closingBalance' defaultMessage='CLOSING BALANCE' />}
                                    value={100000}
                                    valueStyle={{ color: Theme.colorPrimary }}
                                    prefix='MMK'
                                />
                                <div className='content-description'><span style={{fontStyle: 'italic'}}><FormattedMessage id='account.description' defaultMessage='Description' /></span> : {selectedRecord.description}</div>
                            </div>
                        </Row>
                        <Row className='content-column-full-row'>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </Row>
                    </div>
                }
        </div>
    );
};

export default CategoryPage;