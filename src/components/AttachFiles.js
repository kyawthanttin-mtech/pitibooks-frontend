import React, { useState } from "react";
import { PaperClipOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Popover } from "antd";
import "./AttachFiles.css";
import { FormattedMessage } from "react-intl";

const AttachFiles = () => {
  const [open, setOpen] = useState(false);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  const title = (
    <>
      <Flex justify="space-between" align="center" style={{ padding: "12px" }}>
        <FormattedMessage id="label.attachments" defaultMessage="Attachments" />
        {/* <CloseOutlined style={{ color: "red", height: 11, width: 11 }} /> */}
      </Flex>
      <Divider style={{ margin: 0 }} />
    </>
  );

  const content = (
    <>
      <div></div>
      <Divider style={{ margin: 0 }} />
      <div></div>
    </>
  );

  return (
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
        <Button type="text">
          <PaperClipOutlined />
          <span>Attach Files</span>
        </Button>
      </Popover>
    </div>
  );
};

export default AttachFiles;
