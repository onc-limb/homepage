/**
 * Markdown を文字列としてインポートするための webpack 互換ローダー。
 *
 * Next.js 16 で Turbopack が既定になり、`webpack.module.rules` の
 * `type: "asset/source"` が使えなくなったため、その代替として用意した。
 * Turbopack の `rules` は webpack ローダー互換の API を受け付けるので、
 * raw-loader を追加する代わりに同等の 1 関数を自前で持つ。
 *
 * @param {string} source
 * @returns {string}
 */
module.exports = function markdownRawLoader(source) {
    return `export default ${JSON.stringify(source)};`
}
