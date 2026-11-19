# Contributing to GeneWise (MediPredict AI)

Thank you for your interest in contributing to **GeneWise**, an institutional AI-powered clinical decision-support and genetics literacy platform.

## Code of Conduct
All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect, dignity, and professional courtesy.

## How to Contribute
1. **Explore Issues**: Look for existing GitHub Issues or open a discussion before implementing significant architectural changes.
2. **Branching Strategy**: Create feature branches from `main`:
   ```bash
   git checkout -b feature/clinical-workflow-improvement
   ```
3. **Local Development**:
   - Web App: `cd apps/web && npm install && npm run dev`
   - FastAPI Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
4. **Testing & Verification**:
   - Ensure all frontend component tests pass: `npm --prefix apps/web test`
   - Ensure production builds compile cleanly: `npm --prefix apps/web run build`
   - Ensure backend pytest suite passes: `pytest backend/tests/`
5. **Pull Requests**:
   - Provide a concise description of the medical feature, fix, or optimization.
   - Reference any related issue numbers.

## Clinical Safety & Privacy Standards
- **Zero Hardcoded PHI**: Never commit Protected Health Information (PHI) or real patient identifiers.
- **Guideline Alignment**: Algorithmic rules must cite recognized guidelines (ACMG, NSGC, ADA, ACG, KDIGO).
- **Security Check**: Enforce RFC 6238 TOTP, ReBAC access guards, and HMAC-SHA256 audit trails.

Thank you for helping advance open, evidence-grounded clinical intelligence!
