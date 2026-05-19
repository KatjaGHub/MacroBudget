"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
            <form
                onSubmit={async (event) => {
                    event.preventDefault();

                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) {
                        alert(error.message);
                        return;
                    }

                    window.location.href = "/";
                }}
                className="w-full rounded-[2rem] border border-pink-100 bg-white p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]"
            >
                <h1 className="text-4xl font-black text-pink-500">
                    Login ♡
                </h1>

                <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className="mt-6 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-pink-500 outline-none"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="mt-4 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-pink-500 outline-none"
                />

                <button
                    type="submit"
                    className="mt-6 w-full rounded-full bg-pink-500 px-6 py-4 font-black text-white transition hover:bg-pink-600"
                >
                    Log in
                </button>
            </form>
        </main>
    );
}