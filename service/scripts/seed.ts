import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "../lib/db/schema"

// ---------------------------------------------------------------------------
// DB 接続
// ---------------------------------------------------------------------------
function createDb() {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url || url === "libsql://" || url.startsWith("file:")) {
        const client = createClient({ url: url?.startsWith("file:") ? url : "file:local.db" })
        return drizzle(client, { schema })
    }

    return drizzle(createClient({ url, authToken: authToken || undefined }), { schema })
}

// ---------------------------------------------------------------------------
// シードデータ
// ---------------------------------------------------------------------------
type BookSeed = {
    title: string
    author: string
    publisher: string | null
    publishedYear: number | null
    isbn: string | null
    officialUrl: string | null
    ogpImage: string | null
    memo: string | null
    tags: string[]
}

const seedBooks: BookSeed[] = [
    {
        title: "エリックエヴァンスのドメイン駆動設計",
        author: "Eric Evans",
        publisher: "翔泳社",
        publishedYear: 2013,
        isbn: "9784798126708",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798126708",
        ogpImage: "https://www.seshop.com/original/images/product/13087/L.png",
        memo: null,
        tags: ["DDD", "設計", "本質"],
    },
    {
        title: "ソフトウェアアーキテクチャの基礎",
        author: "Mark Richards、Neal Ford",
        publisher: "オライリー・ジャパン",
        publishedYear: 2022,
        isbn: "978-4-87311-982-3",
        officialUrl: "https://www.oreilly.co.jp//books/9784873119823/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-982-3.jpeg",
        memo: null,
        tags: ["アーキテクチャ", "本質"],
    },
    {
        title: "スタッフエンジニア",
        author: "Will Larson",
        publisher: "日経BP",
        publishedYear: 2023,
        isbn: "9784296070558",
        officialUrl: "https://bookplus.nikkei.com/atcl/catalog/23/04/07/00760/",
        ogpImage: "https://bookplus.nikkei.com/atcl/catalog/23/04/07/00760/9784296070558.jpg",
        memo: null,
        tags: ["キャリア"],
    },
    {
        title: "ドメイン駆動設計をはじめよう",
        author: "Vlad Khononov",
        publisher: "オライリー・ジャパン",
        publishedYear: 2024,
        isbn: "978-4-8144-0073-7",
        officialUrl: "https://www.oreilly.co.jp/books/9784814400737/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0073-7.jpeg",
        memo: null,
        tags: ["DDD", "設計", "本質"],
    },
    {
        title: "SREをはじめよう",
        author: "David N. Blank-Edelman",
        publisher: "オライリー・ジャパン",
        publishedYear: 2024,
        isbn: "978-4-8144-0090-4",
        officialUrl: "https://www.oreilly.co.jp/books/9784814400904/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0090-4.jpeg",
        memo: null,
        tags: ["SRE"],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "現場で役立つシステム設計の原則",
        author: "増田亨",
        publisher: "技術評論社",
        publishedYear: 2017,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2017/978-4-7741-9087-7",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2017/9784774190877.jpg",
        memo: null,
        tags: ["アーキテクチャ"],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "詳解Terraform",
        author: "Yevgeniy Brikman",
        publisher: "オライリー・ジャパン",
        publishedYear: 2020,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400522/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0052-2.jpeg",
        memo: null,
        tags: ["SRE"],
    },
    {
        title: "入門監視",
        author: "Mike Julian",
        publisher: "オライリー・ジャパン",
        publishedYear: 2019,
        isbn: "978-4-87311-864-2",
        officialUrl: "https://www.oreilly.co.jp/books/9784873118642/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-864-2.jpeg",
        memo: null,
        tags: ["SRE", "本質"],
    },
    {
        title: "コンピュータビジョンのための実践機械学習",
        author: "Valliappa Lakshmanan、Martin Görner、Ryan Gillard",
        publisher: "オライリー・ジャパン",
        publishedYear: 2023,
        isbn: "978-4-8144-0038-6",
        officialUrl: "https://www.oreilly.co.jp/books/9784814400386/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0038-6.jpeg",
        memo: null,
        tags: ["AI", "CV"],
    },
    {
        title: "データ指向アプリケーションデザイン",
        author: "Martin Kleppmann",
        publisher: "オライリー・ジャパン",
        publishedYear: 2019,
        isbn: "978-4-87311-870-3",
        officialUrl: "https://www.oreilly.co.jp/books/9784873118703/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-870-3.jpeg",
        memo: null,
        tags: ["開発手法"],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "コンピュータシステムの理論と実装",
        author: "Noam Nisan、Shimon Schocken",
        publisher: "オライリー・ジャパン",
        publishedYear: 2015,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873117126/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-712-6.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "詳解 システム・パフォーマンス第2版",
        author: "Brendan Gregg",
        publisher: "オライリー・ジャパン",
        publishedYear: 2022,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400072/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0007-2.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "テスト駆動開発",
        author: "Kent Beck",
        publisher: "オーム社",
        publishedYear: 2017,
        isbn: null,
        officialUrl: "https://www.ohmsha.co.jp/book/9784274217883/",
        ogpImage: "https://www.ohmsha.co.jp/Portals/0/book/large/978-4-274-21788-3.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "融けるデザイン",
        author: "渡邊恵太",
        publisher: "ビー・エヌ・エヌ新社",
        publishedYear: 2015,
        isbn: null,
        officialUrl: "https://bnn.co.jp/products/9784861009389",
        ogpImage: "https://cdn.shopify.com/s/files/1/0724/1616/6199/products/9784861009389.png?v=1679800946",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "データモデリングでドメインを駆動する",
        author: "杉本啓",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14010-6",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297140106.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "コンテナセキュリティ",
        author: "Liz Rice",
        publisher: "インプレス",
        publishedYear: 2020,
        isbn: null,
        officialUrl: "https://book.impress.co.jp/books/1122101051",
        ogpImage: "https://img.ips.co.jp/ij/22/1122101051/1122101051-520x.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "SIMPLICITY",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: null,
        ogpImage: null,
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "SQLアンチパターン第2版",
        author: "Bill Karwin",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400744/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0074-4.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "データマネジメントが30分でわかる本",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://kazaneya.com/4ba84237bb5346d886fd9011005ae52e",
        ogpImage: "https://s3.ap-northeast-1.amazonaws.com/wraptas-prod/kazaneya/4ba84237-bb53-46d8-86fd-9011005ae52e/650f1df6c5723db739c7b2cf315093af.png",
        memo: null,
        tags: [],
    },
    {
        title: "[入門]ドメイン駆動設計",
        author: "増田亨、田中ひさてる、奥澤俊樹、中村充志、成瀬允宣、大西政徳",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14317-6",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14317-6",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297143176.jpg",
        memo: null,
        tags: ["DDD", "設計", "本質"],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "マスタリングTCP/IP 入門編",
        author: "竹下隆史、村山公保、荒井透、苅田幸雄",
        publisher: "オーム社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.ohmsha.co.jp/book/9784274224478/",
        ogpImage: "https://www.ohmsha.co.jp/Portals/0/book/large/978-4-274-22447-8.jpg",
        memo: null,
        tags: [],
    },
    {
        title: "アジャイルサムライ",
        author: "Jonathan Rasmusson",
        publisher: "オーム社",
        publishedYear: 2011,
        isbn: "9784274068560",
        officialUrl: "https://www.ohmsha.co.jp/book/9784274068560/",
        ogpImage: "https://www.ohmsha.co.jp/Portals/0/book/large/978-4-274-06856-0.jpg",
        memo: null,
        tags: ["アジャイル", "本質"],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "入門モダンLINUX",
        author: "Brendan Burns",
        publisher: "オライリー・ジャパン",
        publishedYear: 2023,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400218/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0021-8.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publishedYear, isbn
        title: "AIエージェント開発/運用入門",
        author: "",
        publisher: "SBクリエイティブ",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.sbcr.jp/product/4815636609/",
        ogpImage: null,
        memo: null,
        tags: ["AI", "エージェント", "詳細"],
    },
    {
        title: "Webを支える技術",
        author: "山本陽平",
        publisher: "技術評論社",
        publishedYear: 2010,
        isbn: "978-4-7741-4204-3",
        officialUrl: "https://gihyo.jp/book/2010/978-4-7741-4204-3",
        ogpImage: "https://gihyo.jp/assets/images/cover/2010/9784774142043.jpg",
        memo: null,
        tags: ["ネットワーク", "詳細"],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "Real World HTTP",
        author: "渋川よしき",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873118048/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-804-8.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "技術リーダーシップのための14のヒント",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814401178/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0117-8.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "EPUB3とは何か？",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873115337/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-533-7.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publisher, publishedYear, isbn
        title: "ドメイン駆動設計実装モデリングガイド",
        author: "松岡幸一郎",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://booth.pm/ja/items/1835632",
        ogpImage: "https://booth.pximg.net/c/620x620/e103a1fd-fde3-4a54-8dfd-e44cbc1fdffb/i/1835632/7de83f27-7ac9-4d98-89f1-19b92199d3d0_base_resized.jpg",
        memo: null,
        tags: ["DDD", "本質"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "大規模データ管理",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400089/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0008-9.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publisher, publishedYear, isbn, officialUrl
        title: "A PHILOSOPHY OF SOFTWARE DESIGN",
        author: "John Ousterhout",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://web.stanford.edu/~ouster/cgi-bin/book.php",
        ogpImage: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1531857377i/39996759.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "Go言語によるWebアプリケーション開発",
        author: "Mat Ryer",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873117522/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-752-2.jpeg",
        memo: null,
        tags: [],
    },
    {
        title: "MLOps実装ガイド",
        author: "Yaron Haviv、Noah Gift",
        publisher: "オライリー・ジャパン",
        publishedYear: 2025,
        isbn: "978-4-8144-0120-8",
        officialUrl: "https://www.oreilly.co.jp/books/9784814401208/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0120-8.jpeg",
        memo: null,
        tags: ["AI", "MLOps"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "達人が教えるWebパフォーマンスチューニングISUCON",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2022/978-4-297-12846-3",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2022/9784297128463.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "Looks Good To Me",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.manning.com/books/looks-good-to-me",
        ogpImage: "https://images.manning.com/book/3/1bba1a6-b642-4246-9e56-9bdb5ec865d4/DOTD_braganza.png",
        memo: null,
        tags: [],
    },
    {
        title: "Clean Architecture",
        author: "Robert C. Martin",
        publisher: "アスキードワンゴ",
        publishedYear: 2018,
        isbn: "978-4-04-893065-9",
        officialUrl: "https://asciidwango.jp/post/176293765750/clean-architecture",
        ogpImage: "https://64.media.tumblr.com/avatar_c63524fcb991_128.pnj",
        memo: null,
        tags: ["コーディング", "設計", "本質"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "モデルベース要件定義テクニック",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.shuwasystem.co.jp/book/9784798039442.html",
        ogpImage: "http://www.shuwasystem.co.jp/images/book/424508.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn
        title: "俺たちと探求するLLMアプリケーションのオブザーバビリティ",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://techbookfest.org/product/mn0L7GEm3s8Vhmxq971HEi",
        ogpImage: "https://techbookfest.org/api/product/ogp/image/mn0L7GEm3s8Vhmxq971HEi",
        memo: null,
        tags: ["AI", "エージェント"],
    },
    {
        title: "リーダブルコード",
        author: "Dustin Boswell、Trevor Foucher",
        publisher: "オライリー・ジャパン",
        publishedYear: 2012,
        isbn: "978-4-87311-565-8",
        officialUrl: "https://www.oreilly.co.jp/books/9784873115658/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-565-8.jpeg",
        memo: null,
        tags: ["コーディング", "設計", "本質"],
    },
    {
        title: "良いコード/悪いコードで学ぶ設計入門",
        author: "仙塲大也",
        publisher: "技術評論社",
        publishedYear: 2022,
        isbn: "978-4-297-12783-1",
        officialUrl: "https://gihyo.jp/book/2022/978-4-297-12783-1",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2022/9784297127831.jpg",
        memo: null,
        tags: ["設計", "アーキテクチャ", "本質"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "コンピュータビジョン最前線Summer2025",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.kyoritsu-pub.co.jp/book/b10134461.html",
        ogpImage: "https://hondana-image.s3.amazonaws.com/book/image/10134461/9f941efa-ce1e-4d0a-972b-0dab8d0af21c.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "RDRA2.0ハンドブック",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.hanmoto.com/bd/isbn/9784798060415",
        ogpImage: null,
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - isbn, officialUrl
        title: "ゼロから作るDeep Learning",
        author: "斎藤康毅",
        publisher: "オライリー・ジャパン",
        publishedYear: 2016,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873117584/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-758-4.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "改訂新版Go言語プログラミングエッセンス",
        author: "mattn",
        publisher: "技術評論社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2025/978-4-297-15114-0",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2025/9784297151140.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ドメイン駆動設計サンプルコード＆FAQ",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://little-hands.booth.pm/items/3363104",
        ogpImage: "https://booth.pximg.net/c/620x620/e103a1fd-fde3-4a54-8dfd-e44cbc1fdffb/i/3363104/acf96416-639a-47e2-aa7c-43120bdc8e50_base_resized.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "エンジニアのための時間管理術",
        author: "Thomas A. Limoncelli",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873113074/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large4-87311-307-5.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "なっとく！アルゴリズム第2版",
        author: "Aditya Y. Bhargava",
        publisher: "翔泳社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798187013",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798186894.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "エンジニアリングマネージャーのしごと",
        author: "James Stanier",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873119946/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-994-6.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "プログラムはなぜ動くのか",
        author: "矢沢久雄",
        publisher: "日経BP",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://bookplus.nikkei.com/atcl/catalog/21/S00190/",
        ogpImage: "https://bookplus.nikkei.com/atcl/catalog/21/S00190/S00190_common_pc.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "Docker コンテナ開発・環境構築の基礎",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://book.impress.co.jp/books/1120101031",
        ogpImage: "https://img.ips.co.jp/ij/20/1120101031/1120101031-520x.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "初めてのGraphQL",
        author: "Eve Porcello、Alex Banks",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873118932/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-893-2.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "クリエイター六法",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798184142",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798184142.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "初めてのGo言語",
        author: "Jon Bodner",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814401192/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0119-2.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "Binary Hacks Rebooted",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400850/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0085-0.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "Pytorch 自然言語処理プログラミング",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://book.impress.co.jp/books/1119101184",
        ogpImage: "https://img.ips.co.jp/ij/19/1119101184/1119101184-520x.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "達人に学ぶDB設計徹底指南書",
        author: "ミック",
        publisher: "翔泳社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798186634",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798186627.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ドキュメント作成の基本",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.socym.co.jp/book/post-19000",
        ogpImage: "https://www.socym.co.jp/wp-content/uploads/2024/240807-scaled.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "PythonによるAI・機械学習・深層学習アプリの作り方",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.socym.co.jp/book/1279",
        ogpImage: "https://www.socym.co.jp/wp-content/uploads/2020/150pix_syoei.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ハッカーの学校",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.hanmoto.com/bd/isbn/9784781701974",
        ogpImage: "https://img.hanmoto.com/bd/img/9784781701974_600.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publisher, publishedYear, isbn
        title: "The Rust Programming Language",
        author: "Steve Klabnik、Carol Nichols",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://doc.rust-jp.rs/book-ja-pdf/book.pdf",
        ogpImage: null,
        memo: null,
        tags: ["言語", "Rust"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ゾンビスクラムサバイバルガイド",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.maruzen-publishing.co.jp/item/b304740.html",
        ogpImage: "https://hondana-image.s3.amazonaws.com/book/image/10121820/42590197-0f42-4d0d-b8f8-ef6e0ce16af8.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ハンズオンNode.js",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873119236/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-923-6.jpeg",
        memo: null,
        tags: [],
    },
    {
        title: "AWSクラウドネイティブデザインパターン",
        author: "林政利、根本裕規、吉澤稔",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14337-4",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14337-4",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297143374.jpg",
        memo: null,
        tags: ["SRE", "設計"],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "SQL実践入門",
        author: "ミック",
        publisher: "技術評論社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2015/978-4-7741-7301-6",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2015/9784774173016.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "失敗から学ぶRDBの正しい歩き方",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2019/978-4-297-10408-5",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2019/9784297104085.jpg",
        memo: null,
        tags: [],
    },
    {
        title: "実践Next.js",
        author: "吉井健文",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14061-8",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14061-8",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297140618.jpg",
        memo: null,
        tags: ["Next.js", "詳細"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "オブジェクト設計スタイルガイド",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400331/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0033-1.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ビジュアル情報処理",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.cgarts.or.jp/book/img_engineer/index.html",
        ogpImage: "https://www.cgarts.or.jp/wp-content/uploads/2024/10/bccd7fd41fa93880a0507f6116856402.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "組織を変える五つの対話",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400645/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0064-5.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "Pythonブートキャンプ",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2025/978-4-297-14931-4",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2025/9784297149314.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "AWSの基本・仕組み・重要用語が全部わかる教科書",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.sbcr.jp/product/4815607852/",
        ogpImage: "https://www.sbcr.jp/wp-content/uploads/2022/06/AmazonAplus_AWSの基本・仕組み・重要用語が全部わかる教科書_RE_D4-3.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "プログラミング言語の基礎概念",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.saiensu.co.jp/search/?isbn=978-4-7819-1285-1&y=2011",
        ogpImage: "https://www.saiensu.co.jp/bookImages/2011-978-4-7819-1285-1.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "達人プログラマー",
        author: "David Thomas、Andrew Hunt",
        publisher: "オーム社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.ohmsha.co.jp/book/9784274226298/",
        ogpImage: "https://www.ohmsha.co.jp/Portals/0/book/large/978-4-274-22629-8.jpg",
        memo: null,
        tags: [],
    },
    {
        title: "GitHubCI/CD実践ガイド",
        author: "野村友規",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14173-8",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14173-8",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297141738.jpg",
        memo: null,
        tags: ["DevOps"],
    },
    {
        title: "Tidy First?",
        author: "Kent Beck",
        publisher: "オライリー・ジャパン",
        publishedYear: 2024,
        isbn: "978-4-8144-0091-1",
        officialUrl: "https://www.oreilly.co.jp/books/9784814400911/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0091-1.jpeg",
        memo: null,
        tags: ["設計", "開発手法", "本質"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "効率的なGo",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784814400539/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0053-9.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "ソフトウェア開発現場の「失敗」集めてみた。",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798185187",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798185187.jpg",
        memo: null,
        tags: [],
    },
    {
        title: "バックエンドエンジニアを目指す人のためのRust",
        author: "安東一慈、大西諒、徳永裕介、中村謙弘、山中雄大",
        publisher: "翔泳社",
        publishedYear: 2024,
        isbn: "9784798186016",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798186016",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798186016.jpg",
        memo: null,
        tags: ["言語", "Rust"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "起業の科学",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://bookplus.nikkei.com/atcl/catalog/19/271170/",
        ogpImage: "https://bookplus.nikkei.com/atcl/catalog/19/271170/271170_common_pc.jpg",
        memo: null,
        tags: [],
    },
    {
        title: "Go言語ハンズオン",
        author: "掌田津耶乃",
        publisher: "秀和システム",
        publishedYear: 2021,
        isbn: "9784798063997",
        officialUrl: "https://www.shuwasystem.co.jp/book/9784798063997.html",
        ogpImage: "http://www.shuwasystem.co.jp/images/book/564027.jpg",
        memo: null,
        tags: ["言語", "Go", "ハンズオン"],
    },
    {
        // TODO: 情報不足 - author, publisher, publishedYear, isbn, officialUrl
        title: "HTML&CSSとWebデザイン 入門講座",
        author: "",
        publisher: null,
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.sbcr.jp/product/4797398892/",
        ogpImage: "https://www.sbcr.jp/wp-content/uploads/2019/03/html1.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "SREサイトリライアビリティエンジニアリング",
        author: "Betsy Beyer、Chris Jones、Jennifer Petoff、Niall Richard Murphy",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873117911/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-791-1.jpeg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "プロを目指す人のためのTypeScript入門",
        author: "鹿野壮",
        publisher: "技術評論社",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://gihyo.jp/book/2022/978-4-297-12747-3",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2022/9784297127473.jpg",
        memo: null,
        tags: [],
    },
    {
        // TODO: 情報不足 - publishedYear, isbn, officialUrl
        title: "マイクロサービスアーキテクチャ",
        author: "Sam Newman",
        publisher: "オライリー・ジャパン",
        publishedYear: null,
        isbn: null,
        officialUrl: "https://www.oreilly.co.jp/books/9784873117607/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-760-7.jpeg",
        memo: null,
        tags: [],
    },
    {
        title: "現場で使える！機械学習システム構築実践ガイド",
        author: "澁井雄介",
        publisher: "翔泳社",
        publishedYear: 2022,
        isbn: "9784798179049",
        officialUrl: "https://www.seshop.com/product/detail/25429",
        ogpImage: "https://www.seshop.com/static/images/product/25429/L.png",
        memo: null,
        tags: ["AI", "機械学習"],
    },
    {
        title: "AIエンジニアのための機械学習システムデザインパターン",
        author: "澁井雄介",
        publisher: "翔泳社",
        publishedYear: 2021,
        isbn: "9784798169453",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798169453",
        ogpImage: "https://www.shoeisha.co.jp/static/splus/2301/meta/9784798169453.jpg",
        memo: null,
        tags: ["AI", "機械学習"],
    },
    {
        title: "［作って学ぶ］ブラウザのしくみ",
        author: "土井麻未",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14546-0",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14546-0",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297145460.jpg",
        memo: null,
        tags: ["ブラウザ", "ハンズオン"],
    },
    {
        title: "［作って学ぶ］OSのしくみⅠ",
        author: "hikalium",
        publisher: "技術評論社",
        publishedYear: 2025,
        isbn: "978-4-297-14859-1",
        officialUrl: "https://gihyo.jp/book/2025/978-4-297-14859-1",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2025/9784297148591.jpg",
        memo: null,
        tags: ["OS"],
    },
    {
        title: "Elixir実践入門",
        author: "栗林健太郎、大原常徳、大聖寺谷一樹、山内修、齋藤和也、隆藤唯章、高瀬英希",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14014-4",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14014-4",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297140144.jpg",
        memo: null,
        tags: ["Elixir"],
    },
    {
        title: "Rustで学ぶWebAssembly",
        author: "清水智公",
        publisher: "技術評論社",
        publishedYear: 2024,
        isbn: "978-4-297-14413-5",
        officialUrl: "https://gihyo.jp/book/2024/978-4-297-14413-5",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2024/9784297144135.jpg",
        memo: null,
        tags: ["Rust", "WASM"],
    },
    {
        title: "Design It!",
        author: "Michael Keeling",
        publisher: "オライリー・ジャパン",
        publishedYear: 2019,
        isbn: "978-4-87311-895-6",
        officialUrl: "https://www.oreilly.co.jp//books/9784873118956/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-895-6.jpeg",
        memo: null,
        tags: ["アーキテクチャ"],
    },
    {
        title: "ソフトウェアエンジニアガイドブック",
        author: "Gergely Orosz",
        publisher: "オライリー・ジャパン",
        publishedYear: 2025,
        isbn: "978-4-8144-0121-5",
        officialUrl: "https://www.oreilly.co.jp/books/9784814401215/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0121-5.jpeg",
        memo: null,
        tags: ["キャリア"],
    },
    {
        title: "ソフトウェアアーキテクチャ・ハードパーツ",
        author: "Neal Ford、Mark Richards、Pramod Sadalage、Zhamak Dehghani",
        publisher: "オライリー・ジャパン",
        publishedYear: 2022,
        isbn: "978-4-8144-0006-5",
        officialUrl: "https://www.oreilly.co.jp//books/9784814400065/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0006-5.jpeg",
        memo: null,
        tags: ["アーキテクチャ"],
    },
    {
        title: "Effective TypeScript",
        author: "Dan Vanderkam",
        publisher: "オライリー・ジャパン",
        publishedYear: 2025,
        isbn: "978-4-8144-0109-3",
        officialUrl: "https://www.oreilly.co.jp/books/9784814401093/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-8144-0109-3.jpeg",
        memo: null,
        tags: ["言語", "TypeScript", "詳細"],
    },
    {
        // TODO: 情報不足 - isbn
        title: "なぜ依存を注入するのか",
        author: "Steven van Deursen、Mark Seemann",
        publisher: "マイナビ出版",
        publishedYear: 2024,
        isbn: null,
        officialUrl: "https://book.mynavi.jp/ec/products/detail/id=143373",
        ogpImage: "https://book.mynavi.jp//files/topics/143373_ext_06_0.jpg",
        memo: null,
        tags: ["アーキテクチャ", "設計"],
    },
    {
        title: "ソフトウェア設計の結合バランス",
        author: "Vlad Khononov",
        publisher: "インプレス",
        publishedYear: 2025,
        isbn: "9784295022961",
        officialUrl: "https://book.impress.co.jp/books/1124101149",
        ogpImage: "https://img.ips.co.jp/ij/24/1124101149/1124101149-520x.jpg",
        memo: null,
        tags: ["設計"],
    },
    {
        title: "ユーザーストーリーマッピング",
        author: "Jeff Patton",
        publisher: "オライリー・ジャパン",
        publishedYear: 2015,
        isbn: "978-4-87311-732-4",
        officialUrl: "https://www.oreilly.co.jp/books/9784873117324/",
        ogpImage: "https://www.oreilly.co.jp/books/images/picture_large978-4-87311-732-4.jpeg",
        memo: null,
        tags: ["設計", "本質"],
    },
    {
        title: "エンジニアの知的生産術",
        author: "西尾泰和",
        publisher: "技術評論社",
        publishedYear: 2018,
        isbn: "978-4-7741-9876-7",
        officialUrl: "https://gihyo.jp/book/2018/978-4-7741-9876-7",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2018/9784774198767.jpg",
        memo: null,
        tags: ["キャリア", "読み物"],
    },
    {
        // TODO: 情報不足 - isbn
        title: "安全なWebアプリケーションの作り方",
        author: "徳丸浩",
        publisher: "SBクリエイティブ",
        publishedYear: 2018,
        isbn: null,
        officialUrl: "https://www.sbcr.jp/product/4797393163/",
        ogpImage: "https://www.sbcr.jp/wp-content/uploads/2018/05/aplus_taikeitekini_190821_07-e1566374955873.jpg",
        memo: null,
        tags: ["セキュリティ"],
    },
    {
        title: "独習PHP",
        author: "山田祥寛",
        publisher: "翔泳社",
        publishedYear: 2021,
        isbn: "9784798168494",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798168494",
        ogpImage: "https://www.shoeisha.co.jp/static/splus/2165/meta/9784798168494.jpg",
        memo: null,
        tags: ["PHP"],
    },
    {
        title: "PHPフレームワークLaravel入門",
        author: "掌田津耶乃",
        publisher: "秀和システム",
        publishedYear: 2025,
        isbn: "9784798075273",
        officialUrl: "https://www.shuwasystem.co.jp/book/9784798075273.html",
        ogpImage: "http://www.shuwasystem.co.jp/images/book/663841.jpg",
        memo: null,
        tags: ["PHP", "言語"],
    },
    {
        title: "フロントエンド開発のためのテスト入門",
        author: "吉井健文",
        publisher: "翔泳社",
        publishedYear: 2023,
        isbn: "9784798178639",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798178639",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798178189.jpg",
        memo: null,
        tags: ["テスト"],
    },
    {
        title: "ドメイン駆動設計入門",
        author: "成瀬允宣",
        publisher: "翔泳社",
        publishedYear: 2020,
        isbn: "9784798150727",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798150727",
        ogpImage: "https://www.shoeisha.co.jp/static/splus/1837/meta/9784798150727.jpg",
        memo: null,
        tags: ["DDD", "設計", "本質"],
    },
    {
        title: "SCRUM BOOT CAMP THE BOOK",
        author: "西村直人、永瀬美穂、吉羽龍太郎",
        publisher: "翔泳社",
        publishedYear: 2020,
        isbn: "9784798167282",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798167282",
        ogpImage: "https://www.shoeisha.co.jp/static/splus/2480/meta/9784798167282.jpg",
        memo: null,
        tags: ["スクラム", "アジャイル"],
    },
    {
        title: "チームトポロジー",
        author: "Matthew Skelton、Manuel Pais",
        publisher: "日本能率協会マネジメントセンター",
        publishedYear: 2021,
        isbn: "9784820729631",
        officialUrl: "https://pub.jmam.co.jp/book/b593881.html",
        ogpImage: "http://pub.jmam.co.jp/images/book/593881.jpg",
        memo: null,
        tags: ["開発手法"],
    },
    {
        // TODO: 情報不足 - author
        title: "WEB+DB PRESS VOL.133",
        author: "",
        publisher: "技術評論社",
        publishedYear: 2023,
        isbn: "978-4-297-13370-2",
        officialUrl: "https://gihyo.jp/magazine/wdpress/archive/2023/vol133",
        ogpImage: "https://gihyo.jp/assets/images/cover/2023/9784297133702.jpg",
        memo: null,
        tags: ["教養"],
    },
    {
        title: "プリンシプルオブプログラミング",
        author: "上田勲",
        publisher: "秀和システム",
        publishedYear: 2016,
        isbn: "9784798046143",
        officialUrl: "https://www.shuwasystem.co.jp/book/9784798046143.html",
        ogpImage: "http://www.shuwasystem.co.jp/images/book/425175.jpg",
        memo: null,
        tags: ["設計", "本質"],
    },
    {
        title: "フロントエンド開発のためのセキュリティ入門",
        author: "平野昌士",
        publisher: "翔泳社",
        publishedYear: 2023,
        isbn: "9784798170602",
        officialUrl: "https://www.seshop.com/product/detail/25546",
        ogpImage: "https://www.seshop.com/static/images/product/25546/L.png",
        memo: null,
        tags: ["セキュリティ"],
    },
    {
        title: "人工知能は人間を超えるか",
        author: "松尾豊",
        publisher: "KADOKAWA",
        publishedYear: 2015,
        isbn: "9784040800202",
        officialUrl: "https://www.u-tokyo.ac.jp/biblioplaza/ja/D_00055.html",
        ogpImage: "https://www.u-tokyo.ac.jp/content/400113937.jpg",
        memo: null,
        tags: ["AI", "読み物"],
    },
    {
        title: "ネットワークはなぜ繋がるのか",
        author: "戸根勤",
        publisher: "日経BP",
        publishedYear: 2007,
        isbn: "9784822283117",
        officialUrl: "https://bookplus.nikkei.com/atcl/catalog/07/P83110/",
        ogpImage: "https://bookplus.nikkei.com/atcl/catalog/07/P83110/P83110_common_pc.jpg",
        memo: null,
        tags: ["ネットワーク"],
    },
    {
        // TODO: 情報不足 - author, isbn
        title: "日経テクノロジー展望2023世界を変える100の技術",
        author: "",
        publisher: "日経BP",
        publishedYear: 2022,
        isbn: null,
        officialUrl: "https://bookplus.nikkei.com/atcl/catalog/22/08/29/00341/",
        ogpImage: "https://bookplus.nikkei.com/atcl/catalog/22/08/29/00341/9784296001187.jpg",
        memo: null,
        tags: ["教養"],
    },
    {
        title: "アーキテクトの教科書",
        author: "米久保剛",
        publisher: "翔泳社",
        publishedYear: 2024,
        isbn: "9784798184777",
        officialUrl: "https://www.shoeisha.co.jp/book/detail/9784798184777",
        ogpImage: "https://www.shoeisha.co.jp/static/book/og_image/9784798184777.jpg",
        memo: null,
        tags: ["アーキテクチャ", "設計"],
    },
    {
        title: "未来IT図鑑 これからのAIビジネス",
        author: "谷田部卓",
        publisher: "エムディエヌコーポレーション",
        publishedYear: 2018,
        isbn: "978-4-8443-6823-6",
        officialUrl: "https://books.mdn.co.jp/books/3218203011/",
        ogpImage: "https://img.ips.co.jp/mdn/18/3218203011/3218203011-x1000.jpg",
        memo: null,
        tags: ["AI", "読み物"],
    },
    {
        title: "はじめよう！要件定義",
        author: "羽生章洋",
        publisher: "技術評論社",
        publishedYear: 2015,
        isbn: "978-4-7741-7228-6",
        officialUrl: "https://gihyo.jp/book/2015/978-4-7741-7228-6",
        ogpImage: "https://gihyo.jp/assets/images/ogp/2015/9784774172286.jpg",
        memo: null,
        tags: ["設計"],
    },
]

// 記事系シードデータ。既存 books と同じ「本体 + tags 名の集合」パターンに揃える。
// status は schema の check() に合わせて 'draft' | 'published' のみを使う。
type ArticleStatus = "draft" | "published"

type ArticleSeed = {
    // slug は公開サイト /blog/[slug] のルーティングキー。一意である必要がある。
    slug: string
    title: string
    // Markdown 本文（react-markdown + remark-gfm で表示する）。
    body: string
    status: ArticleStatus
    tags: string[]
}

const seedArticles: ArticleSeed[] = [
    {
        slug: "hello-blog",
        title: "ブログをはじめました",
        body: [
            "# ブログをはじめました",
            "",
            "この記事は Seeder で投入されるサンプル記事です。",
            "記事一覧・詳細画面の表示確認に利用します。",
            "",
            "## できること",
            "",
            "- Markdown での本文表示",
            "- タグによる分類",
        ].join("\n"),
        status: "published",
        tags: ["読み物"],
    },
    {
        slug: "ddd-in-practice",
        title: "実践ドメイン駆動設計のはじめ方",
        body: [
            "# 実践ドメイン駆動設計のはじめ方",
            "",
            "ドメイン駆動設計（DDD）を実務に導入する際のポイントを整理します。",
            "",
            "## ユビキタス言語",
            "",
            "チーム全員が同じ言葉でドメインを語れるようにすることが第一歩です。",
            "",
            "## 境界づけられたコンテキスト",
            "",
            "モデルが有効な範囲を明示的に区切ることで、設計の一貫性を保ちます。",
        ].join("\n"),
        status: "published",
        tags: ["DDD", "設計", "本質"],
    },
    {
        slug: "nextjs-app-router-notes",
        title: "Next.js App Router 移行メモ",
        body: [
            "# Next.js App Router 移行メモ",
            "",
            "Pages Router から App Router へ移行する際に押さえておきたい点をまとめます。",
            "",
            "## Server Components",
            "",
            "デフォルトが Server Component になるため、クライアント固有の処理は `\"use client\"` を明示します。",
            "",
            "## データ取得",
            "",
            "`fetch` のキャッシュ制御と `revalidate` の挙動を理解しておくと安定します。",
        ].join("\n"),
        status: "published",
        tags: ["Next.js", "詳細"],
    },
    {
        slug: "sre-getting-started",
        title: "SRE 入門: SLO から始める信頼性設計",
        body: [
            "# SRE 入門: SLO から始める信頼性設計",
            "",
            "サービスの信頼性を数値で扱うための出発点として SLO を設定します。",
            "",
            "## エラーバジェット",
            "",
            "SLO を割ることで許容されるエラーの量を可視化し、開発と運用のバランスを取ります。",
        ].join("\n"),
        status: "draft",
        tags: ["SRE", "本質"],
    },
    {
        slug: "typescript-tips",
        title: "TypeScript の型を安全に保つための小さな工夫",
        body: [
            "# TypeScript の型を安全に保つための小さな工夫",
            "",
            "日々のコーディングで型の安全性を高めるための小技を紹介します。",
            "",
            "## `as` を避ける",
            "",
            "型アサーションは最終手段にとどめ、まずは型ガードで絞り込みます。",
        ].join("\n"),
        status: "draft",
        tags: ["言語", "TypeScript", "詳細"],
    },
]

// ---------------------------------------------------------------------------
// 実行
// ---------------------------------------------------------------------------
async function seed() {
    const db = createDb()

    // 既存データをクリア（順序重要: 外部キー制約）
    await db.delete(schema.bookTags)
    await db.delete(schema.articleTags)
    await db.delete(schema.books)
    await db.delete(schema.articles)
    await db.delete(schema.tags)

    // 全タグを抽出・重複排除（books / articles 双方のタグ名を集合化）
    const allTagNames = [
        ...new Set([...seedBooks.flatMap((b) => b.tags), ...seedArticles.flatMap((a) => a.tags)]),
    ].filter(Boolean)

    // tags テーブルに挿入
    if (allTagNames.length > 0) {
        await db.insert(schema.tags).values(allTagNames.map((name) => ({ name })))
    }

    // name → id マップを作成
    const allTags = await db.select().from(schema.tags)
    const tagMap = new Map(allTags.map((t) => [t.name, t.id]))

    // books + bookTags を挿入
    let bookCount = 0
    let bookTagCount = 0

    for (const book of seedBooks) {
        const [inserted] = await db
            .insert(schema.books)
            .values({
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                publishedYear: book.publishedYear,
                isbn: book.isbn,
                officialUrl: book.officialUrl,
                ogpImage: book.ogpImage,
                memo: book.memo,
                isRead: false,
            })
            .returning({ id: schema.books.id })

        bookCount++

        // bookTags を挿入
        const tagIds = book.tags.map((name) => tagMap.get(name)).filter((id): id is number => id !== undefined)
        if (tagIds.length > 0) {
            await db.insert(schema.bookTags).values(tagIds.map((tagId) => ({ bookId: inserted.id, tagId })))
            bookTagCount += tagIds.length
        }
    }

    // articles + articleTags を挿入（books と同じパターンを踏襲）
    let articleCount = 0
    let articleTagCount = 0

    for (const article of seedArticles) {
        const [inserted] = await db
            .insert(schema.articles)
            .values({
                slug: article.slug,
                title: article.title,
                body: article.body,
                status: article.status,
            })
            .returning({ id: schema.articles.id })

        articleCount++

        // articleTags を挿入
        const tagIds = article.tags.map((name) => tagMap.get(name)).filter((id): id is number => id !== undefined)
        if (tagIds.length > 0) {
            await db.insert(schema.articleTags).values(tagIds.map((tagId) => ({ articleId: inserted.id, tagId })))
            articleTagCount += tagIds.length
        }
    }

    console.log(`Seed completed:`)
    console.log(`  - ${allTagNames.length} tags`)
    console.log(`  - ${bookCount} books`)
    console.log(`  - ${bookTagCount} book-tag relations`)
    console.log(`  - ${articleCount} articles`)
    console.log(`  - ${articleTagCount} article-tag relations`)
}

seed().catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
})
