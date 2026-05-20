"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ShoppingItem = {
    id: number;
    name: string;
    quantity: string | null;
    is_checked: boolean;
    added_by: string | null;
    profiles: {
        id: string;
        full_name: string;
    } | null;
};

type Profile = {
    id: string;
    full_name: string;
};

export default function ShoppingListPage() {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [newItem, setNewItem] = useState("");
    const [newQuantity, setNewQuantity] = useState("");
    const [householdId, setHouseholdId] = useState<number | null>(null);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        let isMounted = true;
        let channelName = "";

        const fetchShoppingItems = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUserId = sessionData.session?.user.id;

            setUserId(currentUserId ?? "");

            if (!currentUserId) return;

            const { data: membershipData, error: membershipError } = await supabase
                .from("household_members")
                .select("household_id")
                .eq("user_id", currentUserId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (membershipError) {
                alert(membershipError.message);
                return;
            }

            const currentHouseholdId = membershipData.household_id;

            if (!isMounted) return;

            setHouseholdId(currentHouseholdId);

            const loadItems = async () => {
                const { data, error } = await supabase
                    .from("shopping_items")
                    .select("id, name, quantity, is_checked, added_by")
                    .eq("household_id", currentHouseholdId)
                    .order("created_at", { ascending: false });

                if (error) {
                    alert(error.message);
                    return;
                }

                const addedByIds = Array.from(
                    new Set((data ?? []).map((item) => item.added_by).filter(Boolean))
                ) as string[];

                let profilesData: Profile[] = [];

                if (addedByIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from("profiles")
                        .select("id, full_name")
                        .in("id", addedByIds);

                    profilesData = (profiles ?? []) as Profile[];
                }

                const itemsWithProfiles = (data ?? []).map((item) => ({
                    ...item,
                    profiles:
                        profilesData.find((profile) => profile.id === item.added_by) ??
                        null,
                }));

                if (isMounted) {
                    setItems(itemsWithProfiles as ShoppingItem[]);
                }
            };

            await loadItems();

            channelName = `shopping-list-${currentHouseholdId}-${crypto.randomUUID()}`;

            const realtimeChannel = supabase
                .channel(channelName)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "shopping_items",
                        filter: `household_id=eq.${currentHouseholdId}`,
                    },
                    () => {
                        loadItems();
                    }
                );

            realtimeChannel.subscribe();
        };

        fetchShoppingItems();

        return () => {
            isMounted = false;

            if (channelName) {
                supabase.removeChannel(supabase.channel(channelName));
            }
        };
    }, []);

    const addItem = async () => {
        if (!newItem.trim()) return;

        if (!householdId) {
            alert("No household found.");
            return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user.id;

        if (!currentUserId) {
            alert("You need to be logged in.");
            return;
        }

        const { data, error } = await supabase
            .from("shopping_items")
            .insert({
                household_id: householdId,
                added_by: currentUserId,
                name: newItem.trim(),
                quantity: newQuantity.trim() || null,
                is_checked: false,
            })
            .select("id, name, quantity, is_checked, added_by")
            .single();

        if (error) {
            alert(error.message);
            return;
        }

        setItems([
            {
                ...(data as Omit<ShoppingItem, "profiles">),
                profiles: {
                    id: currentUserId,
                    full_name: "you",
                },
            },
            ...items,
        ]);

        setNewItem("");
        setNewQuantity("");
    };

    const toggleBought = async (item: ShoppingItem) => {
        const { error } = await supabase
            .from("shopping_items")
            .update({
                is_checked: !item.is_checked,
            })
            .eq("id", item.id);

        if (error) {
            alert(error.message);
            return;
        }

        setItems((currentItems) =>
            currentItems.map((currentItem) =>
                currentItem.id === item.id
                    ? { ...currentItem, is_checked: !currentItem.is_checked }
                    : currentItem
            )
        );
    };

    const deleteItem = async (id: number) => {
        const { error } = await supabase
            .from("shopping_items")
            .delete()
            .eq("id", id);

        if (error) {
            alert(error.message);
            return;
        }

        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    };

    const getAddedByText = (item: ShoppingItem) => {
        if (item.added_by === userId) return "you";
        return item.profiles?.full_name ?? "Someone";
    };

    const toBuyItems = items.filter((item) => !item.is_checked);
    const boughtItems = items.filter((item) => item.is_checked);

    return (
        <main className="mx-auto max-w-2xl p-6">
            <section className="pt-10">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    shared list
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Shopping List ♡
                </h1>

                <p className="mt-3 text-rose-600">
                    Minimal grocery list for quick shopping.
                </p>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-4 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                <div className="flex gap-2">
                    <input
                        value={newItem}
                        onChange={(event) => setNewItem(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") addItem();
                        }}
                        placeholder="Add item..."
                        className="min-w-0 flex-1 rounded-full bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-900 outline-none placeholder:text-rose-300"
                    />

                    <input
                        value={newQuantity}
                        onChange={(event) => setNewQuantity(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") addItem();
                        }}
                        placeholder="Qty"
                        className="w-24 rounded-full bg-pink-50 px-4 py-4 text-center text-lg font-semibold text-rose-900 outline-none placeholder:text-rose-300"
                    />

                    <button
                        onClick={addItem}
                        className="rounded-full bg-pink-500 px-5 text-2xl font-black text-white shadow-sm transition hover:scale-105 hover:bg-pink-600"
                        aria-label="Add item"
                    >
                        +
                    </button>
                </div>
            </section>

            <section className="mt-8">
                <div className="space-y-1">
                    {toBuyItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center gap-4 rounded-2xl px-2 py-3 transition hover:bg-white/70"
                        >
                            <button
                                onClick={() => toggleBought(item)}
                                className="h-7 w-7 rounded-full border-2 border-pink-300 transition group-hover:border-pink-500"
                                aria-label={`Mark ${item.name} as bought`}
                            />

                            <button
                                onClick={() => toggleBought(item)}
                                className="min-w-0 flex-1 text-left"
                            >
                                <p className="truncate text-xl font-black text-rose-950">
                                    {item.name}
                                </p>

                                {item.quantity && (
                                    <p className="text-sm font-medium text-rose-700">
                                        {item.quantity}
                                    </p>
                                )}

                                <p className="text-xs font-bold text-rose-300">
                                    added by {getAddedByText(item)}
                                </p>
                            </button>

                            <button
                                onClick={() => deleteItem(item.id)}
                                className="rounded-full p-2 text-rose-300 opacity-0 transition hover:bg-rose-100 hover:text-rose-500 group-hover:opacity-100"
                                aria-label={`Delete ${item.name}`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {boughtItems.length > 0 && (
                    <div className="mt-10">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-rose-300">
                            Bought
                        </p>

                        <div className="space-y-1">
                            {boughtItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-4 rounded-2xl px-2 py-3 opacity-60 transition hover:bg-white/60"
                                >
                                    <button
                                        onClick={() => toggleBought(item)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-400 text-sm font-bold text-white"
                                        aria-label={`Mark ${item.name} as not bought`}
                                    >
                                        ✓
                                    </button>

                                    <button
                                        onClick={() => toggleBought(item)}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <p className="truncate text-xl font-black text-rose-400 line-through">
                                            {item.name}
                                        </p>

                                        {item.quantity && (
                                            <p className="text-sm font-medium text-rose-300 line-through">
                                                {item.quantity}
                                            </p>
                                        )}

                                        <p className="text-xs font-bold text-rose-300">
                                            added by {getAddedByText(item)}
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="rounded-full p-2 text-rose-300 opacity-0 transition hover:bg-rose-100 hover:text-rose-500 group-hover:opacity-100"
                                        aria-label={`Delete ${item.name}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}