const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  toggleActionItem,
  addActionItem,
  deleteActionItem
} = require('../controllers/noticeController');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');

// Configure Multer for memory upload of PDF/Image
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('pdf') || file.mimetype.includes('image') || file.mimetype.includes('text')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, PNG or text files are allowed!'), false);
    }
  }
});

router.post('/', optionalAuth, upload.single('file'), createNotice);
router.get('/', optionalAuth, getAllNotices);
router.get('/:id', optionalAuth, getNoticeById);
router.put('/:id', optionalAuth, updateNotice);
router.delete('/:id', optionalAuth, deleteNotice);

// Action item checklist endpoints (FR5)
router.patch('/:id/actions/:actionId', optionalAuth, toggleActionItem);
router.post('/:id/actions', optionalAuth, addActionItem);
router.delete('/:id/actions/:actionId', optionalAuth, deleteActionItem);

module.exports = router;
