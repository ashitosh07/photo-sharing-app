import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("test-share", "routes/test-share.tsx"),
  route("generate-did", "routes/generate-did.tsx"),
  route("api/photos/upload", "routes/api.photos.upload.tsx"),
  route("api/photos/share", "routes/api.photos.share.tsx"),
  route("api/photos/revoke", "routes/api.photos.revoke.tsx"),
  route("api/photos/shared/:cid", "routes/api.photos.shared.$cid.tsx"),
  route("api/photos/download/:cid", "routes/api.photos.download.$cid.tsx"),
  route("photo/:cid", "routes/photo.$cid.tsx"),
] satisfies RouteConfig;
