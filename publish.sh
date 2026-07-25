#!/usr/bin/env bash
# Publish Creative Artstyle. ALWAYS pass scopes: `cohub works publish` overwrites
# workScopes/allowedViewerScopes with empty arrays when the flags are omitted,
# which breaks generation with "No allowed scopes requested".
set -euo pipefail

SLUG="creative-artstyle"
DIR="creative-artstyle/dist"

npm run build

cohub works publish "$SLUG" --dir "$DIR" \
  --work-scope space.view \
  --work-scope session.view \
  --work-scope taskrun.view \
  --viewer-scope generation.create \
  --viewer-scope session.prompt.fullaccess \
  --json | python3 -c "
import sys, json
d = json.load(sys.stdin)
w = d.get('work', d)
vs = w.get('allowedViewerScopes') or []
ws = w.get('workScopes') or []
print('published v%s | slug: %s' % (w.get('latestVersion'), w.get('slug')))
print('  workScopes:', ws)
print('  allowedViewerScopes:', vs)
required = {'generation.create', 'session.prompt.fullaccess'}
missing = required - set(vs)
if missing:
    print('FAIL: missing viewer scopes:', sorted(missing))
    sys.exit(1)
print('OK: generation scopes present')
"
