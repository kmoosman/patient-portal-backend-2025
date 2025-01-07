import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllResearchOfInterestByPatientIdService = async ({
  id,
  lastLogin,
  accessLevel }
) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND ri.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `WITH links AS (
      SELECT
          research_interest_id,
          json_agg(
              json_build_object(
                  'research_link_id', id,
                  'title', title,
                  'link', link,
                  'description', description,
                  'notes', notes,
                  'category', category,
                  'status', status,
                  'highlighted', highlighted,
                  'link_type', link_type,
                  'start_date', start_date,
                  'created_at', created_at
              ) ORDER BY start_date
          ) FILTER (WHERE id IS NOT NULL) AS research_links
      FROM
          research_links
      GROUP BY
          research_interest_id
  ),
  notations AS (
      SELECT
          research_interest_id,
          json_agg(
              json_build_object(
                  'id', id,
                  'title', title,
                  'description', description,
                  'notes', notes,
                  'category', category,
                  'status', status,
                  'highlighted', highlighted,
                  'created_at', created_at
              ) ORDER BY created_at
          ) FILTER (WHERE id IS NOT NULL) AS research_notations
      FROM
          research_notations
      GROUP BY
          research_interest_id
  )
SELECT
  ri.*,
  COALESCE(l.research_links, '[]') AS research_links,
  COALESCE(n.research_notations, '[]') AS research_notations
FROM
  research_interests ri
LEFT JOIN
  links l ON ri.id = l.research_interest_id
LEFT JOIN
  notations n ON ri.id = n.research_interest_id
JOIN
  research_interest_users riu ON ri.id = riu.research_interest_id
WHERE
  riu.user_id = :id
  AND ri.access_level_id >= :accessLevel
  ${additionalCondition};
  
`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results;
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch institutions");
  }
};

