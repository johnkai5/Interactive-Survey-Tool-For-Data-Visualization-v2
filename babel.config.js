// Only used by Jest (through babel-jest) so tests can import the browser's ES modules.
// The app itself is not transpiled: browsers load visualization/ui/public/src as-is.
module.exports = {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
}
