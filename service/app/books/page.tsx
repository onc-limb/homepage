import { Suspense } from "react"
import BooksContent from "./BooksContent"

export default function BooksPage() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-turquoise-600 uppercase">
                            Library
                        </span>
                        <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground">
                            Books
                        </h1>
                        <div className="w-16 h-px bg-turquoise-400/60 my-4" />
                        <p className="max-w-[600px] text-muted-foreground text-base md:text-lg font-light tracking-elegant">
                            読んだ書籍の一覧
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-turquoise-200/50" />
            <Suspense fallback={null}>
                <BooksContent />
            </Suspense>
        </main>
    )
}

