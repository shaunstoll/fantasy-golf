declare module "*.css";
declare module "*.webp" {
  const src: import("next/image").StaticImageData;
  export default src;
}
declare module "*.png" {
  const src: import("next/image").StaticImageData;
  export default src;
}
