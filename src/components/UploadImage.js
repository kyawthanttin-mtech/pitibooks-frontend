import React, { useState, useEffect } from "react";
import { Upload, Button, Image, Flex, Space } from "antd";
import {
  InboxOutlined,
  PlusOutlined,
  CheckCircleFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import { openErrorNotification } from "../utils/Notification";
import { useOutletContext } from "react-router-dom";

import "./UploadImage.css";

const UploadImage = ({ onCustomFileListChange }) => {
  const { notiApi } = useOutletContext();
  const [customFileList, setCustomFileList] = useState([
    {
      uid: "-1",
      name: "image.png",
      status: "done",
      url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  const primaryImageIndex = 0;

  const selectImage = (index) => {
    setSelectedImageIndex(index);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      openErrorNotification(notiApi, "You can only upload JPG/PNG file!");
      return;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      openErrorNotification(notiApi, "Image must be smaller than 5MB!");
      return;
    }

    const updatedFileList = [
      ...customFileList,
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(file),
      },
    ];

    setCustomFileList(updatedFileList);
    onCustomFileListChange(updatedFileList);
    return false;
  };

  const handleRemoveImage = (currentIndex) => {
    console.log("Image index to be removed", currentIndex);
    const newFileList = [...customFileList];

    newFileList.splice(currentIndex, 1);

    setCustomFileList(newFileList);
    onCustomFileListChange(newFileList);
    setSelectedImageIndex(currentIndex === 0 ? currentIndex : currentIndex - 1);
  };
  console.log("custom file list ", customFileList);
  const handleMarkAsPrimary = (currentIndex) => {
    const newFileList = [...customFileList];

    const [removed] = newFileList.splice(currentIndex, 1);

    newFileList.unshift(removed);

    setSelectedImageIndex(0);
    setCustomFileList(newFileList);
    onCustomFileListChange(newFileList);
  };

  return (
    <div className="upload-container">
      {customFileList.length > 0 ? (
        <>
          <Flex gap="middle">
            <div className="image-preview-container">
              <div className="primary-image-container">
                <Image.PreviewGroup
                  items={customFileList.map((file) => ({
                    src: file.url,
                    title: file.name,
                  }))}
                  preview={{
                    current: selectedPreviewIndex,
                    onChange: (current) => setSelectedPreviewIndex(current),
                  }}
                >
                  <Image
                    onClick={() => {
                      setSelectedPreviewIndex(selectedImageIndex);
                    }}
                    src={customFileList[selectedImageIndex].url}
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
                <DeleteOutlined
                  className="action-icon-delete"
                  onClick={() => handleRemoveImage(selectedImageIndex)}
                />
              </div>
            </div>
            <div className="upload-list-container">
              <div className="file-list">
                {customFileList.map((file, index) => (
                  <div
                    key={index}
                    className={`file-item ${
                      selectedImageIndex === index ? "selected" : ""
                    }`}
                    onClick={() => selectImage(index)}
                  >
                    <img src={file.url} alt={`file-${index}`} />
                  </div>
                ))}
                {customFileList.length >= 4 ? null : (
                  <Upload
                    className="upload-button"
                    name="product"
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                  >
                    <Button type="button">
                      <PlusOutlined />
                    </Button>
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
          beforeUpload={beforeUpload}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            You can add up to 5 images, each not exceeding 5 MB.
          </p>
        </Upload.Dragger>
      )}
    </div>
  );
};

export default UploadImage;
