import { Button, Divider, Flex, Modal, Skeleton, Timeline } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import "./CommentColumns.css";
import { FormattedMessage } from "react-intl";
import "react-quill/dist/quill.snow.css";
import {
  CloseOutlined,
  MessageOutlined,
  DeleteOutlined,
  LoadingOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import { CommentMutations, CommentQueries, HistoryQueries } from "../graphql";
import { openErrorNotification } from "../utils/Notification";
import { useOutletContext } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation, useQuery } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../config/Constants";
import dayjs from "dayjs";
import { ReactComponent as FileHistoryOutlined } from "../assets/icons/FileHistoryOutlined.svg";
const { CREATE_COMMENT, DELETE_COMMENT } = CommentMutations;
const { GET_COMMENTS } = CommentQueries;
const { GET_HISTORIES } = HistoryQueries;

const CommentColumn = ({ open, setOpen, referenceId, referenceType }) => {
  const [value, setValue] = useState("");
  const { notiApi } = useOutletContext();
  const [deleteModal, contextHolder] = Modal.useModal();

  // Queries
  const {
    data: cmtData,
    loading: cmtLoading,
    refetch: cmtRefetch,
  } = useQuery(GET_COMMENTS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: { referenceId, referenceType },
    onError: (err) => openErrorNotification(notiApi, err.message),
    skip: !open,
  });

  const {
    data: hisData,
    loading: hisLoading,
    refetch: hisRefetch,
  } = useQuery(GET_HISTORIES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: { referenceId, referenceType },
    onError: (err) => openErrorNotification(notiApi, err.message),
    skip: !open,
  });

  useEffect(() => {
    if (open) {
      cmtRefetch();
      hisRefetch();
    }
  }, [open, cmtRefetch, hisRefetch]);

  // Mutations
  const [createComment, { loading: createLoading }] = useMutation(
    CREATE_COMMENT,
    {
      refetchQueries: [GET_COMMENTS],
    }
  );

  const [deleteComment, { loading: deleteLoading }] = useMutation(
    DELETE_COMMENT,
    {
      refetchQueries: [GET_COMMENTS],
    }
  );

  const comments = useMemo(() => cmtData?.listComment || [], [cmtData]);
  const histories = useMemo(() => hisData?.listHistory || [], [hisData]);

  const mergedData = useMemo(() => {
    const combined = [...comments, ...histories].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return combined.map((item) => ({
      ...item,
      type: item.__typename === "Comment" ? "comment" : "history",
    }));
  }, [comments, histories]);

  const modules = {
    toolbar: [["bold", "italic", "underline"]],
  };

  const handleSubmit = () => {
    try {
      createComment({
        variables: {
          input: { description: value, referenceId, referenceType },
        },
      });
      setValue("");
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleDelete = async (id) => {
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
        await deleteComment({ variables: { id } });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
    try {
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const stripHtml = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const isInputEmpty = (input) => stripHtml(input).trim().length === 0;

  return (
    <>
      {contextHolder}
      <div className={`cmt-column ${open ? "open" : ""}`}>
        <div className="cmt-column-header">
          <div className="title">
            <FormattedMessage
              id="label.commentsAndHistory"
              defaultMessage="Comments & History"
            />
          </div>
          <Button
            icon={<CloseOutlined />}
            type="text"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="cmt-column-body">
          <ReactQuill
            value={value}
            onChange={setValue}
            modules={modules}
            theme="snow"
            placeholder="Write your comment here..."
          />
          <div style={{ marginTop: "0.5rem" }}>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={isInputEmpty(value)}
              loading={createLoading}
            >
              <FormattedMessage
                id="button.addComment"
                defaultMessage="Add Comment"
              />
            </Button>
          </div>
          <p
            style={{
              marginBlock: "2rem 0",
              fontSize: "var(--small-text)",
              fontWeight: 500,
            }}
          >
            ALL COMMENTS & HISTORY{" "}
            <span className="cmt-count">{mergedData.length}</span>
          </p>
          <Divider style={{ marginBlock: "0.5rem 2rem" }} />

          {cmtLoading || hisLoading ? (
            <Skeleton active />
          ) : mergedData.length > 0 ? (
            <div style={{ marginLeft: "0.5rem" }}>
              <Timeline>
                {mergedData.map((item) => (
                  <Timeline.Item
                    key={item.id}
                    dot={
                      <Flex
                        align="center"
                        justify="center"
                        className="circle-box"
                      >
                        {item.type === "comment" ? (
                          <MessageOutlined />
                        ) : (
                          <FileHistoryOutlined
                            style={{
                              width: "14px",
                              height: "14px",
                            }}
                          />
                        )}
                      </Flex>
                    }
                  >
                    <Flex gap="0.25rem" align="center" className="cmt-username">
                      <div
                        className="text-ellipsis"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.userName),
                        }}
                      ></div>
                      <span style={{ opacity: "70%" }}>
                        <b>•</b>
                      </span>
                      <span
                        style={{
                          fontSize: "0.688rem",
                          opacity: "70%",
                          letterSpacing: ".2px",
                          fontWeight: 500,
                        }}
                      >
                        {dayjs(item.createdAt).format(
                          REPORT_DATE_FORMAT + " h:mm A"
                        )}
                      </span>
                    </Flex>
                    <Flex
                      justify="space-between"
                      className="cmt-box"
                      gap="1rem"
                    >
                      <div
                        className="cmt-description"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.description),
                        }}
                      ></div>
                      {item.type === "comment" && (
                        <span onClick={() => handleDelete(item.id)}>
                          {deleteLoading ? (
                            <LoadingOutlined />
                          ) : (
                            <DeleteOutlined />
                          )}
                        </span>
                      )}
                    </Flex>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          ) : (
            <Flex justify="center" align="center">
              No comment or history yet!
            </Flex>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentColumn;
