<template>
    <div class="container">
        <!-- <div class="nav-bar">
            <div class="brand">Preview SVG Container</div>
            <div style="flex-grow: 1"></div>
            <div>
                <SvgIcon iconName="home" class="icon" @click="goBack"></SvgIcon>
            </div>
        </div> -->
        <div class="content-box">
            <div id="left-panel">
                <!-- <h1>Preview SVG Container</h1> -->
                <div id="svg-content"></div>
            </div>
            <div id="right-panel">
                <h1>Summary</h1>
                <div>
                    <p id="summary"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    onMounted,
    computed,
    nextTick,
    watch,
    defineComponent,
} from "vue";
// import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { PDFGraph } from "@/utils/exporter/treeExporter.js";
import svgIcon from "../components/ui/svg-icon.vue";

defineComponent({
    name: "PreviewPage",
});

// const route = useRoute();
// const router = useRouter();
const store = useStore();

const props = defineProps({
    exportData: Object,
    summaryData: Object,
});

const pdfGraph = ref(null);

// // get nodes and links data from store
// const pathData = computed(() => {
//     if (store.getters["passData/passData"]) {
//         try {
//             console.log("data", store.getters["passData/passData"]);
//             return store.getters["passData/passData"];
//         } catch (e) {
//             console.error("解析路由数据时出错:", e);
//             return null;
//         }
//     } else {
//         console.error("路由查询中没有数据");
//         return null;
//     }
// });

// // get summary data from store
// const summaryData = computed(() => {
//     console.log("summary: ", store.getters["passData/getSummary"]);
//     return store.getters["passData/getSummary"];
// });

// // back to mainPage
// const goBack = () => {
//     router.back();
//     // router.replace({ path: "/main" });
// };

// hover node related
const hoverNodeId = computed(() => store.getters["hover/id"]);
watch(hoverNodeId, (newVal, oldVal) => {
    const id = newVal || oldVal;

    console.log("hover related id: ", id);

    const sentence = d3.select("#summary").selectAll(`span.insight-node-${id}`);

    console.log("sentence: ", sentence);

    if (newVal) {
        sentence.classed("highlight", true);
    } else {
        sentence.classed("highlight", false);
    }
});

// lifeHook
onMounted(async () => {
    // const data = pathData.value;

    if (props.exportData) {
        const containerNode = d3.select("#svg-content").node();

        console.log("pathData Proxy: ", props.exportData);

        pdfGraph.value = new PDFGraph(props.exportData, store);
        // console.log("PDFGraph 初始化成功");
        await pdfGraph.value.createGraph(containerNode);
        // console.log("图表创建成功");

        // console.log("summaryData: ", props.summaryData); recall

        // const summaryContent = `${props.summaryData.summary}`;
        // const summarySentence = d3.select("#summary").html(summaryContent); recall

        // 使用 nextTick 确保 DOM 更新后再添加事件监听
        nextTick(() => {
            // summarySentence
            //     .selectAll("span")
            //     .on("mouseover", handleMouseOver)
            //     .on("mouseout", handleMouseOut); recall
        });
    }

    // const svg = d3.select("#main-svg");
    // console.log("svg: ", svg);

    // const spanHighlighter = summarySentence
    //     .selectAll("span")
    //     .on("mouseover", handleMouseOver)
    //     .on("mouseout", handleMouseOut);

    function handleMouseOver(event) {
        // select hovered sentence
        const sentence = d3.select(event.currentTarget);

        // get hovered sentence class attribute value
        const sentenceClasses = sentence.attr("class");

        if (!sentenceClasses) {
            return;
        }
        const sentenceClassesArr = sentenceClasses.split(" ");
        const coNodeId = sentenceClassesArr.find((className) =>
            className.startsWith("insight-node-")
        );

        if (coNodeId) {
            sentence.classed("highlight", true);
        }

        const svg = d3.select("#main-svg");
        const nodeList = svg.select(".top-g-node").selectChildren(".node");
        const nodeElement = nodeList.filter((node) => {
            return `insight-node-${node.data.id}` === coNodeId;
        });

        if (nodeElement.node()) {
            toggleHover(nodeElement, true);
        }
    }

    function handleMouseOut(event) {
        const sentence = d3.select(event.currentTarget);

        const sentenceClasses = sentence.attr("class");

        if (!sentenceClasses) {
            return;
        }

        const sentenceClassesArr = sentenceClasses.split(" ");
        const coNodeId = sentenceClassesArr.find((className) =>
            className.startsWith("insight-node-")
        );

        if (coNodeId) {
            sentence.classed("highlight", false);
        }

        const svg = d3.select("#main-svg");

        const nodeList = svg.select(".top-g-node").selectChildren(".node");

        const nodeElement = nodeList.filter((node) => {
            return `insight-node-${node.data.id}` === coNodeId;
        });

        if (nodeElement.node()) {
            toggleHover(nodeElement, false);
        }
    }

    function toggleHover(nodeG, state, duration = 200) {
        let transformStr = "";
        let scale = 1.1;
        if (state) {
            transformStr = nodeG.style("transform") + ` scale(${scale})`;
        } else {
            transformStr = nodeG.style("transform").split("scale")[0];
        }
        nodeG.transition().duration(duration).style("transform", transformStr);
    }
});
</script>

<style lang="scss">
.container {
    @include container-base();
    // @include flex-box(column);
    // max-height: 100%;
    // // gap: 0.5rem;

    // .nav-bar {
    //     flex: auto;
    //     width: 100%;
    //     height: 5%;
    //     box-shadow: 0rem 0.2rem 0.3rem 0rem rgba(0, 0, 0, 0.2);
    //     z-index: $z-top-absolute;
    //     @include flex-box();
    //     align-items: center;
    //     padding-left: 1rem;
    //     background-color: $background-color-light;
    //     .brand {
    //         font-size: 2rem;
    //         font-weight: bold;
    //         color: $primary-color;
    //     }
    //     .icon {
    //         @include icon-style($icon-size-small);
    //         background-color: transparent !important;
    //         margin-right: 6px;
    //         // &:hover {
    //         //     fill: $secondary-color;
    //         //     background-color: $background-color-dark;
    //         // }
    //     }
    // }
    #svg-content {
        height: 100%;
    }
    .content-box {
        height: 95%;
        width: 100%;
        display: flex;

        .highlight {
            background-color: yellow; /* 高亮效果 */
        }
    }
}

.sentence {
    margin: 40px 0;
    cursor: pointer;
    /* font-size: 100px; */
}
</style>
