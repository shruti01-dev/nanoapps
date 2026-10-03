import express from 'express';
import { adminOnly } from '../middleware/adminMiddleware';
import { optionalProtect, protect } from '../middleware/authMiddleware';
import {
  createProduct,
  deleteProduct,
  getDownloadUrl,
  getMyProducts,
  getProduct,
  grantAccess,
  handleUpload,
  listProducts,
  updateProduct,
  uploadProductFile,
} from '../controllers/productController';

const router = express.Router();

router.get('/', optionalProtect, listProducts);
router.get('/me', protect, getMyProducts);
router.get('/slug/:slug', optionalProtect, getProduct);
router.get('/:productId/download/:platform', protect, getDownloadUrl);

router.post('/', protect, adminOnly, createProduct);
router.patch('/:productId', protect, adminOnly, updateProduct);
router.delete('/:productId', protect, adminOnly, deleteProduct);
router.post('/:productId/files', protect, adminOnly, handleUpload, uploadProductFile);
router.post('/grant-access', protect, adminOnly, grantAccess);

export default router;
