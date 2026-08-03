/**
 * コンタクトフォームの useActionState 用の状態定義。
 *
 * クライアントコンポーネント（app/contact/ContactForm.tsx）から import されるため、
 * このファイルは DB・通知などサーバー専用モジュールに依存させないこと。
 * 依存させると lib/db 経由で libsql がクライアントバンドルに引き込まれて壊れる。
 * 処理本体は lib/contact-submission.ts 側にある。
 */

/** 送信者が入力した生の値。エラー時に画面へ戻して入力をやり直させないために使う。 */
export interface ContactFormValuesRaw {
    name: string
    email: string
    company: string
    category: string
    message: string
}

export type ContactFormState =
    | { status: "idle" }
    | { status: "success" }
    | {
          status: "error"
          message: string
          fieldErrors?: Record<string, string[] | undefined>
          // React 19 の form action は送信後にフォームをリセットするため、
          // エラー時はここに入力値を戻して defaultValue で復元する。
          values: ContactFormValuesRaw
      }

export const initialContactFormState: ContactFormState = { status: "idle" }
