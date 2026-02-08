import { createClient } from '@supabase/supabase-js'

export class ImgEditor {
  private supabase

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase env missing')
    }
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  async getImageUrl(userId: string) {
    const { data, error } = await this.supabase
      .from('img_editor')
      .select('src')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data?.src ?? null
  }

  async uploadImage(fileObj: File, userId: string) {
    const fileExt = fileObj.name.split('.').pop()?.toLowerCase() ?? 'png'
    const filePath = `${userId}/upload-img.${fileExt}`

    const { data, error } = await this.supabase.storage
      .from('img-store')
      .upload(filePath, fileObj, { upsert: true })

    if (error) throw error

    const { data: pub, error: publicError } = this.supabase.storage
      .from('img-store')
      .getPublicUrl(data.path)

    if (publicError) throw publicError

    const src = pub.publicUrl

    const { error: upsertError } = await this.supabase
      .from('img_editor')
      .upsert({ user_id: userId, src })

    if (upsertError) throw upsertError

    return { src }
  }
}
