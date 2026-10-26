# © 2026 aiaiaiai · aiaiaiai.org
# SPDX-License-Identifier: MPL-2.0
# CI supplies the previously built and verified dist; never rebuild here.
FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY dist/ /srv/site/
EXPOSE 1927
USER 1000:1000
