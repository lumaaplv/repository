
/* =========================================
   LUMA — SERVICE WORKER
   NOTIFICAÇÕES PUSH
   ========================================= */

self.addEventListener("push", function (event) {

    let dados = {};

    try {
        dados = event.data
            ? event.data.json()
            : {};
    } catch (erro) {
        console.error("Erro ao ler push:", erro);
    }

    const titulo = "LUMA | Comunidade";

    const opcoes = {
        body: dados.body || "Você tem uma nova notificação.",
        icon: "./icons/icon-192.png",
        badge: "./icons/icon-192.png",
        tag: dados.tag || "luma-notificacao",
        data: {
            url: "./feed.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            titulo,
            opcoes
        )
    );
});

/* ABRIR LUMA AO CLICAR NA NOTIFICAÇÃO */

self.addEventListener(
    "notificationclick",
    function (event) {

        event.notification.close();

        const destino = new URL(
            "./feed.html",
            self.registration.scope
        ).href;

        event.waitUntil(
            (async function () {

                const janelas =
                    await clients.matchAll({
                        type: "window",
                        includeUncontrolled: true
                    });

                for (const janela of janelas) {
                    if (janela.url === destino) {
                        await janela.focus();
                        return;
                    }
                }

                await clients.openWindow(destino);

            })()
        );
    }
);
