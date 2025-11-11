export const Routes = {
  // ==========================================================
  // 🔹 MAIN PAGES
  // ==========================================================
  Presentation: { path: "/" },
  DashboardLeader: { path: "/leader/dashboard" },
  DashboardMember: { path: "/member/dashboard" },
  DashboardOverview: { path: "/dashboard/overview" },

  // ==========================================================
  // 🔹 AUTHENTICATION PAGES
  // ==========================================================
  Signin: { path: "/examples/sign-in" },
  Signup: { path: "/examples/sign-up" },
  ForgotPassword: { path: "/examples/forgot-password" },
  ResetPassword: { path: "/examples/reset-password" },
  Lock: { path: "/examples/lock" },
  NotFound: { path: "/examples/404" },
  ServerError: { path: "/examples/500" },

  // ==========================================================
  // 🔹 PROJECT MANAGEMENT (LEADER)
  // ==========================================================
  ProjectCreateLeader: { path: "/leader/projects/create" },
  ProjectListLeader: { path: "/leader/projects/list" },
  ProjectMembersLeader: { path: "/leader/projects/members" },

  // ==========================================================
  // 🔹 PROJECT MANAGEMENT (MEMBER)
  // ==========================================================
  ProjectListMember: { path: "/member/projects/list" },

  // ==========================================================
  // 🔹 STUDENT MANAGEMENT (LEADER VIEW ONLY)
  // ==========================================================
  StudentManageLeader: { path: "/leader/students/manage/:projectId" },
  StudentViewLeader: { path: "/leader/students/view/:projectId/:id" },

  // ==========================================================
  // 🔹 STUDENT MANAGEMENT (MEMBER FULL ACCESS)
  // ==========================================================
  StudentManageMember: { path: "/member/students/manage/:projectId" },
  StudentAddMember: { path: "/member/students/add/:projectId" },
  StudentListMember: { path: "/member/students/list/:projectId" },
  StudentEditMember: { path: "/member/students/edit/:projectId/:id" },
  StudentViewMember: { path: "/member/students/view/:projectId/:id" },

  // ==========================================================
  // 🔹 ATTENDANCE MANAGEMENT (LEADER VIEW ONLY)
  // ==========================================================
  AttendanceHistoryLeader: { path: "/leader/attendance/history/:projectId" },
  AttendanceSummaryLeader: { path: "/leader/attendance/summary/:projectId" },

  // ==========================================================
  // 🔹 ATTENDANCE MANAGEMENT (MEMBER FULL ACCESS)
  // ==========================================================
  AttendanceManageMember: { path: "/member/attendance/manage/:projectId" },
  AttendanceHistoryMember: { path: "/member/attendance/history/:projectId" },
  AttendanceSummaryMember: { path: "/member/attendance/summary/:projectId" },

// ==========================================================
// 🔹 REQUISITION MANAGEMENT (LEADER & MEMBER)
// ==========================================================
RequisitionSummary: { path: "/leader/requisitions/summary" },
RequisitionViewLeader: { path: "/leader/requisitions/view/:projectId/:id" },
RequisitionListMember: { path: "/member/requisitions/list/:projectId" },
RequisitionCreateMember: { path: "/member/requisitions/create/:projectId" },
RequisitionViewMember: { path: "/member/requisitions/view/:projectId/:id" },

  // ==========================================================
  // 🔹 OTHER SYSTEM PAGES
  // ==========================================================
  Transactions: { path: "/transactions" },
  Settings: { path: "/settings" },
  Upgrade: { path: "/upgrade" },
  BootstrapTables: { path: "/tables/bootstrap-tables" },
  Billing: { path: "/examples/billing" },
  Invoice: { path: "/examples/invoice" },

  // ==========================================================
  // 🔹 DOCUMENTATION
  // ==========================================================
  DocsOverview: { path: "/documentation/overview" },
  DocsDownload: { path: "/documentation/download" },
  DocsQuickStart: { path: "/documentation/quick-start" },
  DocsLicense: { path: "/documentation/license" },
  DocsFolderStructure: { path: "/documentation/folder-structure" },
  DocsBuild: { path: "/documentation/build-tools" },
  DocsChangelog: { path: "/documentation/changelog" },

  // ==========================================================
  // 🔹 COMPONENTS SHOWCASE
  // ==========================================================
  Accordions: { path: "/components/accordions" },
  Alerts: { path: "/components/alerts" },
  Badges: { path: "/components/badges" },
  Widgets: { path: "/widgets" },
  Breadcrumbs: { path: "/components/breadcrumbs" },
  Buttons: { path: "/components/buttons" },
  Forms: { path: "/components/forms" },
  Modals: { path: "/components/modals" },
  Navs: { path: "/components/navs" },
  Navbars: { path: "/components/navbars" },
  Pagination: { path: "/components/pagination" },
  Popovers: { path: "/components/popovers" },
  Progress: { path: "/components/progress" },
  Tables: { path: "/components/tables" },
  Tabs: { path: "/components/tabs" },
  Tooltips: { path: "/components/tooltips" },
  Toasts: { path: "/components/toasts" },
  WidgetsComponent: { path: "/components/widgets" },
};
