import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts',
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            clean: true,
        })
    ],
    output: [
        {
            name: 'headroom.umd',
            file: 'dist/bundles/headroom.umd.js',
            format: 'umd'
        },
        {
            file: 'dist/esm/headroom.js',
            format: 'es'
        }
    ]
};
