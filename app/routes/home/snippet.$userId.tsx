import { getUserById } from "~/utils/user.server"
import { Modal } from '~/components/modal';
import { getUser } from '~/utils/auth.server'

import { useLoaderData, useActionData } from "@remix-run/react"
import { useState } from "react";
import { SelectBox } from '~/components/select-box'
import { colorMap, langMap } from "~/utils/constants";
import { Snippet } from "~/components/snippet";

import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node"
import { createSnippet } from "~/utils/snippets.server";
import { Color, Lang, SnippetStyle } from '@prisma/client'
import { requireUserId } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { userId } = params
    const user = await getUser(request)

    if (typeof userId !== 'string') {
        return redirect('/home')
    }

    const recipient = await getUserById(userId)
    return json({ recipient, user })
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const userId = await requireUserId(request)

    const title = form.get('title')
    const message = form.get('message')
    const backgroundColor = form.get('backgroundColor')
    const textColor = form.get('textColor')
    const lang = form.get('lang')
    const recipientId = form.get('recipientId')

    if (
        typeof title !== 'string'
        ||
        typeof message !== 'string'
        || typeof recipientId !== 'string'
        || typeof backgroundColor !== 'string'
        || typeof textColor !== 'string'
        || typeof lang !== 'string'
    ) {
        return json({ error: `Invalid Form Data` }, { status: 400 });
    }

    if (!message.length) {
        return json({ error: `Please provide a message.` }, { status: 400 });
    }

    if (!recipientId.length) {
        return json({ error: `No recipient found...` }, { status: 400 });
    }

    await createSnippet(
        title,
        message,
        userId,
        recipientId,
        {
            backgroundColor: backgroundColor as Color,
            textColor: textColor as Color,
            lang: lang as Lang
        }
    )

    return redirect('/home')
}

export default function SnippetModal() {
    const actionData = useActionData()
    const [formError] = useState(actionData?.error || '')
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        style: {
            backgroundColor: 'RED',
            textColor: 'WHITE',
            lang: 'JAVASCRIPT',
        } as SnippetStyle
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setFormData(data => ({ ...data, [field]: e.target.value }))
    }

    const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setFormData(data => ({
            ...data, style: {
                ...data.style,
                [field]: e.target.value
            }
        }))
    }

    const getOptions = (data: any) => Object.keys(data).reduce((acc: any[], curr) => {
        acc.push({
            name: curr.charAt(0).toUpperCase() + curr.slice(1).toLowerCase(),
            value: curr
        })
        return acc
    }, [])

    const colors = getOptions(colorMap)
    const langs = getOptions(langMap)

    const { recipient, user } = useLoaderData()

    return <Modal isOpen={true} className="w-2/3 p-10">
        <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full mb-2">
            {formError}
        </div>
        <form method="post">
            <input type="hidden" value={recipient.id} name="recipientId" />
            <div className="flex flex-col md:flex-row gap-y-2 md:gap-y-0">
          
                <div className="flex-1 flex flex-col gap-y-4">
                <textarea
                        name="title"
                        className="w-full rounded-xl h-10 p-4"
                        value={formData.title}
                        onChange={e => handleChange(e, 'title')}
                        placeholder={`Title here...`}
                    />
                    <textarea
                        name="message"
                        className="w-full rounded-xl h-40 p-4"
                        value={formData.message}
                        onChange={e => handleChange(e, 'message')}
                        placeholder={`Code snippet here...`}
                    />
                    <div className="flex flex-col items-center md:flex-row md:justify-start gap-x-4">
                        <SelectBox
                            options={colors}
                            name="backgroundColor"
                            value={formData.style.backgroundColor}
                            onChange={e => handleStyleChange(e, 'backgroundColor')}
                            label="Label"
                            containerClassName="w-36"
                            className="w-full rounded-xl px-3 py-2 text-gray-400"
                        />
                        <SelectBox
                            options={colors}
                            name="textColor"
                            value={formData.style.textColor}
                            onChange={e => handleStyleChange(e, 'textColor')}
                            label="Text Color"
                            containerClassName="w-36"
                            className="w-full rounded-xl px-3 py-2 text-gray-400"
                        />
                        <SelectBox
                            options={langs}
                            label="Lang"
                            name="lang"
                            value={formData.style.lang}
                            onChange={e => handleStyleChange(e, 'lang')}
                            containerClassName="w-36"
                            className="w-full rounded-xl px-3 py-2 text-gray-400"
                        />
                    </div>
                </div>
            </div>
            <br />
            <p className="text-blue-600 font-semibold mb-2">Preview</p>
            <div className="flex flex-col items-center md:flex-row gap-x-24 gap-y-2 md:gap-y-0">
                <Snippet snippet={formData} />
                <div className="flex-1" />
                <button type="submit" className="rounded-xl bg-yellow-300 font-semibold text-blue-600 w-80 h-12 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1">
                    Send
                </button>
            </div>
        </form>
    </Modal>
}
