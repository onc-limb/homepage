export const GetArticles = async (category?: string) => {
    // DBから記事一覧を取得して、domain objectに詰め込む
    const articles = [
        { title: "記事1", category: "カテゴリー1", content: "本文1" },
        { title: "記事2", category: "カテゴリー2", content: "本文2" },
    ];
    return articles;
};
