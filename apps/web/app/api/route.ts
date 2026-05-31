import { NextResponse } from "next/server";

export async function GET() {
  const endpoints = {
    name: "SUKIT API",
    version: "1.0",
    authentication: "next-auth (Credentials)",
    namespaces: {
      auth: {
        register: { method: "POST", path: "/api/auth/register" },
        logout: { method: "POST", path: "/api/auth/logout" },
        session: { method: "GET", path: "/api/auth/session" },
      },
      sites: {
        list: { method: "GET", path: "/api/sites" },
        create: { method: "POST", path: "/api/sites" },
        get: { method: "GET", path: "/api/sites/[siteId]" },
        update: { method: "PUT", path: "/api/sites/[siteId]" },
        delete: { method: "DELETE", path: "/api/sites/[siteId]" },
        settings: { method: "GET|PUT", path: "/api/sites/[siteId]/settings" },
        pages: { method: "GET|POST", path: "/api/sites/[siteId]/pages" },
        media: { method: "GET|POST", path: "/api/sites/[siteId]/media" },
        export: { method: "POST", path: "/api/sites/[siteId]/export" },
      },
      pages: {
        get: { method: "GET", path: "/api/pages/[pageId]" },
        update: { method: "PUT", path: "/api/pages/[pageId]" },
        publish: { method: "POST", path: "/api/pages/[pageId]/publish" },
        sections: { method: "POST|PUT|DELETE", path: "/api/pages/[pageId]/sections" },
        blocks: { method: "PUT|DELETE", path: "/api/pages/[pageId]/blocks/[blockId]" },
        revisions: { method: "GET", path: "/api/pages/[pageId]/revisions" },
        restore: { method: "POST", path: "/api/pages/[pageId]/revisions" },
      },
      posts: {
        list: { method: "GET", path: "/api/posts" },
        create: { method: "POST", path: "/api/posts" },
        get: { method: "GET", path: "/api/posts/[postId]" },
        update: { method: "PUT", path: "/api/posts/[postId]" },
        delete: { method: "DELETE", path: "/api/posts/[postId]" },
      },
      comments: {
        list: { method: "GET", path: "/api/comments" },
        create: { method: "POST", path: "/api/comments" },
        update: { method: "PUT", path: "/api/comments/[commentId]" },
        delete: { method: "DELETE", path: "/api/comments/[commentId]" },
        submit: { method: "POST", path: "/api/comments/submit", auth: false },
      },
      taxonomies: {
        list: { method: "GET", path: "/api/taxonomies" },
        create: { method: "POST", path: "/api/taxonomies" },
        update: { method: "PUT", path: "/api/taxonomies/[taxonomyId]" },
        delete: { method: "DELETE", path: "/api/taxonomies/[taxonomyId]" },
      },
      themes: {
        list: { method: "GET", path: "/api/themes" },
        install: { method: "POST", path: "/api/themes" },
        activate: { method: "POST", path: "/api/themes" },
      },
      options: {
        list: { method: "GET", path: "/api/options" },
        set: { method: "POST", path: "/api/options" },
        update: { method: "PUT", path: "/api/options/[optionId]" },
        delete: { method: "DELETE", path: "/api/options/[optionId]" },
      },
      widgets: {
        list: { method: "GET", path: "/api/widget-areas" },
        create: { method: "POST", path: "/api/widget-areas" },
        update: { method: "PUT", path: "/api/widget-areas/[areaId]" },
        delete: { method: "DELETE", path: "/api/widget-areas/[areaId]" },
      },
      cron: {
        list: { method: "GET", path: "/api/cron" },
        create: { method: "POST", path: "/api/cron" },
      },
      search: {
        query: { method: "GET", path: "/api/search?q=", auth: false },
      },
      export: {
        build: { method: "POST", path: "/api/export/[siteId]" },
        status: { method: "GET", path: "/api/export/[siteId]" },
        download: { method: "GET", path: "/api/export/[siteId]/download" },
      },
      webhooks: {
        github: { method: "POST", path: "/api/webhook/github", auth: false },
      },
    },
  };

  return NextResponse.json(endpoints);
}
