const express = require('express');
const router = express.Router();
const { createPage, updatePage, getPages, getPage, deletePage } = require('../controllers/pages');
const isAdmin = require('../middleware/admin'); 
const upload = require('../middleware/pageuploadmiddleware'); 

router.get('/', getPages);
router.get('/:slug', getPage);

router.post('/', isAdmin, upload.array('images'), createPage);
router.put('/:id', isAdmin, upload.array('images'), updatePage);
router.delete('/:id', isAdmin, deletePage);

module.exports = router;