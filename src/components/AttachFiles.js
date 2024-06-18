import React, { useState } from "react";
import {
  PaperClipOutlined,
  CloseOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined,
  UploadOutlined,
  LeftOutlined,
  RightOutlined,
  QuestionOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileUnknownOutlined,
  ZoomOutOutlined,
  ZoomInOutlined,
} from "@ant-design/icons";
import { Button, Divider, Flex, Modal, Popover, Space, Upload } from "antd";
import "./AttachFiles.css";
import { FormattedMessage } from "react-intl";
// import { Document, Page } from "@react-pdf/renderer";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const AttachFiles = ({ files, iconButton = false }) => {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // const [openOptionsIndices, setOpenOptionsIndices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const extractFilename = (url) => {
    return url?.substring(url?.lastIndexOf("/") + 1);
  };
  console.log(files);
  const initializeFileList = (files) => {
    return files?.map((file) => ({
      ...file,
      name: extractFilename(file?.documentUrl),
    }));
  };

  const [customFileList, setCustomFileList] = useState(
    files ? initializeFileList(files) : []
  );

  // const hide = () => {
  //   setOpen(false);
  // };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  // const toggleOptions = (index) => {
  //   if (openOptionsIndices.includes(index)) {
  //     setOpenOptionsIndices(openOptionsIndices.filter((i) => i !== index));
  //   } else {
  //     setOpenOptionsIndices([...openOptionsIndices, index]);
  //   }
  // };

  const handleAttachmentClick = (file, index) => {
    setSelectedFile(file);
    setSelectedPreviewIndex(index);
    setModalOpen(true);
    setOpen(false);
  };

  const modalClose = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setZoomLevel(1);
  };

  const goToSlide = (slideIndex) => {
    setSelectedPreviewIndex(slideIndex);
    setSelectedFile(customFileList[slideIndex]);
    setZoomLevel(1);
  };

  const goToPrevious = () => {
    const isFirstSlide = selectedPreviewIndex === 0;
    const newIndex = isFirstSlide
      ? customFileList.length - 1
      : selectedPreviewIndex - 1;
    setSelectedPreviewIndex(newIndex);
    setSelectedFile(customFileList[newIndex]);
    setZoomLevel(1);
  };

  const goToNext = () => {
    const isLastSlide = selectedPreviewIndex === customFileList.length - 1;
    const newIndex = isLastSlide ? 0 : selectedPreviewIndex + 1;
    setSelectedPreviewIndex(newIndex);
    setSelectedFile(customFileList[newIndex]);
    setZoomLevel(1);
  };

  const getFileIcon = (fileExtension) => {
    switch (fileExtension.toLowerCase()) {
      case "pdf":
        return <FilePdfOutlined />;
      case "xlsx":
      case "xls":
        return <FileExcelOutlined />;
      case "doc":
      case "docx":
        return <FileWordOutlined />;
      case "png":
      case "jpg":
      case "jpeg":
        return <FileImageOutlined />;
      default:
        return <FileUnknownOutlined />;
    }
  };

  const getFileExtension = (url) => {
    return url?.split(".").pop();
  };

  const getFileType = (fileUrl) => {
    const extension = getFileExtension(fileUrl)?.toLowerCase();
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "bmp", "tiff"];
    const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt"];

    if (imageExtensions.includes(extension)) {
      return "image";
    } else if (documentExtensions.includes(extension)) {
      return "document";
    } else {
      return "unknown";
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.1));
  };

  const handleDownloadFile = async (documentUrl, name) => {
    try {
      const response = await fetch(documentUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const title = (
    <>
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: "8px 12px" }}
      >
        <FormattedMessage id="label.attachments" defaultMessage="Attachments" />
        {/* <CloseOutlined style={{ color: "red", height: 11, width: 11 }} /> */}
      </Flex>
      <Divider style={{ margin: 0 }} />
    </>
  );

  const content = (
    <>
      <div className="attachment-container">
        {!customFileList?.length > 0 ? (
          <Flex
            justify="center"
            align="center"
            style={{ paddingBottom: "12px" }}
          >
            No Files Attached
          </Flex>
        ) : (
          customFileList?.map((file, index) => (
            <Flex
              key={index}
              className="attachment-li"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleAttachmentClick(file, index)}
              align="center"
            >
              <Flex
                align="center"
                justify="center"
                style={{ paddingRight: "12px", fontSize: 16 }}
              >
                {getFileIcon(getFileExtension(file.documentUrl))}
              </Flex>
              <div>
                <Flex justify="space-between" align="center" key={index}>
                  <Flex vertical>
                    <span className="attachment-name">{file.name}</span>
                    {/* <span className="attachment-size">File Size</span> */}
                  </Flex>
                  {/* {hoveredIndex === index && (
                  <Space>
                    <span>
                      <DeleteOutlined
                        style={{ color: "red", width: 14, height: 14 }}
                      />
                    </span>
                    <span onClick={() => toggleOptions(index)}>
                      <MoreOutlined style={{ width: 14, height: 14 }} />
                    </span>
                  </Space>
                )} */}
                </Flex>
                {/* {openOptionsIndices.includes(index) && hoveredIndex === index && ( */}
                <div className="attachment-options">
                  <span>
                    <a
                      href={file.documentUrl}
                      download
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(file.documentUrl, file.name);
                      }}
                    >
                      <FormattedMessage
                        id="button.download"
                        defaultMessage="Download"
                      />
                    </a>
                  </span>
                  <Divider type="vertical" />
                  <span>
                    <a
                      href={file.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExportOutlined />
                    </a>
                  </span>
                </div>
                {/* )} */}
              </div>
            </Flex>
          ))
        )}
      </div>
      {/* <Divider style={{ margin: 0 }} />
        <div style={{ padding: "12px" }}>
          <Upload.Dragger>
            <Button
              type="button"
              // loading={uploadLoading}
              icon={<UploadOutlined style={{ color: "var(--primary-color)" }} />}
            >
              <span>Upload Files</span>
            </Button>
          </Upload.Dragger>
          <p
            style={{
              fontSize: "0.625rem",
              textAlign: "center",
              margin: "10px 0 0 0",
            }}
          >
            <FormattedMessage
              id="label.uploadLimit"
              defaultMessage="You can upload a maximum of 5 files, 5MB each"
            />
          </p>
        </div> */}
    </>
  );

  const modalFooter = (
    <div className="modal-footer">
      {getFileType(selectedFile?.documentUrl) === "image" && (
        <div className="zoom-tools">
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </div>
      )}
      <Flex
        justify="center"
        align="center"
        gap="1rem"
        className="preview-nav-container"
      >
        {customFileList.map((slide, slideIndex) => {
          console.log("File type:", slide.__typename);
          return (
            <div
              className={`preview-nav-indicator ${
                slideIndex === selectedPreviewIndex ? "active" : ""
              }`}
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
            >
              {getFileType(slide.documentUrl) === "image" ? (
                <img src={slide.documentUrl} alt="preview" />
              ) : (
                <QuestionOutlined />
              )}
            </div>
          );
        })}
      </Flex>
    </div>
  );

  console.log("selected file", selectedFile);
  return (
    <>
      <Modal
        title={selectedFile?.name}
        open={modalOpen}
        onCancel={modalClose}
        centered
        width="80%"
        // bodyStyle={{ padding: 0 }}
        wrapClassName="preview-modal"
        footer={modalFooter}
      >
        <Flex justify="center" align="center" style={{ width: "100%" }}>
          {selectedPreviewIndex > 0 && (
            <div className="preview-nav-button left" onClick={goToPrevious}>
              <LeftOutlined style={{ opacity: "100%" }} />
            </div>
          )}
          <div className="preview-container">
            {getFileType(selectedFile?.documentUrl) === "image" ? (
              <div>
                <TransformWrapper>
                  <TransformComponent>
                    <img
                      src={selectedFile?.documentUrl}
                      alt="Preview"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
            ) : (
              <iframe
                src={selectedFile?.documentUrl}
                title={selectedFile?.name}
              />
            )}
          </div>
          {selectedPreviewIndex < customFileList.length - 1 && (
            <div className="preview-nav-button right" onClick={goToNext}>
              <RightOutlined style={{ opacity: "100%" }} />
            </div>
          )}
        </Flex>
      </Modal>

      <div>
        <Popover
          className="attachment-popover"
          title={title}
          content={content}
          trigger="click"
          open={open}
          placement="bottomLeft"
          onOpenChange={handleOpenChange}
        >
          {iconButton ? (
            <Button icon={<PaperClipOutlined />}>
              {files?.length > 0 && files?.length}
            </Button>
          ) : (
            <Button type="text" icon={<PaperClipOutlined />}>
              <span>
                {files
                  ? `${files.length} File${files.length > 1 ? "s" : ""}`
                  : "Attach Files"}
              </span>
            </Button>
          )}
        </Popover>
      </div>
    </>
  );
};

export default AttachFiles;
