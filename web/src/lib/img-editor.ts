// import { createClient } from '@supabase/supabase-js'

// export class ImgEditor {
//   private supabase

//   constructor(supabaseUrl: string, supabaseAnonKey: string) {
//     if (!supabaseUrl || !supabaseAnonKey) {
//       throw new Error('Supabase env missing')
//     }
//     this.supabase = createClient(supabaseUrl, supabaseAnonKey)
//   }

//   async getImageUrl(userId: string) {
//     const { data, error } = await this.supabase
//       .from('img_editor')
//       .select('src')
//       .eq('user_id', userId)
//       .single()

//     if (error) return null
//     return data?.src ?? null
//   }

//   async uploadImage(fileObj: File, userId: string) {
//     const fileExt = fileObj.name.split('.').pop()?.toLowerCase() ?? 'png'
//     const filePath = `${userId}/upload-img.${fileExt}`

//     const { data, error } = await this.supabase.storage
//       .from('review-images')
//       .upload(filePath, fileObj, { upsert: true })

//     if (error) throw error

//     const { data: pub, error: publicError } = this.supabase.storage
//       .from('review-images')
//       .getPublicUrl(data.path)

//     if (publicError) throw publicError

//     const src = pub.publicUrl

//     const { error: upsertError } = await this.supabase
//       .from('img_editor')
//       .upsert({ user_id: userId, src })

//     if (upsertError) throw upsertError

//     return { src }
//   }
// }
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'review-images'

export class ImgEditor {
  private supabase

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase env missing')
    }
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
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
    const res = await fetch('/api/reviews/image-upload', {
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
