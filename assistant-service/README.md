# Portfolio representative service

The portfolio can use an OpenAI model to select the most relevant first-person answer from the approved records. Only the selected record ID returns to the browser. Answer text and links come from the shared records file. Unsupported questions and requests for compensation, commitments, or scheduling lead to the contact page.

## Enable on Render

1. Create a standalone Node web service for this repository. Use the repository root, no dependency build, and start command `node assistant-service/server.mjs`. Use Node 22 or newer and configure the health check at `/health`.
2. Set `OPENAI_API_KEY` and `OPENAI_MODEL` in the service environment. Use a Responses API model that supports Structured Outputs. Use a dedicated API project/key and review its usage controls before exposing the endpoint.
3. Verify the HTTPS service and put its full `/ask` URL in the `assistant-api` meta tag in `assistant/index.html`. The page displays a notice when this URL is set.
4. Deploy the portfolio and test both entry points. Verify a first-person architecture answer, sponsorship, salary handoff, and an unsupported question about years of Java experience.

The blank endpoint is the default. The page also falls back to its curated keyword lookup if the configured service is temporarily unavailable. The service limits model calls per process. For public traffic beyond the pilot, enforce caller-level quotas at the hosting edge. CORS allows the portfolio origins and does not authenticate callers.
