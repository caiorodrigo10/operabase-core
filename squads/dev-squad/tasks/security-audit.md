# Security Audit

> Task for @qa (Quinn) | Security

## Purpose

Perform security audit on code changes or specific modules.

## Prerequisites

- Code to audit (file paths, PR, or module)
- OWASP Top 10 awareness

## Workflow

### Phase 1: Static Analysis

1. Check for injection vulnerabilities (SQL, command, XSS)
2. Review authentication and authorization logic
3. Check for sensitive data exposure
4. Review error handling (no stack traces in production)
5. Check dependency vulnerabilities: `npm audit`

### Phase 2: Code Review

1. Review input validation
2. Check output encoding
3. Verify CSRF protections
4. Review session management
5. Check for hardcoded secrets

### Phase 3: Report

1. Document findings with severity (Critical/High/Medium/Low)
2. Provide fix recommendations
3. Prioritize fixes

## Outputs

- Security audit report
- Prioritized list of findings
- Fix recommendations

## Validation

- [ ] No critical vulnerabilities
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Output encoding correct
- [ ] Dependencies audited

---

_Task version: 1.0_
