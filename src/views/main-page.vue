<template>
    <div
        class="container"
        v-loading="isLoading"
        element-loading-custom-class="main"
        element-loading-text="Computing..."
    >
        <transition>
            <div class="main" v-show="showPage">
                <div class="nav-bar">
                    <div class="brand">LLM Guided Table Exploration</div>
                    <div style="flex-grow: 1"></div>
                    <div>
                        <SvgIcon
                            iconName="upload"
                            :class="['icon', { disabled: hasProcessed }]"
                            @click="uploadTable"
                        ></SvgIcon>
                        <input
                            type="file"
                            ref="fileInput"
                            @change="handleFileChange"
                            accept=".xls,.xlsx"
                            style="display: none"
                        />
                    </div>
                    <SvgIcon
                        iconName="export"
                        :class="['icon', { disabled: !hasProcessed }]"
                        @click="handleExport"
                    ></SvgIcon>
                </div>
                <div class="content-box">
                    <div
                        class="loading-mask"
                        v-if="!hasProcessed"
                        v-loading="isPreprocessing"
                        element-loading-text="Calculating Insights ..."
                    >
                        <div class="introduction">
                            <div>
                                Upload <strong>.xls/.xlsx</strong> files now
                            </div>
                            <div class="explain">
                                start <em>talking with LLMs</em>
                            </div>
                            <div class="explain">
                                & exploring your <em>Insight Stories</em>!
                            </div>
                        </div>
                    </div>
                    <div class="filter-box" v-show="!exportMode">
                        <FilterPanel></FilterPanel>
                    </div>
                    <div class="graph-box">
                        <CircleGraph></CircleGraph>
                    </div>
                </div>
            </div>
        </transition>

        <transition>
            <div class="preview" v-show="!showPage">
                <!-- <div class="nav-bar">
                    <div class="brand">Preview SVG Container</div>
                    <div style="flex-grow: 1"></div>
                    <div>
                        <SvgIcon
                            iconName="home"
                            class="icon"
                            @click="goBack"
                        ></SvgIcon>
                    </div>
                </div> -->

                <PreviewPage
                    v-if="exportDataReady"
                    :exportData="exportData"
                    :summaryData="summaryData"
                ></PreviewPage>
            </div>
        </transition>
    </div>
</template>
<script setup>
import { ref, onMounted, computed, watch, defineComponent } from "vue";
import { getNodeDetail, getVlSpec } from "@/api/panel.js";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import CircleGraph from "@/components/graph/circle-graph.vue";
import FilterPanel from "@/components/filter/filter-panel.vue";
import SvgIcon from "../components/ui/svg-icon.vue";
import PreviewPage from "./preview-page.vue";
import { PDFGraph } from "@/utils/exporter/treeExporter.js";

defineComponent({
    name: "MainPage",
});

/* -------------------------------------------------------------------------- */
// other
/* -------------------------------------------------------------------------- */
const store = useStore();
// const router = useRouter();

// control timing of creating force graph component
const isLoading = ref(true);

// control the page showing on the main
// const showPage = ref(true);
const showPage = computed(() => {
    console.log(
        "showPage after export: ",
        store.getters["changePage/showPage"]
    );
    return store.getters["changePage/showPage"];
});

// define props to pass data to preview-page
// const exportDataReady = ref(false);
const exportDataReady = computed(() => {
    console.log(
        "exportDataReady after export: ",
        store.getters["changePage/exportDataReady"]
    );
    return store.getters["changePage/exportDataReady"];
});
const exportData = ref(null);
const summaryData = ref(null);
/* -------------------------------------------------------------------------- */
// export mode
/* -------------------------------------------------------------------------- */

const exportMode = computed(() => {
    return store.getters["export/mode"];
});
const handleExport = () => {
    store.commit("export/setMode", true);
};
const freezeId = computed(() => {
    return store.getters["freeze/id"];
});

