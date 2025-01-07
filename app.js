import express from "express";
import cors from "cors";
import organizationRoutes from "./routes/organizationRoutes.js";
import institutionRoutes from "./routes/institutionRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import openAIRoutes from "./routes/openAIRoutes.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import tagRoutes from "./routes/tagRouter.js";
import uploadRoutes from "./routes/uploadRouter.js";
import diagnosesRoutes from "./routes/diagnosesRoutes.js";
import interventionRoutes from "./routes/interventionRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import imagingRoutes from "./routes/imagingRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import { protectRouteAndCheckAdmin } from "./controllers/loginController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { fetchUserAccessLevel } from "./middleware/fetchUserAccessLevel.js";
import cookieParser from "cookie-parser";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";

import { Clerk } from "@clerk/clerk-sdk-node";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize Clerk with your API key
const clerk = Clerk(process.env.CLERK_API_KEY);

const app = express();
const port = process.env.PORT || 5194;

console.log(process.env.NODE_ENV)

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_URL
    : process.env.DEVELOPMENT_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
const environment = process.env.NODE_ENV;

if (environment === "production") {
  app.use((req, res, next) => {
    if (req.method !== 'OPTIONS' && req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

app.use("/api/organizations", ClerkExpressRequireAuth(), fetchUserAccessLevel, organizationRoutes);
app.use("/api/articles", ClerkExpressRequireAuth(), fetchUserAccessLevel, articleRoutes);
app.use("/api/openai", ClerkExpressRequireAuth(), fetchUserAccessLevel, openAIRoutes);
app.use("/api/auth", ClerkExpressRequireAuth(), fetchUserAccessLevel, authenticationRoutes);
app.use("/api/clear-token", ClerkExpressRequireAuth(), authenticationRoutes);
app.use("/api/attachments", ClerkExpressRequireAuth(), fetchUserAccessLevel, attachmentRoutes);
app.use("/api/institutions", ClerkExpressRequireAuth(), fetchUserAccessLevel, institutionRoutes);
app.use("/api/interventions", ClerkExpressRequireAuth(), fetchUserAccessLevel, interventionRoutes);
app.use("/api/medications", ClerkExpressRequireAuth(), fetchUserAccessLevel, medicationRoutes);
app.use("/api/imaging", ClerkExpressRequireAuth(), fetchUserAccessLevel, imagingRoutes);
app.use("/api/providers", ClerkExpressRequireAuth(), fetchUserAccessLevel, providerRoutes);
app.use("/api/diagnoses", ClerkExpressRequireAuth(), fetchUserAccessLevel, diagnosesRoutes);
app.use("/api/patients", ClerkExpressRequireAuth(), fetchUserAccessLevel, labRoutes);
app.use("/api/patients", ClerkExpressRequireAuth(), fetchUserAccessLevel, patientRoutes);
app.use("/api/users", ClerkExpressRequireAuth(), fetchUserAccessLevel, userRoutes);
app.use("/api/tags", ClerkExpressRequireAuth(), fetchUserAccessLevel, tagRoutes);
app.use("/api/upload", ClerkExpressRequireAuth(), fetchUserAccessLevel, uploadRoutes);
app.use("/api/research-interests", ClerkExpressRequireAuth(), fetchUserAccessLevel, researchRoutes);
app.use("/api/set-patient", ClerkExpressRequireAuth(), fetchUserAccessLevel, authenticationRoutes);

export const storage = multer.memoryStorage();

app.use((err, res) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});


export default app;


