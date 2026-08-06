// @ts-check

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // CODING_RULES.md: Commit message format
    // {type}({scope}): {description}
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'chore', // maintenance, dependency updates
        'docs', // documentation only
        'test', // test additions or fixes
        'refactor', // code restructure (no behaviour change)
        'perf', // performance improvement
        'ci', // CI/CD pipeline changes
        'sprint', // sprint deliverable (major commit)
        'style', // formatting only
        'revert', // revert a previous commit
      ],
    ],

    // Scope must be kebab-case (e.g., evidence-agent, apps/web)
    'scope-case': [2, 'always', 'kebab-case'],

    // Subject can be any case (allow sentence case)
    'subject-case': [0],

    // Max header length
    'header-max-length': [2, 'always', 100],

    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],

    // Body must have a blank line before it
    'body-leading-blank': [2, 'always'],

    // Footer must have a blank line before it
    'footer-leading-blank': [2, 'always'],
  },

  // Scope examples shown in error messages
  prompt: {
    scopes: [
      'web',
      'api',
      'agent-sdk',
      'ai-provider',
      'shared',
      'ui',
      'infra',
      'docs',
      'ci',
      'root',
      'evidence-agent',
      'content-agent',
      'threat-agent',
      'context-agent',
      'activity-agent',
      'metadata-agent',
      'synthetic-agent',
      'timeline-agent',
      'retrieval-agent',
      'reporting-agent',
      'risk-agent',
      'fusion-agent',
      'hypothesis-agent',
      'verification-agent',
      'copilot-agent',
      'explainability-agent',
    ],
  },
}
