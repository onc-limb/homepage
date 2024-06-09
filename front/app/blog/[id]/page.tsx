'use client'

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import {gql, useQuery} from '@apollo/client'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {Button} from '@/components/ui/button'
import { ApolloProvider } from '@apollo/client';
import useApolloClient from '@/lib/apolloClient';
import DOMPurify from 'dompurify';


const GET_ARTICLE_Detail = gql`
    query GetArticleDetail($id: Int!) {
        article(input: $id) {
            id
            title
            category
            content
            featurePoint
            isPublished
            createdAt
            EditedAt
        }
    }
`

const Article = ({initialApolloState, params}: {initialApolloState: any, params: {id: string}}) => {
    const client = useApolloClient(initialApolloState);
    if (!client) {
        return <div>Loading...</div>
    }
    const id = Number(params.id);
    return (
        <ApolloProvider client={client}>
        <ArticleContent id={id}/>
    </ApolloProvider>
    )
}

export default Article

const ArticleContent = ({id}: {id: number}) => {
    const { loading, error, data } = useQuery(GET_ARTICLE_Detail, {
        variables: {id: id}
    })
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;
    const {article} = data;

    const safeHTML = DOMPurify.sanitize(article.content)

    return (
        <article className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 lg:max-w-4xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">{article.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">投稿日：{new Date(article.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-500 dark:text-gray-400">更新日：{new Date(article.EditedAt).toLocaleDateString()}</p>
          </div>
          <div className="prose prose-gray mx-auto dark:prose-invert" dangerouslySetInnerHTML={{ __html: safeHTML }} />
        </div>
      </div>
    </article>
    )
}