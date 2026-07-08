export interface TourStep {
  id: string
  path: string
  target: string
  title: string
  description: string
}

export const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    path: '/admin/dashboard',
    target: 'dash-stats',
    title: 'Your dashboard',
    description: 'Track total jobs, active work, completed jobs, and team activity at a glance. This updates in real time as your team works.',
  },
  {
    id: 'create-job',
    path: '/admin/jobs',
    target: 'create-job-btn',
    title: 'Create a job order',
    description: 'Start here: add the customer, location, schedule, and priority for a new job, then assign it to one or more technicians.',
  },
  {
    id: 'nav-jobs',
    path: '/admin/jobs',
    target: 'nav-jobs',
    title: 'Track job status',
    description: 'Every job order lives here. Jobs move through Pending → In Progress → Completed, and you can search or filter anytime by status, technician, or date.',
  },
  {
    id: 'invite-team',
    path: '/admin/users',
    target: 'invite-btn',
    title: 'Build your team',
    description: 'Invite technicians by email to join your organization. Once they accept, you can assign them to job orders.',
  },
  {
    id: 'alerts',
    path: '/admin/alerts',
    target: 'create-alert-btn',
    title: 'Send alerts',
    description: 'Broadcast a message to a specific technician or your whole team, handy for urgent updates or reminders.',
  },
  {
    id: 'job-sheets',
    path: '/admin/job-sheets',
    target: 'nav-sheets',
    title: 'Review job sheets',
    description: 'Every submitted job sheet, including work performed, time spent, and photos, shows up here for you to review.',
  },
  {
    id: 'profile',
    path: '/admin/dashboard',
    target: 'account-link',
    title: 'Your account',
    description: "Click your name to manage your account, where profile, security, and organization settings all live. That's the whole tour, and you're ready to go!",
  },
]

export const TECHNICIAN_TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    path: '/technician/dashboard',
    target: 'dash-stats',
    title: 'Your dashboard',
    description: 'See your active jobs, completed work, submitted sheets, and unread alerts at a glance.',
  },
  {
    id: 'my-jobs',
    path: '/technician/jobs',
    target: 'nav-jobs',
    title: 'Your jobs',
    description: "Jobs assigned to you appear here. Tap one to view details, update its status (Pending → In Progress → Completed), and submit a job sheet once you're done.",
  },
  {
    id: 'job-sheets',
    path: '/technician/job-sheets',
    target: 'nav-sheets',
    title: 'Job sheets history',
    description: 'Review everything you\'ve submitted here, including anything still syncing from offline work.',
  },
  {
    id: 'alerts',
    path: '/technician/alerts',
    target: 'nav-alerts',
    title: 'Alerts',
    description: 'Messages from your admin show up here, and unread ones are marked so you never miss an update.',
  },
  {
    id: 'profile',
    path: '/technician/dashboard',
    target: 'account-link',
    title: 'Your account',
    description: "Tap your name to manage your account, where profile and security settings live. That's the whole tour, and you're ready to go!",
  },
]
