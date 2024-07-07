import React, { useCallback, useEffect, useState } from "react";
import { Button, Upload, Modal, Space, Flex, Popover } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  MoreOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { openErrorNotification } from "../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FileMutations } from "../graphql";
import { useMutation } from "@apollo/client";

const { UPLOAD_FILE, REMOVE_FILE } = FileMutations;

const UploadAttachment = ({ onCustomFileListChange, files }) => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const { notiApi, msgApi } = useOutletContext();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [open, setOpen] = useState(false);

  const extractFilename = (url) => {
    return url?.substring(url?.lastIndexOf("/") + 1);
  };

  const initializeFileList = useCallback((files) => {
    return files?.map((file) => ({
      ...file,
      name: extractFilename(file?.documentUrl),
    }));
  }, []);

  useEffect(() => {
    setCustomFileList(files ? initializeFileList(files) : []);
  }, [files, initializeFileList]);

  const [customFileList, setCustomFileList] = useState(
    files ? initializeFileList(files) : []
  );

  const [uploadFile, { loading: uploadLoading }] = useMutation(UPLOAD_FILE, {
    onCompleted() {},
  });

  const [removeFile, { loading: removeLoading }] = useMutation(REMOVE_FILE, {
    onCompleted() {},
  });
  const beforeUpload = (file) => {
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
    ];

    // if (!allowedTypes.includes(file.type)) {
    //   openErrorNotification(
    //     notiApi,
    //     "You can only upload MS Word, Excel, or PDF files!"
    //   );
    //   return false;
    // }

    console.log("file", file);

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      openErrorNotification(notiApi, "File size must be smaller than 5MB!");
      return false;
    }
    return true;
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const { data } = await uploadFile({
        variables: { file },
      });
      console.log("data", file);

      const newFile = {
        uid: file.uid,
        name: file.name,
        status: "done",
        imageUrl: data?.uploadFile?.image_url,
      };

      const updatedFileList = [...customFileList, newFile];
      setCustomFileList(updatedFileList);
      onCustomFileListChange(updatedFileList);

      msgApi.success(`Attachment Uploaded`);
      onSuccess(null, file);
    } catch (error) {
      openErrorNotification(notiApi, `File upload failed: ${error.message}`);
      onError(error);
    }
  };

  const handleRemove = async (file) => {
    console.log("remove file", file);
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
        const fileToRemove = customFileList.find(
          (item) => item.uid === file.uid
        );

        if (fileToRemove.id) {
          const updatedFileList = customFileList.map((item) =>
            item.uid === file.uid ? { ...item, isDeletedItem: true } : item
          );
          setCustomFileList(updatedFileList);
          onCustomFileListChange(updatedFileList);
        } else {
          await removeFile({ variables: { imageUrl: fileToRemove.imageUrl } });

          const updatedFileList = customFileList.filter(
            (item) => item.uid !== file.uid
          );
          setCustomFileList(updatedFileList);
          onCustomFileListChange(updatedFileList);
        }

        msgApi.success(`Attachment Removed`);
      } catch (error) {
        openErrorNotification(
          notiApi,
          `Failed to remove attachment: ${error.message}`
        );
      }
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  console.log("File List", customFileList);

  const content = (
    <>
      <div className="attachment-container">
        {!customFileList?.length > 0 ? (
          <Flex
            justify="center"
            align="center"
            style={{ paddingBlock: "12px" }}
          >
            No Files Attached
          </Flex>
        ) : (
          customFileList?.map((file, index) => (
            <div
              key={index}
              className="attachment-li"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              // onClick={() => handleAttachmentClick(file, index)}
            >
              <Flex justify="space-between" align="center" key={index}>
                <Flex vertical>
                  <span className="attachment-name">{file.name}</span>
                  {/* <span className="attachment-size">File Size</span> */}
                </Flex>
                {hoveredIndex === index && (
                  <Space>
                    <span>
                      <DeleteOutlined
                        style={{ color: "red", width: 14, height: 14 }}
                      />
                    </span>
                  </Space>
                )}
              </Flex>
            </div>
          ))
        )}
      </div>
    </>
  );

  const visibleFileList = customFileList.filter((file) => !file.isDeletedItem);

  return (
    <>
      {contextHolder}
      <div className="attachment-upload" style={{ maxWidth: "20rem" }}>
        <p>
          <FormattedMessage
            id="label.attachments"
            defaultMessage="Attachments"
          />
        </p>
        <Space>
          <Upload
            beforeUpload={beforeUpload}
            customRequest={handleUpload}
            onRemove={handleRemove}
            fileList={visibleFileList}
            showUploadList={{
              showRemoveIcon: true,
              removeIcon: removeLoading ? (
                <LoadingOutlined />
              ) : (
                <DeleteOutlined />
              ),
            }}
          >
            <Button
              disabled={visibleFileList.length >= 5 ? true : false}
              loading={uploadLoading}
              type="dashed"
              icon={<UploadOutlined />}
              className="attachment-upload-button"
            >
              <span>
                <FormattedMessage
                  id="button.uploadFile"
                  defaultMessage="Upload File"
                />
              </span>
            </Button>
          </Upload>
          {/* <Popover
            className="attachment-popover"
            // title={title}
            content={content}
            trigger="click"
            open={open}
            placement="topLeft"
            onOpenChange={handleOpenChange}
          >
            <Button
              style={{ fontSize: 13, padding: "4px 9px" }}
              type="primary"
              icon={
                <PaperClipOutlined
                  style={{ paddingRight: "2px", fontSize: 13 }}
                />
              }
            >
              {visibleFileList.length > 0 && visibleFileList.length}
            </Button>
          </Popover> */}
        </Space>
        <p>
          <FormattedMessage
            id="label.uploadLimit"
            defaultMessage="You can upload a maximum of 5 files, 5MB each"
          />
        </p>
      </div>
    </>
  );
};

export default UploadAttachment;
