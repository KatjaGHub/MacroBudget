"use client";

import { useState } from "react";
import { Camera, ImagePlus, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

export type NutritionScanResult = {
    found_nutrition: boolean;
    name: string;
    emoji: string;
    unit: "g" | "pcs";
    calories: number;
    protein: number;
    package_amount: number;
    package_price: number;
    note: string;
};

type Photo = { preview: string; data: string; media_type: "image/jpeg" };

// Phone photos are several MB; shrink them so the upload is fast and stays
// under the server's request size limit. The label stays readable at this size.
const MAX_SIDE = 1568;

async function prepareImage(file: File): Promise<Photo> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    return {
        preview: dataUrl,
        data: dataUrl.split(",")[1],
        media_type: "image/jpeg",
    };
}

function PhotoSlot({
    label,
    hint,
    photo,
    onChange,
}: {
    label: string;
    hint: string;
    photo: Photo | null;
    onChange: (photo: Photo | null) => void;
}) {
    const { t } = useLanguage();

    return (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-3">
            <p className="text-sm font-black text-rose-950">{label}</p>
            <p className="text-xs font-semibold text-rose-400">{hint}</p>

            {photo ? (
                <div className="relative mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={photo.preview}
                        alt={label}
                        className="h-40 w-full rounded-xl object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-rose-600 shadow"
                        aria-label={t.createIngredient.scanRemovePhoto}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <label className="mt-3 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-pink-50 text-pink-400 transition hover:bg-pink-100">
                    <ImagePlus size={28} />
                    <span className="text-sm font-black">{t.createIngredient.scanAddPhoto}</span>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={async (event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (!file) return;

                            try {
                                onChange(await prepareImage(file));
                            } catch {
                                alert(t.createIngredient.scanPhotoError);
                            }
                        }}
                    />
                </label>
            )}
        </div>
    );
}

export function NutritionScanButton({ onClick }: { onClick: () => void }) {
    const { t } = useLanguage();

    return (
        <button
            type="button"
            onClick={onClick}
            title={t.createIngredient.scanTitle}
            aria-label={t.createIngredient.scanTitle}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-500 shadow-sm transition hover:scale-105 hover:bg-purple-200"
        >
            <Camera size={20} />
            <Sparkles size={12} className="absolute -right-0.5 -top-0.5 text-pink-500" />
        </button>
    );
}

export default function NutritionScanCard({
    onResult,
    onClose,
}: {
    onResult: (result: NutritionScanResult) => void;
    onClose: () => void;
}) {
    const { t } = useLanguage();
    const [labelPhoto, setLabelPhoto] = useState<Photo | null>(null);
    const [productPhoto, setProductPhoto] = useState<Photo | null>(null);
    const [scanning, setScanning] = useState(false);
    const [message, setMessage] = useState("");

    const scan = async () => {
        if (!labelPhoto) return;

        setScanning(true);
        setMessage("");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token;

            const images = [labelPhoto, productPhoto]
                .filter((photo): photo is Photo => photo !== null)
                .map(({ data, media_type }) => ({ data, media_type }));

            const response = await fetch("/api/scan-nutrition", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${accessToken ?? ""}`,
                },
                body: JSON.stringify({ images }),
            });

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.error ?? t.createIngredient.scanFailed);
                return;
            }

            if (!result.found_nutrition) {
                setMessage(result.note || t.createIngredient.scanNothingFound);
                return;
            }

            onResult(result as NutritionScanResult);
            setMessage(result.note || t.createIngredient.scanDone);
        } catch {
            setMessage(t.createIngredient.scanFailed);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="rounded-[2rem] border border-purple-100 bg-purple-50/60 p-5">
            <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 p-3 text-purple-500">
                    <Camera size={22} />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-black text-purple-500">
                        {t.createIngredient.scanTitle}
                    </h2>
                    <p className="text-sm font-semibold text-rose-500">
                        {t.createIngredient.scanBody}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-rose-400 transition hover:bg-purple-100"
                    aria-label={t.createIngredient.scanClose}
                >
                    <X size={20} />
                </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <PhotoSlot
                    label={t.createIngredient.scanLabelPhoto}
                    hint={t.createIngredient.scanLabelHint}
                    photo={labelPhoto}
                    onChange={setLabelPhoto}
                />
                <PhotoSlot
                    label={t.createIngredient.scanProductPhoto}
                    hint={t.createIngredient.scanProductHint}
                    photo={productPhoto}
                    onChange={setProductPhoto}
                />
            </div>

            <button
                type="button"
                onClick={scan}
                disabled={!labelPhoto || scanning}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-4 font-black text-white transition disabled:opacity-50"
            >
                <Sparkles size={18} className={scanning ? "animate-spin" : ""} />
                {scanning ? t.createIngredient.scanning : t.createIngredient.scanButton}
            </button>

            {message && (
                <p className="mt-3 text-center text-sm font-bold text-rose-600">{message}</p>
            )}
        </div>
    );
}
