# Central API

This is one independently deployable part of the ShiftUp Lab connected platform. See the bundle-level `LOCAL_SETUP.md` for the complete five-app startup sequence and Neon configuration.

- Shared API base (local): `http://localhost:4000`
- Production API base: `https://api.shiftuplab.com`
- Production host: Render Web Service (Docker). See `render.yaml` and `docs/RELEASE_CHECKLIST.md`.
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` on the host only. Do not commit `.env`, credentials, or database URLs.
- Run the app-specific build and test commands before deployment.
