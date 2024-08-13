// represent current focus node, mainly for filter panel to listen
export default {
    namespaced: true,
    state() {
        return {
            id: null, // refer to graph node's id
        };
    },
    getters: {
        id(state) {
            return state.id;
        },
    },
    mutations: {
        setId(state, payload) {
            state.id = payload;
        },
    },
    actions: {
        changeId(context, payload) {
            context.commit("setId", payload);
        },
    },
};
