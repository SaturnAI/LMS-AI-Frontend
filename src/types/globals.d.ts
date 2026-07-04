// Ambient type declarations for non-code side-effect imports.
// Lets TypeScript understand `import "./globals.css"` and CSS modules.
declare module "*.css";

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
