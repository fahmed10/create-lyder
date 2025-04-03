import { defineConfig } from 'vite';
import babel from '@rollup/plugin-babel';

export default defineConfig({
    plugins: [
        babel({
            babelrc: false,
            configFile: false,
            ignore: ["node_modules"],
            babelHelpers: "bundled",
            plugins: [
                "@babel/plugin-transform-react-jsx",
                ["lyder/preprocessor", { babelJsx: true }]
            ]
        }),
    ],
})