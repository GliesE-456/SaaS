"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeAlertEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const ChangeAlertEmail = ({ workspaceId, urlId, changeEventId, competitorName, pageLabel, impactLevel, diffSummary = 'Changes detected on the page. View diff for details.', dashboardUrl, }) => {
    const diffLink = `${dashboardUrl}/dashboard/changes/${changeEventId}`;
          const footerText = `You received this email because of your Notification Preferences in OutScout.`;
          return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: `Change detected on ${competitorName} - ${pageLabel}` }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsxs)(components_1.Heading, { style: h1, children: ["Change Detected: ", competitorName] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: text, children: ["We detected a change on ", (0, jsx_runtime_1.jsx)("strong", { children: pageLabel }), " for ", competitorName, "."] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: infoBox, children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { style: impactText(impactLevel), children: ["Impact Level: ", impactLevel.toUpperCase()] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: diffText, children: diffSummary })] }), (0, jsx_runtime_1.jsx)(components_1.Section, { style: btnContainer, children: (0, jsx_runtime_1.jsx)(components_1.Button, { style: button, href: diffLink, children: "View Diff" }) }), (0, jsx_runtime_1.jsxs)(components_1.Text, { style: footer, children: ["You received this email because of your Notification Preferences in OutScout.", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)(components_1.Link, { href: `${dashboardUrl}/dashboard/settings/notifications`, style: link, children: "Manage Preferences" })] })] }) })] }));
};
exports.ChangeAlertEmail = ChangeAlertEmail;
exports.default = exports.ChangeAlertEmail;
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};
const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '40px',
    padding: '0 48px',
};
const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 48px',
};
const infoBox = {
    backgroundColor: '#f9f9f9',
    borderLeft: '4px solid #6366f1',
    margin: '20px 48px',
    padding: '16px',
};
const impactText = (level) => ({
    color: level.toLowerCase() === 'high' ? '#ef4444' : level.toLowerCase() === 'medium' ? '#f59e0b' : '#64748b',
    fontWeight: '600',
    margin: '0 0 8px 0',
});
const diffText = {
    color: '#4b5563',
    margin: '0',
    fontSize: '14px',
    lineHeight: '22px',
};
const btnContainer = {
    textAlign: 'center',
    padding: '0 48px',
};
const button = {
    backgroundColor: '#6366f1',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '12px',
};
const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    padding: '0 48px',
    marginTop: '32px',
};
const link = {
    color: '#6366f1',
    textDecoration: 'underline',
};
