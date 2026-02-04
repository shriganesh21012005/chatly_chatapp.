// import { aj } from "../lib/arcjet.js";
// import { ENV } from "../lib/env";


// const arcjetMiddleware = async (req, res, next) => {
//   try {
//     const decision = aj.protect(req);
//     if (decision.isDenied()) {
//       if (decision.reason.ratelimit) {
//         res.status(429).json({
//           message: "Too many requests. Rate limit exceeded."
//         });
//       } else if (decision.reason.bot) {
//         res.status(403).json({
//           message: "Bot detected. Please try again later."
//         });
//       }
//       else {
//         res.status(403).json({
//           message: "Request denied for security reasons"
//         });
//       }

//       // check for spoofed bots
//       if (decision.results.some(isSpoofedBot)) {
//         return res.status(403).json({
//           error: "Spoofed bot detected",
//           message: "Malicious bot activity detected.",
//         });
//       }

//     } else {
//       next();
//     }
//   }
//   catch (error) {
//     res.status(500).json({
//       message: "Internal server error"
//     });
//   }
// };

// export default arcjetMiddleware;



import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot access denied." });
      } else {
        return res.status(403).json({
          message: "Access denied by security policy.",
        });
      }
    }

    // check for spoofed bots
    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected.",
      });
    }

    next();
  } catch (error) {
    console.log("Arcjet Protection Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
