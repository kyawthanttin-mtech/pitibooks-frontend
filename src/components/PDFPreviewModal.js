import { PDFViewer } from "@react-pdf/renderer";
import { Modal } from "antd";
import React from "react";

const PDFPreviewModal = ({ modalOpen, setModalOpen, children }) => {
  return (
    <Modal
      title="PDF Preview"
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      centered
      width="80%"
      footer={null}
      wrapClassName="preview-modal"
    >
      <div style={{ height: "calc(100vh - 13rem)" }}>
        <PDFViewer width="100%" height="100%">
          {children}
        </PDFViewer>
      </div>
    </Modal>
  );
};

export default PDFPreviewModal;
