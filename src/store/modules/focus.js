// represent current foucs node, mainly for filter panel to listen
export default {
    namespaced: true,
    state() {
        return {
            realId: -1,
            dataScope: null,
        };
    },
    getters: {
        realId(state) {
            return state.realId;
        },
        dataScope(state) {
            return state.dataScope;
        },
    },
    mutations: {
        setRealId(state, payload) {
            state.realId = payload;
        },
        setDataScope(state, payload) {
            state.dataScope = payload;
        },
    },
    actions: {
        changeRealId(context, payload) {
            context.commit("setRealId", payload);
        },
        changeDataScope(context, payload) {
            context.commit("setDataScope", payload);
        },
    },
};
