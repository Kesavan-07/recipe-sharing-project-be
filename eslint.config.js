import js from "@eslint/js";
import node from "eslint-plugin-node";

export default [
  js.configs.recommended, // Use recommended JS rules
  node.configs.recommended, // Use recommended Node.js rules
  {
    ignores: ["node_modules", "dist"], // Ignore unnecessary files
  },
  {
    rules: {
      "no-unused-vars": "warn", // Warn instead of error
      "no-console": "off", // Allow console logs
    },
  },
];
