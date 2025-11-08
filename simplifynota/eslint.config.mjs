import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...boundaries.configs.recommended,
  {
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'widgets', pattern: 'src/widgets/**' },
        { type: 'app', pattern: 'src/app/**' },
        { type: 'infra', pattern: 'src/infra/**' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'shared',   allow: [] },
          { from: 'entities', allow: ['shared'] },
          { from: 'features', allow: ['entities','shared'] },
          { from: 'widgets',  allow: ['features','entities','shared'] },
          { from: 'app',      allow: ['widgets','features','entities','shared','infra'] },
          { from: 'infra',    allow: ['shared'] }, // infra é baixo-nível
        ]
      }]
    }
  },
];

export default eslintConfig;