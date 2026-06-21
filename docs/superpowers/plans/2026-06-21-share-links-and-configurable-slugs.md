# Share Links, Lead Capture, and Configurable Store Slugs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the v1 feature in the design spec — shareable per-product/per-store URLs with rich WhatsApp previews, mandatory WA-number identity capture, merchant Leads inbox + analytics, and editable store slugs with redirect aliases.

**Architecture:** Backend lays the data layer + APIs first (Django + DRF, four new models, two utility modules, eleven endpoints, alias-aware slug routing). Frontend then consumes via typed actions: Next.js server-rendered interstitial pages with OG meta tags + cookie-gated identity, plus three merchant UI surfaces (Leads inbox, per-product share panel, manage Store Link tab). Everything additive — no breaking changes to existing flows.

**Tech Stack:** Backend = Django 5.2, DRF, PostgreSQL/SQLite (dev), `phonenumbers`, `django-ratelimit`, stdlib `hmac`+`hashlib`. Frontend = Next.js 14 App Router, TypeScript, axios, `libphonenumber-js`, openapi-typescript-generated types, shadcn/ui.

**User Verification:** YES — the spec specifies a 10-step manual smoke checklist that the user must walk through before the work is considered shippable (see Task 21).

**Spec:** `preorder/docs/superpowers/specs/2026-06-21-share-links-and-configurable-slugs-design.md`

**Repos in play:**
- `Buzzmart_backend` on branch `final` — at `/Users/lordamola/company-repos/data-totems/Buzzmart_backend/`
- `preorder` on branch `main` — at `/Users/lordamola/company-repos/data-totems/preorder/`

---

## File Map

### Backend (`Buzzmart_backend/`)

**Create:**
- `accounts/lead_tokens.py` — HMAC sign/verify for the `bz_lead` cookie payload
- `accounts/slug_validation.py` — format + reserved-word validator, suggestion generator
- `accounts/phone.py` — E.164 normalization via `phonenumbers`
- `accounts/signals.py` — extend existing file: auto-create ShareLink on Product / BusinessDetails save
- `accounts/migrations/0009_share_links_leads_clicks_aliases.py` — schema + data backfill
- `accounts/tests/test_lead_tokens.py`
- `accounts/tests/test_slug_validation.py`
- `accounts/tests/test_phone.py`
- `accounts/tests/test_share_link_models.py`
- `accounts/tests/test_share_link_api.py`
- `accounts/tests/test_slug_api.py`
- `accounts/tests/test_leads_api.py`
- `accounts/tests/test_store_alias_routing.py`

**Modify:**
- `accounts/models.py` — add ShareLink, Lead, ClickEvent, StoreSlugAlias
- `accounts/serializers.py` — add ShareLinkResolveSerializer, LeadSerializer, ShareStatsSerializer, BusinessSlugUpdateSerializer; modify SetupAccountSerializer to accept `store_slug`
- `accounts/views.py` — add `share_link_resolve`, `share_link_identify`, `update_business_slug`, `check_business_slug`, `my_leads`, `my_lead_activity`; modify `get_merchant_store` + `get_product_by_uuid` for alias resolution; modify `store_link` view to include aliases
- `accounts/urls.py` — wire new endpoints
- `products/views.py` + `products/urls.py` — add `product_share_stats` endpoint
- `accounts/admin.py` — register new models
- `buzzmart/settings.py` — `LEAD_TOKEN_SECRET`, `SHARE_LINKS_ENABLED`, DRF pagination class, ratelimit cache backend
- `requirements.txt` — add `phonenumbers`, `django-ratelimit`
- `.env`, `.env.example` — add `LEAD_TOKEN_SECRET`, `SHARE_LINKS_ENABLED`

### Frontend (`preorder/`)

**Create:**
- `lib/phone.ts` — `libphonenumber-js` wrapper (NG default, normalize/validate)
- `actions/share-links.actions.ts` — typed API client: `resolveShareLink`, `identifyVisitor`, `getLeads`, `getLeadActivity`, `getProductShareStats`, `getStoreShareStats`
- `actions/slug.actions.ts` — `checkSlugAvailability`, `updateStoreSlug`
- `app/p/[shortId]/page.tsx` — product share landing (SSR + OG)
- `app/s/[shortId]/page.tsx` — store share landing (SSR + OG)
- `app/api/share-link-identify/route.ts` — Next.js Route Handler that sets the `bz_lead` cookie server-side
- `app/(dashboard)/leads/page.tsx` — Leads inbox
- `components/share/Interstitial.tsx` — identity-capture form
- `components/share/SharePanel.tsx` — analytics card (reused on product detail + manage)
- `components/share/ShareButton.tsx` — `navigator.share()` mobile / clipboard + `wa.me/?text=` desktop
- `components/slug/SlugInput.tsx` — reusable slug input with debounced availability check
- `components/slug/EditSlugModal.tsx` — modal triggered from manage page
- `components/leads/LeadRow.tsx`
- `components/leads/LeadActivityDrawer.tsx`

**Modify:**
- `app/(dashboard)/marketplace/product/[id]/page.tsx` — drop SharePanel at top
- `app/(dashboard)/manage/page.tsx` (or wherever tabs live) — add "Store Link" tab
- `components/setup/BussinessDetails.tsx` — add SlugInput with auto-suggest
- The dashboard sidebar component — add Leads link + badge
- `types/api.ts` — add `ShareLinkResolve`, `Lead`, `ShareStats`, `BusinessSlugUpdate` aliases (after regenerating)
- `package.json` — add `libphonenumber-js`
- `.env.local`, `.env.example` — add `NEXT_PUBLIC_SITE_URL`

**Regenerate:** `types/api-generated.ts` — via `npm run gen:types` after backend tasks complete.

---

## Task 0: Backend prep — settings, env, deps

**Goal:** Install `phonenumbers` + `django-ratelimit`, wire `LEAD_TOKEN_SECRET` and `SHARE_LINKS_ENABLED` env vars, add DRF pagination defaults, verify backend still boots cleanly.

**Files:**
- Modify: `Buzzmart_backend/requirements.txt`
- Modify: `Buzzmart_backend/buzzmart/settings.py`
- Modify: `Buzzmart_backend/.env`
- Modify: `Buzzmart_backend/.env.example`

