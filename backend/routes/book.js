const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();


const bookCtrl = require ('../controllers/book');


router.get('/',  bookCtrl.getAllBook);
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id',  bookCtrl.getOneBook);

router.put('/:id', auth, multer, bookCtrl.modifyBook );
router.delete('/:id', auth, bookCtrl.deleteBook );


router.post('/', auth, multer, bookCtrl.createBook); 
router.post('/:id/rating', auth, multer, bookCtrl.addRating);








module.exports = router;