import { sendNotification } from '../socket/socketHandler.js';

// ─── Application aane par recruiter ko notify karo ───
export const notifyNewApplication = (recruiterId, jobTitle, applicantName) => {
  sendNotification(recruiterId, {
    type: 'NEW_APPLICATION',
    message: `${applicantName} applied in the  "${jobTitle}" !`,
    timestamp: new Date(),
  });
};

// ─── Status change hone par applicant ko notify karo ───
export const notifyStatusChange = (applicantId, jobTitle, status) => {
  const messages = {
    reviewed: `your "${jobTitle}" application is under review`,
    shortlisted: `🎉 your "${jobTitle}" application is shortlist !`,
    rejected: `your "${jobTitle}" application  is rejected`,
  };

  sendNotification(applicantId, {
    type: 'STATUS_CHANGED',
    message: messages[status] || `Status update: ${status}`,
    status,
    timestamp: new Date(),
  });
};