**Acceptance Criteria:**
- [ ] `phonenumbers>=8.13` and `django-ratelimit>=4.1` in `requirements.txt`, installed in `.venv`
- [ ] `LEAD_TOKEN_SECRET` env var read in settings; fail-loud if missing in production (DEBUG=False); fall back to dev placeholder when DEBUG=True (mirrors the existing `SECRET_KEY` pattern from bug #2)
- [ ] `SHARE_LINKS_ENABLED` env var, default True, gates new endpoints
- [ ] DRF default pagination set: `PageNumberPagination`, `PAGE_SIZE=20` — applied only to endpoints that opt in (don't paginate every list endpoint or we break existing UIs)
- [ ] `RATELIMIT_USE_CACHE = 'default'`, cache config falls back to local memory for v1
- [ ] `python manage.py check` clean, `python manage.py runserver` boots, existing `/api/products/all_products/` still 200

**Verify:** `cd Buzzmart_backend && source .venv/bin/activate && python manage.py check && curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/api/products/all_products/` → expect `System check identified no issues` then `200`

**Steps:**

- [ ] **Step 1: Add deps to `requirements.txt`**

Append:

```
phonenumbers==8.13.50
django-ratelimit==4.1.0
```

- [ ] **Step 2: Install**

```bash
cd /Users/lordamola/company-repos/data-totems/Buzzmart_backend
source .venv/bin/activate
uv pip install -r requirements.txt
```

Expected: `phonenumbers` and `django-ratelimit` listed as installed.

- [ ] **Step 3: Add `LEAD_TOKEN_SECRET` reader to `buzzmart/settings.py`**

Insert right after the existing `SECRET_KEY` block:

```python
LEAD_TOKEN_SECRET = os.getenv("LEAD_TOKEN_SECRET")
if not LEAD_TOKEN_SECRET:
    if DEBUG:
        LEAD_TOKEN_SECRET = "dev-only-lead-token-secret-do-not-use-in-production"
    else:
        raise RuntimeError(
            "LEAD_TOKEN_SECRET environment variable is required when DEBUG is False."
        )

SHARE_LINKS_ENABLED = os.getenv("SHARE_LINKS_ENABLED", "True").lower() in ("true", "1", "yes")
```

- [ ] **Step 4: Add cache + ratelimit settings**

In `settings.py`, find the `REST_FRAMEWORK` dict and add:

```python
REST_FRAMEWORK = {
    # ... existing keys ...
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

Below it add:

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}
RATELIMIT_USE_CACHE = "default"
```

Note: PageNumberPagination is a *default*; only endpoints that subclass `ListAPIView` or explicitly opt in via `pagination_class` will paginate. Existing function-based views that return raw `Response([...])` are unaffected.

- [ ] **Step 5: Update `.env` and `.env.example`**

Append to `Buzzmart_backend/.env`:

```
LEAD_TOKEN_SECRET=dev-only-lead-token-secret-do-not-use-in-production
SHARE_LINKS_ENABLED=true
```

Append to `Buzzmart_backend/.env.example`:

```
# Generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))'
LEAD_TOKEN_SECRET=
# Set to false to gate the share-link endpoints (kill switch)
SHARE_LINKS_ENABLED=true
```

- [ ] **Step 6: Restart server and verify**

```bash
# in the backend terminal
python manage.py check
python manage.py runserver 127.0.0.1:8000
# in another terminal
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/api/products/all_products/
```

Expected: `200`.

- [ ] **Step 7: Commit**

```bash
cd /Users/lordamola/company-repos/data-totems/Buzzmart_backend
git add requirements.txt buzzmart/settings.py .env.example
git commit -m "feat(share-links): add LEAD_TOKEN_SECRET, SHARE_LINKS_ENABLED, ratelimit + pagination wiring"
```

(Don't commit `.env` — it's gitignored per the bug #2 fix.)

---

## Task 1: Data model + migrations with backfill

**Goal:** ShareLink, Lead, ClickEvent, StoreSlugAlias models + a single migration that creates them and backfills aliases / share links from existing data.

**Files:**
- Modify: `Buzzmart_backend/accounts/models.py`
- Create: `Buzzmart_backend/accounts/migrations/0009_share_links_leads_clicks_aliases.py`
- Modify: `Buzzmart_backend/accounts/admin.py`
- Create: `Buzzmart_backend/accounts/tests/__init__.py`
- Create: `Buzzmart_backend/accounts/tests/test_share_link_models.py`
- Delete (move content): existing `Buzzmart_backend/accounts/tests.py` — if any (per audit it's empty)

**Acceptance Criteria:**
- [ ] Four new models in `models.py` with constraints from spec
- [ ] Unique constraint `(Lead.merchant, Lead.wa_number)` enforced at DB
- [ ] Unique constraint on `StoreSlugAlias.slug` (case-sensitive — slugs are normalized lowercase before save)
- [ ] `StoreSlugAlias`: partial unique index on `(business_details, is_current)` where `is_current=true`
- [ ] `ShareLink.short_id`: unique, indexed, 8-char default via `secrets.token_urlsafe(6)`
- [ ] `ClickEvent`: indexes on `(share_link, occurred_at desc)` and `(lead, occurred_at desc)`
- [ ] Migration backfill: every existing `BusinessDetails` gets a `StoreSlugAlias(slug=store_slug, is_current=True)`; every existing `Products` gets a `ShareLink(kind=product, product=...)`; every existing `BusinessDetails` gets a `ShareLink(kind=store, product=NULL, merchant=user)`
- [ ] All four models registered in Django admin
- [ ] Tests pass

**Verify:** `cd Buzzmart_backend && source .venv/bin/activate && python manage.py migrate && python manage.py test accounts.tests.test_share_link_models -v 2`

**Steps:**

- [ ] **Step 1: Convert `accounts/tests.py` to a package**

```bash
cd /Users/lordamola/company-repos/data-totems/Buzzmart_backend
rm -f accounts/tests.py
mkdir -p accounts/tests
touch accounts/tests/__init__.py
```

- [ ] **Step 2: Write the failing test in `accounts/tests/test_share_link_models.py`**

```python
from django.db import IntegrityError
from django.test import TestCase
from accounts.models import User, Products, BusinessDetails, ShareLink, Lead, ClickEvent, StoreSlugAlias


class ShareLinkModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="m@x.com", password="x")
        self.product = Products.objects.create(user=self.user, name="P", price=10, description="d")

    def test_short_id_auto_generated_and_unique(self):
        link_a = ShareLink.objects.create(kind="product", product=self.product, merchant=self.user)
        link_b = ShareLink.objects.create(kind="store", merchant=self.user)
        self.assertEqual(len(link_a.short_id), 8)
        self.assertNotEqual(link_a.short_id, link_b.short_id)


class LeadModelTests(TestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")

    def test_unique_per_merchant_wa_number(self):
        Lead.objects.create(merchant=self.merchant, wa_number="+2348127778036")
        with self.assertRaises(IntegrityError):
            Lead.objects.create(merchant=self.merchant, wa_number="+2348127778036")


class StoreSlugAliasModelTests(TestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        self.biz = BusinessDetails.objects.create(user=self.merchant, business_name="X", store_slug="x-shop")

    def test_only_one_current_per_business(self):
        StoreSlugAlias.objects.create(business_details=self.biz, slug="x-shop", is_current=True)
        with self.assertRaises(IntegrityError):
            StoreSlugAlias.objects.create(business_details=self.biz, slug="other", is_current=True)
```

- [ ] **Step 3: Run test to confirm it fails (models don't exist yet)**

```bash
python manage.py test accounts.tests.test_share_link_models -v 2
```

Expected: `ImportError: cannot import name 'ShareLink'`.

- [ ] **Step 4: Add models to `accounts/models.py`**

Append these at the end of the file (after existing `Order` model):

```python
import secrets


def _generate_short_id():
    # 6 random bytes → 8 url-safe chars
    return secrets.token_urlsafe(6)


class ShareLink(models.Model):
    KIND_CHOICES = [("product", "Product"), ("store", "Store")]

    short_id = models.CharField(max_length=12, unique=True, db_index=True, default=_generate_short_id)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    product = models.ForeignKey(
        "accounts.Products",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="share_links",
    )
    merchant = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="share_links",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(kind="product", product__isnull=False)
                    | models.Q(kind="store", product__isnull=True)
                ),
                name="sharelink_product_present_iff_kind_product",
            )
        ]

    def __str__(self):
        return f"ShareLink({self.kind}, {self.short_id})"


class Lead(models.Model):
    merchant = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="leads")
    wa_number = models.CharField(max_length=20)  # E.164, e.g. +2348127778036
    name = models.CharField(max_length=80, blank=True)
    first_seen_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["merchant", "wa_number"], name="lead_unique_per_merchant_number"),
        ]
        indexes = [
            models.Index(fields=["merchant", "-last_seen_at"], name="lead_merchant_lastseen_idx"),
        ]

    def __str__(self):
        return f"Lead({self.wa_number})"


class ClickEvent(models.Model):
    EVENT_TYPES = [("submit", "Submit"), ("view", "View")]

    share_link = models.ForeignKey(ShareLink, on_delete=models.CASCADE, related_name="click_events")
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name="click_events")
    event_type = models.CharField(max_length=10, choices=EVENT_TYPES)
    occurred_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip = models.CharField(max_length=64, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["share_link", "-occurred_at"], name="clickevent_link_occurred_idx"),
            models.Index(fields=["lead", "-occurred_at"], name="clickevent_lead_occurred_idx"),
        ]

    def __str__(self):
        return f"ClickEvent({self.event_type}, {self.occurred_at})"


class StoreSlugAlias(models.Model):
    slug = models.SlugField(max_length=40, unique=True, db_index=True)
    business_details = models.ForeignKey(
        "accounts.BusinessDetails",
        on_delete=models.CASCADE,
        related_name="slug_aliases",
    )
    is_current = models.BooleanField(default=False)
    retired_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            # Partial unique: only one current alias per merchant.
            models.UniqueConstraint(
                fields=["business_details"],
                condition=models.Q(is_current=True),
                name="storeslugalias_one_current_per_business",
            )
        ]

    def __str__(self):
        return f"StoreSlugAlias({self.slug}, current={self.is_current})"
```

- [ ] **Step 5: Generate schema migration**

```bash
python manage.py makemigrations accounts --name share_links_leads_clicks_aliases
```

Expected: writes `accounts/migrations/0009_share_links_leads_clicks_aliases.py`.

- [ ] **Step 6: Add data backfill operation to the migration**

Edit the new migration file. After the `migrations.CreateModel(...)` operations, append:

```python
    def backfill(apps, schema_editor):
        BusinessDetails = apps.get_model("accounts", "BusinessDetails")
        Products = apps.get_model("accounts", "Products")
        ShareLink = apps.get_model("accounts", "ShareLink")
        StoreSlugAlias = apps.get_model("accounts", "StoreSlugAlias")
        import secrets

        def short_id():
            for _ in range(5):
                candidate = secrets.token_urlsafe(6)
                if not ShareLink.objects.filter(short_id=candidate).exists():
                    return candidate
            raise RuntimeError("Could not generate unique short_id after 5 attempts")

        for biz in BusinessDetails.objects.all():
            StoreSlugAlias.objects.get_or_create(
                slug=biz.store_slug,
                defaults={"business_details": biz, "is_current": True},
            )
            ShareLink.objects.get_or_create(
                kind="store",
                product=None,
                merchant=biz.user,
                defaults={"short_id": short_id(), "is_active": True},
            )

        for product in Products.objects.all():
            ShareLink.objects.get_or_create(
                kind="product",
                product=product,
                merchant=product.user,
                defaults={"short_id": short_id(), "is_active": True},
            )

    operations.append(migrations.RunPython(backfill, reverse_code=migrations.RunPython.noop))
```

Note: the `operations.append(...)` call is conceptual — in practice, add `migrations.RunPython(backfill, reverse_code=migrations.RunPython.noop)` as the last entry in the `operations = [...]` list directly. Move the `def backfill(...)` function above the `class Migration:` declaration.

- [ ] **Step 7: Register models in admin**

In `accounts/admin.py` append:

```python
from .models import ShareLink, Lead, ClickEvent, StoreSlugAlias

admin.site.register(ShareLink)
admin.site.register(Lead)
admin.site.register(ClickEvent)
admin.site.register(StoreSlugAlias)
```

- [ ] **Step 8: Run migration + tests**

```bash
python manage.py migrate
python manage.py test accounts.tests.test_share_link_models -v 2
```

Expected: migration runs clean, three test methods pass.

- [ ] **Step 9: Commit**

```bash
git add accounts/models.py accounts/admin.py accounts/migrations/0009_share_links_leads_clicks_aliases.py accounts/tests/
git commit -m "feat(share-links): add ShareLink, Lead, ClickEvent, StoreSlugAlias models + backfill migration"
```

---

## Task 2: Utility modules — lead tokens, slug validation, phone

**Goal:** Three small, well-tested utility modules used across the API layer.

**Files:**
- Create: `Buzzmart_backend/accounts/lead_tokens.py`
- Create: `Buzzmart_backend/accounts/slug_validation.py`
- Create: `Buzzmart_backend/accounts/phone.py`
- Create: `Buzzmart_backend/accounts/tests/test_lead_tokens.py`
- Create: `Buzzmart_backend/accounts/tests/test_slug_validation.py`
- Create: `Buzzmart_backend/accounts/tests/test_phone.py`

**Acceptance Criteria:**
- [ ] `lead_tokens.sign(lead_id, merchant_id, ttl_seconds)` returns a URL-safe string; `verify(token)` returns `(lead_id, merchant_id)` or raises on bad signature / expired / malformed
- [ ] `slug_validation.validate(slug)` returns `(ok: bool, reason: str | None)`; reasons: `"format"`, `"reserved"`
- [ ] `slug_validation.RESERVED` exact set from spec
- [ ] `slug_validation.suggest(slug, taken_set)` returns 3 deterministic variants (`slug-2`, `slug-ng`, `slug-tech`) skipping any already in `taken_set`
- [ ] `phone.normalize(raw, default_region="NG")` returns E.164 string or raises `ValueError` on invalid

**Verify:** `python manage.py test accounts.tests.test_lead_tokens accounts.tests.test_slug_validation accounts.tests.test_phone -v 2`

**Steps:**

- [ ] **Step 1: Write failing test `accounts/tests/test_lead_tokens.py`**

```python
import time
from django.test import TestCase, override_settings
from accounts.lead_tokens import sign, verify, BadToken


@override_settings(LEAD_TOKEN_SECRET="test-secret-do-not-use")
class LeadTokenTests(TestCase):
    def test_sign_verify_roundtrip(self):
        token = sign(lead_id=42, merchant_id=7, ttl_seconds=60)
        lead_id, merchant_id = verify(token)
        self.assertEqual(lead_id, 42)
        self.assertEqual(merchant_id, 7)

    def test_tampered_signature_rejected(self):
        token = sign(lead_id=42, merchant_id=7, ttl_seconds=60)
        tampered = token[:-1] + ("A" if token[-1] != "A" else "B")
        with self.assertRaises(BadToken):
            verify(tampered)

    def test_expired_token_rejected(self):
        token = sign(lead_id=42, merchant_id=7, ttl_seconds=-1)
        with self.assertRaises(BadToken):
            verify(token)

    def test_malformed_token_rejected(self):
        with self.assertRaises(BadToken):
            verify("not-a-real-token")
```

- [ ] **Step 2: Implement `accounts/lead_tokens.py`**

```python
"""HMAC-signed tokens for the bz_lead cookie."""
import base64
import hashlib
import hmac
import time
from django.conf import settings


class BadToken(Exception):
    pass


def _hmac(payload: bytes) -> bytes:
    return hmac.new(
        settings.LEAD_TOKEN_SECRET.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).digest()


def sign(lead_id: int, merchant_id: int, ttl_seconds: int) -> str:
    expiry = int(time.time()) + ttl_seconds
    payload = f"{lead_id}|{merchant_id}|{expiry}".encode("utf-8")
    sig = _hmac(payload)
    blob = base64.urlsafe_b64encode(payload).decode("ascii") + "." + base64.urlsafe_b64encode(sig).decode("ascii")
    return blob


def verify(token: str) -> tuple[int, int]:
    try:
        payload_b64, sig_b64 = token.split(".", 1)
        payload = base64.urlsafe_b64decode(payload_b64.encode("ascii"))
        sig = base64.urlsafe_b64decode(sig_b64.encode("ascii"))
    except (ValueError, base64.binascii.Error) as e:
        raise BadToken("malformed") from e

    if not hmac.compare_digest(_hmac(payload), sig):
        raise BadToken("signature")

    try:
        lead_id_s, merchant_id_s, expiry_s = payload.decode("utf-8").split("|")
        lead_id, merchant_id, expiry = int(lead_id_s), int(merchant_id_s), int(expiry_s)
    except (ValueError, UnicodeDecodeError) as e:
        raise BadToken("payload") from e

    if expiry < int(time.time()):
        raise BadToken("expired")

    return lead_id, merchant_id
```

- [ ] **Step 3: Run lead-tokens tests**

```bash
python manage.py test accounts.tests.test_lead_tokens -v 2
```

Expected: 4 tests pass.

- [ ] **Step 4: Write failing test `accounts/tests/test_slug_validation.py`**

```python
from django.test import TestCase
from accounts.slug_validation import validate, suggest, RESERVED


class SlugValidationTests(TestCase):
    def test_valid_slugs(self):
        for s in ["aunty-bola", "abc", "a1-b2-c3", "x" * 40]:
            ok, reason = validate(s)
            self.assertTrue(ok, msg=f"{s!r} should be valid (got {reason!r})")

    def test_invalid_format(self):
        for s in ["", "ab", "x" * 41, "-foo", "foo-", "foo--bar", "Foo", "foo_bar", "foo.bar", "fóó"]:
            ok, reason = validate(s)
            self.assertFalse(ok, msg=f"{s!r} should be invalid")
            self.assertEqual(reason, "format")

    def test_reserved_words(self):
        for s in RESERVED:
            ok, reason = validate(s)
            self.assertFalse(ok)
            self.assertEqual(reason, "reserved")

    def test_suggestions_skip_taken(self):
        suggestions = suggest("foo", taken_set={"foo-2"})
        self.assertEqual(len(suggestions), 3)
        self.assertNotIn("foo-2", suggestions)
```

- [ ] **Step 5: Implement `accounts/slug_validation.py`**

```python
"""Slug format + reserved-word validation."""
import re

RESERVED = frozenset({
    "admin", "api", "auth", "login", "register", "setup", "manage",
    "marketplace", "orders", "leads", "notifications", "p", "s", "store",
    "dispatch", "www", "mail", "static", "media", "_next",
})

_FORMAT = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def validate(slug: str) -> tuple[bool, str | None]:
    if not slug or len(slug) < 3 or len(slug) > 40:
        return False, "format"
    if not _FORMAT.match(slug):
        return False, "format"
    if slug in RESERVED:
        return False, "reserved"
    return True, None


def suggest(slug: str, taken_set: set[str]) -> list[str]:
    """Three deterministic variants, skipping any already taken."""
    candidates = [f"{slug}-2", f"{slug}-ng", f"{slug}-tech", f"{slug}-3", f"{slug}-store"]
    out: list[str] = []
    for c in candidates:
        if c in taken_set:
            continue
        ok, _ = validate(c)
        if ok:
            out.append(c)
        if len(out) == 3:
            break
    return out
```

- [ ] **Step 6: Run slug tests**

```bash
python manage.py test accounts.tests.test_slug_validation -v 2
```

Expected: 4 tests pass.

- [ ] **Step 7: Write failing test `accounts/tests/test_phone.py`**

```python
from django.test import TestCase
from accounts.phone import normalize, InvalidPhone


class PhoneNormalizationTests(TestCase):
    def test_local_ng_number(self):
        self.assertEqual(normalize("08127778036"), "+2348127778036")

    def test_e164_passthrough(self):
        self.assertEqual(normalize("+2348127778036"), "+2348127778036")

    def test_strips_whitespace(self):
        self.assertEqual(normalize(" 0812 777 8036 "), "+2348127778036")

    def test_invalid_raises(self):
        with self.assertRaises(InvalidPhone):
            normalize("hello")

    def test_too_short_raises(self):
        with self.assertRaises(InvalidPhone):
            normalize("123")
```

- [ ] **Step 8: Implement `accounts/phone.py`**

```python
"""E.164 normalization of WhatsApp numbers, default NG."""
import phonenumbers


class InvalidPhone(ValueError):
    pass


def normalize(raw: str, default_region: str = "NG") -> str:
    if not raw or not isinstance(raw, str):
        raise InvalidPhone("empty")
    try:
        parsed = phonenumbers.parse(raw.strip(), default_region)
    except phonenumbers.NumberParseException as e:
        raise InvalidPhone(str(e)) from e
    if not phonenumbers.is_valid_number(parsed):
        raise InvalidPhone("invalid")
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
```

- [ ] **Step 9: Run phone tests**

```bash
python manage.py test accounts.tests.test_phone -v 2
```

Expected: 5 tests pass.

- [ ] **Step 10: Commit**

```bash
git add accounts/lead_tokens.py accounts/slug_validation.py accounts/phone.py accounts/tests/
git commit -m "feat(share-links): add lead-token, slug-validation, phone utility modules"
```

---

## Task 3: Auto-create ShareLink on Product / BusinessDetails save

**Goal:** Django signal handlers that ensure every Product and every BusinessDetails has a corresponding ShareLink at all times (without any callsite changes).

**Files:**
- Modify: `Buzzmart_backend/accounts/signals.py`
- Modify: `Buzzmart_backend/accounts/apps.py` (ensure signals are imported on app ready)
- Modify: `Buzzmart_backend/accounts/tests/test_share_link_models.py` (add signal tests)

**Acceptance Criteria:**
- [ ] Creating a `Products` instance auto-creates a `ShareLink(kind="product")`
- [ ] Creating a `BusinessDetails` instance auto-creates a `ShareLink(kind="store")` AND a `StoreSlugAlias(is_current=True)`
- [ ] Saving an existing instance does NOT create duplicates (`get_or_create`)
- [ ] Tests pass

**Verify:** `python manage.py test accounts.tests.test_share_link_models -v 2`

**Steps:**

- [ ] **Step 1: Inspect existing `accounts/signals.py`**

```bash
cat /Users/lordamola/company-repos/data-totems/Buzzmart_backend/accounts/signals.py
```

Note current contents (per the design audit, this file already exists with 9 lines from the `notification` app's signals — reuse the pattern, don't replace).

- [ ] **Step 2: Append signal handlers**

In `accounts/signals.py`, add:

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Products, BusinessDetails, ShareLink, StoreSlugAlias


@receiver(post_save, sender=Products)
def ensure_product_share_link(sender, instance, created, **kwargs):
    if not created:
        return
    ShareLink.objects.get_or_create(
        kind="product",
        product=instance,
        merchant=instance.user,
    )


@receiver(post_save, sender=BusinessDetails)
def ensure_business_share_link_and_alias(sender, instance, created, **kwargs):
    if not created:
        return
    ShareLink.objects.get_or_create(
        kind="store",
        product=None,
        merchant=instance.user,
    )
    StoreSlugAlias.objects.get_or_create(
        slug=instance.store_slug,
        defaults={"business_details": instance, "is_current": True},
    )
```

- [ ] **Step 3: Make sure signals are loaded — check `accounts/apps.py`**

```bash
cat accounts/apps.py
```

If it doesn't already have a `ready()` method importing `signals`, add:

```python
class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        from . import signals  # noqa: F401
```

- [ ] **Step 4: Add signal tests to `accounts/tests/test_share_link_models.py`**

```python
class AutoShareLinkSignalTests(TestCase):
    def test_creating_product_creates_share_link(self):
        merchant = User.objects.create_user(email="m@x.com", password="x")
        product = Products.objects.create(user=merchant, name="P", price=10, description="d")
        links = ShareLink.objects.filter(kind="product", product=product)
        self.assertEqual(links.count(), 1)

    def test_creating_business_creates_store_link_and_alias(self):
        merchant = User.objects.create_user(email="m@x.com", password="x")
        biz = BusinessDetails.objects.create(user=merchant, business_name="X", store_slug="x-shop")
        store_links = ShareLink.objects.filter(kind="store", merchant=merchant)
        aliases = StoreSlugAlias.objects.filter(business_details=biz, is_current=True)
        self.assertEqual(store_links.count(), 1)
        self.assertEqual(aliases.count(), 1)
        self.assertEqual(aliases.first().slug, "x-shop")

    def test_re_saving_does_not_duplicate(self):
        merchant = User.objects.create_user(email="m@x.com", password="x")
        product = Products.objects.create(user=merchant, name="P", price=10, description="d")
        product.name = "P2"
        product.save()
        self.assertEqual(ShareLink.objects.filter(product=product).count(), 1)
```

- [ ] **Step 5: Run tests**

```bash
python manage.py test accounts.tests.test_share_link_models -v 2
```

Expected: 6 tests pass (3 from Task 1 + 3 new).

- [ ] **Step 6: Commit**

```bash
git add accounts/signals.py accounts/apps.py accounts/tests/
git commit -m "feat(share-links): auto-create ShareLink + StoreSlugAlias on Product/BusinessDetails save"
```

---

## Task 4: GET /api/share-links/<short_id>/resolve/ endpoint

**Goal:** Public endpoint that returns merchant + product info for a given short_id, used by the Next.js interstitial page to render OG meta + form.

**Files:**
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/serializers.py`
- Modify: `Buzzmart_backend/accounts/urls.py`
- Create: `Buzzmart_backend/accounts/tests/test_share_link_api.py`

**Acceptance Criteria:**
- [ ] `GET /api/share-links/<short_id>/resolve/` returns 200 with `{kind, merchant, product?}` for active product links
- [ ] Returns 200 with `{kind: "store", merchant, product: null}` for active store links
- [ ] Returns 404 for unknown short_id
- [ ] Returns 404 when `is_active=false`
- [ ] No auth required (AllowAny)
- [ ] Includes `merchant.business_name`, `merchant.store_slug`, `merchant.display_picture` (all nullable)

**Verify:** `python manage.py test accounts.tests.test_share_link_api.ShareLinkResolveTests -v 2`

**Steps:**

- [ ] **Step 1: Write failing test `accounts/tests/test_share_link_api.py`**

```python
from rest_framework.test import APITestCase
from accounts.models import User, Products, BusinessDetails, ShareLink


class ShareLinkResolveTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        self.biz = BusinessDetails.objects.create(
            user=self.merchant, business_name="X Shop", store_slug="x-shop",
            business_description="best shop", business_email="x@x.com",
        )
        self.product = Products.objects.create(
            user=self.merchant, name="Phone X", price="85000", description="great phone",
        )
        # Signal-created links from Tasks 1 + 3
        self.product_link = ShareLink.objects.get(kind="product", product=self.product)
        self.store_link = ShareLink.objects.get(kind="store", merchant=self.merchant)

    def test_resolve_product_link(self):
        url = f"/api/share-links/{self.product_link.short_id}/resolve/"
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["kind"], "product")
        self.assertEqual(res.data["product"]["name"], "Phone X")
        self.assertEqual(res.data["merchant"]["business_name"], "X Shop")

    def test_resolve_store_link(self):
        url = f"/api/share-links/{self.store_link.short_id}/resolve/"
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["kind"], "store")
        self.assertIsNone(res.data["product"])

    def test_resolve_unknown_returns_404(self):
        res = self.client.get("/api/share-links/zzznotreal/resolve/")
        self.assertEqual(res.status_code, 404)

    def test_resolve_inactive_returns_404(self):
        self.product_link.is_active = False
        self.product_link.save()
        url = f"/api/share-links/{self.product_link.short_id}/resolve/"
        self.assertEqual(self.client.get(url).status_code, 404)
```

- [ ] **Step 2: Run test to confirm failure**

```bash
python manage.py test accounts.tests.test_share_link_api.ShareLinkResolveTests -v 2
```

Expected: 4 tests fail with 404 (URL not wired yet).

- [ ] **Step 3: Add serializer in `accounts/serializers.py`**

Append:

```python
from .models import ShareLink


class _ResolveMerchantSerializer(serializers.Serializer):
    business_name = serializers.SerializerMethodField()
    store_slug = serializers.SerializerMethodField()
    display_picture = serializers.SerializerMethodField()

    def get_business_name(self, merchant):
        biz = getattr(merchant, "businessdetails", None)
        return biz.business_name if biz else None

    def get_store_slug(self, merchant):
        biz = getattr(merchant, "businessdetails", None)
        return biz.store_slug if biz else None

    def get_display_picture(self, merchant):
        profile = getattr(merchant, "profile", None)
        if not profile or not profile.display_picture:
            return None
        request = self.context.get("request")
        url = profile.display_picture.url
        return request.build_absolute_uri(url) if request else url


class _ResolveProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    primary_image = serializers.SerializerMethodField()
    description = serializers.CharField()

    def get_primary_image(self, product):
        request = self.context.get("request")
        first = product.images.filter(position="front").first() or product.images.first()
        if not first or not first.image:
            return None
        url = first.image.url
        return request.build_absolute_uri(url) if request else url


class ShareLinkResolveSerializer(serializers.Serializer):
    kind = serializers.CharField()
    merchant = _ResolveMerchantSerializer()
    product = _ResolveProductSerializer(allow_null=True)
```

(Note: model + serializer field names like `images`, `position`, `profile`, `businessdetails` are the existing relationships from the current schema — confirm with `python manage.py shell -c "from accounts.models import User; print(dir(User()))"` if any look off.)

- [ ] **Step 4: Add view in `accounts/views.py`**

Append:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import ShareLink
from .serializers import ShareLinkResolveSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def share_link_resolve(request, short_id):
    link = get_object_or_404(ShareLink, short_id=short_id, is_active=True)
    payload = {
        "kind": link.kind,
        "merchant": link.merchant,
        "product": link.product if link.kind == "product" else None,
    }
    serializer = ShareLinkResolveSerializer(payload, context={"request": request})
    return Response(serializer.data)
```

- [ ] **Step 5: Wire URL in `accounts/urls.py`**

Add to `urlpatterns`:

```python
path("share-links/<str:short_id>/resolve/", views.share_link_resolve, name="share-link-resolve"),
```

Then update `buzzmart/urls.py` if `share-links/` isn't yet routed — verify it lives under `api/accounts/`:

Actually re-route under a top-level `share-links/` namespace to keep `/api/share-links/...` URLs clean. In `buzzmart/urls.py` add:

```python
path("api/share-links/", include("accounts.urls_share_links")),
```

Create `accounts/urls_share_links.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("<str:short_id>/resolve/", views.share_link_resolve, name="share-link-resolve"),
]
```

- [ ] **Step 6: Run tests**

```bash
python manage.py test accounts.tests.test_share_link_api.ShareLinkResolveTests -v 2
```

Expected: 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add accounts/views.py accounts/serializers.py accounts/urls_share_links.py buzzmart/urls.py accounts/tests/
git commit -m "feat(share-links): add GET /api/share-links/<short_id>/resolve/"
```

---

## Task 5: POST /api/share-links/<short_id>/identify/ endpoint

**Goal:** Public endpoint that captures the visitor's WhatsApp number, creates/updates a `Lead`, records a `ClickEvent`, and returns a signed `lead_token` + redirect URL.

**Files:**
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/serializers.py`
- Modify: `Buzzmart_backend/accounts/urls_share_links.py`
- Modify: `Buzzmart_backend/accounts/tests/test_share_link_api.py`

**Acceptance Criteria:**
- [ ] `POST /identify/` with `{wa_number}` creates Lead + ClickEvent(submit), returns `{lead_token, redirect_to}`
- [ ] WA number normalized to E.164 server-side; bad format → 400
- [ ] Subsequent POST with valid `lead_token` matching the merchant: creates ClickEvent(view), updates `last_seen_at`, returns fresh token (no new Lead)
- [ ] POST with `lead_token` from a *different* merchant: treats as no-token, creates new Lead for the current merchant
- [ ] POST with tampered `lead_token`: treats as no-token, creates new Lead
- [ ] Inactive share link → 404
- [ ] `redirect_to` for product links: `/store/<slug>/<product_uuid>`; for store links: `/store/<slug>`

**Verify:** `python manage.py test accounts.tests.test_share_link_api.ShareLinkIdentifyTests -v 2`

**Steps:**

- [ ] **Step 1: Write failing tests**

Append to `accounts/tests/test_share_link_api.py`:

```python
from django.test import override_settings
from accounts.models import Lead, ClickEvent
from accounts.lead_tokens import sign


@override_settings(LEAD_TOKEN_SECRET="test-secret-do-not-use")
class ShareLinkIdentifyTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        self.biz = BusinessDetails.objects.create(
            user=self.merchant, business_name="X Shop", store_slug="x-shop",
            business_description="d", business_email="x@x.com",
        )
        self.product = Products.objects.create(
            user=self.merchant, name="Phone", price="100", description="d",
        )
        self.product_link = ShareLink.objects.get(kind="product", product=self.product)
        self.store_link = ShareLink.objects.get(kind="store", merchant=self.merchant)

    def test_identify_creates_lead_and_submit_event(self):
        url = f"/api/share-links/{self.product_link.short_id}/identify/"
        res = self.client.post(url, {"wa_number": "08127778036", "name": "Ade"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertIn("lead_token", res.data)
        self.assertEqual(res.data["redirect_to"], f"/store/x-shop/{self.product.product_id}")
        lead = Lead.objects.get(merchant=self.merchant)
        self.assertEqual(lead.wa_number, "+2348127778036")
        self.assertEqual(lead.name, "Ade")
        self.assertEqual(ClickEvent.objects.filter(lead=lead, event_type="submit").count(), 1)

    def test_identify_with_valid_token_records_view_not_submit(self):
        # First identify creates the lead
        url = f"/api/share-links/{self.product_link.short_id}/identify/"
        first = self.client.post(url, {"wa_number": "08127778036"}, format="json")
        token = first.data["lead_token"]
        lead = Lead.objects.get(merchant=self.merchant)
        # Second identify with the token
        second = self.client.post(url, {"wa_number": "irrelevant", "lead_token": token}, format="json")
        self.assertEqual(second.status_code, 200)
        events = ClickEvent.objects.filter(lead=lead)
        self.assertEqual(events.filter(event_type="submit").count(), 1)
        self.assertEqual(events.filter(event_type="view").count(), 1)

    def test_identify_with_cross_merchant_token_creates_new_lead(self):
        other_merchant = User.objects.create_user(email="b@x.com", password="x")
        other_lead = Lead.objects.create(merchant=other_merchant, wa_number="+2348000000000")
        bad_token = sign(other_lead.id, other_merchant.id, ttl_seconds=300)
        url = f"/api/share-links/{self.product_link.short_id}/identify/"
        res = self.client.post(url, {"wa_number": "08127778036", "lead_token": bad_token}, format="json")
        self.assertEqual(res.status_code, 200)
        # New Lead for OUR merchant, the cross-merchant lead is untouched
        self.assertTrue(Lead.objects.filter(merchant=self.merchant, wa_number="+2348127778036").exists())
        self.assertEqual(ClickEvent.objects.filter(event_type="submit").count(), 1)

    def test_invalid_wa_number_400(self):
        url = f"/api/share-links/{self.product_link.short_id}/identify/"
        res = self.client.post(url, {"wa_number": "not-a-phone"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_inactive_link_404(self):
        self.product_link.is_active = False
        self.product_link.save()
        url = f"/api/share-links/{self.product_link.short_id}/identify/"
        res = self.client.post(url, {"wa_number": "08127778036"}, format="json")
        self.assertEqual(res.status_code, 404)

    def test_store_link_redirect_target(self):
        url = f"/api/share-links/{self.store_link.short_id}/identify/"
        res = self.client.post(url, {"wa_number": "08127778036"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["redirect_to"], "/store/x-shop")
```

- [ ] **Step 2: Add identify view to `accounts/views.py`**

```python
from django.db import transaction
from .lead_tokens import sign as sign_lead_token, verify as verify_lead_token, BadToken
from .phone import normalize as normalize_phone, InvalidPhone
from .models import Lead, ClickEvent

LEAD_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 90  # 90 days


def _client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


@api_view(["POST"])
@permission_classes([AllowAny])
def share_link_identify(request, short_id):
    link = get_object_or_404(ShareLink, short_id=short_id, is_active=True)

    # Try the existing cookie token first.
    incoming_token = request.data.get("lead_token") or ""
    matched_lead = None
    if incoming_token:
        try:
            lead_id, merchant_id = verify_lead_token(incoming_token)
            if merchant_id == link.merchant_id:
                matched_lead = Lead.objects.filter(id=lead_id, merchant_id=merchant_id).first()
        except BadToken:
            matched_lead = None

    if matched_lead:
        with transaction.atomic():
            matched_lead.save()  # bumps last_seen_at via auto_now
            ClickEvent.objects.create(
                share_link=link, lead=matched_lead, event_type="view",
                ip=_client_ip(request), user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
            )
        new_token = sign_lead_token(matched_lead.id, link.merchant_id, LEAD_TOKEN_TTL_SECONDS)
        return Response({"lead_token": new_token, "redirect_to": _redirect_target(link)})

    # No usable token — require wa_number.
    raw_wa = (request.data.get("wa_number") or "").strip()
    name = (request.data.get("name") or "").strip()[:80]
    if not raw_wa:
        return Response({"wa_number": ["This field is required."]}, status=400)
    try:
        wa = normalize_phone(raw_wa)
    except InvalidPhone:
        return Response({"wa_number": ["Invalid WhatsApp number format."]}, status=400)

    with transaction.atomic():
        lead, created = Lead.objects.get_or_create(
            merchant=link.merchant,
            wa_number=wa,
            defaults={"name": name},
        )
        if not created and name and not lead.name:
            lead.name = name
            lead.save()
        ClickEvent.objects.create(
            share_link=link, lead=lead, event_type="submit",
            ip=_client_ip(request), user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
        )

    token = sign_lead_token(lead.id, link.merchant_id, LEAD_TOKEN_TTL_SECONDS)
    return Response({"lead_token": token, "redirect_to": _redirect_target(link)})


def _redirect_target(link):
    biz = link.merchant.businessdetails
    if link.kind == "product":
        return f"/store/{biz.store_slug}/{link.product.product_id}"
    return f"/store/{biz.store_slug}"
```

- [ ] **Step 3: Wire URL**

In `accounts/urls_share_links.py`, append to `urlpatterns`:

```python
path("<str:short_id>/identify/", views.share_link_identify, name="share-link-identify"),
```

- [ ] **Step 4: Run tests**

```bash
python manage.py test accounts.tests.test_share_link_api.ShareLinkIdentifyTests -v 2
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add accounts/views.py accounts/urls_share_links.py accounts/tests/
git commit -m "feat(share-links): add POST /api/share-links/<short_id>/identify/"
```

---

## Task 6: Slug-alias resolution on public `/store/<slug>/` + `/store/<slug>/<uuid>/`

**Goal:** When a visitor hits an old (retired) slug, 301-redirect them to the current slug for that merchant. Unknown slugs still 404.

**Files:**
- Modify: `Buzzmart_backend/accounts/views.py` (existing `get_merchant_store` view)
- Modify: `Buzzmart_backend/products/views.py` (existing `get_product_by_uuid` view)
- Create: `Buzzmart_backend/accounts/tests/test_store_alias_routing.py`

**Acceptance Criteria:**
- [ ] `GET /store/<current_slug>/` → 200 with merchant data (current behavior preserved)
- [ ] `GET /store/<retired_slug>/` → 301 to `/store/<current_slug>/`
- [ ] `GET /store/<unknown_slug>/` → 404
- [ ] `GET /store/<retired_slug>/<uuid>/` → 301 to `/store/<current_slug>/<uuid>/` (preserves uuid path)

**Verify:** `python manage.py test accounts.tests.test_store_alias_routing -v 2`

**Steps:**

- [ ] **Step 1: Write failing test**

`accounts/tests/test_store_alias_routing.py`:

```python
from rest_framework.test import APITestCase
from django.utils import timezone
from accounts.models import User, Products, BusinessDetails, StoreSlugAlias


class StoreSlugAliasRoutingTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        self.biz = BusinessDetails.objects.create(
            user=self.merchant, business_name="X", store_slug="new-slug",
            business_description="d", business_email="x@x.com",
        )
        # signal already created an alias for new-slug.
        # Pre-create a retired alias from a previous slug.
        StoreSlugAlias.objects.create(
            slug="old-slug", business_details=self.biz, is_current=False,
            retired_at=timezone.now(),
        )
        self.product = Products.objects.create(
            user=self.merchant, name="P", price="10", description="d",
        )

    def test_current_slug_returns_200(self):
        res = self.client.get("/store/new-slug/")
        self.assertEqual(res.status_code, 200)

    def test_retired_slug_redirects_301(self):
        res = self.client.get("/store/old-slug/")
        self.assertEqual(res.status_code, 301)
        self.assertEqual(res["Location"], "/store/new-slug/")

    def test_unknown_slug_404s(self):
        self.assertEqual(self.client.get("/store/bogus/").status_code, 404)

    def test_retired_slug_with_uuid_redirects_preserving_path(self):
        res = self.client.get(f"/store/old-slug/{self.product.product_id}/")
        self.assertEqual(res.status_code, 301)
        self.assertEqual(res["Location"], f"/store/new-slug/{self.product.product_id}/")
```

- [ ] **Step 2: Modify `accounts/views.py` — wrap `get_merchant_store`**

Find the existing `get_merchant_store(request, store_slug)` view. Wrap its body so alias lookup happens first:

```python
from django.http import HttpResponseRedirect
from .models import StoreSlugAlias


def get_merchant_store(request, store_slug):
    alias = StoreSlugAlias.objects.select_related("business_details").filter(slug=store_slug).first()
    if not alias:
        return Response({"detail": "Store not found."}, status=404)
    if not alias.is_current:
        current = alias.business_details.store_slug
        return HttpResponseRedirect(f"/store/{current}/", status=301)
    # ... existing implementation continues below this line ...
```

Replace the original function body with this guard prepended. The rest of the existing rendering logic stays intact.

- [ ] **Step 3: Modify `products/views.py` — wrap `get_product_by_uuid`**

Same pattern. Add at the top of the function:

```python
def get_product_by_uuid(request, store_slug, product_uuid):
    alias = StoreSlugAlias.objects.select_related("business_details").filter(slug=store_slug).first()
    if not alias:
        return Response({"detail": "Store not found."}, status=404)
    if not alias.is_current:
        current = alias.business_details.store_slug
        return HttpResponseRedirect(f"/store/{current}/{product_uuid}/", status=301)
    # ... existing implementation continues ...
```

Add the imports at the top of `products/views.py`:

```python
from django.http import HttpResponseRedirect
from accounts.models import StoreSlugAlias
```

- [ ] **Step 4: Run tests**

```bash
python manage.py test accounts.tests.test_store_alias_routing -v 2
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add accounts/views.py products/views.py accounts/tests/test_store_alias_routing.py
git commit -m "feat(share-links): alias-aware resolution on /store/<slug>/ with 301 to current"
```

---

## Task 7: Merchant slug endpoints — PATCH + availability check

**Goal:** Two endpoints — atomic slug swap (creates new alias, retires old) and a debounced availability check used by the SlugInput component.

**Files:**
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/serializers.py`
- Modify: `Buzzmart_backend/accounts/urls.py`
- Create: `Buzzmart_backend/accounts/tests/test_slug_api.py`

**Acceptance Criteria:**
- [ ] `PATCH /api/accounts/business/slug/` with `{slug}`: atomic update — retire old alias (`is_current=false, retired_at=now()`), create new alias (`is_current=true`), update `BusinessDetails.store_slug`, return `{slug, store_url, aliases: [...]}`
- [ ] Returns 400 with `{slug: ["already in use"]}` if requested slug exists in ANY alias row (current or retired)
- [ ] Returns 400 with `{slug: ["reserved"]}` for reserved words
- [ ] Returns 400 with `{slug: ["invalid format"]}` for format violations
- [ ] `GET /api/accounts/business/slug/check/?slug=foo` returns `{available, reason?, suggestions?}`
- [ ] Suggestions only included when `available=false reason=taken`
- [ ] Requires auth (existing IsAuthenticated)

**Verify:** `python manage.py test accounts.tests.test_slug_api -v 2`

**Steps:**

- [ ] **Step 1: Write failing test `accounts/tests/test_slug_api.py`**

```python
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from accounts.models import User, BusinessDetails, StoreSlugAlias


class SlugUpdateTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        self.biz = BusinessDetails.objects.create(
            user=self.merchant, business_name="X", store_slug="old-slug",
            business_description="d", business_email="x@x.com",
        )
        token = Token.objects.create(user=self.merchant)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_update_creates_new_alias_and_retires_old(self):
        res = self.client.patch("/api/accounts/business/slug/", {"slug": "new-slug"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["slug"], "new-slug")
        self.biz.refresh_from_db()
        self.assertEqual(self.biz.store_slug, "new-slug")
        self.assertTrue(StoreSlugAlias.objects.filter(slug="new-slug", is_current=True).exists())
        old = StoreSlugAlias.objects.get(slug="old-slug")
        self.assertFalse(old.is_current)
        self.assertIsNotNone(old.retired_at)

    def test_duplicate_against_active_alias_rejected(self):
        other = User.objects.create_user(email="o@x.com", password="x")
        BusinessDetails.objects.create(
            user=other, business_name="O", store_slug="taken-slug",
            business_description="d", business_email="o@x.com",
        )
        res = self.client.patch("/api/accounts/business/slug/", {"slug": "taken-slug"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("already in use", res.data["slug"][0])

    def test_duplicate_against_retired_alias_rejected(self):
        StoreSlugAlias.objects.create(slug="retired-slug", business_details=self.biz, is_current=False)
        res = self.client.patch("/api/accounts/business/slug/", {"slug": "retired-slug"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_reserved_word_rejected(self):
        res = self.client.patch("/api/accounts/business/slug/", {"slug": "admin"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("reserved", res.data["slug"][0])

    def test_format_invalid_rejected(self):
        res = self.client.patch("/api/accounts/business/slug/", {"slug": "Bad_Slug"}, format="json")
        self.assertEqual(res.status_code, 400)


class SlugCheckTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        self.biz = BusinessDetails.objects.create(
            user=self.merchant, business_name="X", store_slug="x-shop",
            business_description="d", business_email="x@x.com",
        )
        token = Token.objects.create(user=self.merchant)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_available(self):
        res = self.client.get("/api/accounts/business/slug/check/?slug=free-slug")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["available"])

    def test_taken_returns_suggestions(self):
        res = self.client.get("/api/accounts/business/slug/check/?slug=x-shop")
        self.assertFalse(res.data["available"])
        self.assertEqual(res.data["reason"], "taken")
        self.assertEqual(len(res.data["suggestions"]), 3)

    def test_reserved_returns_reason(self):
        res = self.client.get("/api/accounts/business/slug/check/?slug=admin")
        self.assertFalse(res.data["available"])
        self.assertEqual(res.data["reason"], "reserved")
```

- [ ] **Step 2: Add views to `accounts/views.py`**

```python
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone
from .models import StoreSlugAlias
from .slug_validation import validate as validate_slug, suggest as suggest_slug, RESERVED


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_business_slug(request):
    raw = (request.data.get("slug") or "").strip().lower()
    ok, reason = validate_slug(raw)
    if not ok:
        msg = {"format": "invalid format", "reserved": "reserved"}[reason]
        return Response({"slug": [msg]}, status=400)

    biz = getattr(request.user, "businessdetails", None)
    if not biz:
        return Response({"detail": "Business details not found."}, status=404)

    # Cross-check ALL aliases (current + retired) for uniqueness.
    if StoreSlugAlias.objects.filter(slug=raw).exclude(business_details=biz, is_current=True).exists():
        return Response({"slug": ["already in use"]}, status=400)

    with transaction.atomic():
        StoreSlugAlias.objects.filter(business_details=biz, is_current=True).update(
            is_current=False, retired_at=timezone.now(),
        )
        StoreSlugAlias.objects.update_or_create(
            slug=raw, defaults={"business_details": biz, "is_current": True, "retired_at": None},
        )
        biz.store_slug = raw
        biz.save()

    aliases = list(StoreSlugAlias.objects.filter(business_details=biz).order_by("-is_current", "-retired_at"))
    site = getattr(settings, "FRONTEND_URL", "")
    return Response({
        "slug": raw,
        "store_url": f"{site}/store/{raw}",
        "aliases": [{"slug": a.slug, "retired_at": a.retired_at} for a in aliases if not a.is_current],
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_business_slug(request):
    raw = (request.GET.get("slug") or "").strip().lower()
    ok, reason = validate_slug(raw)
    if not ok:
        return Response({"available": False, "reason": reason})

    biz = getattr(request.user, "businessdetails", None)
    qs = StoreSlugAlias.objects.filter(slug=raw)
    if biz:
        qs = qs.exclude(business_details=biz, is_current=True)
    if qs.exists():
        taken = set(StoreSlugAlias.objects.values_list("slug", flat=True))
        return Response({
            "available": False,
            "reason": "taken",
            "suggestions": suggest_slug(raw, taken_set=taken | RESERVED),
        })
    return Response({"available": True})
```

- [ ] **Step 3: Wire URLs in `accounts/urls.py`**

Append to `urlpatterns`:

```python
path("business/slug/", views.update_business_slug, name="update-business-slug"),
path("business/slug/check/", views.check_business_slug, name="check-business-slug"),
```

- [ ] **Step 4: Run tests**

```bash
python manage.py test accounts.tests.test_slug_api -v 2
```

Expected: 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add accounts/views.py accounts/urls.py accounts/tests/test_slug_api.py
git commit -m "feat(share-links): merchant slug update + availability-check endpoints"
```

---

## Task 8: Merchant leads endpoints — list + per-lead activity

**Goal:** Paginated `/api/share-links/leads/` for the merchant's inbox, plus `/api/share-links/leads/<id>/activity/` for the per-lead activity drawer.

**Files:**
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/serializers.py`
- Modify: `Buzzmart_backend/accounts/urls_share_links.py`
- Create: `Buzzmart_backend/accounts/tests/test_leads_api.py`

**Acceptance Criteria:**
- [ ] `GET /api/share-links/leads/?ordering=-last_seen_at` returns the merchant's own leads, paginated (20/page)
- [ ] Each result: `{id, wa_number, name, first_seen_at, last_seen_at, whatsapp_link, click_count, order_count}`
- [ ] `?since=<iso>` filter returns only leads with `last_seen_at > since`
- [ ] `?search=080` filter returns leads whose `wa_number` starts with the digits (after stripping `+234`)
- [ ] `GET /api/share-links/leads/<id>/activity/` returns the lead's full ClickEvent history (newest first) with product details where applicable; 404 if lead isn't this merchant's
- [ ] Auth required

**Verify:** `python manage.py test accounts.tests.test_leads_api -v 2`

**Steps:**

- [ ] **Step 1: Write failing test `accounts/tests/test_leads_api.py`**

```python
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, BusinessDetails, Products, ShareLink, Lead, ClickEvent


class LeadsListTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        BusinessDetails.objects.create(user=self.merchant, business_name="X", store_slug="x")
        product = Products.objects.create(user=self.merchant, name="P", price="10", description="d")
        sl = ShareLink.objects.get(kind="product", product=product)
        self.lead_a = Lead.objects.create(merchant=self.merchant, wa_number="+2348127778036", name="Ade")
        self.lead_b = Lead.objects.create(merchant=self.merchant, wa_number="+2349012345678")
        ClickEvent.objects.create(share_link=sl, lead=self.lead_a, event_type="submit")
        ClickEvent.objects.create(share_link=sl, lead=self.lead_a, event_type="view")
        ClickEvent.objects.create(share_link=sl, lead=self.lead_b, event_type="submit")

        token = Token.objects.create(user=self.merchant)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_returns_my_leads_paginated(self):
        res = self.client.get("/api/share-links/leads/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["count"], 2)
        results = res.data["results"]
        wa_numbers = {r["wa_number"] for r in results}
        self.assertEqual(wa_numbers, {"+2348127778036", "+2349012345678"})

    def test_click_count_correct(self):
        res = self.client.get("/api/share-links/leads/")
        ade = next(r for r in res.data["results"] if r["wa_number"] == "+2348127778036")
        self.assertEqual(ade["click_count"], 2)

    def test_whatsapp_link_built(self):
        res = self.client.get("/api/share-links/leads/")
        ade = next(r for r in res.data["results"] if r["wa_number"] == "+2348127778036")
        self.assertEqual(ade["whatsapp_link"], "https://wa.me/2348127778036")

    def test_search_filter(self):
        res = self.client.get("/api/share-links/leads/?search=0812")
        self.assertEqual(res.data["count"], 1)

    def test_since_filter(self):
        future = (timezone.now() + timedelta(minutes=5)).isoformat()
        res = self.client.get(f"/api/share-links/leads/?since={future}")
        self.assertEqual(res.data["count"], 0)

    def test_cross_merchant_isolated(self):
        other = User.objects.create_user(email="o@x.com", password="x")
        Lead.objects.create(merchant=other, wa_number="+2340000000000")
        res = self.client.get("/api/share-links/leads/")
        self.assertEqual(res.data["count"], 2)  # not 3


class LeadActivityTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        BusinessDetails.objects.create(user=self.merchant, business_name="X", store_slug="x")
        product = Products.objects.create(user=self.merchant, name="Phone", price="10", description="d")
        sl = ShareLink.objects.get(kind="product", product=product)
        self.lead = Lead.objects.create(merchant=self.merchant, wa_number="+2348127778036")
        ClickEvent.objects.create(share_link=sl, lead=self.lead, event_type="submit")
        ClickEvent.objects.create(share_link=sl, lead=self.lead, event_type="view")
        token = Token.objects.create(user=self.merchant)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_returns_events_newest_first(self):
        res = self.client.get(f"/api/share-links/leads/{self.lead.id}/activity/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["events"]), 2)
        self.assertEqual(res.data["events"][0]["event_type"], "view")

    def test_other_merchant_lead_404s(self):
        other = User.objects.create_user(email="o@x.com", password="x")
        other_lead = Lead.objects.create(merchant=other, wa_number="+2340000000000")
        res = self.client.get(f"/api/share-links/leads/{other_lead.id}/activity/")
        self.assertEqual(res.status_code, 404)
```

- [ ] **Step 2: Add serializers + views**

In `accounts/serializers.py` append:

```python
class LeadListSerializer(serializers.ModelSerializer):
    whatsapp_link = serializers.SerializerMethodField()
    click_count = serializers.IntegerField(read_only=True)
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Lead
        fields = ["id", "wa_number", "name", "first_seen_at", "last_seen_at", "whatsapp_link", "click_count", "order_count"]

    def get_whatsapp_link(self, lead):
        return f"https://wa.me/{lead.wa_number.lstrip('+')}"


class LeadEventSerializer(serializers.ModelSerializer):
    share_link = serializers.SerializerMethodField()

    class Meta:
        model = ClickEvent
        fields = ["id", "event_type", "occurred_at", "share_link"]

    def get_share_link(self, evt):
        return {
            "kind": evt.share_link.kind,
            "product": {"id": evt.share_link.product.id, "name": evt.share_link.product.name}
            if evt.share_link.product else None,
        }
```

In `accounts/views.py` append:

```python
from django.db.models import Count, Q
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from .serializers import LeadListSerializer, LeadEventSerializer


class _LeadsPagination(PageNumberPagination):
    page_size = 20


class MyLeadsView(ListAPIView):
    serializer_class = LeadListSerializer
    pagination_class = _LeadsPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            Lead.objects.filter(merchant=self.request.user)
            .annotate(click_count=Count("click_events"))
            .annotate(order_count=Count("merchant__orders", filter=Q(merchant__orders__customer_whatsapp__contains=models.F("wa_number")), distinct=True))
            .order_by("-last_seen_at")
        )
        since = self.request.query_params.get("since")
        if since:
            qs = qs.filter(last_seen_at__gt=since)
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(wa_number__contains=search.lstrip("+"))
        return qs


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_lead_activity(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id, merchant=request.user)
    events = lead.click_events.select_related("share_link__product").order_by("-occurred_at")
    return Response({
        "lead": LeadListSerializer(lead).data,
        "events": LeadEventSerializer(events, many=True).data,
    })
```

Note: the `order_count` annotation above is a simplification — it does a contains-match between Lead's wa_number and Order's customer_whatsapp. Verify with one round-trip in the shell; refine to an exact match if formats align (both should be E.164 going forward — Order.customer_whatsapp normalization is OUT of scope for this task but worth a follow-up issue).

- [ ] **Step 3: Wire URLs in `accounts/urls_share_links.py`**

```python
from . import views

urlpatterns = [
    # ... existing ...
    path("leads/", views.MyLeadsView.as_view(), name="my-leads"),
    path("leads/<int:lead_id>/activity/", views.my_lead_activity, name="my-lead-activity"),
]
```

- [ ] **Step 4: Run tests**

```bash
python manage.py test accounts.tests.test_leads_api -v 2
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add accounts/views.py accounts/serializers.py accounts/urls_share_links.py accounts/tests/test_leads_api.py
git commit -m "feat(share-links): merchant leads list + activity endpoints"
```

---

## Task 9: Merchant share-stats endpoints (product + store)

**Goal:** Two analytics endpoints — `GET /api/products/<id>/share-stats/` and `GET /api/share-links/store-link/` — that return the share URL + rollup counts + recent clicks for the merchant's UI.

**Files:**
- Modify: `Buzzmart_backend/products/views.py`
- Modify: `Buzzmart_backend/products/urls.py`
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/urls_share_links.py`
- Modify: `Buzzmart_backend/accounts/serializers.py`
- Modify: `Buzzmart_backend/accounts/tests/test_share_link_api.py`

**Acceptance Criteria:**
- [ ] `GET /api/products/<id>/share-stats/` returns `{short_id, full_url, total_clicks, unique_leads, total_orders, recent_clicks: [...]}`
- [ ] Merchant must own the product (403 otherwise)
- [ ] `GET /api/share-links/store-link/` returns same shape for the merchant's store-level share link
- [ ] `recent_clicks` limited to last 20, newest first, each with `{occurred_at, event_type, lead: {wa_number, name}}`
- [ ] `full_url` uses `FRONTEND_URL` from settings

**Verify:** `python manage.py test accounts.tests.test_share_link_api.ShareStatsTests -v 2`

**Steps:**

- [ ] **Step 1: Write failing test**

Append to `accounts/tests/test_share_link_api.py`:

```python
class ShareStatsTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        BusinessDetails.objects.create(user=self.merchant, business_name="X", store_slug="x")
        self.product = Products.objects.create(user=self.merchant, name="P", price="10", description="d")
        self.product_link = ShareLink.objects.get(kind="product", product=self.product)
        self.store_link = ShareLink.objects.get(kind="store", merchant=self.merchant)
        lead = Lead.objects.create(merchant=self.merchant, wa_number="+2348127778036", name="Ade")
        ClickEvent.objects.create(share_link=self.product_link, lead=lead, event_type="submit")
        ClickEvent.objects.create(share_link=self.product_link, lead=lead, event_type="view")
        token = Token.objects.create(user=self.merchant)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_product_share_stats(self):
        res = self.client.get(f"/api/products/{self.product.id}/share-stats/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["short_id"], self.product_link.short_id)
        self.assertEqual(res.data["total_clicks"], 2)
        self.assertEqual(res.data["unique_leads"], 1)
        self.assertEqual(len(res.data["recent_clicks"]), 2)

    def test_other_merchants_product_404(self):
        other = User.objects.create_user(email="o@x.com", password="x")
        other_product = Products.objects.create(user=other, name="O", price="1", description="d")
        res = self.client.get(f"/api/products/{other_product.id}/share-stats/")
        self.assertIn(res.status_code, (403, 404))

    def test_store_share_stats(self):
        res = self.client.get("/api/share-links/store-link/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["short_id"], self.store_link.short_id)
```

- [ ] **Step 2: Add a reusable serializer + helper in `accounts/serializers.py`**

```python
class _RecentClickSerializer(serializers.ModelSerializer):
    lead = serializers.SerializerMethodField()

    class Meta:
        model = ClickEvent
        fields = ["id", "event_type", "occurred_at", "lead"]

    def get_lead(self, evt):
        if not evt.lead:
            return None
        return {"wa_number": evt.lead.wa_number, "name": evt.lead.name}


class ShareStatsSerializer(serializers.Serializer):
    short_id = serializers.CharField()
    full_url = serializers.CharField()
    total_clicks = serializers.IntegerField()
    unique_leads = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    recent_clicks = _RecentClickSerializer(many=True)
```

- [ ] **Step 3: Add a helper view function in `accounts/views.py`**

```python
def _build_share_stats(link):
    site = getattr(settings, "FRONTEND_URL", "")
    prefix = "p" if link.kind == "product" else "s"
    events_qs = link.click_events.select_related("lead").order_by("-occurred_at")
    return {
        "short_id": link.short_id,
        "full_url": f"{site}/{prefix}/{link.short_id}",
        "total_clicks": events_qs.count(),
        "unique_leads": link.click_events.exclude(lead__isnull=True).values("lead").distinct().count(),
        # Orders attribution is loose (see Task 8 note); refine in a follow-up.
        "total_orders": 0,
        "recent_clicks": events_qs[:20],
    }
```

Add the store-link endpoint view:

```python
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_store_share_link(request):
    link = get_object_or_404(ShareLink, merchant=request.user, kind="store")
    return Response(ShareStatsSerializer(_build_share_stats(link)).data)
```

- [ ] **Step 4: Add product-stats endpoint in `products/views.py`**

```python
from accounts.models import ShareLink
from accounts.views import _build_share_stats
from accounts.serializers import ShareStatsSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def product_share_stats(request, pk):
    product = get_object_or_404(Products, pk=pk, user=request.user)
    link = get_object_or_404(ShareLink, product=product, kind="product")
    return Response(ShareStatsSerializer(_build_share_stats(link)).data)
```

- [ ] **Step 5: Wire URLs**

In `products/urls.py` append:

```python
path("<int:pk>/share-stats/", views.product_share_stats, name="product-share-stats"),
```

In `accounts/urls_share_links.py` append:

```python
path("store-link/", views.my_store_share_link, name="my-store-share-link"),
```

- [ ] **Step 6: Run tests**

```bash
python manage.py test accounts.tests.test_share_link_api.ShareStatsTests -v 2
```

Expected: 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add accounts/views.py accounts/serializers.py accounts/urls_share_links.py products/views.py products/urls.py accounts/tests/test_share_link_api.py
git commit -m "feat(share-links): product + store share-stats endpoints"
```

---

## Task 10: Setup serializer accepts custom slug + store/link response includes aliases

**Goal:** Merchants pick their slug at setup time (replaces auto-slugify). `GET /api/accounts/store/link/` returns the alias history so the manage page can render it.

**Files:**
- Modify: `Buzzmart_backend/accounts/serializers.py`
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/tests/test_slug_api.py`

**Acceptance Criteria:**
- [ ] `PATCH /api/accounts/setup/` accepts an optional `store_slug` field; if provided, used verbatim (validated via slug_validation); if omitted, auto-slugify as before
- [ ] `GET /api/accounts/store/link/` returns `{store_slug, store_url, business_name, aliases: [{slug, retired_at}, ...]}`
- [ ] If a custom slug fails validation: 400 with the same error shape as the slug update endpoint
- [ ] If a custom slug is already taken: 400

**Verify:** `python manage.py test accounts.tests.test_slug_api -v 2`

**Steps:**

- [ ] **Step 1: Add tests**

Append to `accounts/tests/test_slug_api.py`:

```python
class SetupSlugTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="m@x.com", password="x")
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_setup_with_custom_slug(self):
        res = self.client.patch("/api/accounts/setup/", {
            "full_name": "Ade", "username": "ade", "phone_number": "08127778036",
            "address": "Ibadan", "business_name": "Ade Shop", "business_description": "shop",
            "business_email": "a@x.com", "bank_name": "X", "account_number": "0",
            "whatsapp_number": "08127778036", "store_slug": "ade-shop",
        }, format="content_type=multipart/form-data")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(StoreSlugAlias.objects.filter(slug="ade-shop", is_current=True).exists())

    def test_setup_with_invalid_slug_400(self):
        res = self.client.patch("/api/accounts/setup/", {
            "full_name": "Ade", "username": "ade", "phone_number": "08127778036",
            "address": "Ibadan", "business_name": "Ade Shop", "business_description": "shop",
            "business_email": "a@x.com", "bank_name": "X", "account_number": "0",
            "whatsapp_number": "08127778036", "store_slug": "Bad_Slug",
        }, format="content_type=multipart/form-data")
        self.assertEqual(res.status_code, 400)


class StoreLinkResponseTests(APITestCase):
    def setUp(self):
        self.merchant = User.objects.create_user(email="m@x.com", password="x")
        biz = BusinessDetails.objects.create(user=self.merchant, business_name="X", store_slug="current")
        StoreSlugAlias.objects.create(slug="retired", business_details=biz, is_current=False)
        token = Token.objects.create(user=self.merchant)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_store_link_includes_aliases(self):
        res = self.client.get("/api/accounts/store/link/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("aliases", res.data)
        slugs = [a["slug"] for a in res.data["aliases"]]
        self.assertIn("retired", slugs)
```

- [ ] **Step 2: Modify `SetupAccountSerializer`**

In `accounts/serializers.py`, locate `SetupAccountSerializer`. Add a `store_slug` field and validation:

```python
class SetupAccountSerializer(serializers.Serializer):
    # ... existing fields ...
    store_slug = serializers.CharField(required=False, allow_blank=True)

    def validate_store_slug(self, value):
        from .slug_validation import validate as validate_slug
        if not value:
            return value
        v = value.strip().lower()
        ok, reason = validate_slug(v)
        if not ok:
            raise serializers.ValidationError({"format": "invalid format", "reserved": "reserved"}[reason])
        if StoreSlugAlias.objects.filter(slug=v).exists():
            raise serializers.ValidationError("already in use")
        return v
```

In the serializer's `create()` / `save()` method (or wherever it constructs `BusinessDetails`), use the provided `store_slug` if present:

```python
slug = validated_data.get("store_slug") or _auto_slugify(validated_data["business_name"])
BusinessDetails.objects.create(user=user, ..., store_slug=slug)
```

(`_auto_slugify` is whatever Django util the existing code uses — keep it as-is.)

- [ ] **Step 3: Modify the existing `store_link` view (`get_my_store_link` or similar) to include aliases**

```python
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_store_link(request):
    biz = getattr(request.user, "businessdetails", None)
    if not biz:
        return Response({"error": "Business details not found."}, status=404)
    site = getattr(settings, "FRONTEND_URL", "")
    aliases = StoreSlugAlias.objects.filter(business_details=biz, is_current=False).order_by("-retired_at")
    return Response({
        "store_slug": biz.store_slug,
        "store_url": f"{site}/store/{biz.store_slug}",
        "business_name": biz.business_name,
        "aliases": [{"slug": a.slug, "retired_at": a.retired_at} for a in aliases],
    })
```

- [ ] **Step 4: Run tests**

```bash
python manage.py test accounts.tests.test_slug_api -v 2
```

Expected: 11 tests pass (8 from Task 7 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add accounts/serializers.py accounts/views.py accounts/tests/test_slug_api.py
git commit -m "feat(share-links): setup accepts custom slug; store-link returns alias history"
```

---

## Task 11: Rate limiting on /resolve/ and /identify/

**Goal:** Block obvious abuse — 60/min/IP on `/resolve/`, 10/min/IP on `/identify/`, plus 5/min/(IP,short_id) on `/identify/`.

**Files:**
- Modify: `Buzzmart_backend/accounts/views.py`
- Modify: `Buzzmart_backend/accounts/tests/test_share_link_api.py`

**Acceptance Criteria:**
- [ ] `/resolve/` 61st request from same IP within 60s returns 429
- [ ] `/identify/` 11th request from same IP within 60s returns 429
- [ ] `/identify/` 6th request from same (IP, short_id) within 60s returns 429
- [ ] Cache backend is in-memory (default from Task 0)

**Verify:** `python manage.py test accounts.tests.test_share_link_api.RateLimitTests -v 2`

**Steps:**

- [ ] **Step 1: Add tests**

```python
from django.core.cache import cache
from django_ratelimit.exceptions import Ratelimited


class RateLimitTests(APITestCase):
    def setUp(self):
        cache.clear()
        merchant = User.objects.create_user(email="m@x.com", password="x")
        BusinessDetails.objects.create(user=merchant, business_name="X", store_slug="x")
        product = Products.objects.create(user=merchant, name="P", price="10", description="d")
        self.product_link = ShareLink.objects.get(kind="product", product=product)

    def test_resolve_blocked_after_60_per_minute(self):
        url = f"/api/share-links/{self.product_link.short_id}/resolve/"
        for _ in range(60):
            self.assertEqual(self.client.get(url).status_code, 200)
        self.assertEqual(self.client.get(url).status_code, 429)

    def test_identify_blocked_after_10_per_minute(self):
        url = f"/api/share-links/{self.product_link.short_id}/identify/"
        for i in range(10):
            self.client.post(url, {"wa_number": f"0812000{i:04d}"}, format="json")
        res = self.client.post(url, {"wa_number": "08120009999"}, format="json")
        self.assertEqual(res.status_code, 429)
```

- [ ] **Step 2: Apply decorators in `accounts/views.py`**

```python
from django_ratelimit.decorators import ratelimit


@ratelimit(key="ip", rate="60/m", method="GET", block=True)
@api_view(["GET"])
@permission_classes([AllowAny])
def share_link_resolve(request, short_id):
    # ... existing implementation ...


@ratelimit(key="ip", rate="10/m", method="POST", block=True)
@ratelimit(key=lambda group, request: f"{request.META.get('REMOTE_ADDR','')}|{request.resolver_match.kwargs.get('short_id','')}", rate="5/m", method="POST", block=True)
@api_view(["POST"])
@permission_classes([AllowAny])
def share_link_identify(request, short_id):
    # ... existing implementation ...
```

Note: `block=True` returns Django's `Ratelimited` exception which DRF turns into a 429 via the default exception handler. Verify the response shape in the test.

- [ ] **Step 3: Run tests**

```bash
python manage.py test accounts.tests.test_share_link_api.RateLimitTests -v 2
```

Expected: 2 tests pass. If 429s render as 403, install DRF's `django_ratelimit` exception handler — usually a `EXCEPTION_HANDLER` setting tweak.

- [ ] **Step 4: Full backend test sweep**

```bash
python manage.py test accounts -v 2
```

Expected: all share-link + slug + lead-token + phone tests pass.

- [ ] **Step 5: Commit**

```bash
git add accounts/views.py accounts/tests/test_share_link_api.py
git commit -m "feat(share-links): rate-limit /resolve/ and /identify/"
```

---

## Task 12: Frontend prep — deps, type regen, env, action stubs

**Goal:** Install frontend deps, regenerate types from the now-extended backend schema, write typed action functions and `lib/phone.ts`.

**Files:**
- Modify: `preorder/package.json` + `package-lock.json`
- Modify: `preorder/.env.local` + `preorder/.env.example`
- Create: `preorder/lib/phone.ts`
- Create: `preorder/actions/share-links.actions.ts`
- Create: `preorder/actions/slug.actions.ts`
- Regenerate: `preorder/types/api-generated.ts`
- Modify: `preorder/types/api.ts`

**Acceptance Criteria:**
- [ ] `libphonenumber-js` installed
- [ ] `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`, present in `.env.example`
- [ ] `npm run gen:types` produces updated `types/api-generated.ts` containing the new endpoints (Notification patch already in `scripts/gen-types.mjs`)
- [ ] `types/api.ts` exports `ShareLinkResolve`, `Lead`, `ShareStats`, `BusinessSlugUpdate`, `SlugCheckResponse` aliases
- [ ] All action functions in `share-links.actions.ts` typed against the generated schema; same for `slug.actions.ts`
- [ ] `lib/phone.ts` exports `normalizePhone(raw: string): string | null` and `isValidPhone(raw: string): boolean` (returns `null` instead of throwing — caller handles)
- [ ] `npx tsc --noEmit` clean, `npm run build` clean

**Verify:** `cd preorder && npm run build 2>&1 | tail -5` → ends with route summary, no errors.

**Steps:**

- [ ] **Step 1: Install dep**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
npm install libphonenumber-js
```

- [ ] **Step 2: Add env vars**

Append to `.env.local`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Append to `.env.example`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Regenerate types**

```bash
# In one terminal: backend dev server must be running on port 8000
# In preorder/:
npm run gen:types
```

Expected: writes new `types/api-generated.ts` with the new paths (`/api/share-links/*`, `/api/products/{id}/share-stats/`, etc.).

- [ ] **Step 4: Add aliases to `types/api.ts`**

Append:

```typescript
export type ShareLinkResolve =
  paths["/api/share-links/{short_id}/resolve/"]["get"]["responses"][200]["content"]["application/json"];

export type ShareLinkIdentifyResponse =
  paths["/api/share-links/{short_id}/identify/"]["post"]["responses"][200]["content"]["application/json"];

export type LeadListItem = Schemas["LeadList"];
export type LeadActivity =
  paths["/api/share-links/leads/{lead_id}/activity/"]["get"]["responses"][200]["content"]["application/json"];

export type ShareStats = Schemas["ShareStats"];

export type SlugCheckResponse =
  paths["/api/accounts/business/slug/check/"]["get"]["responses"][200]["content"]["application/json"];

export type BusinessSlugUpdate =
  paths["/api/accounts/business/slug/"]["patch"]["responses"][200]["content"]["application/json"];
```

(If any of these resolve to `never` because of drf-spectacular gaps, hand-define them inline with a comment — pattern is already established in `types/api.ts` from bug #10.)

- [ ] **Step 5: Create `lib/phone.ts`**

```typescript
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const parsed = parsePhoneNumberFromString(raw.trim(), "NG");
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // E.164
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}
```

- [ ] **Step 6: Create `actions/share-links.actions.ts`**

```typescript
import axios from "axios";
import { baseUrl } from "./auth.actions";
import type {
  ShareLinkResolve,
  ShareLinkIdentifyResponse,
  LeadListItem,
  LeadActivity,
  ShareStats,
} from "@/types/api";

export async function resolveShareLink(shortId: string): Promise<ShareLinkResolve> {
  const res = await axios.get(`${baseUrl}/share-links/${shortId}/resolve/`);
  return res.data;
}

export async function identifyVisitor(
  shortId: string,
  body: { wa_number?: string; name?: string; lead_token?: string }
): Promise<ShareLinkIdentifyResponse> {
  const res = await axios.post(`${baseUrl}/share-links/${shortId}/identify/`, body);
  return res.data;
}

export async function getLeads(params: { search?: string; since?: string; page?: number }): Promise<{ count: number; next: string | null; previous: string | null; results: LeadListItem[] }> {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.get(`${baseUrl}/share-links/leads/`, {
    headers: { Authorization: `token ${token}` },
    params,
  });
  return res.data;
}

export async function getLeadActivity(leadId: number): Promise<LeadActivity> {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.get(`${baseUrl}/share-links/leads/${leadId}/activity/`, {
    headers: { Authorization: `token ${token}` },
  });
  return res.data;
}

export async function getProductShareStats(productId: number): Promise<ShareStats> {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.get(`${baseUrl}/products/${productId}/share-stats/`, {
    headers: { Authorization: `token ${token}` },
  });
  return res.data;
}

export async function getStoreShareStats(): Promise<ShareStats> {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.get(`${baseUrl}/share-links/store-link/`, {
    headers: { Authorization: `token ${token}` },
  });
  return res.data;
}
```

- [ ] **Step 7: Create `actions/slug.actions.ts`**

```typescript
import axios from "axios";
import { baseUrl } from "./auth.actions";
import type { SlugCheckResponse, BusinessSlugUpdate } from "@/types/api";

export async function checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.get(`${baseUrl}/accounts/business/slug/check/`, {
    headers: { Authorization: `token ${token}` },
    params: { slug },
  });
  return res.data;
}

export async function updateStoreSlug(slug: string): Promise<BusinessSlugUpdate> {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.patch(
    `${baseUrl}/accounts/business/slug/`,
    { slug },
    { headers: { Authorization: `token ${token}` } }
  );
  return res.data;
}
```

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit
npm run build
```

Expected: 0 TS errors; build passes all 14+ routes (will be more after later tasks).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .env.example lib/phone.ts actions/share-links.actions.ts actions/slug.actions.ts types/api.ts types/api-generated.ts
git commit -m "feat(share-links): frontend prep — deps, regenerated types, typed actions, phone util"
```

---

## Task 13: SlugInput component

**Goal:** Reusable component used in setup wizard step 2 (Task 20) and edit modal (Task 19). Debounced availability check, visual states, suggestion chips.

**Files:**
- Create: `preorder/components/slug/SlugInput.tsx`

**Acceptance Criteria:**
- [ ] Accepts `value: string`, `onChange: (slug: string) => void`, optional `defaultValue`, optional `excludeCurrent: string` (so the merchant's own current slug doesn't show as "taken" in the edit modal)
- [ ] Renders prefix "buzzmart.app/store/" + input + state indicator (gray "…", green "✓ Available", red "✗ ..." with reason text)
- [ ] Auto-lowercases input on type
- [ ] Debounces availability check by 300ms
- [ ] Calls `onChange` immediately on type; emits a separate `onAvailability(available, reason)` callback (parent forms can disable submit until available)
- [ ] When `reason === "taken"`, renders 3 clickable suggestion chips below input; clicking fills the input
- [ ] Helper text "3–40 characters · lowercase, numbers, hyphens"

**Verify:** Visual + `npm run build` clean.

**Steps:**

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, Loader2, X } from "lucide-react";
import { checkSlugAvailability } from "@/actions/slug.actions";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  onAvailability?: (available: boolean | null, reason: string | null) => void;
  excludeCurrent?: string;
}

type State =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; reason: string; suggestions?: string[] };

export default function SlugInput({ value, onChange, onAvailability, excludeCurrent }: SlugInputProps) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const v = value.trim();
    if (!v) {
      setState({ kind: "idle" });
      onAvailability?.(null, null);
      return;
    }
    if (excludeCurrent && v === excludeCurrent) {
      setState({ kind: "available" });
      onAvailability?.(true, null);
      return;
    }
    setState({ kind: "checking" });
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkSlugAvailability(v);
        if (res.available) {
          setState({ kind: "available" });
          onAvailability?.(true, null);
        } else {
          setState({ kind: "unavailable", reason: res.reason ?? "format", suggestions: res.suggestions });
          onAvailability?.(false, res.reason ?? "format");
        }
      } catch {
        setState({ kind: "idle" });
        onAvailability?.(null, "network");
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, excludeCurrent, onAvailability]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#03140A80] whitespace-nowrap">buzzmart.app/store/</span>
        <Input
          className="bg-[#F0F0F0] rounded-[12px] max-w-xs"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="your-store-slug"
          maxLength={40}
        />
        <Indicator state={state} />
      </div>
      <p className="text-xs text-[#03140A80]">3–40 characters · lowercase, numbers, hyphens</p>
      {state.kind === "unavailable" && state.suggestions && state.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {state.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className="text-xs px-2 py-1 bg-[#27BA5F1F] text-[#27BA5F] rounded-md hover:bg-[#27BA5F33]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Indicator({ state }: { state: State }) {
  if (state.kind === "idle") return <span className="text-xs text-gray-400">…</span>;
  if (state.kind === "checking") return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
  if (state.kind === "available")
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <Check className="w-4 h-4" /> Available
      </span>
    );
  const reasonText = {
    taken: "Already taken",
    reserved: "Reserved word",
    format: "Use 3–40 lowercase letters, numbers, hyphens",
  }[state.reason] ?? state.reason;
  return (
    <span className="flex items-center gap-1 text-xs text-red-600">
      <X className="w-4 h-4" /> {reasonText}
    </span>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/slug/SlugInput.tsx
git commit -m "feat(share-links): SlugInput component with debounced availability check"
```

---

## Task 14: Interstitial component

**Goal:** The identity-capture form rendered inside `/p/[shortId]` and `/s/[shortId]`. Receives resolved share-link data as props; on submit, POSTs to the Next.js Route Handler.

**Files:**
- Create: `preorder/components/share/Interstitial.tsx`

**Acceptance Criteria:**
- [ ] Accepts `resolved: ShareLinkResolve` and `shortId: string` props
- [ ] Renders product image / store header + name + price (for product) or store name (for store)
- [ ] Phone field with NG default, validated via `lib/phone.ts`; name optional
- [ ] Submit button disabled until phone valid
- [ ] On submit: POST to `/api/share-link-identify/` (Route Handler) with `{shortId, wa_number, name}`; on 200, `router.replace(redirect_to)`
- [ ] Surfaces errors via `toast.error(errorMessage(err, "..."))`

**Verify:** `npm run build` clean.

**Steps:**

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizePhone, isValidPhone } from "@/lib/phone";
import { errorMessage } from "@/lib/errors";
import type { ShareLinkResolve } from "@/types/api";

export default function Interstitial({ resolved, shortId }: { resolved: ShareLinkResolve; shortId: string }) {
  const router = useRouter();
  const [wa, setWa] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = isValidPhone(wa);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/share-link-identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortId, wa_number: normalizePhone(wa) ?? wa, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(errorMessage(data, "Could not submit your details."));
        return;
      }
      router.replace(data.redirect_to);
    } catch (e) {
      toast.error(errorMessage(e, "Network error. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const merchant = resolved.merchant;
  const product = resolved.product;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm overflow-hidden">
        {product && product.primary_image && (
          <img src={product.primary_image} alt={product.name} className="w-full h-64 object-cover" />
        )}
        <div className="p-6">
          {product ? (
            <>
              <h1 className="text-xl font-bold">{product.name}</h1>
              <p className="text-orange-500 font-semibold mt-1">₦{product.price}</p>
              <p className="text-sm text-gray-500 mt-1">by {merchant.business_name}</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">{merchant.business_name}</h1>
              <p className="text-sm text-gray-500 mt-1">Visit this store</p>
            </>
          )}

          <div className="mt-6">
            <label className="text-sm font-medium text-[#03140A]">Enter your WhatsApp to see details:</label>
            <Input
              className="bg-[#F0F0F0] rounded-[12px] mt-2"
              placeholder="+234 _ _ _ _ _ _ _ _ _ _"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
            />
            <label className="text-sm font-medium text-[#03140A] mt-4 block">Your name (optional)</label>
            <Input
              className="bg-[#F0F0F0] rounded-[12px] mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              onClick={submit}
              disabled={!valid || submitting}
              className="mt-6 w-full bg-[#27BA5F] hover:bg-[#1FA34E]"
            >
              {submitting ? "Loading..." : "Continue →"}
            </Button>
            <p className="text-xs text-gray-400 mt-3 text-center">
              We&apos;ll only use this to follow up about your order. No spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/share/Interstitial.tsx
git commit -m "feat(share-links): Interstitial identity-capture form component"
```

---

## Task 15: /p/[shortId] + /s/[shortId] pages + Route Handler

**Goal:** Server-rendered share-link landing pages with OG meta tags, cookie-based skip, and the cookie-setting Route Handler.

**Files:**
- Create: `preorder/app/p/[shortId]/page.tsx`
- Create: `preorder/app/s/[shortId]/page.tsx`
- Create: `preorder/app/api/share-link-identify/route.ts`

**Acceptance Criteria:**
- [ ] Both pages SSR-fetch `/resolve/`, render OG meta via `generateMetadata` (image, title, description, url)
- [ ] If valid `bz_lead` cookie present: server-side POST to `/identify/` → if 200 + `redirect_to`, set refreshed cookie + 302 redirect (no flash)
- [ ] If no cookie or invalid: render `<Interstitial>` component
- [ ] Route Handler `/api/share-link-identify/` proxies to backend, sets cookie from response, returns `{redirect_to}` to client
- [ ] Cookie: `bz_lead`, `HttpOnly`, `SameSite=Lax`, 90-day max-age, `Secure` when `NODE_ENV=production`
- [ ] 404 from resolve → render fallback "This link is no longer active"
- [ ] WhatsApp scraper (`User-Agent: WhatsApp/2`) gets full OG metadata in HTML

**Verify:** `curl -s http://localhost:3000/p/<known-short-id> | grep -E 'og:image|og:title'` returns the tags; `npm run build` clean.

**Steps:**

- [ ] **Step 1: Create the Route Handler `app/api/share-link-identify/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "bz_lead";
const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

export async function POST(req: Request) {
  const backendBase = process.env.NEXT_PUBLIC_BASE_URI;
  if (!backendBase) {
    return NextResponse.json({ message: "Backend not configured" }, { status: 500 });
  }
  const body = await req.json();
  const { shortId, wa_number, name } = body;
  const existing = cookies().get(COOKIE_NAME)?.value;

  const res = await fetch(`${backendBase}/share-links/${shortId}/identify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wa_number,
      name,
      lead_token: existing,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  const response = NextResponse.json({ redirect_to: data.redirect_to });
  response.cookies.set(COOKIE_NAME, data.lead_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: NINETY_DAYS_SECONDS,
    path: "/",
  });
  return response;
}
```

- [ ] **Step 2: Create `app/p/[shortId]/page.tsx`**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Interstitial from "@/components/share/Interstitial";
import type { ShareLinkResolve } from "@/types/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const BACKEND = process.env.NEXT_PUBLIC_BASE_URI ?? "http://127.0.0.1:8000/api";

async function fetchResolve(shortId: string): Promise<ShareLinkResolve | null> {
  try {
    const res = await fetch(`${BACKEND}/share-links/${shortId}/resolve/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { shortId: string } }): Promise<Metadata> {
  const resolved = await fetchResolve(params.shortId);
  if (!resolved) return { title: "Link not found" };
  const product = resolved.product;
  if (!product) return { title: resolved.merchant.business_name ?? "Store" };
  const title = `${product.name} — ${resolved.merchant.business_name ?? ""}`.trim();
  return {
    title,
    description: product.description?.slice(0, 160) ?? "",
    openGraph: {
      title,
      description: product.description?.slice(0, 160) ?? "",
      url: `${SITE}/p/${params.shortId}`,
      images: product.primary_image ? [product.primary_image] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProductSharePage({ params }: { params: { shortId: string } }) {
  const resolved = await fetchResolve(params.shortId);
  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">This link is no longer active</h1>
          <a href="/store" className="text-[#27BA5F] mt-2 inline-block">Browse all stores →</a>
        </div>
      </div>
    );
  }

  // Cookie check — try a passive identify that just refreshes the token.
  const existingCookie = cookies().get("bz_lead")?.value;
  if (existingCookie) {
    try {
      const res = await fetch(`${BACKEND}/share-links/${params.shortId}/identify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_token: existingCookie }),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        // We can't set cookies on a server-component redirect — so the cookie stays at its
        // previous value (still valid for 90 days), and we just redirect.
        redirect(data.redirect_to);
      }
    } catch {
      // Fall through to rendering interstitial
    }
  }

  return <Interstitial resolved={resolved} shortId={params.shortId} />;
}
```

- [ ] **Step 3: Create `app/s/[shortId]/page.tsx`**

Same shape — copy the file above, change OG `type` interpretation if needed. The interstitial component already branches on `product` vs not.

```tsx
// Identical to app/p/[shortId]/page.tsx; the share-link kind is determined by /resolve/'s response.
// Duplicate the file content above; the only conceptual difference is the URL prefix used in
// generateMetadata's og:url, which uses ${SITE}/s/ instead of ${SITE}/p/.
```

In the actual file, the only line that differs from the `/p/` page:

```tsx
url: `${SITE}/s/${params.shortId}`,
```

- [ ] **Step 4: Verify**

```bash
npm run build
```

Expected: build passes, two new routes (`/p/[shortId]`, `/s/[shortId]`) listed.

Run the dev server, generate a known short_id from the backend admin, and:

```bash
curl -s http://localhost:3000/p/<short_id> | grep -E "og:image|og:title"
```

Expected: tags present in HTML.

- [ ] **Step 5: Commit**

```bash
git add app/p/[shortId]/page.tsx app/s/[shortId]/page.tsx app/api/share-link-identify/route.ts
git commit -m "feat(share-links): /p/[shortId] + /s/[shortId] pages with OG meta + cookie skip"
```

---

## Task 16: SharePanel + ShareButton + integration on product detail

**Goal:** Reusable analytics card with copy + share buttons, dropped into the existing product detail page.

**Files:**
- Create: `preorder/components/share/SharePanel.tsx`
- Create: `preorder/components/share/ShareButton.tsx`
- Modify: `preorder/app/(dashboard)/marketplace/product/[id]/page.tsx`

**Acceptance Criteria:**
- [ ] `SharePanel` accepts `stats: ShareStats` and `messageTemplate: string`
- [ ] Shows the full URL (selectable), copy button (clipboard), share button (`<ShareButton />`)
- [ ] Shows rollup counts: clicks · unique leads · orders
- [ ] Lists last 20 click events with timestamp, lead name/number, event type
- [ ] `ShareButton`: on mobile uses `navigator.share({ title, text, url })`; on desktop copies + opens `https://wa.me/?text=<encoded>` in new tab
- [ ] Product detail page renders `SharePanel` at the top of the layout

**Verify:** Manual: visit `/marketplace/product/<id>` → see SharePanel; tap Share on mobile → native sheet; click Share on desktop → wa.me opens.

**Steps:**

- [ ] **Step 1: Create `components/share/ShareButton.tsx`**

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: Props) {
  const handleShare = async () => {
    const fullMessage = `${text}\n${url}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: fullMessage, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to wa.me
      }
    }
    // Desktop / fallback
    await navigator.clipboard.writeText(fullMessage);
    toast.success("Copied to clipboard");
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, "_blank");
  };

  return (
    <Button onClick={handleShare} variant="ghost" className="text-[#27BA5F]">
      <Share2 className="w-4 h-4 mr-2" /> Share
    </Button>
  );
}
```

- [ ] **Step 2: Create `components/share/SharePanel.tsx`**

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import ShareButton from "./ShareButton";
import type { ShareStats } from "@/types/api";

interface Props {
  stats: ShareStats;
  messageTemplate: string; // pre-built outside; we just stitch + share
  shareTitle: string;
}

export default function SharePanel({ stats, messageTemplate, shareTitle }: Props) {
  const copyUrl = async () => {
    await navigator.clipboard.writeText(stats.full_url);
    toast.success("Link copied");
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Share link</h2>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm">{stats.full_url}</code>
        <Button variant="ghost" onClick={copyUrl}><Copy className="w-4 h-4 mr-1" /> Copy</Button>
        <ShareButton title={shareTitle} text={messageTemplate} url={stats.full_url} />
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <strong>{stats.total_clicks}</strong> clicks · <strong>{stats.unique_leads}</strong> unique leads · <strong>{stats.total_orders}</strong> orders
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase text-gray-400">Recent clicks</h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {stats.recent_clicks.slice(0, 20).map((c) => (
          <li key={c.id} className="flex items-center gap-2 text-gray-600">
            <span className="text-gray-400">·</span>
            <span>{new Date(c.occurred_at).toLocaleString()}</span>
            <span className="text-gray-400">—</span>
            <span>{c.lead?.name || "Unknown"} ({c.lead?.wa_number || "anonymous"})</span>
            <span className="text-xs text-gray-400">{c.event_type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Modify `app/(dashboard)/marketplace/product/[id]/page.tsx`**

Near the top of the rendered tree (inside the existing layout), import and render:

```tsx
import SharePanel from "@/components/share/SharePanel";
import { getProductShareStats } from "@/actions/share-links.actions";
import type { ShareStats } from "@/types/api";

// inside the component:
const [shareStats, setShareStats] = useState<ShareStats | null>(null);
useEffect(() => {
  if (!id) return;
  getProductShareStats(Number(id)).then(setShareStats).catch(() => {});
}, [id]);

// in the JSX, near the top:
{shareStats && product && (
  <SharePanel
    stats={shareStats}
    shareTitle={product.name}
    messageTemplate={`📱 *${product.name}* — ₦${product.price}\nTap to view:`}
  />
)}
```

- [ ] **Step 4: Verify**

```bash
npm run build
```

Visit `/marketplace/product/<id>` in dev → SharePanel renders at top.

- [ ] **Step 5: Commit**

```bash
git add components/share/SharePanel.tsx components/share/ShareButton.tsx app/(dashboard)/marketplace/product/[id]/page.tsx
git commit -m "feat(share-links): SharePanel + ShareButton, drop into product detail page"
```

---

## Task 17: Leads inbox page + activity drawer

**Goal:** `/leads` page in dashboard with paginated list, search, and per-lead activity drawer.

**Files:**
- Create: `preorder/app/(dashboard)/leads/page.tsx`
- Create: `preorder/components/leads/LeadRow.tsx`
- Create: `preorder/components/leads/LeadActivityDrawer.tsx`

**Acceptance Criteria:**
- [ ] `/leads` lists leads (paginated, 20/page), sorted by `last_seen_at` desc
- [ ] Search bar filters by WA prefix (debounced 300ms, calls API with `?search=`)
- [ ] Each row: name, E.164 number, first/last seen, click/order counts, "Chat on WhatsApp" → opens `wa.me/<number>` in new tab, "View activity" → opens drawer
- [ ] Drawer shows the lead's full event history newest-first via `getLeadActivity`
- [ ] Empty state: "No leads yet. Share your store or product links on WhatsApp to start collecting leads." with "Copy store link" button
- [ ] `localStorage` records `lastSeenLeadsAt` on page visit for sidebar badge (Task 18)

**Verify:** Manual + `npm run build` clean.

**Steps:**

- [ ] **Step 1: Create `components/leads/LeadRow.tsx`**

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import type { LeadListItem } from "@/types/api";

interface Props {
  lead: LeadListItem;
  onViewActivity: (leadId: number) => void;
}

export default function LeadRow({ lead, onViewActivity }: Props) {
  return (
    <div className="border-b py-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-medium">{lead.name || "Unknown name"} ({lead.wa_number})</h3>
        <p className="text-sm text-gray-500 mt-1">
          First clicked {formatRelative(lead.first_seen_at)} · {lead.click_count} views · {lead.order_count} orders
        </p>
        <p className="text-sm text-gray-500">Last seen {formatRelative(lead.last_seen_at)}</p>
      </div>
      <div className="flex items-center gap-2">
        <a href={lead.whatsapp_link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 mr-1" /> Chat</Button>
        </a>
        <Button variant="ghost" size="sm" onClick={() => onViewActivity(lead.id)}>View activity →</Button>
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

- [ ] **Step 2: Create `components/leads/LeadActivityDrawer.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getLeadActivity } from "@/actions/share-links.actions";
import type { LeadActivity } from "@/types/api";

interface Props {
  leadId: number | null;
  onClose: () => void;
}

export default function LeadActivityDrawer({ leadId, onClose }: Props) {
  const [data, setData] = useState<LeadActivity | null>(null);
  useEffect(() => {
    if (!leadId) return;
    setData(null);
    getLeadActivity(leadId).then(setData).catch(() => {});
  }, [leadId]);

  return (
    <Sheet open={leadId !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>{data?.lead?.name || "Lead"} activity</SheetTitle></SheetHeader>
        <div className="mt-4">
          {!data && <div className="text-sm text-gray-500">Loading…</div>}
          {data && data.events.length === 0 && <div className="text-sm text-gray-500">No activity yet.</div>}
          {data && data.events.map((e) => (
            <div key={e.id} className="border-b py-3 text-sm">
              <div className="font-medium">{labelFor(e.event_type)}</div>
              <div className="text-gray-500">{new Date(e.occurred_at).toLocaleString()}</div>
              {e.share_link?.product && <div className="text-gray-700">{e.share_link.product.name}</div>}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function labelFor(t: string): string {
  if (t === "submit") return "First identified";
  if (t === "view") return "Viewed product";
  return t;
}
```

(If `@/components/ui/sheet` doesn't exist in the project, add it via `npx shadcn@latest add sheet` first.)

- [ ] **Step 3: Create `app/(dashboard)/leads/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";
import LeadRow from "@/components/leads/LeadRow";
import LeadActivityDrawer from "@/components/leads/LeadActivityDrawer";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import type { LeadListItem } from "@/types/api";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activityLeadId, setActivityLeadId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("lastSeenLeadsAt", new Date().toISOString());
    const t = setTimeout(() => {
      getLeads({ search: search || undefined, page })
        .then((data) => { setLeads(data.results); setCount(data.count); })
        .catch((e) => toast.error(errorMessage(e, "Could not load leads.")));
    }, 300);
    return () => clearTimeout(t);
  }, [search, page]);

  const copyStoreLink = async () => {
    try {
      const stats = await getStoreShareStats();
      await navigator.clipboard.writeText(stats.full_url);
      toast.success("Store link copied");
    } catch (e) {
      toast.error(errorMessage(e, "Could not copy store link."));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">LEADS</h1>
        <Input
          className="max-w-xs bg-gray-50 rounded-[12px]"
          placeholder="Search 080…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">{count} leads · sorted by most recent</p>

      {leads.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No leads yet. Share your store or product links on WhatsApp to start collecting leads.</p>
          <Button className="mt-4 bg-[#27BA5F] hover:bg-[#1FA34E]" onClick={copyStoreLink}>Copy store link</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-2 shadow-sm">
          {leads.map((l) => (
            <LeadRow key={l.id} lead={l} onViewActivity={setActivityLeadId} />
          ))}
        </div>
      )}

      <LeadActivityDrawer leadId={activityLeadId} onClose={() => setActivityLeadId(null)} />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npm run build
```

Navigate to `/leads` → page renders, empty state with copy-store-link button works.

- [ ] **Step 5: Commit**

```bash
git add app/(dashboard)/leads/ components/leads/
git commit -m "feat(share-links): Leads inbox page + activity drawer"
```

---

## Task 18: Sidebar nav — add Leads link + unread badge

**Goal:** Find wherever the dashboard sidebar/nav lives, add Leads between Orders and Manage, with a badge that counts new leads since the last `/leads` visit.

**Files:**
- Modify: the dashboard nav component (discover with `grep -rn "Orders\|Manage" --include='*.tsx' components/`)
- Modify: `preorder/actions/share-links.actions.ts` (add `getLeadsCountSince(since: string): Promise<number>` if not derivable from existing endpoint — actually the existing `getLeads({since})` returns `count`, so reuse)

**Acceptance Criteria:**
- [ ] "Leads" link appears between "Orders" and "Manage" in the dashboard sidebar
- [ ] Badge shows the number of leads with `last_seen_at > localStorage.lastSeenLeadsAt`
- [ ] Badge fetches once on dashboard mount; resets when visiting `/leads`
- [ ] No badge shown when count is 0

**Verify:** Manual: visit `/orders`, see badge count; visit `/leads`, badge clears.

**Steps:**

- [ ] **Step 1: Find the nav file**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
grep -rn "Orders\|orders" --include='*.tsx' components/ app/\(dashboard\)/layout.tsx 2>/dev/null | grep -i "nav\|sidebar\|layout" | head -5
```

Identify the file. (Likely under `app/(dashboard)/layout.tsx` or `components/shared/Sidebar.tsx` — actual location TBD by grep.)

- [ ] **Step 2: Add the Leads link + badge**

In that file, where existing nav items are listed, add:

```tsx
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getLeads } from "@/actions/share-links.actions";

// inside the component:
const [newLeads, setNewLeads] = useState(0);
useEffect(() => {
  const since = localStorage.getItem("lastSeenLeadsAt");
  if (!since) return;
  getLeads({ since }).then((data) => setNewLeads(data.count)).catch(() => {});
}, []);

// In the nav, between Orders and Manage:
<Link href="/leads" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded">
  <Users className="w-5 h-5" />
  <span>Leads</span>
  {newLeads > 0 && <span className="ml-auto bg-[#27BA5F] text-white text-xs rounded-full px-2 py-0.5">{newLeads}</span>}
</Link>
```

(Adapt class names to whatever the existing nav uses.)

- [ ] **Step 3: Verify**

```bash
npm run build
```

Manual: nav shows Leads link.

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/layout.tsx  # or whichever file
git commit -m "feat(share-links): sidebar Leads link with new-leads-since badge"
```

---

## Task 19: Manage page Store Link tab + EditSlugModal

**Goal:** New "Store Link" tab on the manage page showing the merchant's slug, the store share link with SharePanel, and an "Edit slug" button that opens a modal using `SlugInput`.

**Files:**
- Modify: `preorder/app/(dashboard)/manage/page.tsx` (or wherever tabs live — discover with `grep -rn "Account\|Payment\|Dispatch" components/manage/`)
- Create: `preorder/components/slug/EditSlugModal.tsx`
- Create: a tab component for "Store Link" if the existing tabs pattern requires one

**Acceptance Criteria:**
- [ ] New "Store Link" tab appears in the manage page tabs
- [ ] Tab shows: current slug + store URL, "Edit slug" button, SharePanel for the store share link, list of retired alias slugs with their retired_at
- [ ] "Edit slug" opens EditSlugModal
- [ ] Modal: shows current slug, SlugInput with `excludeCurrent`, warning copy, alias history (from `getMyStoreLink`), Cancel + Update buttons
- [ ] On Update: PATCH via `updateStoreSlug`; success → toast + close + refresh; error → inline field error (uses `errorMessage` helper)

**Verify:** Manual: open Store Link tab → see SharePanel; click Edit slug → modal → change slug → success toast → old URL 301s in browser.

**Steps:**

- [ ] **Step 1: Create `components/slug/EditSlugModal.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SlugInput from "./SlugInput";
import { updateStoreSlug } from "@/actions/slug.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";

interface Props {
  open: boolean;
  onClose: () => void;
  currentSlug: string;
  aliases: { slug: string; retired_at: string | null }[];
  onUpdated: () => void;
}

export default function EditSlugModal({ open, onClose, currentSlug, aliases, onUpdated }: Props) {
  const [slug, setSlug] = useState(currentSlug);
  const [available, setAvailable] = useState<boolean | null>(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setFieldError(null);
    try {
      await updateStoreSlug(slug);
      toast.success("Store link updated");
      onUpdated();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      if (data?.slug?.[0]) {
        setFieldError(data.slug[0]);
      } else {
        toast.error(errorMessage(e, "Could not update store link."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit your store link</DialogTitle></DialogHeader>

        <div className="mt-3">
          <p className="text-sm text-gray-500">Your current link:</p>
          <code className="text-sm">buzzmart.app/store/{currentSlug}</code>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-1">New link:</p>
          <SlugInput value={slug} onChange={setSlug} excludeCurrent={currentSlug} onAvailability={setAvailable} />
          {fieldError && <p className="text-xs text-red-600 mt-1">{fieldError}</p>}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
          ⚠ <strong>Old links keep working.</strong> Customers who tap your old link will be redirected to your new one. You can change this any time.
        </div>

        {aliases.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            <p>Previously used slugs (still redirect):</p>
            <ul className="list-disc list-inside">
              {aliases.map((a) => (
                <li key={a.slug}>{a.slug} {a.retired_at && `(retired ${new Date(a.retired_at).toLocaleDateString()})`}</li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || available !== true || slug === currentSlug} className="bg-[#27BA5F] hover:bg-[#1FA34E]">
            Update store link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Add Store Link tab to the manage page**

Find the tabs implementation (probably `app/(dashboard)/manage/page.tsx`). Add a new tab entry:

```tsx
import SharePanel from "@/components/share/SharePanel";
import EditSlugModal from "@/components/slug/EditSlugModal";
import { getStoreShareStats } from "@/actions/share-links.actions";
import { getAccountProfile } from "@/actions/auth.actions";

// state:
const [storeStats, setStoreStats] = useState<ShareStats | null>(null);
const [storeMeta, setStoreMeta] = useState<{ slug: string; aliases: { slug: string; retired_at: string | null }[] } | null>(null);
const [editing, setEditing] = useState(false);

const refresh = useCallback(async () => {
  const [stats, profile] = await Promise.all([
    getStoreShareStats(),
    getAccountProfile(), // existing — extend if it doesn't already include aliases
  ]);
  setStoreStats(stats);
  setStoreMeta({ slug: profile.store_url.split("/").pop()!, aliases: profile.aliases ?? [] });
}, []);

useEffect(() => { refresh(); }, [refresh]);

// in the tab JSX:
<div>
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="font-bold uppercase text-sm text-gray-500">Your Store Link</h2>
      <code className="text-sm">buzzmart.app/store/{storeMeta?.slug}</code>
    </div>
    <Button variant="outline" onClick={() => setEditing(true)}>Edit slug</Button>
  </div>
  {storeStats && <SharePanel stats={storeStats} shareTitle={storeMeta?.slug ?? ""} messageTemplate={`Visit my store:`} />}
  {storeMeta && (
    <EditSlugModal
      open={editing}
      onClose={() => setEditing(false)}
      currentSlug={storeMeta.slug}
      aliases={storeMeta.aliases}
      onUpdated={refresh}
    />
  )}
</div>
```

If `getAccountProfile` doesn't return `aliases`, switch to a new dedicated call `getMyStoreLink` exported from `slug.actions.ts`:

```typescript
export async function getMyStoreLink() {
  const token = localStorage.getItem("buzzToken");
  const res = await axios.get(`${baseUrl}/accounts/store/link/`, { headers: { Authorization: `token ${token}` } });
  return res.data; // { store_slug, store_url, business_name, aliases }
}
```

- [ ] **Step 3: Verify**

```bash
npm run build
```

Manual:
1. Visit `/manage`, click Store Link tab → see panel + Edit slug.
2. Click Edit slug → modal opens with SlugInput.
3. Try a reserved word → see ✗ Reserved word.
4. Pick a valid new slug → Update → toast success.
5. Open the old `/store/<old-slug>/` in a browser → should 301 to new.

- [ ] **Step 4: Commit**

```bash
git add components/slug/EditSlugModal.tsx app/\(dashboard\)/manage/page.tsx actions/slug.actions.ts
git commit -m "feat(share-links): manage Store Link tab + EditSlugModal"
```

---

## Task 20: Setup wizard slug integration

**Goal:** Add `SlugInput` to setup wizard step 2 (business details) with auto-suggest from business name, send the chosen slug as part of the setup payload.

**Files:**
- Modify: `preorder/components/setup/BussinessDetails.tsx`
- Modify: `preorder/actions/auth.actions.ts` (extend `setupAccount` to accept `store_slug`)

**Acceptance Criteria:**
- [ ] SlugInput appears directly under the business name field
- [ ] As the merchant types into the business name, the slug field auto-fills with a slugified version
- [ ] Merchant can override the slug; subsequent business-name edits don't overwrite a hand-edited slug
- [ ] Continue button disabled until slug is available
- [ ] The setup payload includes `store_slug`
- [ ] Backend rejects invalid/duplicate slug → form shows error inline

**Verify:** Manual: register → setup → step 2 → type business name → slug fills → submit → success.

**Steps:**

- [ ] **Step 1: Modify `setupAccount` signature in `actions/auth.actions.ts`**

```typescript
export const setupAccount = async ({
  fullName, username, phone_number, address, display_picture,
  business_description, business_email, business_name, bank_name, account_number,
  store_slug,
}: {
  fullName: string; username: string; phone_number: string; address: string;
  display_picture: string; business_description: string; business_email: string;
  business_name: string; bank_name: string; account_number: string;
  store_slug?: string;
}) => {
  const token = localStorage.getItem("buzzToken");
  const formData = new FormData();
  formData.append("full_name", fullName);
  formData.append("username", username);
  formData.append("phone_number", phone_number);
  formData.append("address", address);
  if (display_picture) formData.append("display_picture", display_picture);
  formData.append("business_name", business_name);
  formData.append("business_description", business_description);
  formData.append("business_email", business_email);
  formData.append("bank_name", bank_name);
  formData.append("account_number", account_number);
  formData.append("whatsapp_number", phone_number);
  if (store_slug) formData.append("store_slug", store_slug);

  const response = await axios.patch(`${baseUrl}/accounts/setup/`, formData, {
    headers: { Authorization: `token ${token}`, "Content-Type": "multipart/form-data" },
  });
  return response;
};
```

- [ ] **Step 2: Modify `components/setup/BussinessDetails.tsx`**

Inside the component, add:

```tsx
import SlugInput from "@/components/slug/SlugInput";

// state:
const [slug, setSlug] = useState("");
const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

// Auto-suggest on business name change:
const handleBusinessNameChange = (val: string) => {
  // existing onChange handler:
  setBusinessName(val);  // or whatever existing setter
  if (!slugManuallyEdited) {
    setSlug(slugify(val));
  }
};

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

const handleSlugChange = (s: string) => {
  setSlug(s);
  setSlugManuallyEdited(true);
};

// in JSX, under the business name field:
<div className="mt-4">
  <label className="text-sm font-medium">Your store link:</label>
  <SlugInput value={slug} onChange={handleSlugChange} onAvailability={(av) => setSlugAvailable(av)} />
</div>

// in the existing setStore/setupAccount call, pass store_slug:
setStore({
  ...store,
  // ... existing fields,
  storeSlug: slug,
});
// And ensure the parent flow (BankDetails calling setupAccount) reads store?.storeSlug and passes as store_slug.
```

Update the parent flow (`BankDetails.tsx`) submit:

```typescript
await setupAccount({
  // ... existing args,
  store_slug: store?.storeSlug,
});
```

Disable the "Continue" button on step 2 until `slugAvailable === true`.

- [ ] **Step 3: Verify**

```bash
npm run build
```

Manual: complete a fresh register → setup → type business name → see slug auto-fill → success.

- [ ] **Step 4: Commit**

```bash
git add components/setup/BussinessDetails.tsx actions/auth.actions.ts components/setup/BankDetails.tsx
git commit -m "feat(share-links): setup wizard accepts custom slug with auto-suggest"
```

---

## Task 21: User verification — manual smoke checklist

**Goal:** Walk through the 10 spec-defined smoke checks and confirm with the user that the feature works end-to-end.

**Files:** None modified.

**Acceptance Criteria:**
- [ ] User confirms all 10 smoke checks pass

**User Verification Required:**
Before marking this task complete, you MUST call AskUserQuestion:

```yaml
AskUserQuestion:
  question: "Walking the spec's smoke checklist. For each step that fails, tell me which one — I'll fix and re-run that step before continuing.\n\n1. Open /p/<short_id> in incognito → see interstitial → submit WA → land on product\n2. Reload → land on product directly (cookie skip)\n3. Open same URL in a second incognito → form again (no cookie)\n4. `curl -H 'User-Agent: WhatsApp/2' http://localhost:3000/p/<id>` → response contains og:image + og:title\n5. Merchant dashboard /leads → new lead row appears with the WA number\n6. 'Chat on WhatsApp' → wa.me/+234... opens\n7. /manage Store Link tab → 'Edit slug' → change → old /store/<old>/ 301s in browser\n8. Setup wizard step 2 → type business name → slug auto-fills → backspace + retype → availability check fires\n9. Try reserved word ('admin') → red error\n10. Type duplicate slug → suggestions appear\n\nAll 10 pass?"
  header: "Verification"
  options:
    - label: "All pass"
      description: "Ship — feature is complete and verified."
    - label: "Some fail — list which"
      description: "I'll fix the failing checks and re-verify."
```

**If the user selects the negative option:** The task is NOT complete. Identify the failing step(s), open the relevant prior task to fix, then re-run AskUserQuestion until "All pass."

**Verify:** Subjective — user confirms via AskUserQuestion.

**Steps:**

- [ ] **Step 1: Pre-flight check**

```bash
cd /Users/lordamola/company-repos/data-totems/Buzzmart_backend
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000 &

cd /Users/lordamola/company-repos/data-totems/preorder
npm run dev &
```

- [ ] **Step 2: Seed a known share link**

```bash
cd /Users/lordamola/company-repos/data-totems/Buzzmart_backend
source .venv/bin/activate
python manage.py shell -c "
from accounts.models import User, BusinessDetails, Products, ShareLink
u = User.objects.create_user(email='smoke@x.com', password='pw1234')
BusinessDetails.objects.create(user=u, business_name='Smoke Shop', store_slug='smoke', business_description='d', business_email='s@x.com')
p = Products.objects.create(user=u, name='Smoke Test Phone', price='5000', description='d')
print('PRODUCT SHORT_ID:', ShareLink.objects.get(product=p).short_id)
print('STORE SHORT_ID:', ShareLink.objects.get(merchant=u, kind='store').short_id)
"
```

Note the two short_ids — use them for steps 1–4 of the checklist.

- [ ] **Step 3: Walk the checklist with the user**

Call AskUserQuestion (the standard verification block above). If they say "Some fail", rework, then re-call.

- [ ] **Step 4: Once passed, final commit (no code change, just close the feature)**

```bash
cd /Users/lordamola/company-repos/data-totems/preorder
git tag share-links-v1-verified
echo "Smoke checklist passed $(date)" >> docs/superpowers/plans/2026-06-21-share-links-and-configurable-slugs.md.completion
git add docs/superpowers/plans/2026-06-21-share-links-and-configurable-slugs.md.completion
git commit -m "chore(share-links): mark v1 smoke checklist passed"
```

```json:metadata
{"files": [], "verifyCommand": "", "acceptanceCriteria": ["user confirms all 10 smoke checks pass"], "requiresUserVerification": true, "userVerificationPrompt": "All 10 smoke checks pass?"}
```

---

## Self-review

**1. Spec coverage:**
- Data model (4 tables + BusinessDetails change) → Task 1
- Migration with backfill → Task 1
- Utility modules (lead_tokens, slug_validation, phone) → Task 2
- Auto-create on save → Task 3
- /resolve/ → Task 4
- /identify/ → Task 5
- Slug alias resolution + 301 → Task 6
- PATCH slug + slug check → Task 7
- Leads list + activity → Task 8
- Share-stats endpoints → Task 9
- Setup serializer slug + store/link aliases → Task 10
- Rate limiting → Task 11
- Frontend prep (deps, types, actions, phone) → Task 12
- SlugInput → Task 13
- Interstitial component → Task 14
- /p/ and /s/ pages + Route Handler → Task 15
- SharePanel + ShareButton + product detail integration → Task 16
- Leads inbox + activity drawer → Task 17
- Sidebar nav + badge → Task 18
- Manage Store Link tab + EditSlugModal → Task 19
- Setup wizard slug → Task 20
- Manual smoke checklist verification → Task 21

All spec sections covered.

**2. Placeholder scan:** No "TBD" / "fill in details" / unspecified error handling. Exception: Task 18 says "discover the file with grep" rather than naming it directly — that's intentional since the file location wasn't established during exploration; the grep command is provided so the engineer can find it deterministically.

**3. Type consistency:** Endpoint shapes match between backend serializers and frontend type aliases. The `wa_number` is consistently E.164 (`+234...`). `ShareLink.kind` enum strings match across both repos. `lead_token` field name consistent in API + cookie + frontend.

**4. Verification requirement scan:** The spec explicitly defines a 10-step manual smoke checklist as ship-blocker — this requires user verification. Task 21 includes `requiresUserVerification: true` in its metadata block and uses the standard verification template. ✅

---

## Future Work (out of scope for this plan)

Tracked in spec's "Future work" section: OTP verification, multi-active aliases, WhatsApp Business API broadcast, custom share-message templates, per-channel attribution. All have data-model hooks in place that make them additive (not migrations-from-scratch).
