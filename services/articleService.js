import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { type } from "os";

export const getTrialsService = async () => {
  try {
    const queryUrl = buildClinicalTrialsQuery(params);

    const response = await fetch(queryUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const parsedTrials = parseClinicalTrialsData(data);
    return parsedTrials;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch trials");
  }
};

export const getAllArticlesService = async () => {
  try {
    const query = `SELECT * FROM articles`;
    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    const articles = results;
    if (articles) {
      return deepCamelcaseKeys(articles);
    }
  } catch (error) {
    throw new Error("Failed to fetch articles");
  }
};

export const getArticleByIdService = async (id) => {
  try {
    const query = `SELECT
    articles.*,
    json_agg(json_build_object('id', authors.id, 'first_name', authors.first_name, 'last_name', authors.last_name, 'designation', authors.designation, 'institution', authors.institution, 'list_order', article_authors.list_order)) AS article_authors
  FROM
    articles
  LEFT JOIN article_authors ON articles.id = article_authors.article_id
  LEFT JOIN authors ON article_authors.author_id = authors.id
  WHERE
    articles.id = :id
  GROUP BY
    articles.id;`;
    const results = await sequelize.query(query, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT,
    });
    const articles = results[0];
    if (articles) {
      return deepCamelcaseKeys(articles);
    }
  } catch (error) {
    throw new Error("Failed to fetch article");
  }
};

export const getAllArticlesByOrganizationIdService = async (id) => {
  try {
    const query = `SELECT
      articles.*,
      json_agg(json_build_object('id', authors.id, 'first_name', authors.first_name, 'last_name', authors.last_name, 'designation', authors.designation, 'institution', authors.institution, 'list_order', article_authors.list_order)) AS article_authors
    FROM
      articles
    LEFT JOIN article_authors ON articles.id = article_authors.article_id
    LEFT JOIN authors ON article_authors.author_id = authors.id
    WHERE
      articles.organization_id = :id
    GROUP BY
      articles.id;`;
    const results = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    const articles = results;
    if (articles) {
      return deepCamelcaseKeys(articles);
    }
  } catch (error) {
    throw new Error("Failed to fetch articles");
  }
};

