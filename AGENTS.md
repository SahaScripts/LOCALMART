<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## LOCALMART architecture
- Use TanStack Start file routes and shared React components for the frontend, as approved by the user, while preserving the existing external Spring Boot/PostgreSQL system.
- Centralize relative HTTP requests in the API module and use only confirmed endpoint contracts; unsupported mutations remain disabled until Java source is provided.
- Keep catalog and rating report data in TanStack Query, deriving categories and business groupings from real catalog rows rather than seeding demo records.
- Do not infer authentication or roles from browser storage; private dashboard data and management actions remain locked until backend session and role contracts are verified.
- Define visual styles and semantic colors in the global design system; generated lifestyle images are editorial promotion assets, never substitutes for real product images.
