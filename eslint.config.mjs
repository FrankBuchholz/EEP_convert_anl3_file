// ESLint-Konfiguration
// Installation:
//   npm i -D eslint @eslint/js globals
// Aufruf:
//   npx eslint ./js/
//   npx eslint ./js/EEP_Gleisplan_LoadFile.js
//
import js from "@eslint/js";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		files: ["js/**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "script",          // klassische <script>-Dateien, keine ES-Module
			globals: { ...globals.browser } // document, fetch, FileReader, ...
		},
		rules: {
			"no-undef": "error",
			"no-unused-vars": ["warn", { args: "none", vars: "local" }]
		}
	}
];