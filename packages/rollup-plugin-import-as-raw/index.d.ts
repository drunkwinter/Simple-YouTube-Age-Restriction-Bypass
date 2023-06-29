declare module '@syarb/rollup-plugin-import-as-raw' {
    function fn(): Plugin;
    export default fn;
}

declare module 'raw:*' {
    const value: string;
    export default value;
}
