const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();


const bookCtrl = require ('../controllers/book');


router.get('/',  bookCtrl.getAllBook);
router.post('/', auth, multer, bookCtrl.createBook); 
router.get('/:id',  bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook );
router.delete('/:id', auth, bookCtrl.deleteBook );
router.post('/books/:id/rating', multer, bookCtrl.postRating);
router.get('/books/bestrating',bookCtrl.getBestRating);



module.exports = router;