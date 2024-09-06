// represent current hovered node, mainly used for summary function
export default {
    namespaced: true,

    state() {
        return {
            id: null, // refer to hovered node's id on summary
        };
    },

    getters: {
        id(state) {
            return state.id;
        },
    },

    mutations: {
        setId(store, payload) {
            store.id = payload;
        },
    },

    actions: {
        changeId(context, payload) {
            context.commit("setId", payload);
        },
    },
};
