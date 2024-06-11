import React, { useState } from "react";
import { Upload, Button, Image, Flex, Space, Modal } from "antd";
import {
  PlusOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../utils/Notification";
import { useOutletContext } from "react-router-dom";
import "./UploadImage.css";
import { ImageMutations } from "../graphql";
import { useMutation } from "@apollo/client";
import { FormattedMessage } from "react-intl";
import { ReactComponent as ImageOutlined } from "../assets/icons/ImageOutlined.svg";
import { useHistoryState } from "../utils/HelperFunctions";
const { UPLOAD_SINGLE_IMAGE, REMOVE_SINGLE_IMAGE } = ImageMutations;

const UploadImage = ({ onCustomFileListChange, images = [] }) => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const { notiApi, msgApi } = useOutletContext();
  const [customFileList, setCustomFileList] = useState(images ? images : []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  console.log("images", customFileList);
  const primaryImageIndex = 0;

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

  const loading = uploadLoading || removeLoading;

  const selectImage = (index) => {
    setSelectedImageIndex(index);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      openErrorNotification(notiApi, "You can only upload JPG/PNG file!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      openErrorNotification(notiApi, "Image must be smaller than 5MB!");
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
        thumbnailUrl: data?.uploadSingleImage?.thumbnail_url,
        imageUrl: data?.uploadSingleImage?.image_url,
      };

      const updatedFileList = [...customFileList, newFile];
      setCustomFileList(updatedFileList);
      onCustomFileListChange(updatedFileList);

      msgApi.success(`Image Uploaded`);
      onSuccess(null, file);
    } catch (error) {
      openErrorNotification(notiApi, `Image upload failed: ${error.message}`);
      onError(error);
    }
  };

  const handleRemoveImage = async (currentIndex) => {
    const imageUrl = customFileList[currentIndex].imageUrl;

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
        const newFileList = [...customFileList];

        if (newFileList[currentIndex].id) {
          newFileList[currentIndex] = {
            ...newFileList[currentIndex],
            isDeletedItem: true,
          };
        } else {
          await removeImage({ variables: { imageUrl: imageUrl } });
          newFileList.splice(currentIndex, 1);
        }

        setCustomFileList(newFileList);
        onCustomFileListChange(newFileList);
        setSelectedImageIndex(
          currentIndex === 0 ? currentIndex : currentIndex - 1
        );

        msgApi.success("Image Removed");
      } catch (error) {
        openErrorNotification(
          notiApi,
          `Failed to remove image: ${error.message}`
        );
      }
    }
  };

  const handleMarkAsPrimary = (currentIndex) => {
    const newFileList = [...customFileList];

    const [removed] = newFileList.splice(currentIndex, 1);

    newFileList.unshift(removed);

    setSelectedImageIndex(0);
    setCustomFileList(newFileList);
    onCustomFileListChange(newFileList);
  };

  // Filter out deleted items
  const visibleFileList = customFileList.filter((file) => !file.isDeletedItem);

  return (
    <>
      {contextHolder}
      <div className="upload-container">
        {visibleFileList.length > 0 ? (
          <>
            <Flex gap="middle">
              <div className="image-preview-container">
                <div className="primary-image-container">
                  <Image.PreviewGroup
                    items={visibleFileList.map((file) => ({
                      src: file.imageUrl,
                      title: file.name,
                    }))}
                    preview={{
                      current: selectedPreviewIndex,
                      onChange: (current) => setSelectedPreviewIndex(current),
                    }}
                  >
                    <Image
                      loading={loading}
                      onClick={() => {
                        setSelectedPreviewIndex(selectedImageIndex);
                      }}
                      src={visibleFileList[selectedImageIndex].thumbnailUrl}
                      alt="product"
                      className="primary-image"
                    />
                  </Image.PreviewGroup>
                </div>

                <div className="image-actions">
                  {selectedImageIndex === primaryImageIndex ? (
                    <span className="primary-indicator">
                      <Space size={5}>
                        <CheckCircleFilled className="check-circle-icon" />
                        Primary
                      </Space>
                    </span>
                  ) : (
                    <a onClick={() => handleMarkAsPrimary(selectedImageIndex)}>
                      Mark as primary
                    </a>
                  )}
                  <Space size="small">
                    {removeLoading && <LoadingOutlined />}
                    <DeleteOutlined
                      className="action-icon-delete"
                      onClick={() => handleRemoveImage(selectedImageIndex)}
                    />
                  </Space>
                </div>
              </div>
              <div className="upload-list-container">
                <div className="file-list">
                  {visibleFileList.map((file, index) => (
                    <div
                      key={index}
                      className={`file-item ${
                        selectedImageIndex === index ? "selected" : ""
                      }`}
                      onClick={() => selectImage(index)}
                    >
                      <img src={file.thumbnailUrl} alt={`file-${index}`} />
                    </div>
                  ))}
                  {visibleFileList.length >= 4 ? null : (
                    <Upload
                      className="upload-button"
                      name="product"
                      customRequest={handleUpload}
                      beforeUpload={beforeUpload}
                      showUploadList={false}
                    >
                      <Button
                        type="button"
                        loading={uploadLoading}
                        icon={<PlusOutlined />}
                      ></Button>
                    </Upload>
                  )}
                </div>
              </div>
            </Flex>
          </>
        ) : (
          <Upload.Dragger
            name="product"
            className="upload-dragger"
            customRequest={handleUpload}
            beforeUpload={beforeUpload}
            showUploadList={false}
          >
            {uploadLoading ? (
              <LoadingOutlined />
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <ImageOutlined
                    height={30}
                    width={50}
                    style={{ opacity: "70%" }}
                  />
                </p>
                <p className="ant-upload-text">
                  Click or drag image to this area to upload
                </p>
                <p className="ant-upload-hint">
                  You can add up to 5 images, each not exceeding 5 MB.
                </p>
              </>
            )}
          </Upload.Dragger>
        )}
      </div>
    </>
  );
};

export default UploadImage;
