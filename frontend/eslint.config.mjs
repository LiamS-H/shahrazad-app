import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
// import { dirname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        ignores: ["src/lib/shahrazad-wasm/"],
        languageOptions: {
            parserOptions: {
                projectService: true, // Recommended for performance in v8+
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@next/next/no-img-element": "off",
            // "@typescript-eslint/strict-boolean-expressions": [
            //     "warn",
            //     {
            //         allowNumber: false,
            //         allowNullableNumber: false,
            //         allowString: true,
            //         allowNullableString: true,
            //         allowNullableBoolean: true,
            //         allowAny: true,
            //     },
            // ],
        },
    },
];

export default eslintConfig;
