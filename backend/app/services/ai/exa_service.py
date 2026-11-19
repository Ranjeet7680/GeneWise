import os
import logging
from typing import Any, Dict, List, Optional
from exa_py import Exa
from app.core.config import settings

logger = logging.getLogger(__name__)

# Canonical tool description & objective wording as defined by Exa
TOOL_DESCRIPTION = "Search the live web and return the most relevant URLs and content. Use for fresh information beyond the model's training data."
OBJECTIVE_DESCRIPTION = "Goal for this search turn; say which documents should rank first, which should be excluded, and what specific facts or figures to pull from them."

SYSTEM_PROMPT_GUIDANCE = """You have access to a web search tool (`exa_search`) to retrieve current technical documentation, library changelogs, SDK references, and live web information.

When using the search tool:
1. Always supply both a natural-language `query` (specifying the technical subject and any recency constraints) and an `objective`.
2. In the `objective`, specify which sources should rank first (e.g., official docs, GitHub releases), what to exclude (e.g., outdated major versions, low-quality aggregators), and what specific code snippets, parameters, or version facts to extract.
3. Keep search queries focused on retrieval intent; do not put keep/drop rules inside `query` (place them in `objective`).
4. Ground your technical answers and code examples in the returned `highlights`.
"""

class ExaSearchService:
    """
    Exa Search Service adhering to the canonical build-with-exa specifications:
    - Default to POST /search
    - Natural language query + objective
    - type="auto"
    - contents={"highlights": True} for token-efficient extraction
    - No boilerplate numResults or invented categories
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.EXA_API_KEY or os.getenv("EXA_API_KEY", "")
        self._client: Optional[Exa] = None
        if self.api_key:
            self._client = Exa(api_key=self.api_key)

    @property
    def is_configured(self) -> bool:
        return bool(self._client)

    def search(
        self,
        query: str,
        objective: Optional[str] = None,
        num_results: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Executes a canonical Exa search with token-efficient highlights.
        """
        if not self._client:
            raise ValueError("Exa API client is not configured. Set EXA_API_KEY.")

        kwargs: Dict[str, Any] = {
            "query": query,
            "type": "auto",
            "contents": {"highlights": True},
        }

        if objective:
            kwargs["objective"] = objective
        if num_results is not None:
            kwargs["num_results"] = num_results

        try:
            response = self._client.search(**kwargs)
            results = []
            for item in response.results:
                results.append({
                    "title": getattr(item, "title", ""),
                    "url": getattr(item, "url", ""),
                    "published_date": getattr(item, "published_date", None),
                    "author": getattr(item, "author", None),
                    "highlights": getattr(item, "highlights", []),
                })
            return {
                "success": True,
                "query": query,
                "objective": objective,
                "count": len(results),
                "results": results,
            }
        except Exception as e:
            logger.error(f"Exa search failed for query '{query}': {e}", exc_info=True)
            return {
                "success": False,
                "query": query,
                "error": str(e),
                "results": [],
            }

    @staticmethod
    def get_openai_tool_definition() -> Dict[str, Any]:
        """Canonical OpenAI tool definition for Exa search."""
        return {
            "type": "function",
            "function": {
                "name": "exa_search",
                "description": TOOL_DESCRIPTION,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Natural-language search query."
                        },
                        "objective": {
                            "type": "string",
                            "description": OBJECTIVE_DESCRIPTION,
                        },
                    },
                    "required": ["query", "objective"],
                },
            },
        }

    @staticmethod
    def get_anthropic_tool_definition() -> Dict[str, Any]:
        """Canonical Anthropic tool definition for Exa search."""
        return {
            "name": "exa_search",
            "description": TOOL_DESCRIPTION,
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural-language search query."
                    },
                    "objective": {
                        "type": "string",
                        "description": OBJECTIVE_DESCRIPTION,
                    },
                },
                "required": ["query", "objective"],
            },
        }

exa_search_service = ExaSearchService()