export const getResearchInterestByIdService = async (id, lastLogin) => {
  try {
    let additionalCondition = "";
    let replacements = { id };

    if (lastLogin) {
      additionalCondition = "AND research_interest.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `WITH links AS (
    SELECT
        research_interest_id,
        json_agg(
            json_build_object(
                'research_link_id', id,
                'title', title,
                'link', link,
                'description', description,
                'notes', notes,
                'category', category,
                'link_type', link_type,
                'status', status,
                'list_order', list_order,
                'highlighted', highlighted,
                'start_date', start_date,
                'created_at', created_at
            ) ORDER BY start_date
        ) FILTER (WHERE id IS NOT NULL) AS research_links
    FROM
        research_links
    GROUP BY
        research_interest_id
),
notations AS (
  SELECT
      rn.research_interest_id,
      json_agg(
          json_build_object(
              'id', rn.id,
              'title', rn.title,
              'description', rn.description,
              'notes', rn.notes,
              'category', rn.category,
              'status', rn.status,
              'highlighted', rn.highlighted,
              'created_at', rn.created_at,
              'threads', COALESCE(threads.threads, '[]')
          ) ORDER BY rn.created_at
      ) FILTER (WHERE rn.id IS NOT NULL) AS research_notations
  FROM
      research_notations rn
  LEFT JOIN (
      SELECT
          rnt.notation_id,
          json_agg(
              json_build_object(
                  'id', rnt.id,
                  'user_id', rnt.user_id,
                  'user_first_name', u.first_name,  -- Fetch first name
                  'user_last_name', u.last_name,    -- Fetch last name
                  'access_level', rnt.access_level,
                  'comment', rnt.comment,
                  'created_at', rnt.created_at
              ) ORDER BY rnt.created_at
          ) FILTER (WHERE rnt.id IS NOT NULL) AS threads
      FROM
          research_notation_threads rnt
      JOIN users u ON rnt.user_id = u.id  -- Join with users table
      GROUP BY
          rnt.notation_id
  ) threads ON rn.id = threads.notation_id
  GROUP BY
      rn.research_interest_id
)
SELECT
    ri.*,
    COALESCE(l.research_links, '[]') AS research_links,
    COALESCE(n.research_notations, '[]') AS research_notations
FROM
    research_interests ri
LEFT JOIN
    links l ON ri.id = l.research_interest_id
LEFT JOIN
    notations n ON ri.id = n.research_interest_id
WHERE
    ri.id = :id
${additionalCondition};

`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results[0];
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch interests");
  }
};

export const createResearchInterestService = async ({
  patientId,
  researchInterest
}
) => {
  try {
    const {
      category,
      status,
      title,
      description,
      notes,
      links,
      comments,
      visibility,
      pubmedKeywords,
    } = researchInterest.data;

    const researchInterestId = uuidv4();


    const query = `INSERT INTO research_interests (id, patient_id, category, status, title, description, notes, access_level_id, pubmed_keywords)
      VALUES (:researchInterestId, :patientId, :category, :status, :title, :description, :notes, :visibility, :pubmedKeywords)`;

    const replacements = {
      researchInterestId,
      patientId,
      category,
      status,
      title,
      description,
      notes,
      visibility,
      pubmedKeywords,
    };

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });

    if (results) {
      const researchInterestUsersQuery = `
          INSERT INTO research_interest_users (research_interest_id, user_id)
          VALUES (:researchInterestId, :patientId)
      `;

      await sequelize.query(researchInterestUsersQuery, {
        replacements: {
          researchInterestId,
          patientId
        },
        type: sequelize.QueryTypes.INSERT,
      });


      if (links.length > 0) {
        const linksValues = links.map((link) => {
          const startDate = new Date(link.startDate);

          return [
            uuidv4(),
            researchInterestId,
            link.title,
            link.description,
            link.link,
            link.category,
            "unreviewed",
            link.highlighted,
            startDate.toISOString().split("T")[0],
            link.notes,
          ];
        });

        const placeholders = links
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .join(",");
        const linksQuery = `INSERT INTO research_links 
          (id, research_interest_id, title, description, link, category, status, highlighted, start_date, notes)
          VALUES ${placeholders}`;

        const flattenedValues = linksValues.flat();

        const linkResults = await sequelize.query(linksQuery, {
          replacements: flattenedValues,
          type: sequelize.QueryTypes.INSERT,
        });
      }

      if (comments.length > 0) {
        const commentsValues = comments.map((comment) => [
          uuidv4(),
          researchInterestId,
          comment.title,
          comment.description,
          comment.category,
          "unreviewed",
          comment.highlighted,
          comment.notes,
        ]);

        const placeholders = comments
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
          .join(",");

        const commentsQuery = `INSERT INTO research_notations
            (id, research_interest_id, title, description, category, status, highlighted, notes)
            VALUES ${placeholders}`;

        const flattenedValues = commentsValues.flat();

        const commentResults = await sequelize.query(commentsQuery, {
          replacements: flattenedValues,
          type: sequelize.QueryTypes.INSERT,
        });
      }
    }

    if (results) {
      return researchInterestId;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create research interest");
  }
};

export const updateResearchInterestService = async (
  patientId,
  researchInterest
) => {

  try {
    const {
      id,
      category,
      status,
      title,
      description,
      notes,
      visibility,
      pubmedKeywords,
    } = researchInterest.data;

    const query = `UPDATE research_interests
    SET 
        category = :category, 
        status = :status, 
        title = :title, 
        description = :description, 
        notes = :notes, 
        access_level_id = :visibility, 
        pubmed_keywords = :pubmedKeywords
    WHERE 
        id = :id AND 
        EXISTS (
            SELECT 1 
            FROM research_interest_users 
            WHERE 
                research_interest_id = :id AND 
                user_id = :patientId
        );`;

    const replacements = {
      id,
      patientId,
      category,
      status,
      title,
      description,
      notes,
      visibility,
      pubmedKeywords,
      patientId,
    };

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });

    if (results) {
      return id;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update research interest");
  }
};

export const createResearchLinkService = async (researchLink) => {
  try {
    const {
      researchInterestId,
      title,
      description,
      link,
      category,
      linkType,
      status,
      highlighted,
      startDate,
      notes,
    } = researchLink.data;

    const query = `INSERT INTO research_links (id, research_interest_id, title, description, link, category, link_type, status, highlighted, start_date, notes)
        VALUES (:id, :researchInterestId, :title, :description, :link, :category, :linkType, :status, :highlighted, :startDate, :notes)`;

    const replacements = {
      id: uuidv4(),
      researchInterestId,
      title,
      description,
      link,
      category,
      linkType,
      status,
      highlighted,
      startDate,
      notes,
    };

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });

    if (results) {
      return results;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create research link");
  }
};

export const updateResearchLinkService = async (researchLink) => {
  try {
    const {
      id,
      researchInterestId,
      title,
      description,
      link,
      category,
      linkType,
      status,
      highlighted,
      startDate,
      notes,
    } = researchLink.data;

    const query = `UPDATE research_links SET title = :title, description = :description, link = :link, category = :category, link_type = :linkType, status = :status, highlighted = :highlighted, start_date = :startDate, notes = :notes WHERE id = :id AND research_interest_id = :researchInterestId`;

    const replacements = {
      id,
      researchInterestId,
      title,
      description,
      link,
      category,
      linkType,
      status,
      highlighted,
      startDate,
      notes,
    };

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });

    if (results) {
      return results;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update research link");
  }
};

export const createResearchCommentService = async (researchComment) => {
  try {
    const {
      researchInterestId,
      title,
      description,
      category,
      highlighted,
      notes,
    } = researchComment.data;

    const query = `INSERT INTO research_notations (id, research_interest_id, title, description, category, highlighted, notes)
        VALUES (:id, :researchInterestId, :title, :description, :category, :highlighted, :notes)`;

    const replacements = {
      id: uuidv4(),
      researchInterestId,
      title,
      description,
      category,
      highlighted,
      notes,
    };

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });

    if (results) {
      return results;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create research comment");
  }
};

export const updateResearchCommentService = async (researchComment) => {
  try {
    const {
      id,
      researchInterestId,
      title,
      description,
      category,
      highlighted,
      notes,
    } = researchComment.data;

    const query = `UPDATE research_notations SET title = :title, description = :description, category = :category, highlighted = :highlighted, notes = :notes WHERE id = :id AND research_interest_id = :researchInterestId`;

    const replacements = {
      id,
      researchInterestId,
      title,
      description,
      category,
      highlighted,
      notes,
    };

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });

    if (results) {
      return results;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update research comment");
  }
};
