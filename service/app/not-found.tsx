import { Page } from "@/components/ds/Page"
import { TextLink } from "@/components/ds/TextLink"

import { HOME_LINK_LABEL } from "./error-copy"

export default function NotFound() {
    return (
        <main className="flex-1">
            <Page title="404 ページが見つかりません">
                <div className="space-y-ds-3">
                    <p>
                        お探しのページは移動または削除された可能性があります。URL をご確認いただくか、ホームからお探しください。
                    </p>
                    <p>
                        <TextLink href="/">{HOME_LINK_LABEL}</TextLink>
                    </p>
                </div>
            </Page>
        </main>
    )
}
