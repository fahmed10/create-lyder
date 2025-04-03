import { defineConfig } from 'vite';
import babel from '@rollup/plugin-babel';

export default defineConfig({
    plugins: [
        babel({
            babelrc: false,
            configFile: false,
            ignore: ["node_modules"],
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            babelHelpers: "bundled",
            presets: ["@babel/preset-typescript"],
            plugins: ["lyder/preprocessor"]
        }),
    ],
})