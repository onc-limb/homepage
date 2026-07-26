/**
 * docs/design/top.html の `.hero__spotlight` を単色化に伴い簡素化。
 * グラデーション廃止（gradient-abolition-solid-background）により、
 * マウス追従の放射状グラデーションによるスポットライトを撤去し、装飾のない
 * 透明オーバーレイに置き換えた。単色ベースのデザインでは追従グロー装飾を持たない。
 */
export function HeroSpotlight() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1]"
        />
    )
}
