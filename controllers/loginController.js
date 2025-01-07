import jwt from "jsonwebtoken";
import {
  getUserById,
  isUserAdminService,
  getUserByEmailService,
} from "../services/userService.js";

export const getLogin = async (req, res) => {
  const bearerHeader = req.headers["authorization"];
  const token = bearerHeader && bearerHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.email = decoded.email; // Store the email in the request for further processing
  } catch (err) {
    return res.status(403).send("Invalid token");
  }
  //get the email address from the params
  const email = req.email;
  if (!bearerHeader) {
    return res.status(403).send("Access denied");
  }

  if (!email) {
    return res.status(403).send("Access denied");
  }

  const user = await getUserByEmail(email);
  if (!user || user.length === 0) {
    return res.status(404).send("User not found");
  }

  if (!(await isUserAdmin(user[0].id))) {
    return res.status(403).send("Access denied");
  }

  // If Google token is valid and user is an admin, issue JWT token and pass control
  const systemToken = jwt.sign(
    { userId: user[0].id, userEmail: user[0].email, isAdmin: true },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  return res.json({ systemToken });
};

export const protectRouteAndCheckAdmin = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  const token = bearerHeader && bearerHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.isAuthenticated = decoded.isAdmin;
    next();
  } catch (err) {
    res.isAuthenticated = false;
    next();
  }
};


//need to add more protections to check for admin status basic auth
export const adminAuthRequired = async (req, res, next) => {
  const userId = req.headers["userid"];

  if (typeof userId !== "undefined") {
    const isUser = await getUserById(userId);

    if (isUser.length > 0) {
      const isAdmin = await isUserAdminService(userId);
      res.isAuthenticated = isAdmin;
    } else {
      res.isAuthenticated = false;
    }
    next();
  } else {
    res.sendStatus(403);
  }
};

const getUserByEmail = async (email) => {
  // Assuming you have a function to get user by email
  return await getUserByEmailService(email);
};

const isUserAdmin = async (userId) => {
  return await isUserAdminService(userId);
};

