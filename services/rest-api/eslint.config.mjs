import path from "node:path";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import { configs, plugins, rules } from "eslint-config-airbnb-extended";
import prettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import tseslint from 'typescript-eslint';

const gitignorePath = path.resolve(".", ".gitignore");

// A `tseslint.config` segédfüggvényt használjuk a konfigurációk összefűzésére.
export default tseslint.config(
    includeIgnoreFile(gitignorePath),

    // 1. ÁLTALÁNOS BEÁLLÍTÁSOK (JS, Node, stb.)
    // Ezek minden fájlra érvényesek lesznek.
    js.configs.recommended,
    ...configs.base.recommended,
    plugins.stylistic,
    plugins.importX,
    plugins.node,
    ...configs.node.recommended,

    // 2. TYPESCRIPT-SPECIFIKUS BEÁLLÍTÁSOK
    // Ez a konfigurációs objektum csak a .ts és .tsx kiterjesztésű fájlokra vonatkozik.
    {
        files: ['**/*.{ts,tsx}'],

        // Az AirBnb TypeScript konfigurációinak betöltése.
        // A tseslint.config ezeket intelligensen összefűzi a lenti beállításokkal.
        ...tseslint.config(
            plugins.typescriptEslint,
            ...configs.base.typescript
        ),

        // A TypeScript aliasok feloldásához szükséges beállítások.
        // Mivel ez a blokk csak a TS fájlokra vonatkozik, itt a helye.
        settings: {
            'import-x/resolver-next': [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true,
                    // Ellenőrizd, hogy ezek az útvonal-minták illeszkednek-e a projektstruktúrádra!
                    project: [
                        'packages/*/tsconfig.json',
                        'services/*/tsconfig.json'
                    ],
                }),
            ],
        },

        // Az egyéni és felülírt szabályaid, szintén ebben a TS-blokkban.
        rules: {
            // Először betöltjük az Airbnb szigorú szabályait...
            ...rules.typescript.typescriptEslintStrict.rules,

            // ...majd jöhetnek a te egyéni felülírásaid.
            "import-x/no-extraneous-dependencies": [
                "error",
                {
                    devDependencies: true,
                },
            ],
            "no-underscore-dangle": [
                "error",
                { allow: ["_avg", "_count", "_sum", "_min", "_max", "_all"] },
            ],
            "prefer-destructuring": "off",
            "@typescript-eslint/prefer-destructuring": "off",
        },
    },

    // 3. PRETTIER KONFIGURÁCIÓ
    // Ennek kell lennie a legvégén, hogy felülírhassa az összes stilisztikai szabályt.
    prettier
);
