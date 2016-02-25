import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/SpriteReader.js',
    dest: 'dist/sprite-reader.js',
    format: 'cjs',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
