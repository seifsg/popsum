# Popsum

Pop the balloon with the right answer: a calm math game for kids (adding and subtracting within 10, then 20), with no ads, no accounts and no timers. It works offline and comes in English and Arabic.

## Run it

Needs Node 24 or newer (tests run TypeScript natively).

```bash
npm ci
npm run dev       # http://localhost:4317
```

```bash
npm test          # problem generation and level tests
npm run build     # type-checks, then writes dist/ (static, installable, offline)
npm run preview   # serves dist/ on http://localhost:4318
```

🏭 Built with [AI Software Factory](https://softwarefactory.company/) by Seif
