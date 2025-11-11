import React from "react";
import { Card, Row, Col, Button, ListGroup, ProgressBar } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faUserPlus,
  faChartBar,
  faChartLine,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Lightweight placeholder donut (SVG) used instead of heavy chart libs.
 * Keeps the bundle small and prevents runtime import failures.
 */
export const CircleChart = ({ size = 120, series = [60, 25, 15], labels = ["A", "B", "C"] }) => {
  const total = series.reduce((a, b) => a + b, 0) || 1;
  let start = 0;
  const radius = (size / 2) - 6;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {series.map((s, i) => {
        const slice = (s / total) * Math.PI * 2;
        const x1 = center + radius * Math.cos(start);
        const y1 = center + radius * Math.sin(start);
        start += slice;
        const x2 = center + radius * Math.cos(start);
        const y2 = center + radius * Math.sin(start);
        const large = slice > Math.PI ? 1 : 0;
        const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
        const fill = ["#0d6efd","#198754","#ffc107","#dc3545","#6f42c1"][i % 5];
        return <path key={i} d={d} fill={fill} stroke="#fff" strokeWidth="0.5" />;
      })}
      <circle cx={center} cy={center} r={radius * 0.5} fill="#fff" />
    </svg>
  );
};

/**
 * Minimal bar chart placeholder (pure CSS)
 */
export const BarChart = ({ labels = ["Mon","Tue","Wed","Thu","Fri"], series = [30,40,45,50,49] }) => {
  const max = Math.max(...series, 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "end", height: 80 }}>
      {series.map((v, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            height: `${(v / max) * 100}%`,
            background: "#0d6efd",
            borderRadius: 4,
            marginBottom: 6,
            transition: "height .25s ease"
          }} />
          <small style={{ display: "block", color: "#6c757d" }}>{labels[i]}</small>
        </div>
      ))}
    </div>
  );
};

/* -----------------------------
   CounterWidget (named export)
   ----------------------------- */
export const CounterWidget = ({ icon, iconColor = "primary", category = "", title = "", percentage = 0 }) => {
  const isNegative = typeof percentage === "number" && percentage < 0;
  const percentText = typeof percentage === "number" ? `${Math.abs(percentage)}%` : percentage ?? "0%";
  const percentIcon = isNegative ? faAngleDown : faAngleUp;
  const percentClass = isNegative ? "text-danger" : "text-success";

  return (
    <Card border="light" className="shadow-sm">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={3} className="text-center">
            <div className={`icon icon-shape icon-md bg-${iconColor} rounded-circle d-inline-flex align-items-center justify-content-center`} style={{ width:48, height:48 }}>
              {icon ? <FontAwesomeIcon icon={icon} /> : <FontAwesomeIcon icon={faCircle} />}
            </div>
          </Col>
          <Col xs={9}>
            <h6 className="mb-0">{category}</h6>
            <h4 className="mb-1">{title}</h4>
            <small className={`${percentClass} fw-bold`}><FontAwesomeIcon icon={percentIcon} className="me-1" />{percentText}</small>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

/* -----------------------------
   BarChartWidget
   ----------------------------- */
export const BarChartWidget = ({ title = "Chart", value = 0, percentage = 0, labels, series }) => {
  return (
    <Card border="light" className="shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ flex: 1 }}>
            <h6 className="fw-normal text-gray mb-2">{title}</h6>
            <h3>{value}</h3>
            <small className={percentage < 0 ? "text-danger" : "text-success"}>
              <FontAwesomeIcon icon={percentage < 0 ? faAngleDown : faAngleUp} className="me-1" />
              {percentage}%
            </small>
          </div>
          <div style={{ width: "45%", minWidth: 150 }}>
            <BarChart labels={labels} series={series} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

/* -----------------------------
   ProgressTrackWidget
   ----------------------------- */
export const ProgressTrackWidget = ({ header = "Progress Track", tasks }) => {
  const defaultTasks = [
    { title: "Project Alpha", percentage: 80, variant: "success" },
    { title: "Project Beta", percentage: 50, variant: "warning" },
    { title: "Project Gamma", percentage: 30, variant: "danger" },
  ];

  const items = tasks && tasks.length ? tasks.map(t => ({ title: t.title, percentage: t.percentage, variant: t.color || t.variant || "info" })) : defaultTasks;

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header>
        <h5 className="mb-0">{header}</h5>
      </Card.Header>
      <Card.Body>
        {items.map((it, idx) => (
          <div key={idx} className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>{it.title}</span>
              <small className="fw-bold">{it.percentage}%</small>
            </div>
            <ProgressBar now={it.percentage} variant={it.variant} min={0} max={100} />
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

/* -----------------------------
   TeamMembersWidget
   ----------------------------- */
export const TeamMembersWidget = ({ members }) => {
  const defaultMembers = [
    { name: "Neil Sims", status: "Online" },
    { name: "Bonnie Green", status: "In a meeting" },
    { name: "Michael Gough", status: "Offline" },
  ];

  const list = members && members.length ? members : defaultMembers;

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Team Members</h5>
        <Button variant="outline-secondary" size="sm">See all</Button>
      </Card.Header>
      <Card.Body>
        <ListGroup className="list-group-flush">
          {list.map((m, i) => (
            <ListGroup.Item key={i} className="px-0">
              <Row className="align-items-center">
                <Col>
                  <strong>{m.name}</strong>
                  <div className="text-muted small">{m.status}</div>
                </Col>
                <Col className="text-end">
                  <Button variant="light" size="sm">
                    <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Connect
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
