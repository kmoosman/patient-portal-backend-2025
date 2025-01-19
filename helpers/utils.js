import { getPresignedUrlService } from "../services/attachmentService.js";

export function deepCamelcaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCamelcaseKeys(item));
  } else if (obj instanceof Date) {
    // Return the Date object as-is
    return obj;
  } else if (typeof obj === "object" && obj !== null) {
    const result = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let camelKey = key.replace(/_([a-z])/g, (match, p1) =>
          p1.toUpperCase()
        );

        if (camelKey === "firstName" || camelKey === "lastName") {
          camelKey = camelKey.replace(/([A-Z])/g, "$1").trim();
        }

        result[camelKey] = deepCamelcaseKeys(obj[key]);
      }
    }
    return result;
  } else {
    return obj;
  }
}

export const processAttachmentLink = async (link) => {
  if (!link) return link;

  try {
    const url = new URL(link);
    const hostname = url.hostname;

    // Check if URL hostname contains "patient"
    if (hostname.includes("patient")) {
      const pathParts = url.pathname.split("/");
      const filename = pathParts.pop();

      // Check if the filename includes the extension
      const key = filename.includes(".")
        ? `attachments/${filename}`
        : `attachments/${filename}.pdf`; // Default to .pdf if no extension

      return await getPresignedUrlService(key);
    }

    // If not a patient URL, return the original link
    return link;
  } catch (error) {
    console.error("Error processing attachment:", {
      originalLink: link,
      error: error.message,
    });
    return link;
  }
};

export const toNumberOrNull = (value) => {
  const number = parseFloat(value);
  return isNaN(number) ? null : number;
};

export function checkForAuthentication(res) {
  if (res.isAuthenticated) {
    return res.json({ message: "authorized", user: req.user });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
