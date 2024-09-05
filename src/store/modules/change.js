export default {
    namespaced: true,

    state() {
        return {
            // change the content page show in app
            showPage: true,

            // determine export mode
            exportDataReady: false,
        };
    },

    getters: {
        showPage(state) {
            return state.showPage;
        },

        exportDataReady(state) {
            return state.exportDataReady;
        },
    },

    mutations: {
        setShowPage(store, payload) {
            store.showPage = payload;
        },

        setExportDataReady(store, payload) {
            store.exportDataReady = payload;
        },
    },

    actions: {},
};
