import React, { useState } from "react";
import { Button, Col, Dropdown, Flex, Row, Space } from "antd";
import "./HomePage.css";
import { PlusCircleFilled, DownOutlined } from "@ant-design/icons";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const filterCFOptions = [
  {
    key: "1",
    label: "This Fiscal Year",
  },
  {
    key: "2",
    label: "Previous Fiscal Year",
  },
  {
    key: "3",
    label: "Last 12 Months",
  },
];

const filterIEOptions = [
  {
    key: "1",
    label: "This Fiscal Year",
  },
  {
    key: "2",
    label: "Previous Fiscal Year",
  },
  {
    key: "3",
    label: "Last 12 Months",
  },
  {
    key: "4",
    label: "Last 6 Months",
  },
];

const filterEOptions = [
  {
    key: "1",
    label: "This Fiscal Year",
  },
  {
    key: "2",
    label: "This Quarter",
  },
  {
    key: "3",
    label: "This Month",
  },
  {
    key: "4",
    label: "Previous Fiscal Year",
  },
  {
    key: "5",
    label: "Previous Quarter",
  },
  {
    key: "6",
    label: "Previous Month",
  },
  {
    key: "7",
    label: "Last 6 Months",
  },
  {
    key: "8",
    label: "Last 12 Months",
  },
];

