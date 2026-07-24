// ParticleBackground was the constellation-style animated background.
// The animation has been removed as part of `constellation-background-removal`;
// this module is intentionally kept as a no-op so the `animations` barrel
// export (`components/animations/index.ts`) still resolves to a valid module.
// It renders nothing on every page.
export function ParticleBackground() {
    return null
}

export default ParticleBackground
