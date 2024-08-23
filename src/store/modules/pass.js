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

                context.commit("setPassData", payload);

                // integrate pass Nodes data
                // const passNodesIdList = payload.nodes.map((d) => d.id);
                // const passNodesTypeList = payload.nodes.map((d) => d.type);
                // const passNodesDescriptionList = payload.nodes.map(
                //     (d) => d.description
                // );
                // const passNodesQueryList = payload.nodes.map((d) => d.query);
                // const passNodes = payload.nodes.map((node, index) => ({
                //     ...node,
                //     id: passNodesIdList[index],
                //     type: passNodesTypeList[index],
                //     description: passNodesDescriptionList[index],
                //     query: passNodesQueryList[index],
                // }));
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
                // const passLinksSourceList = payload.links.map((d) => d.source);
                // const passLinksTargetList = payload.links.map((d) => d.target);
                // const passQueryList = payload.links.map((d) => d.question);
                // const passRelationshipList = payload.links.map(
                //     (d) => d.relationship
                // );
                // const passRelTypeList = payload.links.map((d) => d.relType);
                // const passLinks = payload.links.map((node, index) => ({
                //     ...node,
                //     source: passLinksSourceList[index],
                //     target: passLinksTargetList[index],
                //     query: passQueryList[index],
                //     relationship: passRelationshipList[index],
                //     relType: passRelTypeList[index],
                // }));
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

                // post passed data and get summary
                getSummaryFromPassData({
                    nodes: passNodes,
                    edges: passLinks,
                }).then((res) => {
                    const data = res.data;
                    console.log("From serve: ", res.data);

                    const summary = data.summary;
                    console.log("From summary: ", summary);

                    context.commit("setSummary", summary);

                    resolve({
                        message: "Get summary successfully.",
                    }).catch((error) => {
                        reject(error);
                    });
                });
            });
        },
    },
};
