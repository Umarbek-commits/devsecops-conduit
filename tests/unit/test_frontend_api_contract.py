from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"


def test_api_endpoint_configuration_is_consistent_and_api_prefixed():
    env_example = (FRONTEND / ".env.example").read_text()
    readme = (FRONTEND / "README.md").read_text()
    api_client = (FRONTEND / "app/libs/api/index.ts").read_text()

    assert "REACT_PUBLIC_API_ENDPOINT=http://127.0.0.1:8000/api" in env_example
    assert "REACT_PUBLIC_API_ENDPOINT" in readme
    assert "NEXT_PUBLIC_API_ENDPOINT" not in readme
    assert "path.endsWith(\"/api\")" in api_client
    assert "`${path}/api`" in api_client


def test_api_authorization_is_request_scoped():
    api_client = (FRONTEND / "app/libs/api/index.ts").read_text()
    root_route = (FRONTEND / "app/root.tsx").read_text()

    assert "fetchClient.token" not in api_client
    assert "createApiClient(session.get(\"token\"))" in root_route
    assert "context.set(apiClientContext, apiClient)" in root_route
    for route in (FRONTEND / "app/routes").glob("**/*.ts*"):
        assert "fetchClient." not in route.read_text(), route


def test_session_cookie_is_secure_outside_development():
    session = (FRONTEND / "app/session.server.ts").read_text()
    assert "secure: process.env.NODE_ENV !== \"development\"" in session


def test_backend_field_errors_are_normalized_for_forms():
    errors = (FRONTEND / "app/libs/api/errors.ts").read_text()
    for route in ("login.tsx", "register.tsx", "settings.tsx", "editor.($slug)/route.tsx"):
        source = (FRONTEND / "app/routes" / route).read_text()
        assert "getApiErrorMessages" in source
    assert "Object.values(payload.errors)" in errors


def test_mutation_actions_do_not_treat_api_errors_as_success():
    for route in ("api.favorites.ts", "api.follow.ts", "api.delete-comment.ts"):
        source = (FRONTEND / "app/routes" / route).read_text()
        assert "result.error" in source
        assert "getApiErrorMessages" in source
        assert "catch (error)" in source


def test_pagination_keeps_existing_query_filters():
    pagination = (FRONTEND / "app/components/Pagination/index.tsx").read_text()
    helper = (FRONTEND / "app/libs/pagination.ts").read_text()
    assert "const { pathname, search } = useLocation()" in pagination
    assert "buildPaginationHref(pathname, search, currentPage)" in pagination
    assert "new URLSearchParams(search)" in helper
    assert "searchParams.set(\"page\", String(page))" in helper


def test_empty_settings_fields_and_article_tag_updates_are_supported():
    settings_request = (ROOT / "backend/conduit/api/schemas/requests/user.py").read_text()
    article_request = (ROOT / "backend/conduit/api/schemas/requests/article.py").read_text()
    article_service = (ROOT / "backend/conduit/services/article.py").read_text()
    editor = (FRONTEND / "app/routes/editor.($slug)/route.tsx").read_text()
    settings_form = (FRONTEND / "app/routes/settings.tsx").read_text()

    assert 'field_validator("email", "password", "username"' in settings_request
    assert 'tags: list[str] | None = Field(None, alias="tagList")' in article_request
    assert "article_to_update.tags is not None" in article_service
    assert "useState<string[]>(article?.tagList ?? [])" in editor
    assert "formState?.bio ?? user?.bio" in settings_form
    assert "formState?.image ?? user?.image" in settings_form


def test_compose_api_healthcheck_uses_the_listening_port():
    compose = (ROOT / "backend/docker-compose.yaml").read_text()
    dockerfile = (ROOT / "backend/Dockerfile").read_text()
    assert 'UVICORN_PORT: "8080"' in compose
    assert "127.0.0.1:8080/api/health-check" in compose
    assert "--port" in dockerfile
    assert "$UVICORN_PORT" in dockerfile
    assert "${UVICORN_PORT}" in dockerfile
