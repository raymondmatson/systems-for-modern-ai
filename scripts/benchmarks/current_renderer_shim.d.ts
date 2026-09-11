declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any; }
  interface IntrinsicAttributes { key?: string | number; }
  interface Element {}
}
declare function __jsx(type: any, props: any, ...children: any[]): any;
declare const __Fragment: any;
declare module 'react' {
  export type KeyboardEvent<T = any> = any;
  export type MouseEvent<T = any> = any;
}
