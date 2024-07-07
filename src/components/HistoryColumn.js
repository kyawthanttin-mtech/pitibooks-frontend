import React, { useEffect, useMemo } from "react";
import { Button, Flex, Skeleton, Timeline } from "antd";
import { CloseOutlined, HistoryOutlined } from "@ant-design/icons";
import { HistoryQueries } from "../graphql";
import { openErrorNotification } from "../utils/Notification";
import { useOutletContext } from "react-router-dom";
import DOMPurify from "dompurify";
import { useQuery } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../config/Constants";
import dayjs from "dayjs";
import "./CommentColumns.css";
import { ReactComponent as FileHistoryOutlined } from "../assets/icons/FileHistoryOutlined.svg";

const { GET_HISTORIES } = HistoryQueries;

const HistoryColumn = ({ name, open, setOpen, referenceId, referenceType }) => {
  const { notiApi } = useOutletContext();

  // Queries
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
      hisRefetch();
    }
  }, [open, hisRefetch]);

  const histories = useMemo(() => hisData?.listHistory || [], [hisData]);

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const isInputEmpty = (input) => stripHtml(input).trim().length === 0;

  return (
    <div className={`cmt-column ${open ? "open" : ""}`}>
      <div className="cmt-column-header">
        <div className="title">{name ? `${name} History` : "History"}</div>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() => setOpen(false)}
        />
      </div>
      <div className="cmt-column-body">
        {hisLoading ? (
          <Skeleton active />
        ) : histories.length > 0 ? (
          <div style={{ marginLeft: "0.5rem" }}>
            <Timeline>
              {histories.map((item) => (
                <Timeline.Item
                  key={item.id}
                  dot={
                    <Flex
                      align="center"
                      justify="center"
                      className="circle-box"
                    >
                      <span style={{ textAlign: "center", paddingTop: 2 }}>
                        <FileHistoryOutlined
                          style={{
                            color: "var(--yellow)",
                            width: "14px",
                            height: "14px",
                          }}
                        />
                      </span>
                    </Flex>
                  }
                >
                  <Flex align="center" gap="0.25rem" className="cmt-username">
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
                  <div className="cmt-box" style={{ gap: "1rem" }}>
                    <div
                      className="cmt-description"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(item.description),
                      }}
                    ></div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ) : (
          <Flex justify="center" align="center">
            No history yet!
          </Flex>
        )}
      </div>
    </div>
  );
};

export default HistoryColumn;
