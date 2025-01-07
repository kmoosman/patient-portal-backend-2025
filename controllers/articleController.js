import {
  getAllArticlesService,
  getAllArticlesByOrganizationIdService,
  createInternalArticleService,
  updateArticleOrderService,
  getArticleByIdService,
  insertAuthorService,
  deleteAuthorService,
  updateAuthorsService,
  updateArticleService,
  getTrialsService,
} from "../services/articleService.js";

// Get trials
export const getTrials = (req, res) => {
  const id = req.params.id;
  getTrialsService(id)
    .then((trials) => {
      if (trials) {
        res.json(trials);
      } else {
        res.status(404).json({ error: "trials not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch trials" });
    });
};

// Get all articles
export const getAllArticlesController = (req, res) => {
  const id = req.params.id;
  getAllArticlesService(id)
    .then((articles) => {
      if (articles) {
        res.json(articles);
      } else {
        res.status(404).json({ error: "Articles not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch articles" });
    });
};

// Get article by id
export const getArticleById = (req, res) => {
  const id = req.params.id;
  getArticleByIdService(id)
    .then((article) => {
      if (article) {
        res.json(article);
      } else {
        res.status(404).json({ error: "Article not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch article" });
    });
};

// Get articles by organization id
export const getAllArticlesByOrganizationIdController = (req, res) => {
  const id = req.params.id;
  getAllArticlesByOrganizationIdService(id)
    .then((articles) => {
      if (articles) {
        res.json(articles);
      } else {
        res.status(404).json({ error: "Articles not found." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch articles." });
    });
};

// Create a new internal article
export const createInteralArticle = (req, res) => {
  if (res.isAuthenticated) {
    createInternalArticleService(req.body)
      .then((article) => {
        res.json(article);
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to create article" });
      });
  } else {
    res.status(403).json({
      error: "User is not an admin - could not create the article",
    });
  }
};

// Create a new author
export const createAuthor = (req, res) => {
  if (res.isAuthenticated) {
    const authors = req.body.data;
    const id = req.params.id;
    insertAuthorService({ authors, id })
      .then((author) => {
        res.json(author);
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to create author" });
      });
  } else {
    res.status(403).json({
      error: "User is not an admin - could not create the author",
    });
  }
};

// Remove an new author
export const deleteAuthor = (req, res) => {
  if (res.isAuthenticated) {
    const authors = req.body.data;
    const id = req.params.id;
    deleteAuthorService({ authors, id })
      .then((author) => {
        res.json(author);
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to delete author" });
      });
  } else {
    res.status(403).json({
      error: "User is not an admin - could not delete the author",
    });
  }
};

// Update an  authors
export const updateAuthors = (req, res) => {
  if (res.isAuthenticated) {
    const authors = req.body.data;
    const id = req.params.id;
    updateAuthorsService({ authors, id })
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to update authors" });
      });
  } else {
    res.status(403).json({
      error: "User is not an admin - could not update the authors",
    });
  }
};

// Update internal article
export const updateArticleOrder = (req, res) => {
  if (res.isAuthenticated) {
    if (req.body.data.updateOrder === true) {
      updateArticleOrderService(req.body)
        .then((article) => {
          res.json(article);
        })
        .catch((err) => {
          res.status(500).json({ error: "Failed to create article" });
        });
    } else {
      updateArticleService(req.body)
        .then((article) => {
          res.json(article);
        })
        .catch((err) => {
          res.status(500).json({ error: "Failed to create article" });
        });
    }
  } else {
    res.status(403).json({
      error: "User is not an admin - could not create the article",
    });
  }
};
