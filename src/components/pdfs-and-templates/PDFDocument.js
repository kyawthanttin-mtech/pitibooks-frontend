import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import "./Template.css";
import { IntlProvider } from "react-intl";

const PDFDocument = ({ children, styles }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <IntlProvider>{children}</IntlProvider>
      </Page>
    </Document>
  );
};

export default PDFDocument;
