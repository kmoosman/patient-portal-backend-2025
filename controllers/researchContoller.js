import {
  getAllResearchOfInterestByPatientIdService,
  getResearchInterestByIdService,
  createResearchInterestService,
  updateResearchInterestService,
  createResearchLinkService,
  updateResearchLinkService,
  createResearchCommentService,
  updateResearchCommentService,
} from "../services/researchService.js";
import { isUserAdminService } from "../services/userService.js";
import clerkClient from "@clerk/clerk-sdk-node";

export const getAllResearchOfInterestByPatientId = async (req, res) => {
  const lastLogin = req.query.lastLogin;
  try {
    const patientId = req.patientId
    const accessLevel = req.accessLevel;
    const results = await getAllResearchOfInterestByPatientIdService({
      id: patientId,
      lastLogin,
      accessLevel
    }
    );

    if (results) {
      res.json(results);
    } else {
      res.status(404).json({ error: "Research interests not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch research interests." });
  }
};

export const getResearchInterestById = async (req, res) => {
  const id = req.params.id;
  const lastLogin = req.query.lastLogin;
  try {
    const patientId = req.params.id;
    const results = await getResearchInterestByIdService(patientId, lastLogin);

    if (results) {
      res.json(results);
    } else {
      res.status(404).json({ error: "Research interest not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch research interest." });
  }
};

export const createResearchInterest = async (req, res) => {
  try {
    const patientId = req.patientId;
    const researchInterest = req.body;
    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;

    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to create research" });
    }

    const results = await createResearchInterestService({
      patientId,
      researchInterest
    });

    if (results) {
      res.json(results);
    } else {
      res.status(404).json({ error: "Research interest not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create research interest." });
  }
};

export const updateResearchInterest = async (req, res) => {

  try {
    const patientId = req.patientId;
    const researchInterest = req.body;

    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;

    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update research" });
    }

    const results = await updateResearchInterestService(
      patientId,
      researchInterest
    );

    if (results) {
      res.json(results);
    } else {
      res.status(404).json({ error: "Research interest not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update research interest." });
  }
};

export const createResearchInterestLink = async (req, res) => {
  try {
    const researchLink = req.body;
    const results = await createResearchLinkService(researchLink);

    if (results) {
      res.json(results);
    } else {
      res
        .status(404)
        .json({ error: "Could not create research interest link." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create resarch interest link." });
  }
};

export const updateResearchInterestLink = async (req, res) => {
  try {
    const patientId = req.params.id;
    const researchLink = req.body;

    const results = await updateResearchLinkService(researchLink);

    if (results) {
      res.json(results);
    } else {
      res
        .status(404)
        .json({ error: "Could not update research interest link." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update resarch interest link." });
  }
};

export const createResearchComment = async (req, res) => {
  try {
    const patientId = req.params.id;
    const researchComment = req.body;

    const results = await createResearchCommentService(researchComment);

    if (results) {
      res.json(results);
    } else {
      res
        .status(404)
        .json({ error: "Could not create research interest comment." });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to create resarch interest comment." });
  }
};

export const updateResearchComment = async (req, res) => {
  try {
    const researchComment = req.body;
    const results = await updateResearchCommentService(researchComment);

    if (results) {
      res.json(results);
    } else {
      res
        .status(404)
        .json({ error: "Could not update research interest comment." });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to update resarch interest comment." });
  }
};
