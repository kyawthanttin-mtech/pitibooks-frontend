import React, { useState } from "react";
import {
  PaperClipOutlined,
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
  DeleteOutlined,
  ZoomInOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Divider, Flex, Modal, Popover, Space, Upload } from "antd";
import "./AttachFiles.css";
import { FormattedMessage } from "react-intl";
// import { Document, Page } from "@react-pdf/renderer";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { openErrorNotification } from "../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { FileMutations } from "../graphql";
const { CREATE_ATTACHMENT, DELETE_ATTACHMENT } = FileMutations;

const AttachFiles = ({
  files,
  iconButton = false,
  referenceType,
  referenceId,
  GET_PAGINATE_BILL,
}) => {
  const { notiApi, msgApi } = useOutletContext();
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // const [openOptionsIndices, setOpenOptionsIndices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [deleteModal, contextHolder] = Modal.useModal();

  const [createFile, { loading: createLoading }] = useMutation(
    CREATE_ATTACHMENT,
    {
      onCompleted() {},
    }
  );

  const [deleteFile, { loading: deleteLoading }] = useMutation(
    DELETE_ATTACHMENT,
    {
      onCompleted() {},
    }
  );

  const extractFilename = (url) => {
    return url?.substring(url?.lastIndexOf("/") + 1);
  };

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

  console.log(customFileList);

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
    console.log("exx", fileExtension);
    switch (fileExtension?.toLowerCase()) {
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
    const documentExtensions = ["doc", "docx", "xls", "xlsx", "txt"];

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
      const { data } = await createFile({
        variables: { file, referenceType, referenceId },
      });
      console.log("file", file);
      const newFile = {
        uid: file.uid,
        name: file.name,
        status: "done",
        id: data?.createAttachment?.id,
        documentUrl: data?.createAttachment?.documentUrl,
      };

      const updatedFileList = [...customFileList, newFile];
      setCustomFileList(updatedFileList);

      msgApi.success(`Attachment Uploaded`);
      onSuccess(null, file);
    } catch (error) {
      openErrorNotification(notiApi, `File upload failed: ${error.message}`);
      onError(error);
    }
  };

  const handleDelete = async (id) => {
    console.log("id", id);
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
        await deleteFile({ variables: { documentId: id } });

        const updatedFileList = customFileList.filter((item) => item.id !== id);
        setCustomFileList(updatedFileList);

        msgApi.success(`Attachment Removed`);
      } catch (error) {
        openErrorNotification(
          notiApi,
          `Failed to remove attachment: ${error.message}`
        );
      }
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
      {contextHolder}
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
                </Flex>
                {/* {openOptionsIndices.includes(index) && hoveredIndex === index && ( */}
                <div className="attachment-options">
                  <span>
                    {/* <a
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
                    </a> */}
                    <a
                      href={file.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FormattedMessage
                        id="button.download"
                        defaultMessage="Download"
                      />
                    </a>
                  </span>
                  {/* <Divider type="vertical" />
                  <span>
                    <a
                      href={file.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExportOutlined />
                    </a>
                  </span> */}
                </div>
                {/* )} */}
              </div>
              {hoveredIndex === index &&
                (deleteLoading ? (
                  <LoadingOutlined />
                ) : (
                  <span
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file?.id);
                    }}
                  >
                    <DeleteOutlined />
                  </span>
                ))}
            </Flex>
          ))
        )}
      </div>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "12px" }}>
        <Upload.Dragger
          customRequest={handleUpload}
          beforeUpload={beforeUpload}
          showUploadList={false}
          disabled={customFileList.length >= 5 ? true : false}
        >
          <Space>
            <span>
              {createLoading ? (
                <LoadingOutlined />
              ) : (
                <UploadOutlined
                  style={{
                    color:
                      customFileList.length >= 5 ? "" : "var(--primary-color)",
                  }}
                />
              )}
            </span>
            <span>Upload File</span>
          </Space>
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
      </div>
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
            ) : getFileExtension(selectedFile?.documentUrl)?.toLowerCase() ===
              "pdf" ? (
              <iframe
                src={selectedFile?.documentUrl}
                title={selectedFile?.name}
              />
            ) : (
              <Flex vertical>
                <span
                  style={{ fontSize: "3rem", color: "var(--primary-color)" }}
                >
                  {getFileIcon(getFileExtension(selectedFile?.documentUrl))}
                </span>
                <a
                  href={selectedFile?.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FormattedMessage
                    id="button.download"
                    defaultMessage="Download"
                  />
                </a>
              </Flex>
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
            <Button
              icon={
                <span>
                  <PaperClipOutlined
                    style={{ color: "var(--primary-color)", fontSize: "16px" }}
                  />
                  {customFileList?.length > 0 && customFileList?.length}
                </span>
              }
            ></Button>
          ) : (
            <Button
              type="text"
              icon={
                <PaperClipOutlined style={{ color: "var(--primary-color)" }} />
              }
            >
              <span>
                {customFileList.length > 0
                  ? `${customFileList.length} File${
                      customFileList.length > 1 ? "s" : ""
                    }`
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
