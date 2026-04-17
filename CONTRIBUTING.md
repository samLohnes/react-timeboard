# Contributing to react-timeboard

Thanks for your interest.

## Local development

```bash
git clone https://github.com/samlohnes/react-timeboard.git
cd react-timeboard
npm install
npm run test
npm run build
npm run storybook
```

The `test` script sets `TZ=America/Los_Angeles` so DST tests are deterministic. If you run `vitest` directly, set `TZ` yourself or expect timezone-sensitive tests to fail.
