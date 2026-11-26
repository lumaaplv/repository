/* LUMA — CONTROLADOR DE APARÊNCIA */

(function () {

    const CHAVE_TEMA = "luma-theme";

    function temaValido(tema) {
        return tema === "light" || tema === "dark";
    }

    function aplicarTema(tema) {

        if (!temaValido(tema)) return;

        document.documentElement.dataset.theme = tema;

        try {
            localStorage.setItem(CHAVE_TEMA, tema);
        } catch (error) {
            console.warn("Não foi possível armazenar o tema.");
        }
    }

    function carregarTemaLocal() {

        try {

            const tema = localStorage.getItem(CHAVE_TEMA);

            return temaValido(tema) ? tema : "dark";

        } catch {
            return "dark";
        }
    }

    async function carregarPreferencia(client, userId) {

        const { data, error } = await client
            .from("user_appearance_preferences")
            .select("theme")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        if (!data) return null;

        aplicarTema(data.theme);

        return data.theme;
    }

    async function salvarPreferencia(client, userId, tema) {

        if (!temaValido(tema)) {
            throw new Error("Tema inválido.");
        }

        const { data, error } = await client
            .from("user_appearance_preferences")
            .select("theme")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        const resultado = data
            ? await client
                .from("user_appearance_preferences")
                .update({ theme: tema })
                .eq("user_id", userId)
            : await client
                .from("user_appearance_preferences")
                .insert({
                    user_id: userId,
                    theme: tema
                });

        if (resultado.error) throw resultado.error;

        aplicarTema(tema);

        return tema;
    }

    aplicarTema(carregarTemaLocal());

    window.LumaTheme = {
        aplicarTema,
        carregarTemaLocal,
        carregarPreferencia,
        salvarPreferencia
    };

})();
