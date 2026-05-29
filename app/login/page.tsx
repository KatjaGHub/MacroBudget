"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function makeInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async () => {
        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message);
                return;
            }

            router.replace("/dashboard");
            return;
        }

        if (!fullName.trim()) {
            alert("Please enter your name.");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        if (data.user) {
            const { error: profileError } = await supabase.from("profiles").insert({
                id: data.user.id,
                full_name: fullName.trim(),
            });

            if (profileError) {
                alert(profileError.message);
                return;
            }

            const { data: createdHousehold, error: householdError } = await supabase
                .from("households")
                .insert({
                    name: `${fullName.trim() || "My"} Household`,
                    invite_code: makeInviteCode(),
                })
                .select()
                .single();

            if (householdError) {
                alert(householdError.message);
                return;
            }

            const { error: membershipError } = await supabase
                .from("household_members")
                .insert({
                    household_id: createdHousehold.id,
                    user_id: data.user.id,
                });

            if (membershipError) {
                alert(membershipError.message);
                return;
            }
        }

        router.replace("/dashboard");
    };

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
                className="w-full rounded-[2rem] border border-pink-100 bg-white p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]"
            >
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    MacroBudget
                </p>

                <h1 className="mt-2 text-4xl font-black text-pink-500">
                    {mode === "login" ? "Welcome back ♡" : "Create account ♡"}
                </h1>

                <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-pink-50 p-1">
                    <button
                        type="button"
                        onClick={() => setMode("login")}
                        className={`rounded-full px-4 py-2 text-sm font-black transition ${mode === "login"
                                ? "bg-pink-500 text-white shadow-sm"
                                : "text-rose-500"
                            }`}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode("register")}
                        className={`rounded-full px-4 py-2 text-sm font-black transition ${mode === "register"
                                ? "bg-pink-500 text-white shadow-sm"
                                : "text-rose-500"
                            }`}
                    >
                        Register
                    </button>
                </div>

                {mode === "register" && (
                    <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Name"
                        className="mt-6 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-pink-500 outline-none placeholder:text-rose-300"
                    />
                )}

                <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className={`${mode === "register" ? "mt-4" : "mt-6"
                        } w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-pink-500 outline-none placeholder:text-rose-300`}
                />

                <input
                    type="password"
                    name="password"
                    autoComplete={
                        mode === "login"
                            ? "current-password"
                            : "new-password"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="mt-4 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-pink-500 outline-none placeholder:text-rose-300"
                />

                <button
                    type="submit"
                    className="mt-6 w-full rounded-full bg-pink-500 px-6 py-4 font-black text-white transition hover:bg-pink-600"
                >
                    {mode === "login" ? "Log in" : "Create account"}
                </button>
            </form>
        </main>
    );
}
