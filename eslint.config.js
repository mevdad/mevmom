import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {languageOptions: { 
      globals: globals.node ,
      'no-unused-vars': 'off'
    }},
    pluginJs.configs.recommended,
];
