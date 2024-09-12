"use server";

import { getUser } from "@/lib/supabase";

const R06_EMAIL_DOMAIN = "route06.co.jp";

export const isRoute06User = async () => {
        const supabaseUser = await getUser();
        const email = supabaseUser.email;

        if (!email) {
                throw new Error("No email found for user");
        }

        const emailDomain = email.split("@")[1];
        return emailDomain === R06_EMAIL_DOMAIN;
};
