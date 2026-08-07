'use client'

import { useState } from 'react'
import type { SiteSetting } from '@prisma/client'
import { updateSettingsAction } from '@/lib/actions/settings'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { ThemePicker } from '@/components/admin/ThemePicker'
import { DEFAULT_PRESET_KEY, isPresetKey } from '@/lib/theme/presets'

export function SettingsForm({ settings }: { settings: SiteSetting }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logoUrl)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(settings.faviconUrl)
  const [homeIntroImageUrl, setHomeIntroImageUrl] = useState<string | null>(settings.homeIntroImageUrl)
  const [seoOgImageUrl, setSeoOgImageUrl] = useState<string | null>(settings.seoOgImageUrl)

  const { pending, submit, fieldError, state } = useActionForm(updateSettingsAction)

  const presetKey = isPresetKey(settings.presetKey) ? settings.presetKey : DEFAULT_PRESET_KEY

  return (
    <form onSubmit={submit} className="space-y-8">
      <input type="hidden" name="logoUrl" value={logoUrl ?? ''} />
      <input type="hidden" name="faviconUrl" value={faviconUrl ?? ''} />
      <input type="hidden" name="homeIntroImageUrl" value={homeIntroImageUrl ?? ''} />
      <input type="hidden" name="seoOgImageUrl" value={seoOgImageUrl ?? ''} />

      <fieldset className="min-w-0 space-y-4 border-0 p-0">
        <legend className="block w-full border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
          Chung
        </legend>
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-slate-700">Tên site</label>
          <input id="siteName" name="siteName" defaultValue={settings.siteName}
            className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('siteName')} />
        </div>
        <div className="flex flex-wrap gap-6">
          <MediaPicker label="Logo" value={logoUrl} onChange={setLogoUrl} />
          <MediaPicker label="Favicon" value={faviconUrl} onChange={setFaviconUrl} />
        </div>
      </fieldset>

      <fieldset className="min-w-0 space-y-4 border-0 p-0">
        <legend className="block w-full border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
          Liên hệ
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700">Email liên hệ</label>
            <input id="contactEmail" name="contactEmail" defaultValue={settings.contactEmail}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError errors={fieldError('contactEmail')} />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700">Điện thoại</label>
            <input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError errors={fieldError('contactPhone')} />
          </div>
        </div>
        <div>
          <label htmlFor="contactAddress" className="block text-sm font-medium text-slate-700">Địa chỉ</label>
          <textarea id="contactAddress" name="contactAddress" rows={2} defaultValue={settings.contactAddress ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('contactAddress')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="zaloUrl" className="block text-sm font-medium text-slate-700">Link Zalo</label>
            <input id="zaloUrl" name="zaloUrl" defaultValue={settings.zaloUrl ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError errors={fieldError('zaloUrl')} />
          </div>
          <div>
            <label htmlFor="facebookUrl" className="block text-sm font-medium text-slate-700">Link Facebook</label>
            <input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError errors={fieldError('facebookUrl')} />
          </div>
        </div>
      </fieldset>

      <fieldset className="min-w-0 space-y-4 border-0 p-0">
        <legend className="block w-full border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
          Giao diện
        </legend>
        <ThemePicker
          defaultMode={settings.themeMode}
          defaultPreset={presetKey}
          defaultCustom={settings.customPrimary ?? ''}
        />
        <FieldError errors={fieldError('customPrimary')} />
      </fieldset>

      <fieldset className="min-w-0 space-y-4 border-0 p-0">
        <legend className="block w-full border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
          Trang chủ
        </legend>
        <div>
          <label htmlFor="homeIntroTitle" className="block text-sm font-medium text-slate-700">Tiêu đề giới thiệu</label>
          <input id="homeIntroTitle" name="homeIntroTitle" defaultValue={settings.homeIntroTitle}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('homeIntroTitle')} />
        </div>
        <div>
          <label htmlFor="homeIntroBody" className="block text-sm font-medium text-slate-700">Nội dung giới thiệu</label>
          <textarea id="homeIntroBody" name="homeIntroBody" rows={3} defaultValue={settings.homeIntroBody}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('homeIntroBody')} />
        </div>
        <MediaPicker label="Ảnh giới thiệu" value={homeIntroImageUrl} onChange={setHomeIntroImageUrl} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="homeIntroCtaLabel" className="block text-sm font-medium text-slate-700">Nhãn nút</label>
            <input id="homeIntroCtaLabel" name="homeIntroCtaLabel" placeholder="Xem sản phẩm" defaultValue={settings.homeIntroCtaLabel ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError errors={fieldError('homeIntroCtaLabel')} />
          </div>
          <div>
            <label htmlFor="homeIntroCtaHref" className="block text-sm font-medium text-slate-700">Link nút</label>
            <input id="homeIntroCtaHref" name="homeIntroCtaHref" placeholder="/san-pham" defaultValue={settings.homeIntroCtaHref ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError errors={fieldError('homeIntroCtaHref')} />
          </div>
        </div>
      </fieldset>

      <fieldset className="min-w-0 space-y-4 border-0 p-0">
        <legend className="block w-full border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
          SEO mặc định
        </legend>
        <div>
          <label htmlFor="seoTitleTemplate" className="block text-sm font-medium text-slate-700">Mẫu tiêu đề</label>
          <input id="seoTitleTemplate" name="seoTitleTemplate" placeholder="%s | VNDERCO" defaultValue={settings.seoTitleTemplate}
            className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('seoTitleTemplate')} />
        </div>
        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-slate-700">Mô tả mặc định</label>
          <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={settings.seoDescription}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('seoDescription')} />
        </div>
        <MediaPicker label="Ảnh chia sẻ mặc định (OG image)" value={seoOgImageUrl} onChange={setSeoOgImageUrl} />
      </fieldset>

      {state?.ok && <p role="status" className="text-sm font-medium text-green-700">Đã lưu cài đặt.</p>}
      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
        {pending ? 'Đang lưu…' : 'Lưu cài đặt'}
      </button>
    </form>
  )
}
