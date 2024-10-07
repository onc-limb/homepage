<script lang="ts">
  import { onMount } from "svelte";
  import { GetArticles } from "../../wailsjs/go/article/Article";
  import { article } from "../../wailsjs/go/models";
  let articles: article.Article[] = [];
  let isLoading = false;
  let error = null;

  // サーバーから記事一覧を取得する関数
  async function fetchArticles(): Promise<article.Article[]> {
    articles = await GetArticles();
    console.log("記事：", articles);
    return articles;
  }

  // コンポーネントのマウント時に記事を取得
  onMount(() => {
    fetchArticles();
  });
</script>

<template>
  {#if isLoading}
    <p>読み込み中...</p>
  {:else if error}
    <p>エラーが発生しました: {error}</p>
  {:else if articles.length === 0}
    <p>記事が見つかりませんでした。</p>
  {:else}
    <ul>
      {#each articles as article}
        <li>
          <h2>{article.id}</h2>
          <p>{article.title}</p>
        </li>
      {/each}
    </ul>
  {/if}
</template>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  h2 {
    margin: 0 0 8px;
  }
</style>
