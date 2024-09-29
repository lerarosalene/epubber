declare module "*.pug" {
  const template: (runtime: any) => (locals?: any) => string;
  export default template;
}

declare module "pug-runtime" {
  const runtime: any;
  export default runtime;
}
