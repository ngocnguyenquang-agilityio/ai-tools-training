// The /search segment needs its own Suspense boundary around the
// `searchParams` read, or navigations into it can't show UI instantly
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md).
export { default } from "@/app/loading";
