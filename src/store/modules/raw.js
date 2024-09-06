import { Tree } from "@/utils/tree/tree";
import { getGraphData } from "@/api/graph";
import { getNodeId } from "@/api/filter";
import { getNextStep } from "@/api/question";
import { getSummaryFromPassData } from "@/api/summary";

export default {
    state() {
        return {
            // tree data for tracing user exploration statement
            treeData: null,
            // data for drawing circleGraph
            graphData: null,
            // columns' name
            colInfoMap: null,
            // force-graph instance
            forceGraph: null,
        };
    },
    getters: {
        treeData(state) {
            return state.treeData;
        },
        graphData(state) {
            return state.graphData;
        },
        colInfoMap(state) {
            return state.colInfoMap;
        },
        forceGraph(state) {
            return state.forceGraph;
        },
    },
    mutations: {
        setTreeData(state, payload) {
            state.treeData = payload;
        },
        setGraphData(state, payload) {
            state.graphData = payload;
        },
        setColInfoMap(state, payload) {
            state.colInfoMap = payload;
        },
        setForceGraph(state, payload) {
            state.forceGraph = payload;
        },
    },
    actions: {
        // load raw data and process it
        initRawData(context, payload) {
            return new Promise((resolve, reject) => {
                getGraphData()
                    .then((res) => {
                        const rawData = res.data;
                        context.dispatch("processRawData", rawData);
                        resolve({
                            message: "Calculation complete.",
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // handle table upload
        uploadTable(context, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 0);
            });
        },
        // post question ,and then add nodes in tree & update graph
        postQuestion(context, payload) {
            return new Promise((resolve, reject) => {
                getNextStep({
                    id: payload.realId,
                    content: payload.content,
                })
                    .then((res) => {
                        const data = res.data;
                        console.log("From server: ", res.data);
                        const newNodeInfo = data.nodes;
                        console.log("from query:", newNodeInfo);

                        // add tree nodes in tree structure
                        context.dispatch("addTreeNode", {
                            parent: payload.id,
                            children: newNodeInfo,
                            question: payload.content,
                        });

                        // update graphdata
                        context.dispatch("updateGraphDataByTree", newNodeInfo);

                        resolve({
                            message: "Query complete.",
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // add new node from filter panel
        addNewNode(context, payload) {
            return new Promise((resolve, reject) => {
                const nodeData = payload.nodeData;
                const parentId = payload.parentId;
                getNodeId()
                    .then((res) => {
                        const id = res.data.id;
                        const newNodeInfo = [
                            {
                                ...nodeData,
                                id: id,
                            },
                        ];
                        context.dispatch("addTreeNode", {
                            parent: parentId,
                            children: newNodeInfo,
                            question: null,
                        });
                        // update graph data
                        context.dispatch("updateGraphDataByTree", newNodeInfo);
                        resolve({
                            message: "Add complete.",
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // initialization of all states data
        processRawData(context, payload) {
            // set column info, for filter panel
            const colRawData = payload.columnInfo;
            const colInfoMap = new Map();
            for (const prop in colRawData) {
                if (Object.hasOwn(colRawData, prop)) {
                    // colRawData[prop].unshift("*");
                    colInfoMap.set(prop, colRawData[prop]);
                }
            }
            context.commit("setColInfoMap", colInfoMap);
            // construct tree
            const tree = new Tree();
            context.commit("setTreeData", tree);
            // add node into tree
            const newNodeInfo = payload.nodes;
            context.dispatch("addTreeNode", {
                parent: 0,
                children: newNodeInfo,
                question: null,
            });

            // update graph data
            context.dispatch("updateGraphDataByTree", newNodeInfo);
        },

        /*
      add nodes into tree
      payload: {
        parent: id
        children: nodes's id from backend severs
      }
    */
        addTreeNode(context, payload) {
            const tree = context.getters["treeData"];
            // const randomNum = Math.floor(Math.random() * 4);
            // let randomType = "";
            // switch (randomNum) {
            //   case 0:
            //     randomType = "sameLevel";
            //     break;
            //   case 1:
            //     randomType = "specialization";
            //     break;
            //   case 2:
            //     randomType = "generalization";
            //     break;
            // }
            // console.log(randomType);

            tree.addNodes(
                payload.parent,
                payload.children.map((d) => ({
                    // refer to visual id
                    id: d.id,
                    realId: d["realId"],
                    relType: d.relType || "",
                    // relType: randomType,
                    relationship: d.relationship || "",
                    question: payload.question,
                }))
            );
        },

        /* detete node from tree & update graph
         */
        deleteTreeNode(context, payload) {
            const tree = context.getters["treeData"];
            tree.deleteNode(payload.id);
            context.dispatch("updateGraphDataByTree", []);
        },

        /*
         * always happens after change of tree data
         * construct new link & node data for graph
         * payload: new node info
         */
        updateGraphDataByTree(context, payload) {
            // get nodes' layer info & links from tree
            const tree = context.getters["treeData"];
            const layerInfo = tree.getDescendantList();
            const links = tree.getLinkList();
            // process nodes
            // get map for new node info
            const newNodeMap = new Map();
            payload.forEach((node) => {
                newNodeMap.set(node.id, node);
            });
            // constructed new nodes
            const newNodes = layerInfo.map((item) => {
                const nodeInfo = newNodeMap.get(item.id);
                if (nodeInfo) {
                    return { ...nodeInfo, layer: item.layer };
                } else {
                    return { ...item };
                }
            });

            // set graph data
            context.commit("setGraphData", {
                node: newNodes,
                link: links,
            });
        },

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
