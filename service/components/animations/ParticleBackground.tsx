// 星座風パーティクル背景 (constellation background) は削除済み。
// バレル `components/animations/index.ts` が `ParticleBackground` を
// re-export しているため、モジュールとして有効な no-op スタブを維持する。
// このコンポーネントは何もレンダリングしない（背景はどのページでも表示されない）。
export function ParticleBackground() {
    return null
}

export default ParticleBackground