const labels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const HomePage = () => {
  const [filterCF, setFilterCF] = useState({
    key: "1",
    label: "This Fiscal Year",
  });
  const [filterIE, setFilterIE] = useState({
    key: "1",
    label: "This Fiscal Year",
  });
  const [filterE, setFilterE] = useState({
    key: "1",
    label: "This Fiscal Year",
  });

  const lineData = {
    labels,
    datasets: [
      {
        label: "Cash Flow",
        data: [
          {
            month: "Jan",
            endingBalance: 655934,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Feb",
            endingBalance: 7484834,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Mar",
            endingBalance: 8478,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Apr",
            endingBalance: 8484831,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "May",
            endingBalance: 93939,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Jun",
            endingBalance: 8879781,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Jul",
            endingBalance: 19789900,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Aug",
            endingBalance: 5789875,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Sep",
            endingBalance: 9384384,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Oct",
            endingBalance: 3943343,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Nov",
            endingBalance: 434333,
            openingBalance: 7484834,
            incoming: 7484834,
            outgoing: 7484834,
          },
          {
            month: "Dec",
            endingBalance: 9304344,
            openingBalance: 0,
            incoming: 7484834,
            outgoing: 0,
          },
        ],
        parsing: {
          xAxisKey: "month",
          yAxisKey: "endingBalance",
        },
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        tension: 0.3,
        pointHoverBorderWidth: 7,
        pointHoverBackgroundColor: "white",
      },
    ],
  };
  
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

  const lineOptions = {
    parsing: false,
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
        backgroundColor: "white",
        borderColor: "#d7d5e2",
        borderWidth: 1,
        titleColor: "#484848",
        bodyColor: "#484848",
        displayColors: false,
        footerColor: "rgba(75,192,192,1)",
        bodySpacing: 5,
        footerSpacing: 5,
        titleAlign: "center",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        footerFont: {
          size: 14,
          weight: 400,
        },
        padding: {
          top: 15,
          right: 15,
          bottom: 15,
          left: 15,
        },
        callbacks: {
          title: (tooltipItems) => `${tooltipItems[0].label}`,
          label: (tooltipItem) => {
            const label1 = `Opening Balance: MMK ${tooltipItem.raw.openingBalance}`;
            const label2 = `Incoming: MMK ${tooltipItem.raw.incoming}`;
            const label3 = `Outgoing: MMK ${tooltipItem.raw.outgoing}`;
            return [label1, label2, label3];
          },
          footer: (tooltipItems) => {
            console.log(tooltipItems);
            const tooltipItem = tooltipItems[0];
            return `Ending Balance: MMK ${tooltipItem.raw.endingBalance}`;
          },
        },
      },
    },
    scales: {
        x: {
            stacked: false,
            grid: {
                display: false,
            },
        },
        y: {
            beginAtZero: true,
            min: 0,
            ticks: {
                stepSize: 5000000,
                callback: function (value) {
                    return value / 1000000 + `${value !== 0 ? "M" : ""}`;
                },
            },
        },
    },
};


  
  

  
  
  const barData = {
    labels: labels,
    datasets: [
      {
        label: "Income",
        data: [
          1200, 1900, 3000, 5000, 2000, 3000, 1000, 2500, 4000, 3200, 4500,
          5500,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        barPercentage: 0.7,
      },
      {
        label: "Expense",
        data: [
          800, 1500, 2000, 3000, 1000, 2000, 1200, 1800, 3000, 2500, 3500, 4000,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        barPercentage: 0.7,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        backgroundColor: "white",
        borderColor: "#d7d5e2",
        borderWidth: 1,
        titleColor: "#484848",
        bodyColor: "#484848",
        footerColor: "#484848",
        bodySpacing: 3,
        footerSpacing: 3,
        titleAlign: "center",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        footerFont: {
          size: 14,
          weight: 400,
        },
        padding: {
          top: 10,
          right: 15,
          bottom: 10,
          left: 15,
        },
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          stepSize: 500,
          callback: (value) => `${value} MMK`,
        },
      },
    },
  };

  const pieData = {
    labels: [
      "Rent",
      "Utilities",
      "Salaries",
      "Transport",
      "Office Supplies",
      "Miscellaneous",
    ],
    datasets: [
      {
        data: [1200, 800, 1500, 600, 700, 400],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        hoverBackgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderWidth: 1,
        hoverOffset: 6,
        hoverBorderWidt: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        backgroundColor: "white",
        borderColor: "#d7d5e2",
        borderWidth: 1,
        titleColor: "#484848",
        bodyColor: "#484848",
        footerColor: "#484848",
        bodySpacing: 3,
        footerSpacing: 3,
        titleAlign: "center",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        footerFont: {
          size: 14,
          weight: 400,
        },
        padding: {
          top: 10,
          right: 15,
          bottom: 10,
          left: 15,
        },
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((acc, value) => acc + value, 0);
            const currentValue = dataset.data[tooltipItem.dataIndex];
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  const handleFilterCFChange = (key) => {
    const selectedFilter = filterCFOptions.find((option) => option.key === key);
    setFilterCF(selectedFilter);
  };

  const handleFilterIEChange = (key) => {
    const selectedFilter = filterIEOptions.find((option) => option.key === key);
    setFilterIE(selectedFilter);
  };

  const handleFilterEChange = (key) => {
    const selectedFilter = filterEOptions.find((option) => option.key === key);
    setFilterE(selectedFilter);
  };

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Home</p>
      </div>
      <div className="page-content page-content-with-padding">
        <div
          className="page-header-text"
          style={{
            cursor: "pointer",
            fontSize: "20px",
            marginTop: "-0.5rem",
            marginBottom: "1.5rem",
            maxWidth: "14rem",
          }}
        >
          Dashboard
        </div>
        <Row className="db-row">
          <Col span={12} style={{ paddingRight: "1rem" }}>
            <div className="db-card">
              <div className="db-card-header">
                <span className="title">Total Receivables</span>
                <Button
                  type="link"
                  icon={<PlusCircleFilled />}
                  style={{ padding: 0 }}
                >
                  New
                </Button>
              </div>
              <div className="db-card-body">
                <div className="db-unpaid">
                  Total Unpaid Invoices MMK 1009090090
                </div>
                <Flex justify="space-between" style={{ paddingTop: "10px" }}>
                  <div className="db-current">
                    <div
                      style={{
                        fontSize: "var(--small-text)",
                        color: "var(--primary-color)",
                      }}
                    >
                      CURRENT
                    </div>
                    <div
                      style={{
                        fontSize: "1.188rem",
                        color: "var(--primary-color)",
                      }}
                    >
                      MMK 09349309
                    </div>
                  </div>
                  <div className="db-overdue">
                    <div
                      style={{
                        fontSize: "var(--small-text)",
                        color: "var(--orange)",
                      }}
                    >
                      OVERDUE
                    </div>
                    <div
                      style={{
                        fontSize: "1.188rem",
                      }}
                    >
                      MMK 09349309
                    </div>
                  </div>
                </Flex>
              </div>
            </div>
          </Col>
          <Col span={12} style={{ paddingLeft: "1rem" }}>
            <div className="db-card">
              <div className="db-card-header">
                <span className="title">Total Payables</span>
                <Button
                  type="link"
                  icon={<PlusCircleFilled />}
                  style={{ padding: 0 }}
                >
                  New
                </Button>
              </div>
              <div className="db-card-body">
                <div className="db-unpaid">
                  Total Unpaid Bills MMK 1009090090
                </div>
                <Flex justify="space-between" style={{ paddingTop: "10px" }}>
                  <div className="db-current">
                    <div
                      style={{
                        fontSize: "var(--small-text)",
                        color: "var(--primary-color)",
                      }}
                    >
                      CURRENT
                    </div>
                    <div style={{ fontSize: "1.188rem" }}>MMK 09349309</div>
                  </div>
                  <div className="db-overdue">
                    <div
                      style={{
                        fontSize: "var(--small-text)",
                        color: "var(--orange)",
                      }}
                    >
                      OVERDUE
                    </div>
                    <div style={{ fontSize: "1.188rem" }}>MMK 09349309</div>
                  </div>
                </Flex>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="db-row">
          <div className="db-card">
            <div className="db-card-header">
              <span className="title">Cash Flow</span>
              <Dropdown
                trigger="click"
                menu={{
                  items: filterCFOptions.map((item) => ({
                    ...item,
                    onClick: ({ key }) => handleFilterCFChange(key),
                  })),
                  selectable: true,
                  selectedKeys: [filterCF.key],
                }}
              >
                <div
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <Space>
                    {filterCF.label}
                    <DownOutlined
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--primary-color)",
                      }}
                    />
                  </Space>
                </div>
              </Dropdown>
            </div>
            <div className="db-card-body" style={{ padding: "5px" }}>
              <Row>
                <Col span={18} className="line-chart-container">
                  <Line data={lineData} options={lineOptions} />
                </Col>
                <Col span={8} className="balance-container text-align-right">
                  <div className="balance-row">
                    <div style={{ opacity: "70%" }}>Cash as on 01 2024 Jan</div>
                    <div className="balance">MMK 393490300 </div>
                  </div>
                  <div className="balance-row">
                    <div style={{ color: "var(--dark-green)" }}>Incoming</div>
                    <div className="balance">MMK 393490300 </div>
                  </div>
                  <div className="balance-row">
                    <div style={{ color: "var(--red)" }}>Outgoing</div>
                    <div className="balance">MMK 393490300 </div>
                  </div>
                  <div className="balance-row">
                    <div style={{ color: "rgba(75,192,192,1)" }}>
                      Cash as on 31 2024 Dec
                    </div>
                    <div className="balance">MMK 393490300 </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Row>
        <Row>
          <Col span={12} style={{ paddingRight: "1rem" }}>
            <div className="db-card">
              <div className="db-card-header">
                <span className="title">Income and Expense</span>
                <span>
                  <Dropdown
                    trigger="click"
                    menu={{
                      items: filterIEOptions.map((item) => ({
                        ...item,
                        onClick: ({ key }) => handleFilterIEChange(key),
                      })),
                      selectable: true,
                      selectedKeys: [filterIE.key],
                    }}
                  >
                    <div
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <Space>
                        {filterIE.label}
                        <DownOutlined
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--primary-color)",
                          }}
                        />
                      </Space>
                    </div>
                  </Dropdown>
                </span>
              </div>
              <div className="db-card-body bar-chart-container">
                <Bar data={barData} options={barOptions} />
              </div>
              <Row className="total-section">
                <Col
                  span={12}
                  style={{
                    padding: "10px",
                    borderRight: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ color: "var(--light-green)" }}>
                    Total Income
                  </div>
                  <div style={{ fontSize: "1.188rem" }}>MMK 939843128</div>
                </Col>
                <Col span={12} style={{ padding: "10px" }}>
                  <div style={{ color: "var(--red)" }}>Total Expense</div>
                  <div style={{ fontSize: "1.188rem" }}>MMK 939843128</div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={12} style={{ paddingLeft: "1rem" }}>
            <div className="db-card">
              <div className="db-card-header">
                <span className="title">Top Expenses</span>
                <span>
                  <Dropdown
                    trigger="click"
                    menu={{
                      items: filterEOptions.map((item) => ({
                        ...item,
                        onClick: ({ key }) => handleFilterEChange(key),
                      })),
                      selectable: true,
                      selectedKeys: [filterE.key],
                    }}
                  >
                    <div
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <Space>
                        {filterE.label}
                        <DownOutlined
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--primary-color)",
                          }}
                        />
                      </Space>
                    </div>
                  </Dropdown>
                </span>
              </div>
              <div className="db-card-body pie-chart-container">
                <Pie data={pieData} options={pieOptions}></Pie>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HomePage;
