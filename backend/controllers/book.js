const Book = require('../models/Book');
const fs = require ('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   //delete bookObject._userId;
   const book = new Book({
       ...bookObject,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
       
   });
 
   book.save()
   .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
   .catch(error => { res.status(400).json( { error })})
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        res.status(200).json(book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };
  
  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Livre modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
  };
  
  exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Not authorized'});
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
  };
  
  exports.getAllStuff = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

 

  exports.postRating = async (req, res) => {
    const id = req.params.id;
    if (id == null || id == "undefined") {
      res.status(400).send("Book id is missing");
      return;
    }
    const rating = req.body.rating;
    const userId = req.Payload.userId;
    try {
      const book = await Book.findById(id);
      if (book == null) {
        res.status(404).send("Book not found");
        return;
      }
      const ratingsInDb = book.ratings;
      const previousRatingFromCurrentUser = ratingsInDb.find((rating) => rating.userId == userId);
      if (previousRatingFromCurrentUser != null) {
        res.status(400).send("You have already rated this book");
        return;
      }
      const newRating = { userId, grade: rating };
      ratingsInDb.push(newRating);
      book.averageRating = calculateAverageRating(ratingsInDb);
      await book.save();
      res.send("Rating posted");
    } catch (e) {
      console.error(e);
      res.status(500).send("Something went wrong:" + e.message);
    }
  }


  function calculateAverageRating(ratings) {
    const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
    return sumOfAllGrades / ratings.length;
  }
  
  exports.getBestRating= async (req, res) => { 
    try {
      const booksWithBestRatings = await Book.find().sort({ rating: -1 }).limit(3);
      booksWithBestRatings.forEach((book) => {
        book.imageUrl = getAbsoluteImagePath(book.imageUrl);
      });
      res.send(booksWithBestRatings);
    } catch (e) {
      console.error(e);
      res.status(500).send("Something went wrong:" + e.message);
    }
  }