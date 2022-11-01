import { json, LoaderFunction } from '@remix-run/node'
import { requireUserId, getUser } from '~/utils/auth.server'
import { Layout } from '~/components/layout'
import { useLoaderData, Outlet } from '@remix-run/react';
import { Snippet } from '~/components/snippet';
import { Snippet as ISnippet, Profile, Prisma } from '@prisma/client'
import { SearchBar } from '~/components/search-bar';
import { getFilteredSnippets, getRecentSnippets } from '~/utils/snippets.server'
interface SnippetWithAuthor extends ISnippet {
    author: {
        profile: Profile
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    const sort = url.searchParams.get("sort");
    const filter = url.searchParams.get("filter");
    let sortOptions: Prisma.SnippetOrderByWithRelationInput = {}
    if (sort) {
        if (sort === 'date') {
            sortOptions = {
                createdAt: 'desc'
            }
        }
        if (sort === 'sender') {
            sortOptions = {
                author: {
                    profile: {
                        firstName: 'asc'
                    }
                }
            }
        }
        if (sort === 'lang') {
            sortOptions = {
                style: {
                    lang: 'asc'
                }
            }
        }
    }

    let textFilter: Prisma.SnippetWhereInput = {}
    if (filter) {
        textFilter = {
            OR: [
                {
                    message: {
                        mode: 'insensitive',
                        contains: filter
                    }
                },
                {
                    author: {
                        OR: [
                            { profile: { is: { firstName: { mode: 'insensitive', contains: filter } } } },
                            { profile: { is: { lastName: { mode: 'insensitive', contains: filter } } } },
                        ]
                    }
                },
            ]
        }
    }
    const snippets = await getFilteredSnippets(userId, sortOptions, textFilter)
    const recentSnippets = await getRecentSnippets();
    const user = await getUser(request);
    return json({ user, snippets, recentSnippets })
};

export default function Home() {
    const { snippets, user } = useLoaderData()
    return <Layout>
        <Outlet />
        <div className="h-full">
            <div className="flex-1 flex flex-col">
                <SearchBar profile={user.profile} />
              
            </div>
            <div className="flex-1 flex">
                    <div className="w-snippet p-10 flex flex-col gap-y-4">
                        {
                            snippets.map((snippet: SnippetWithAuthor) =>
                                <Snippet key={snippet.id} snippet={snippet} />
                            )
                        }
                    </div>
                </div>
        </div>
    </Layout >
}
