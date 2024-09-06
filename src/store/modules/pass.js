import { getSummaryFromPassData } from "@/api/summary";

export default {
    namespaced: true,

    state() {
        return {
            // pass data from main-page to preview-page
            passData: null,

            // store summary
            summary: null,
        };
    },

    getters: {
        passData(store) {
            return store.passData;
        },

        getSummary(store) {
            return store.summary;
        },
    },

    mutations: {
        setPassData(store, payload) {
            store.passData = payload;
        },

        setSummary(store, payload) {
            store.summary = payload;
        },
    },

    actions: {
        // post detailed data, and then store summary
        postPassData(context, payload) {
            return new Promise((resolve, reject) => {
                // store pass data
                console.log("passData payload: ", payload);
                console.log("passData payload nodes: ", payload.nodes);
                console.log("passData payload edges: ", payload.links);

                // context.commit("setPassData", payload);

                // integrate pass Nodes data
                const passNodes = payload.nodes.map((node) => {
                    return {
                        id: node.id,
                        type: node.type,
                        description: node.description,
                        query: node.query,
                    };
                });
                console.log("passNodes: ", passNodes);

                // integrate pass Edges data
                const passLinks = payload.links.map((node) => {
                    return {
                        source: node.source,
                        target: node.target,
                        query: node.question,
                        relationship: node.relationship,
                        relType: node.relType,
                    };
                });
                console.log("passLinks: ", passLinks);

                // resolve({
                //     message: "Get summary successfully.",
                // }); // delete

                // post passed data and get summary
                getSummaryFromPassData({
                    nodes: passNodes,
                    edges: passLinks,
                })
                    .then((res) => {
                        const data = res.data;
                        console.log("From serve: ", res.data);

                        const summary = data.summary;

                        console.log("From summary: ", summary);
                        // context.commit("setSummary", summary);

                        resolve({
                            summary: summary,
                            message: "Get summary successfully.",
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    }); // recall
            });
        },
    },
};
