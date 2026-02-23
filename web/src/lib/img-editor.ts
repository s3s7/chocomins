import { supabaseClient } from './supabase-client'

const BUCKET = 'review-images'

type ImgEditorOptions = {
  endpoint?: string
}

export class ImgEditor {
  private supabase
  private endpoint: string

  constructor(options?: ImgEditorOptions) {
    this.supabase = supabaseClient
    this.endpoint = options?.endpoint ?? '/api/reviews/image-upload'
  }

  // 署名発行APIを叩いて、署名トークンでアップロードする
  async uploadImage(fileObj: File) {
    const ext = fileObj.name.split('.').pop()?.toLowerCase() ?? 'png'

    // 1) サーバに署名発行を依頼（NextAuthのsessionで認可される）
    // const res = await fetch('/api/reviews/image-upload', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ext }),
    // })
    // if (!res.ok) {
    //   throw new Error('署名付きアップロードの準備に失敗しました')
    // }
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ext }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`署名付きアップロード準備失敗 (${res.status}): ${text}`)
    }

    const { path, token } = (await res.json()) as {
      path: string
      token: string
    }

    // 2) tokenでアップロード（ここはRLSポリシー不要）
    const { error } = await this.supabase.storage
      .from(BUCKET)
      .uploadToSignedUrl(path, token, fileObj, { contentType: fileObj.type })

    if (error) throw error

    return { path }
  }

  // Public bucket の場合：表示URLを生成
  getPublicUrl(path: string) {
    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }
}
