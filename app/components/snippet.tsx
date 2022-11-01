import { Snippet as ISnippet } from '@prisma/client'
import { colorMap, backgroundColorMap, langMap } from '~/utils/constants'

export function Snippet({ snippet }: { snippet: Partial<ISnippet> }) {
    return (
        
        <div className={`flex h-300 ${backgroundColorMap[snippet.style?.backgroundColor || 'RED']} p-4 rounded-xl w-full gap-x-2 relative`}>
            <div className="flex flex-col">
                <span className="px-2 py-1 bg-yellow-300 rounded-xl text-black-300 w-auto">
                {snippet.title}                            </span>
                       <p><br></br></p>
                <p className={`${colorMap[snippet.style?.textColor || 'WHITE']} whitespace-pre-wrap break-all`}>{snippet.message}</p>
            </div>
            <div className="absolute bottom-4 right-4 bg-white rounded-full h-10 w-10 flex items-center justify-center text-2xl">
                {langMap[snippet.style?.lang || 'JAVASCRIPT']}
            </div>

        </div>
    )
}