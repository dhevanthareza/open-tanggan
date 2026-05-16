# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in Open Tanggan, please email the maintainer privately instead of using the public issue tracker.

**Do not** open a public issue for security vulnerabilities.

## What to Include

When reporting a security issue, please provide:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

## Response Time

We aim to acknowledge security reports within 48 hours and provide an initial assessment of the severity.

## Disclosure

We will work to fix confirmed vulnerabilities and release a patched version. Once a patch is available, we will disclose the vulnerability details publicly.

## Security Best Practices for Deployments

When deploying Open Tanggan:

1. **Keep dependencies updated**: Run `pnpm update` regularly
2. **Use HTTPS**: Always use HTTPS in production
3. **Secure .env**: Never commit `.env` file; use secure environment variable management
4. **Limit admin access**: Be careful who you add to the `admins` sheet
5. **Audit logs**: Review Google Sheets audit trail for suspicious changes
6. **Service account key**: Rotate service account keys periodically

## Known Limitations

- This application is designed for managing resident data within a community. It is not suitable for handling highly sensitive personal data without additional security measures.
- Data is stored in Google Sheets; ensure you trust Google's security model.
- Always keep Google Cloud credentials secure.

---

For other security concerns or best practices, please refer to the [OWASP Top 10](https://owasp.org/www-project-top-ten/).
