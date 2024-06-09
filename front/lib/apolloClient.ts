import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    NormalizedCacheObject,
} from '@apollo/client';
import { useState, useEffect, useMemo } from 'react';

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

const createApolloClient = () =>
    new ApolloClient({
        link: new HttpLink({ uri: process.env.NEXT_PUBLIC_BACKEND_ENDPOINT }),
        cache: new InMemoryCache(),
    });

const initApollo = (initState: any = null) => {
    const _client = apolloClient ?? createApolloClient();
    if (initState) {
        // Get existing cache, loaded during client side data fetching
        const existingCache = _client.extract();

        // Restore the cache using the data passed from getStaticProps/getServerSideProps
        // combined with the existing cached data
        _client.cache.restore({ ...existingCache, ...initState });
    }
    // For SSG and SSR always create a new Apollo Client
    if (typeof window === 'undefined') return _client;
    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _client;

    return _client;
};

const useApolloClient = (initState: any) => {
    const store = useMemo(() => initApollo(initState), [initState]);
    return store;
};
export default useApolloClient;
