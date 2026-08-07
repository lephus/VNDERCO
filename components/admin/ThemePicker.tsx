'use client'

import { useState } from 'react'
import { PRESETS, type PresetKey } from '@/lib/theme/presets'
import { buildPalette, paletteToCssVars } from '@/lib/theme/palette'

const HEX = /^#[0-9a-fA-F]{6}$/

export function ThemePicker({
  defaultMode, defaultPreset, defaultCustom,
}: { defaultMode: 'PRESET' | 'CUSTOM'; defaultPreset: PresetKey; defaultCustom: string }) {
  const [mode, setMode] = useState(defaultMode)
  const [preset, setPreset] = useState<PresetKey>(defaultPreset)
  const [custom, setCustom] = useState(defaultCustom || PRESETS[defaultPreset].primary)

  const effective = mode === 'CUSTOM' && HEX.test(custom) ? custom : PRESETS[preset].primary
  const palette = buildPalette(effective)
  const vars = paletteToCssVars(palette) as React.CSSProperties

  return (
    <div className="space-y-4">
      <input type="hidden" name="themeMode" value={mode} />
      <input type="hidden" name="presetKey" value={preset} />
      <input type="hidden" name="customPrimary" value={mode === 'CUSTOM' ? custom : ''} />

      <div className="flex gap-4 text-sm">
        {(['PRESET', 'CUSTOM'] as const).map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input type="radio" checked={mode === value} onChange={() => setMode(value)} />
            {value === 'PRESET' ? 'Bảng màu dựng sẵn' : 'Tuỳ chỉnh mã màu'}
          </label>
        ))}
      </div>

      {mode === 'PRESET' ? (
        <div className="flex flex-wrap gap-3">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button key={key} type="button" onClick={() => setPreset(key)}
              aria-pressed={preset === key}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${
                preset === key ? 'border-slate-900' : 'border-slate-200'
              }`}>
              <span className="h-5 w-5 rounded-full" style={{ background: PRESETS[key].primary }} />
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input type="color" aria-label="Chọn màu" value={HEX.test(custom) ? custom : '#6C3DF4'}
            onChange={(e) => setCustom(e.target.value)} className="h-10 w-14 rounded border border-slate-300" />
          <input aria-label="Mã màu" value={custom} onChange={(e) => setCustom(e.target.value)}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
          {!HEX.test(custom) && <span className="text-sm text-red-600">Mã màu phải có dạng #RRGGBB</span>}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Xem trước (chưa lưu thì web thật chưa đổi)</p>
        <div style={vars} className="overflow-hidden rounded-xl border border-slate-200">
          <div className="p-6 text-white"
            style={{ background: `linear-gradient(125deg, ${palette.gradientFrom}, ${palette.gradientVia}, ${palette.gradientTo})`, color: palette.foreground }}>
            <p className="text-2xl font-extrabold">Giải pháp cho doanh nghiệp Việt</p>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold"
              style={{ color: palette.primary }}>Xem sản phẩm</span>
          </div>
          <div className="flex gap-2 bg-white p-3">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div key={shade} className="h-8 flex-1 rounded"
                style={{ background: palette.shades[shade as 100] }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
