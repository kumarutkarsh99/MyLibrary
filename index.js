import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booklist",
    password: "12345678",
    port: 5432,
});
  
db.connect();
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let books = [];

app.set('view engine', 'ejs');
app.set('views', './views');

app.get("/", async(req,res) => {
    const result = await db.query("SELECT * FROM books ORDER BY id DESC");
    books = result.rows;
    try{
        res.render("index.ejs", {
            listTitle: "Your Library",
            listBooks: books,
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/add", (req, res) => {
  res.render("new.ejs");
});

app.post("/add", async(req,res) => {
    const name = req.body.bookname; 
    const author = req.body.authorname;
    const reviews = req.body.reviews;
    const rating = req.body.rating;
    try{
        await db.query(
            "INSERT INTO books (book_name, author_name, reviews, rating) VALUES ($1, $2, $3, $4)",
            [name,author,reviews,rating]
        );
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

app.post("/edit", async(req, res) => {
    const reviews = req.body.updatedReview;
    const rating = req.body.updateRating;
    const name = req.body.updatedBookName;
    try{
      await db.query("UPDATE books SET reviews = ($1), rating = $2, created_at = CURRENT_TIMESTAMP WHERE book_name = ($3) ", 
        [reviews,rating,name]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
});

app.post("/delete", async(req, res) => {
    const id = req.body.deleteBookId;
  
    try{
      await db.query("DELETE FROM books WHERE id = ($1)",
        [id]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
});

app.get("/rating", async(req, res) => {
  try {
      const result = await db.query("SELECT * FROM books ORDER BY rating DESC");
      const books = result.rows;
      res.render("index.ejs", {
          listTitle: "Your Library",
          listBooks: books,
      });
  } catch (err) {
      console.log(err);
  }
});

app.get("/date", async(req, res) => {
  try {
      const result = await db.query("SELECT * FROM books ORDER BY created_at DESC");
      const books = result.rows;
      res.render("index.ejs", {
          listTitle: "Your Library",
          listBooks: books,
      });
  } catch (err) {
      console.log(err);
  }
});
  
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
  