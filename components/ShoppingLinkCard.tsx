"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

export default function ShoppingLinkCard() {
    const { t } = useLanguage();
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const loadToken = async (regenerate = false) => {
        if (regenerate && !confirm(t.settings.linkRegenerateConfirm)) return;

        const { data, error } = await supabase.rpc("get_shopping_link_token", {
            p_regenerate: regenerate,
        });

        if (error) {
            alert(error.message);
            return;
        }

        setToken(data as string);
    };

    const copy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(value);
        window.setTimeout(() => setCopied(null), 2000);
    };

    const baseUrl = token ? `${window.location.origin}/api/shopping/${token}` : "";
    const links = token
        ? [
              { label: t.settings.linkHabitQuestLabel, value: baseUrl },
              { label: t.settings.linkWidgetLabel, value: `${baseUrl}?format=text` },
          ]
        : [];

    return (
        <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-3 text-purple-500">
                    <Link2 size={22} />
                </div>

                <p className="text-2xl font-black text-pink-500">{t.settings.linkTitle}</p>
            </div>

            <p className="mt-3 text-sm font-semibold text-rose-500">
                {t.settings.linkBody}
            </p>

            {token ? (
                <>
                    <div className="mt-5 space-y-4">
                        {links.map((link) => (
                            <div key={link.label}>
                                <p className="text-sm font-black uppercase tracking-wide text-purple-400">
                                    {link.label}
                                </p>

                                <div className="mt-2 flex gap-2">
                                    <input
                                        readOnly
                                        value={link.value}
                                        onFocus={(event) => event.target.select()}
                                        className="min-w-0 flex-1 rounded-2xl bg-purple-50 px-4 py-3 text-sm font-semibold text-rose-950 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => copy(link.value)}
                                        className="shrink-0 rounded-full bg-pink-500 px-5 py-3 text-sm font-black text-white"
                                    >
                                        {copied === link.value ? t.settings.linkCopied : t.settings.linkCopy}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => loadToken(true)}
                        className="mt-5 text-sm font-black text-rose-400 underline"
                    >
                        {t.settings.linkRegenerate}
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={() => loadToken()}
                    className="mt-5 w-full rounded-full bg-purple-500 px-6 py-4 font-black text-white"
                >
                    {t.settings.linkShow}
                </button>
            )}
        </section>
    );
}
