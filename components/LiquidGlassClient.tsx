"use client";
import LiquidGlass from 'liquid-glass-react'
import { PropsWithChildren } from 'react'

export default function LiquidGlassClient({ children }: PropsWithChildren) {
  return <LiquidGlass 
    displacementScale={100}
    blurAmount={0.5}
    saturation={130}
    aberrationIntensity={2}
    elasticity={0.05}
    cornerRadius={32}
    padding="8px 16px"
    onClick={() => console.log('Button clicked!')}
    overLight= {false}
    style={{ position: "relative", top: "-10%", left: "50%" }}
  >
    {children}
  </LiquidGlass>
}
