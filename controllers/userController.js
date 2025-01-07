import {
  getUserByEmailService,
  isUserAdminService,
  getUserAccessLevelService,
  getUserPatientAccountsService,
  getClerkUserIdsService
} from "../services/userService.js";

// Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const user = await getUserByEmailService(email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Get admin status for a user
export const isUserAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await isUserAdminService(id);
    if (res.isAuthenticated) {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } else {
      res.status(403).json({ error: "User is not an admin" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Get the access level for a user based on the patient they are viewing 
export const getAccessLevel = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const userId = req.params.userId;
    const accessLevel = await getUserAccessLevelService(patientId, userId);
    if (accessLevel) {
      res.json(accessLevel);
    } else {
      res.status(404).json({ error: "Access level not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch access level" });
  }
};

// Get all of the patient ID that a user has access to
export const getAllPatientIds = async (req, res) => {
  try {
    const id = req.auth.userId;
    const user = await getClerkUserIdsService(id);
    const clerkUserId = user.id;
    const patientsUserHasAccessTo = await getUserPatientAccountsService(clerkUserId);
    if (patientsUserHasAccessTo) {
      res.json(patientsUserHasAccessTo);
    } else {
      res.status(404).json({ error: "Patient IDs not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patient IDs" });
  }
};

