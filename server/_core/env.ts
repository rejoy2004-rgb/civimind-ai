import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || "mysql://root:password@127.0.0.1:3306/community_hero",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  APP_URL: process.env.APP_URL || "http://localhost:3000"
};

if (!ENV.GEMINI_API_KEY) {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is missing. LLM capabilities will be mocked.");
}
