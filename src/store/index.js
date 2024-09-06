import { createStore } from "vuex";
// import authModule from "./modules/auth";
import rawDataModule from "./modules/raw";
import focusModule from "./modules/focus";
import hoverModule from "./modules/hover";
import nodeAdderModule from "./modules/node_adder";
import nodeMoverModule from "./modules/node_mover";
import freezeModule from "./modules/freeze";
import exportModule from "./modules/export";

import hoverSummaryModule from "./modules/hover_summary";
import changePageModule from "./modules/change";
import passDataModule from "./modules/pass";
// import treeDataModule from "./modules/tree";
// import graphDataModule from "./modules/graph";
// import colDataModule from "./modules/col";
const store = createStore({
    modules: {
        // auth: authModule,
        raw: rawDataModule,
        focus: focusModule,
        hover: hoverModule,
        nodeAdder: nodeAdderModule,
        nodeMover: nodeMoverModule,
        freeze: freezeModule,
        export: exportModule,
        hoverSummary: hoverSummaryModule,
        changePage: changePageModule,
        passData: passDataModule,
        // tree: treeDataModule,
        // graph: graphDataModule,
        // col: colDataModule,
    },
});

export default store;
