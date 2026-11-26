/* LUMA — CONTROLADOR DE APARÊNCIA */

(function () {

    const PREFIXO_TEMA = "luma-theme:";

    function temaValido(tema) {
        return tema === "light" || tema === "dark";
    }

    /* APLICAR APARÊNCIA */

    function aplicarTema(tema) {

        if (!temaValido(tema)) return;

        document.documentElement.dataset.theme = tema;
    }

    /* CARREGAR CACHE INDIVIDUAL */

    function carregarTemaLocal(userId) {

        if (!userId) return "dark";

        try {

            const tema = localStorage.getItem(
                PREFIXO_TEMA + userId
            );

            return temaValido(tema) ? tema : "dark";

        } catch {

            return "dark";

        }
    }

    /* ARMAZENAR PREFERÊNCIA INDIVIDUAL */

    function guardarTemaLocal(userId, tema) {

        if (!userId || !temaValido(tema)) return;

        try {

            localStorage.setItem(
                PREFIXO_TEMA + userId,
                tema
            );

        } catch (error) {

            console.warn(
                "Não foi possível armazenar o tema."
            );

        }
    }

    /* REMOVER CACHE INDIVIDUAL */

    function removerTemaLocal(userId) {

        if (!userId) return;

        try {

            localStorage.removeItem(
                PREFIXO_TEMA + userId
            );

        } catch {

            // O armazenamento pode estar indisponível.

        }
    }

    /* CARREGAR PREFERÊNCIA DO SUPABASE */

    async function carregarPreferencia(client, userId) {

        if (!userId) {
            aplicarTema("dark");
            return null;
        }

        aplicarTema(carregarTemaLocal(userId));

        const { data, error } = await client
            .from("user_appearance_preferences")
            .select("theme")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {

            removerTemaLocal(userId);
            aplicarTema("dark");

            return null;

        }

        if (!temaValido(data.theme)) {
            throw new Error("Preferência de tema inválida.");
        }

        guardarTemaLocal(userId, data.theme);
        aplicarTema(data.theme);

        return data.theme;
    }

    /* SALVAR PREFERÊNCIA NO SUPABASE */

    async function salvarPreferencia(client, userId, tema) {

        if (!userId) {
            throw new Error("Usuário não identificado.");
        }

        if (!temaValido(tema)) {
            throw new Error("Tema inválido.");
        }

        const { data, error } = await client
            .from("user_appearance_preferences")
            .select("theme")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        let resultado;

        if (data) {

            resultado = await client
                .from("user_appearance_preferences")
                .update({ theme: tema })
                .eq("user_id", userId);

        } else {

            resultado = await client
                .from("user_appearance_preferences")
                .insert({
                    user_id: userId,
                    theme: tema
                });

            if (resultado.error?.code === "23505") {

                resultado = await client
                    .from("user_appearance_preferences")
                    .update({ theme: tema })
                    .eq("user_id", userId);

            }

        }

        if (resultado.error) throw resultado.error;

        guardarTemaLocal(userId, tema);
        aplicarTema(tema);

        return tema;
    }

    /* REMOVER ARMAZENAMENTO GLOBAL ANTIGO */

    try {

        localStorage.removeItem("luma-theme");

    } catch {

        // O armazenamento pode estar indisponível.

    }

    /* APARÊNCIA INICIAL */

    aplicarTema("dark");

    window.LumaTheme = {
        aplicarTema,
        carregarTemaLocal,
        carregarPreferencia,
        salvarPreferencia
    };

})();
