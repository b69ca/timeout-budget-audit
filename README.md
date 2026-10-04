# timeout-budget-audit

Calculate the worst-case duration, first-attempt path, request count and deadline slack of nested sequential/parallel operations with retries and backoff.

```sh
npx --yes github:b69ca/timeout-budget-audit plan.json
npx --yes github:b69ca/timeout-budget-audit plan.json --deadline 3000 --json
```

```json
{"name":"request","mode":"sequential","deadlineMs":3000,"steps":[
  {"name":"auth","timeoutMs":300},
  {"name":"fanout","mode":"parallel","steps":[
    {"name":"profile","timeoutMs":500,"attempts":2,"backoff":100},
    {"name":"orders","timeoutMs":900}
  ]}
]}
```

Operations accept `timeoutMs`, `attempts`, and either numeric `backoff` or `{ "initialMs", "factor", "maxMs" }`. Groups accept `mode`, `steps`, and optional `overheadMs`. Parallel groups use the longest child for elapsed time but count requests across every child. A blown deadline exits 1; invalid plans exit 2.

Retry calculators usually model one loop. This utility models the critical path of a small call graph without executing it. It is conservative: timeouts are assumed fully consumed and parallel capacity is assumed available. Zero dependencies, Node.js 20+, MIT licensed.
