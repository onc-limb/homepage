/** 通知経路（Slack / メール）へ渡す、保存済み問い合わせの表示用データ。 */
export interface ContactNotification {
    /** contacts.id。通知から DB のレコードを引けるようにするため含める。 */
    id: number
    name: string
    email: string
    company?: string | null
    /** 相談種別の表示名（`work` などの生値ではなくラベル）。 */
    categoryLabel: string
    message: string
}

/** 通知 1 経路の結果。失敗しても送信自体は成功扱いにするため、例外ではなく値で返す。 */
export interface NotifyResult {
    delivered: boolean
    /** 設定が無いなどで送信を試みなかった場合は true。 */
    skipped: boolean
}

export const NOT_CONFIGURED: NotifyResult = { delivered: false, skipped: true }
export const DELIVERED: NotifyResult = { delivered: true, skipped: false }
export const FAILED: NotifyResult = { delivered: false, skipped: false }