// construct data for path-like pdf-graph
const constructPathData = async (data) => {
    const questionData = data.map((d) => ({ id: d.id, question: d.question }));
    const relaData = data.map((d) => ({
        id: d.id,
        relationship: d.relationship,
    }));
    const relTypeData = data.map((d) => ({
        id: d.id,
        relType: d.relType,
    }));
    questionData.shift();
    relaData.shift();
    relTypeData.shift();
    const idList = data.map((d) => d.id);
    const realIdList = data.map((d) => d.realId);

    // get vlSpecs
    const vlSpecListResult = await getVlSpec(realIdList);
    const vlSpecList = vlSpecListResult.data.vlList;

    // get descriptions
    const descriptionPromiseList = realIdList.map((id) => getNodeDetail(id));
    const nodeDetailResults = await Promise.all(descriptionPromiseList);
    const descriptionList = nodeDetailResults.map(
        (res) => res.data.description
    );
    // const relTypeData = nodeDetailResults.map((res) => {
    //   id: res.data.id;
    //   relType: res.data.relType;
    // });
    const insightData = idList.map((id, index) => ({
        id: id,
        description: descriptionList[index],
        vegaLite: vlSpecList[index],
    }));

    return {
        questionData,
        relaData,
        insightData,
        relTypeData,
    };
};
// construct data for tree-like pdf-graph
const constructTreeData = async (data) => {
    const nodes = data.nodes;

    const realIdList = nodes.map((d) => d.realId);
    // get vl-spec info of all nodes
    const vlSpecListResult = await getVlSpec(realIdList);
    const vlSpecList = vlSpecListResult.data.vlList;
    // get description of all nodes
    const descriptionPromiseList = realIdList.map((id) => getNodeDetail(id));
    const nodeDetailResults = await Promise.all(descriptionPromiseList);

    console.log("output nodeDetailResults: ", nodeDetailResults);

    const descriptionList = nodeDetailResults.map(
        (res) => res.data.description
    );

    // get category of all nodes
    // const categoryList = nodeDetailResults.map((res) => res.data.category);

    // get type of all nodes
    const typeList = nodeDetailResults.map((res) => res.data.type);

    const insightNodes = nodes.map((node, index) => ({
        ...node,
        description: descriptionList[index],
        vegaLite: vlSpecList[index],
        // category: categoryList[index],
        type: typeList[index],
        query: "",
    }));
    return {
        nodes: insightNodes,
        links: data.links,
    };
};

watch(freezeId, async (newVal) => {
    if (exportMode.value && newVal !== -1) {
        const data = await store.dispatch("export/startExport", newVal);

        console.log("data before processing: ", data);

        exportData.value = await constructTreeData(data); // mature data

        console.log("MainPage pathData: ", exportData.value);

        summaryData.value = await store.dispatch(
            "passData/postPassData",
            exportData.value
        ); // wait

        // const processedData = await constructTreeData(data);

        // const result = await store.dispatch(
        //     "passData/postPassData",
        //     processedData
        // );

        // ! waiting for a time loading animation

        // router.push({ name: "preview" });
        // exportDataReady.value = true;
        // showPage.value = false;
        store.commit("changePage/setExportDataReady", true);
        store.commit("changePage/setShowPage", false);
    }
});

/* -------------------------------------------------------------------------- */
// table upload
/* -------------------------------------------------------------------------- */
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        // 限制为 .xls / .xlsx 类型
        const isExcel =
            file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel";

        if (!isExcel) {
            ElMessage.warning(`Incorrect file type, please upload again`);
            return;
        } else {
            isPreprocessing.value = true;
            store.dispatch("uploadTable", file).then((res) => {
                // load data
                store
                    .dispatch("initRawData", null)
                    .then((res) => {
                        isLoading.value = false;
                        isPreprocessing.value = false;
                        hasProcessed.value = true;
                        ElMessage.success(res.message);
                    })
                    .catch((e) => {
                        ElMessage.error(`Data Loading Error: ${e.message}`);
                    });
            });
        }
    }
};
const hasProcessed = ref(false);
const isPreprocessing = ref(false);
const fileInput = ref(null);
const uploadTable = () => {
    fileInput.value.value = null;
    fileInput.value.click();
};
/* -------------------------------------------------------------------------- */
// preview page
/* -------------------------------------------------------------------------- */

// const goBack = () => {
//     showPage.value = true;
//     exportDataReady.value = false;
// };

// starter
onMounted(() => {});
</script>

<style lang="scss" scoped>
.container {
    .main {
        @include container-base();
        @include flex-box(column);
        max-height: 100%;
        // gap: 0.5rem;

        .nav-bar {
            flex: auto;
            width: 100%;
            box-shadow: 0rem 0.2rem 0.3rem 0rem rgba(0, 0, 0, 0.2);
            z-index: $z-top-absolute;
            @include flex-box();
            align-items: center;
            padding-left: 1rem;
            background-color: $background-color-light;
            .brand {
                font-size: 2rem;
                font-weight: bold;
                color: $primary-color;
            }
            .icon {
                @include icon-style($icon-size-small);
                margin-right: 6px;

                &.disabled {
                    pointer-events: none;
                    fill: $text-color-light;
                    // background-color: $background-color-dark;
                    // fill: $;
                }
            }
        }
    }
}

.loading-mask {
    position: absolute;
    z-index: 9;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    /* background-color: rgba(255, 255, 255, 0.8); */
    background-image: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.7)
        ),
        url("/pic/user-interface.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;

    .introduction {
        font-size: 6rem;
        line-height: 120%;
        position: absolute;
        top: 15%;
        left: 10%;
        color: #545b77;
        .explain {
            font-size: 4rem;
            line-height: 100%;
        }
    }
}
</style>

<style lang="scss">
// set style of el-mask
.el-loading-mask {
    z-index: $z-top;
    --el-color-primary: $primary-color;
    --el-mask-color: #{rgba($background-color-light, 0.6)};
    .el-loading-spinner {
        stroke: $primary-color;
    }
    .el-loading-text {
        color: $text-color-light;
    }

    &.main {
        --el-mask-color: #{rgba($background-color-light, 0.9)};
    }
    &.info {
        --el-mask-color: #{$background-color-light, };
    }
}
</style>
