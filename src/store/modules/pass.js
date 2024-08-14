export default {
    namespaced: true,

    state() {
        return {
            passData: null,
        };
    },

    getters: {
        passData(store) {
            return store.passData;
        },
    },

    mutations: {
        setPassData(store, payload) {
            store.passData = payload;
        },
    },

    actions: {},
};