export const createInternalArticleService = async ({ data }) => {
  const {
    title,
    headline,
    description,
    datePublished,
    highlighted,
    management,
    organizationId,
    link,
    authors,
  } = data;

  try {
    // insert one new article into internal articles
    const insertArticleQuery = `
      INSERT INTO articles (title, headline, description, date_published, link, highlighted, management, organization_id) 
      VALUES (:title, :headline, :description, :date_published, :link, :highlighted, :management, :organization_id)
      RETURNING id
    `;
    const result = await sequelize.query(insertArticleQuery, {
      replacements: {
        title,
        headline,
        description,
        date_published: datePublished,
        link,
        highlighted,
        management,
        organization_id: organizationId,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    const articleId = result[0][0].id; // This gets the returned id of the article

    for (const author of data.authors) {
      const insertAuthorQuery = `
    INSERT INTO authors (first_name, last_name, designation, institution) 
    VALUES (:first_name, :last_name, :designation, :institution)
    RETURNING id
    `;
      const authorsResult = await sequelize.query(insertAuthorQuery, {
        replacements: {
          first_name: author.firstName,
          last_name: author.lastName,
          designation: author.designation,
          institution: author.institution,
        },
        type: sequelize.QueryTypes.INSERT,
      });

      const author_id = authorsResult[0][0].id; // Getting the returned author id
      // Insert into article_authors table
      const insertArticleAuthorsQuery = `
      INSERT INTO article_authors (article_id, author_id)
      VALUES (:article_id, :author_id)
      `;
      await sequelize.query(insertArticleAuthorsQuery, {
        replacements: {
          article_id: articleId,
          author_id: author_id,
        },
        type: sequelize.QueryTypes.INSERT,
      });
    }

    return { success: true };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create article and authors");
  }
};

export const updateArticleOrderService = async ({ data }) => {
  //update order of article
  if (data.type === "management") {
    try {
      // insert one new article into internal articles
      const updateOrderQuery = `
        UPDATE articles SET management_order = :order WHERE id = :id
      `;
      const result = await sequelize.query(updateOrderQuery, {
        replacements: {
          id: data.pastArticle.id,
          order: null,
        },
        type: sequelize.QueryTypes.INSERT,
      });

      const result2 = await sequelize.query(updateOrderQuery, {
        replacements: {
          id: data.currentArticle.id,
          order: data.order,
        },
        type: sequelize.QueryTypes.UPDATE,
      });

      return { result, result2 };
    } catch (error) {
      console.log(error);
      throw new Error("Failed to update order");
    }
  } else if (data.type === "highlight") {
    try {
      // update order of articles
      const updateOrderQuery = `
        UPDATE articles SET highlight_order = :order WHERE id = :id
      `;
      const result = await sequelize.query(updateOrderQuery, {
        replacements: {
          id: data.pastArticle.id,
          order: null,
        },
        type: sequelize.QueryTypes.INSERT,
      });

      const result2 = await sequelize.query(updateOrderQuery, {
        replacements: {
          id: data.currentArticle.id,
          order: data.order,
        },
        type: sequelize.QueryTypes.UPDATE,
      });

      return { result, result2 };
    } catch (error) {
      console.log(error);
      throw new Error("Failed to update order");
    }
  } else {
    throw new Error("Failed to update order");
  }
};

export const updateArticleService = async ({ data }) => {
  try {
    const updateArticleQuery = `
      UPDATE articles
      SET
        title = :title,
        headline = :headline,
        description = :description,
        date_published = :date_published,
        link = :link,
        highlighted = :highlighted,
        management = :management,
        organization_id = :organization_id
      WHERE id = :id;
    `;

    const result = await sequelize.query(updateArticleQuery, {
      replacements: {
        id: data.currentArticle.id,
        title: data.currentArticle.title,
        headline: data.currentArticle.headline,
        description: data.currentArticle.description,
        date_published: data.currentArticle.datePublished,
        link: data.currentArticle.link,
        highlighted: data.currentArticle.highlighted,
        management: data.currentArticle.management,
        organization_id: data.currentArticle.organizationId,
      },
      type: sequelize.QueryTypes.UPDATE,
    });

    return { result };
  } catch (error) {
    throw new Error("Failed to update article");
  }
};

export const insertAuthorService = async ({ authors, id }) => {
  try {
    for (const author of authors) {
      const insertAuthorQuery = `
    INSERT INTO authors (first_name, last_name, designation, institution)
    VALUES (:first_name, :last_name, :designation, :institution)
    RETURNING id
    `;
      const authorsResult = await sequelize.query(insertAuthorQuery, {
        replacements: {
          first_name: author.firstName,
          last_name: author.lastName,
          designation: author.designation,
          institution: author.institution,
        },
        type: sequelize.QueryTypes.INSERT,
      });

      const author_id = authorsResult[0][0].id; // Getting the returned author id
      // Insert into article_authors table
      const insertArticleAuthorsQuery = `
      INSERT INTO article_authors (article_id, author_id, list_order)
      VALUES (:article_id, :author_id, :list_order)
      `;
      await sequelize.query(insertArticleAuthorsQuery, {
        replacements: {
          article_id: id,
          author_id: author_id,
          list_order: author.listOrder,
        },
        type: sequelize.QueryTypes.INSERT,
      });
    }

    return { success: true };
  } catch (error) {
    throw new Error("Failed to create article and authors");
  }
};

export const deleteAuthorService = async ({ authors, id }) => {
  try {
    for (const author of authors) {
      // Delete from article_authors table
      const deleteArticleAuthorsQuery = `
      DELETE FROM article_authors
      WHERE article_id = :article_id AND author_id = :author_id
      `;
      await sequelize.query(deleteArticleAuthorsQuery, {
        replacements: {
          article_id: id,
          author_id: author.id,
        },
        type: sequelize.QueryTypes.DELETE,
      });
      // Delete from authors table -- COMMENTED OUT SO THAT AUTHORS CAN BE REUSED
      // const deleteAuthorQuery = `
      // DELETE FROM authors
      // WHERE id = :author_id AND NOT EXISTS (
      //   SELECT 1 FROM article_authors WHERE author_id = :author_id
      // )
      // `;
      // await sequelize.query(deleteAuthorQuery, {
      //   replacements: {
      //     author_id: author.id,
      //   },
      //   type: sequelize.QueryTypes.DELETE,
      // });
    }

    return { success: true };
  } catch (error) {
    throw new Error("Failed to remove author from article");
  }
};

export const updateAuthorsService = async ({ authors, id }) => {
  try {
    for (const author of authors) {
      // Update authors table
      const updateAuthorQuery = `
      UPDATE authors SET
        first_name = :first_name,
        last_name = :last_name,
        designation = :designation,
        institution = :institution
      WHERE id = :author_id
      `;
      await sequelize.query(updateAuthorQuery, {
        replacements: {
          first_name: author.firstName,
          last_name: author.lastName,
          designation: author.designation,
          institution: author.institution,
          author_id: author.id,
        },
        type: sequelize.QueryTypes.UPDATE,
      });

      // If needed, update the article_authors table as well. For example, if list_order is being updated:
      const listOrder = Number(author.listOrder);

      const updateArticleAuthorsQuery = `
      UPDATE article_authors SET
        list_order = :list_order
      WHERE article_id = :article_id AND author_id = :author_id
      `;
      await sequelize.query(updateArticleAuthorsQuery, {
        replacements: {
          list_order: listOrder,
          article_id: id,
          author_id: author.id,
        },
        type: sequelize.QueryTypes.UPDATE,
      });
    }

    return { success: true };
  } catch (error) {
    throw new Error("Failed to update author for article");
  }
};

function buildClinicalTrialsQuery(params) {
  const baseUrl = "https://clinicaltrials.gov/api/int/studies";
  let query = `${baseUrl}?`;

  const queryParams = {
    cond: params.condition || "Non Clear Cell Renal Carcinoma",
    agg: {
      synonyms: params.synonyms || "true",
      aggFilters: params.statusFilter || "status:rec",
    },
    checkSpell: params.checkSpell || "true",
    from: params.from || "0",
    limit: params.limit || "99",
    fields:
      params.fields ||
      [
        "OverallStatus",
        "HasResults",
        "BriefTitle",
        "Condition",
        "InterventionType",
        "InterventionName",
        "LocationFacility",
        "LocationCity",
        "LocationState",
        "LocationCountry",
        "LocationStatus",
        "LocationZip",
        "LocationGeoPoint",
        "LocationContactName",
        "LocationContactRole",
        "LocationContactPhone",
        "LocationContactPhoneExt",
        "LocationContactEMail",
        "CentralContactName",
        "CentralContactRole",
        "CentralContactPhone",
        "CentralContactPhoneExt",
        "CentralContactEMail",
        "Gender",
        "MinimumAge",
        "MaximumAge",
        "StdAge",
        "NCTId",
        "StudyType",
        "LeadSponsorName",
        "Acronym",
        "EnrollmentCount",
        "StartDate",
        "PrimaryCompletionDate",
        "CompletionDate",
        "StudyFirstPostDate",
        "ResultsFirstPostDate",
        "LastUpdatePostDate",
        "OrgStudyId",
        "SecondaryId",
        "Phase",
        "LargeDocLabel",
        "LargeDocFilename",
        "PrimaryOutcomeMeasure",
        "SecondaryOutcomeMeasure",
        "DesignAllocation",
        "DesignInterventionModel",
        "DesignMasking",
        "DesignWhoMasked",
        "DesignPrimaryPurpose",
        "DesignObservationalModel",
        "DesignTimePerspective",
        "LeadSponsorClass",
        "CollaboratorClass",
      ].join(","),
    columns: params.columns || "conditions,interventions,collaborators",
    highlight: params.highlight || "true",
  };

  for (const key in queryParams) {
    if (key === "agg") {
      // Handle agg parameter separately
      query += `&firstPost=2022-01-01_&agg.synonyms=false&`;
    } else if (typeof queryParams[key] !== "object") {
      query += `${key}=${encodeURIComponent(queryParams[key])}&`;
    }
  }

  return query.slice(0, -1); // Remove the last '&'
}

const params = {
  condition: "Non Clear Cell Renal Carcinoma",
  statusFilter: "status:rec",
  limit: "99",
};

function parseClinicalTrialsData(data) {
  const parsedData = data.hits.map((hit) => {
    const study = hit.study.protocolSection;

    let locationCity = "";
    let locationState = "";
    let locationCountry = "";
    if (
      study.contactsLocationsModule &&
      study.contactsLocationsModule.locations &&
      study.contactsLocationsModule.locations.length > 0
    ) {
      const location = study.contactsLocationsModule.locations[0];
      locationCity = location.city || "";
      locationState = location.state || "";
      locationCountry = location.country || "";
    }
    const link = `https://clinicaltrials.gov/study/${study.identificationModule.nctId}`;
    const locationParts = [locationCity, locationState, locationCountry].filter(
      Boolean
    );
    const locationString = locationParts.join(", ");

    return {
      id: study.identificationModule.nctId,
      briefTitle: stripHtmlAndJoin(study.identificationModule.briefTitle),
      sponsors: study.sponsorCollaboratorsModule.leadSponsor.name,
      dateAdded: study.statusModule.studyFirstPostDateStruct.date,
      status: formatStatus(study.statusModule.overallStatus),
      startDate: study.statusModule.startDateStruct
        ? study.statusModule.startDateStruct.date
        : "N/A",
      phase: study.designModule.phases
        ? formatPhase(study.designModule.phases.join(", "))
        : "N/A",
      location: locationString,
      conditions: stripHtmlAndJoin(
        study.conditionsModule.conditions.join(", ")
      ),
      link: link,
    };
  });

  return parsedData.filter((study) => containsWord(study.conditions, "renal"));
}

function stripHtmlAndJoin(text) {
  // Remove HTML tags
  const strippedText = text.replace(/<[^>]*>/g, "");

  // Replace multiple spaces with a single space
  const normalizedText = strippedText.replace(/\s+/g, " ");

  return normalizedText.trim();
}

function formatStatus(text) {
  // Remove HTML tags
  const formattedStatus = text.split("_").join(" ");

  return formattedStatus.toLowerCase().trim();
}

function formatPhase(phaseString) {
  return phaseString
    .split(",")
    .map((phase) => phase.trim().toUpperCase().replace("PHASE", ""))
    .join(", ");
}

function containsWord(str, word) {
  return str.toLowerCase().includes(word.toLowerCase());
}
