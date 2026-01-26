/* file: backend/routes/instructorRoutes.js */
const router = require('express').Router();
const { 
  getInstructorCourses, 
  getCourseApplications, 
  approveByInstructor, 
  bulkApproveByInstructor, // ✅ IMPORTED
  awardGrade, 
  floatCourse, 
  getInstructorFeedback,
  getEnrolledStudentsForCourse,
  validateGradesCSV,
  submitMassGrades,
  sendCourseEmail // ✅ IMPORTED
} = require('../controllers/instructorController');

// 1. Get Courses & Applications
router.get('/courses', getInstructorCourses);
router.get('/applications', getCourseApplications);

// 2. Manage Students (Approve/Reject)
router.post('/approve-student', approveByInstructor);
router.post('/bulk-approve-student', bulkApproveByInstructor); // ✅ NEW ROUTE

// 3. Float New Course
router.post('/float-course', floatCourse); 

// 4. Grading
router.post('/award-grade', awardGrade);
router.post('/validate-grades', validateGradesCSV);
router.post('/submit-mass-grades', submitMassGrades);

// 5. Feedback & Utils
router.get('/feedback', getInstructorFeedback);
router.get('/course-students/:course_id', getEnrolledStudentsForCourse);

// 6. Email Communication
router.post('/send-course-email', sendCourseEmail);

module.exports = router;